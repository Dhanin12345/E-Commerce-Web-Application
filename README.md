# SmartCart — Smart E-Commerce Web Application

SmartCart is a full-stack, enterprise-grade e-commerce web platform engineered with **React (Vite)** on the frontend, **Django REST Framework (DRF)** on the backend, and supporting **SQLite** (for zero-dependency local development) and **PostgreSQL / MySQL** (for production deployments).

---

## 🏗️ High-Level System Architecture

```text
User Browser / Mobile Client
        │
        ▼
 React 18 + Vite Frontend (SPA)
 ├── Authentication (JWT: Login / Register / Refresh)
 ├── Product Catalog, Live Search, Dynamic Filtering
 ├── Cart & Wishlist State Management
 ├── Multi-step Checkout, Address & Payment Simulator
 ├── Order History, Tracking & Invoices
 └── Comprehensive Admin Operations Dashboard
        │
        ▼ (REST API / JSON via Axios)
 Django REST Framework Backend
 ├── config/ (Settings, URLs, ASGI/WSGI, JWT Middleware)
 └── apps/
      ├── authentication  (JWT, Refresh, Password Reset)
      ├── users           (Profiles, Addresses, Roles)
      ├── products        (Catalog, Variants, Filtering, Stock)
      ├── categories      (Hierarchical Taxonomies)
      ├── cart            (Session & Database Persisted Cart)
      ├── wishlist        (User Saved Items)
      ├── orders          (Order Lifecycle, Invoicing, History)
      ├── payments        (Payment Intents, Gateways, Webhooks)
      ├── inventory       (Stock Management, Reorder Alerts)
      ├── reviews         (Ratings, Comments, Verification)
      ├── coupons         (Discounts, Expiry, Redemption)
      ├── notifications   (Transactional Alerts, Emails)
      └── analytics       (Sales, Revenue, Conversion Metrics)
        │
        ▼
 Database Layer (SQLite / PostgreSQL / MySQL)
 ├── ACID Relational Schema
 ├── Normalized Tables & Optimized Foreign Keys
 └── Indexed Search Queries & Composite Constraints
```

---

## 📁 Repository Structure

```text
SmartCart/
│
├── frontend/                     # React 18 Single Page Application
│   ├── public/                   # Static assets, favicon, index.html
│   ├── src/
│   │   ├── assets/               # Images, icons, and custom fonts
│   │   ├── components/
│   │   │   ├── common/           # Reusable UI primitives (Button, Modal, Toast, etc.)
│   │   │   ├── navbar/           # Navigation bar, search bar, cart indicator
│   │   │   ├── product/          # Product card, grid, gallery, filters, rating
│   │   │   ├── cart/             # Cart item, order summary, quantity controls
│   │   │   ├── checkout/         # Address, shipping method, payment forms
│   │   │   ├── orders/           # Order card, status badge, tracking timeline
│   │   │   └── admin/            # Admin sidebar, metric cards, charts, data tables
│   │   ├── pages/                # Storefront pages (Home, Products, Checkout, etc.)
│   │   ├── admin/                # Admin views (Dashboard, Products, Orders, Users, etc.)
│   │   ├── services/             # Axios API client integrations
│   │   ├── context/              # React Context Providers (Auth, Cart, Wishlist)
│   │   ├── hooks/                # Custom React hooks (useAuth, useCart, useProducts)
│   │   ├── routes/               # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── utils/                # Formatters, validators, constants
│   │   └── styles/               # Global styles, CSS design tokens, responsive rules
│   ├── package.json
│   └── .env
│
├── backend/                      # Django REST Framework Application
│   ├── config/                   # Master Django project configuration
│   ├── apps/                     # Modular Django domain apps
│   │   ├── authentication/       # JWT token management & access controls
│   │   ├── users/                # Custom user model & user profiles
│   │   ├── products/             # Product catalog, images, and filters
│   │   ├── categories/           # Product categories and navigation tags
│   │   ├── cart/                 # Persistent shopping cart management
│   │   ├── wishlist/             # Saved items
│   │   ├── orders/               # Order placement & fulfillment tracking
│   │   ├── payments/             # Payment processing & simulation
│   │   ├── inventory/            # Warehouse stock tracking & alerts
│   │   ├── reviews/              # Verified product ratings & reviews
│   │   ├── coupons/              # Promo codes & discount engines
│   │   ├── notifications/        # User notifications & transactional alerts
│   │   └── analytics/            # Admin revenue, sales, and user analytics
│   ├── media/products/           # Uploaded product imagery
│   ├── static/                   # Static files
│   ├── manage.py                 # Django CLI entrypoint
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Backend environment variables
│
├── database/                     # Database assets & schemas
│   ├── migrations/               # Database migration notes & SQL patches
│   ├── seed_data/                # Realistic JSON/SQL e-commerce seed data
│   └── database_schema.sql       # Raw SQL DDL schema
│
├── docs/                         # Engineering documentation
│   ├── architecture.md           # Deep dive into system architecture & flows
│   ├── api-documentation.md      # Comprehensive REST API specifications
│   ├── database-design.md        # Entity-Relationship diagram & schema reference
│   └── setup-guide.md            # Step-by-step developer onboarding guide
│
├── tests/                        # Automated test suites
│   ├── frontend/                 # Component & unit tests (Vitest / RTL)
│   ├── backend/                  # Django test cases & API tests
│   └── integration/              # End-to-end integration workflows
│
├── docker-compose.yml            # Multi-container orchestration
├── .gitignore                    # Version control exclusions
└── README.md                     # Project overview (this file)
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Docker & Docker Compose** *(Optional, for containerized run)*

### 2. Backend Setup (Local SQLite / PostgreSQL)
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load seed data (optional)
python manage.py loaddata ../database/seed_data/seed_data.json

# Run development server
python manage.py runserver 8000
```
Backend API will be active at: `http://localhost:8000/api/`  
Django Admin dashboard at: `http://localhost:8000/admin/`

### 3. Frontend Setup (React + Vite)
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
Frontend client will be active at: `http://localhost:5173/`

### 4. Docker Compose Setup (Full Stack with PostgreSQL)
```bash
docker-compose up --build
```

---

## 📚 Documentation Links
- [System Architecture](file:///c:/Users/Dhanin/Documents/antigravity/E-Commerce%20Web%20Application/docs/architecture.md)
- [API Documentation](file:///c:/Users/Dhanin/Documents/antigravity/E-Commerce%20Web%20Application/docs/api-documentation.md)
- [Database Design & Schema](file:///c:/Users/Dhanin/Documents/antigravity/E-Commerce%20Web%20Application/docs/database-design.md)
- [Developer Setup Guide](file:///c:/Users/Dhanin/Documents/antigravity/E-Commerce%20Web%20Application/docs/setup-guide.md)

---

## 📄 License
This project is open-source under the MIT License.
