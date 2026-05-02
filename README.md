# Team Task Manager

A collaborative task management application built with a Django backend and a React frontend. This project allows teams to manage projects, track tasks, and collaborate efficiently.

## 🚀 Features

- **Project Management**: Organize and categorize tasks under specific projects.
- **Task Tracking**: Create, assign, and update statuses for team tasks.
- **Secure Authentication**: User login and registration using JWT (JSON Web Tokens).
- **Permissions**: Role-based access control for projects and tasks.
- **Modern UI**: A responsive and clean interface built with React.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Vanilla CSS.
- **Backend**: Django, Django REST Framework.
- **Database**: MySQL.
- **Authentication**: SimpleJWT.

## ⚙️ Getting Started

### Prerequisites

- Python 3.x
- Node.js & npm
- MySQL Server

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # macOS/Linux
    source .venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    Create a `.env` file in the `backend/` directory with the following:
    ```env
    DB_NAME=your_db_name
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=127.0.0.1
    DB_PORT=3306
    SECRET_KEY=your_django_secret_key
    ```
5.  Run migrations:
    ```bash
    python manage.py migrate
    ```
6.  Start the server:
    ```bash
    python manage.py runserver
    ```

### 2. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 📁 Project Structure

- `backend/`: Django application source code, API endpoints, and database models.
- `frontend/`: React source code, components, pages, and styling.
- `.gitignore`: Configured to exclude dependencies and sensitive files.
