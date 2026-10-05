# System Architecture — SmartCart E-Commerce Platform

## 1. System Overview

SmartCart is built on a decoupled, service-oriented monolithic architecture. It separates the presentation layer (Single Page Application via React) from the backend API service (Django REST Framework), communicating via JSON over HTTP/HTTPS with stateless JWT (JSON Web Token) authentication.

```mermaid
graph TD
    Client[React 18 Single Page Application]
    Gateway[Nginx / Reverse Proxy / Vite Dev Proxy]
    
    subgraph Django_Backend [Django REST Framework Backend API]
        Router[Master URL Router]
        AuthMiddleware[JWT Authentication Middleware]
        
        subgraph Domain_Apps [Domain Applications]
            AuthApp[Authentication & Users]
            ProdApp[Products & Categories]
            CartApp[Cart & Wishlist]
            OrderApp[Orders & Checkout]
            PayApp[Payments & Webhooks]
            InvApp[Inventory Management]
            RevApp[Reviews & Ratings]
            CpnApp[Coupons & Discounts]
            NotifApp[Notifications]
            AnalyticsApp[Admin Analytics]
        end
    end
    
    subgraph Data_Storage [Data & Storage Layer]
        RelationalDB[(Relational DB: SQLite / PostgreSQL)]
        MediaStorage[(Media Assets: Local / Cloud Storage)]
    end

    Client -->|REST API Requests / JWT| Gateway
    Gateway --> Router
    Router --> AuthMiddleware
    AuthMiddleware --> Domain_Apps
    Domain_Apps --> RelationalDB
    Domain_Apps --> MediaStorage
```

---

## 2. Core Architectural Pillars

### 2.1 Decoupled Client-Server Communication
- **Stateless Communication:** Backend does not maintain server-side sessions for REST requests. Authentication relies on standard HTTP `Authorization: Bearer <access_token>` headers.
- **Token Rotation:** Uses dual-token architecture:
  - `access_token`: Short lifespan (15 minutes), used for authorizing API actions.
  - `refresh_token`: Longer lifespan (7 days), used to generate new access tokens without requiring re-login.

### 2.2 Domain-Driven Modular Django Apps
Instead of placing models and views into a bloated single app, SmartCart isolates business domains into cohesive Django apps:
1. **`authentication` & `users`:** Manages identity, registration, password hashing (Argon2 / PBKDF2), role-based permissions (Customer vs. Admin/Staff), and profile details.
2. **`categories` & `products`:** Handles catalog data, multi-attribute filtering (price ranges, categories, stock levels, rating thresholds), and product imagery.
3. **`cart` & `wishlist`:** Manages items selected by users before ordering, syncing quantities, and saving items for later.
4. **`orders` & `payments`:** Coordinates checkout flow, order state transitions (`Pending`, `Paid`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), payment verification, and order receipt generation.
5. **`inventory`:** Tracks real-time stock counts, warns on low thresholds, and prevents overselling via database transactions.
6. **`reviews` & `coupons`:** User feedback with 1–5 star ratings, and discount coupon validation engines.
7. **`notifications` & `analytics`:** Transactional alerts for orders, and merchant analytics dashboard data aggregates.

---

## 3. High-Level Data Flow

### 3.1 Customer Purchasing Flow
```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant React as React Frontend
    participant API as Django REST API
    participant DB as PostgreSQL / SQLite
    participant Payment as Payment Gateway

    Customer->>React: Browses catalog & adds items to Cart
    React->>API: POST /api/cart/items/
    API->>DB: Check stock & update CartItem
    DB-->>API: Saved
    API-->>React: 201 Created (Cart State)

    Customer->>React: Navigates to Checkout
    React->>API: POST /api/orders/create/ (Address & Shipping)
    API->>DB: Lock inventory & create Pending Order
    DB-->>API: Order #ORD-1001 created
    API-->>React: Order Created (Total: $129.99)

    Customer->>React: Submits Payment Details
    React->>API: POST /api/payments/charge/ (Order ID)
    API->>Payment: Process Payment Intent
    Payment-->>API: Payment Succeeded (Tx ID)
    API->>DB: Update Order Status = 'Paid', Decrement Stock
    API-->>React: 200 OK (Payment Confirmation)
    React->>Customer: Display OrderSuccess & Tracking Timeline
```

---

## 4. Security Architecture

1. **Password Hashing:** Utilizes Django's PBKDF2 with SHA256 algorithm by default.
2. **CORS (Cross-Origin Resource Sharing):** Whitelisted origins configured in `settings.py` via `django-cors-headers`.
3. **CSRF Protection & JWT:** API routes utilize JWT tokens in `Authorization` headers, mitigating traditional browser CSRF attack vectors.
4. **Role-Based Access Control (RBAC):**
   - Public: Product browsing, category listing, login/register.
   - Authenticated User: Cart modification, checkout, order history, personal reviews.
   - Admin/Staff: Inventory adjustments, sales reports, product CRUD, user management.
5. **Input Validation:** Django REST Framework Serializers enforce strict schema validation, type checking, and sanitization before data touches the ORM layer.
