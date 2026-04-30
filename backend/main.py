from fastapi import FastAPI, Depends, HTTPException, Response, Request
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timedelta

from .database import engine, create_db_and_tables, get_session
from .models import *
from .auth import *

# Initialize database on startup
from pydantic import BaseModel
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Task Manager API", lifespan=lifespan)

# --- Auth Routes ---
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
def register(user: UserCreate, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # First user becomes ADMIN, others become MEMBER
    user_count = session.exec(select(User)).all()
    role = "ADMIN" if len(user_count) == 0 else "MEMBER"

    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=role
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
def login(login_data: LoginRequest, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == login_data.email)).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    user_data = {"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    access_token = create_access_token(data={"user": user_data}, expires_delta=expires_delta)
    
    # Send JWT in cookie
    response.set_cookie(
        key="session", 
        value=access_token, 
        httponly=True, 
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    return {"message": "Logged in successfully", "role": user.role}

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("session", path="/")
    return {"message": "Logged out successfully"}

# --- Users Route ---
@app.get("/api/users", response_model=List[UserRead])
def get_users(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    users = session.exec(select(User)).all()
    return users

# --- Projects Routes ---
@app.get("/api/projects", response_model=List[ProjectRead])
def get_projects(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    projects = session.exec(select(Project).order_by(Project.created_at.desc())).all()
    # Populate task_count
    for p in projects:
        p.task_count = len(p.tasks)
    return projects

@app.post("/api/projects", response_model=ProjectRead)
def create_project(project: ProjectCreate, session: Session = Depends(get_session), current_user: User = Depends(require_admin)):
    new_project = Project.model_validate(project, update={"owner_id": current_user.id})
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return new_project

# --- Tasks Routes ---
@app.get("/api/tasks", response_model=List[TaskRead])
def get_tasks(project_id: Optional[int] = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    query = select(Task)
    if project_id:
        query = query.where(Task.project_id == project_id)
    tasks = session.exec(query.order_by(Task.created_at.desc())).all()
    return tasks

@app.post("/api/tasks", response_model=TaskRead)
def create_task(task: TaskCreate, session: Session = Depends(get_session), current_user: User = Depends(require_admin)):
    new_task = Task.model_validate(task)
    session.add(new_task)
    session.commit()
    session.refresh(new_task)
    return new_task

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[int] = None

@app.put("/api/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task_update: TaskUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Member can only update status if assigned
    if current_user.role != "ADMIN" and db_task.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Update logic
    if task_update.status is not None:
        db_task.status = task_update.status
    
    if current_user.role == "ADMIN":
        if task_update.title is not None:
            db_task.title = task_update.title
        if task_update.description is not None:
            db_task.description = task_update.description
        if task_update.assignee_id is not None:
            db_task.assignee_id = task_update.assignee_id

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(require_admin)):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(db_task)
    session.commit()
    return {"message": "Deleted successfully"}
