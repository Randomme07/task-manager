from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class UserBase(SQLModel):
    name: str
    email: str = Field(unique=True, index=True)
    role: str = Field(default="MEMBER")

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    
    projects: List["Project"] = Relationship(back_populates="owner")
    tasks: List["Task"] = Relationship(back_populates="assignee")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class ProjectBase(SQLModel):
    name: str
    description: Optional[str] = None

class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    owner: User = Relationship(back_populates="projects")
    tasks: List["Task"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete"})

class ProjectCreate(ProjectBase):
    pass

class ProjectRead(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    task_count: int = 0
    owner: UserRead

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    status: str = Field(default="TODO") # TODO, IN_PROGRESS, DONE
    due_date: Optional[datetime] = None

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    assignee_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    project: Project = Relationship(back_populates="tasks")
    assignee: Optional[User] = Relationship(back_populates="tasks")

class TaskCreate(TaskBase):
    project_id: int
    assignee_id: Optional[int] = None

class TaskRead(TaskBase):
    id: int
    project_id: int
    assignee_id: Optional[int] = None
    created_at: datetime
    project: ProjectBase
    assignee: Optional[UserRead] = None
