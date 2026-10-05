# Developer Setup Guide — SmartCart

This guide will walk you through setting up the complete development environment on your local machine.

---

## 1. Environment Requirements
- **Python:** 3.10 or higher
- **Node.js:** 18 or higher (with npm 9+)
- **Git:** 2.30+
- **Database:** SQLite (default for development) or PostgreSQL 14+ / MySQL 8+

---

## 2. Setting Up the Backend (Django REST Framework)

### 2.1 Virtual Environment
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate
```

### 2.2 Install Dependencies
```bash
pip install -r requirements.txt
```

### 2.3 Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell:
Copy-Item .env.example .env
# Linux/macOS:
cp .env.example .env
```
Default `.env` configuration uses SQLite (`DB_ENGINE=sqlite`), which requires zero additional database installation.

### 2.4 Apply Migrations & Create Superuser
```bash
# Generate and run database migrations
python manage.py makemigrations
python manage.py migrate

# Create initial admin account
python manage.py createsuperuser

# (Optional) Seed realistic product data
python manage.py loaddata ../database/seed_data/seed_data.json
```

### 2.5 Run Backend Server
```bash
python manage.py runserver 8000
```
- API Base: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`

---

## 3. Setting Up the Frontend (React + Vite)

### 3.1 Install Frontend Packages
In a separate terminal:
```bash
cd frontend
npm install
```

### 3.2 Configure Environment
Verify `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3.3 Run Frontend Dev Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

---

## 4. Docker Compose Setup (Optional)
If you prefer running everything in isolated containers with PostgreSQL:
```bash
docker-compose up --build
```
This launches:
- `smartcart_db`: PostgreSQL on port `5432`
- `smartcart_backend`: Django REST API on port `8000`
- `smartcart_frontend`: React Vite dev server on port `5173`

---

## 5. Running Tests

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```
