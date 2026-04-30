# Team Task Manager

A beginner-friendly, full-stack application for managing projects and tasks with role-based access. 
This project uses **Next.js** for the frontend and **Python FastAPI** for the backend.

## Features
- **Authentication**: JWT-based Signup/Login. The first registered user automatically becomes the `ADMIN`, and subsequent users become `MEMBER`.
- **Project Management**: Create projects (Admins only) and view all projects.
- **Task Tracking**: Assign tasks to team members with status updates (TODO, IN_PROGRESS, DONE).
- **Dashboard**: High-level overview of task statuses and overdue items.

## Technology Stack
- **Frontend**: Next.js 16 (React), Vanilla CSS (Glassmorphism & Gradients).
- **Backend**: Python FastAPI, SQLModel.
- **Database**: SQLite (local development).

## How to Run Locally

You will need two terminal windows to run both the backend and frontend simultaneously.

### 1. Start the Python Backend
Open a terminal in the project root directory and run:

```bash
# Install Python dependencies (requires Python 3.8+)
pip install -r backend/requirements.txt

# Start the FastAPI server on port 8000
python -m uvicorn backend.main:app --reload
```
The backend API and documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Start the Next.js Frontend
Open a *second* terminal in the project root directory and run:

```bash
# Install Node.js dependencies
npm install

# Start the Next.js development server
npm run dev
```
The application will be running at `http://localhost:3000`. 
*Note: All API calls from the frontend are automatically proxied to the Python backend.*

## Deployment to Railway

1. **GitHub Repository**: Push this entire project to a GitHub repository.
2. **Create Project on Railway**: Connect your GitHub repo to a new Railway project.
3. **Multi-Service Architecture**: Railway will detect the `package.json` for Next.js. You can create a second service in the same project pointing to the same repo, but set the start command to `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
4. Update your Next.js environment variables to point to the live FastAPI URL.
