# REST API Documentation — SmartCart

All API endpoints are prefixed with `/api/`. Responses are delivered formatted as JSON with standard HTTP status codes.

---

## 1. Authentication Endpoints (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:--------------|
| `POST` | `/api/auth/register/` | Register a new customer account | No |
| `POST` | `/api/auth/login/` | Obtain JWT token pair (`access`, `refresh`) | No |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | No |
| `POST` | `/api/auth/logout/` | Blacklist refresh token & logout | Yes |
| `POST` | `/api/auth/forgot-password/` | Send password reset email token | No |
| `POST` | `/api/auth/reset-password/` | Reset password using verified token | No |

### Example: Login Request & Response
```json
// POST /api/auth/login/
{
  "email": "customer@example.com",
  "password": "SecurePassword123!"
}

// 200 OK Response
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": 1,
    "email": "customer@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "is_staff": false
  }
}
```

---

## 2. Products & Categories (`/api/products/`, `/api/categories/`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:--------------|
| `GET` | `/api/categories/` | List all active categories | No |
| `GET` | `/api/categories/{slug}/` | Get category details by slug | No |
| `GET` | `/api/products/` | List products (supports filtering, search, pagination) | No |
| `GET` | `/api/products/{id}/` | Get single product detail + ratings | No |
| `POST` | `/api/products/` | Create a new product | Admin only |
| `PUT/PATCH`| `/api/products/{id}/` | Update product details | Admin only |
| `DELETE` | `/api/products/{id}/` | Soft delete / remove product | Admin only |

### Query Parameters for `/api/products/`
- `search`: Search text across product title and description.
- `category`: Category slug filter.
- `min_price` & `max_price`: Price range boundaries.
- `ordering`: Sort by `price`, `-price`, `rating`, `created_at`.
- `page` & `page_size`: Pagination control (default page size: 12).

---

## 3. Cart & Wishlist (`/api/cart/`, `/api/wishlist/`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:--------------|
| `GET` | `/api/cart/` | Retrieve user's current active cart | Yes |
| `POST` | `/api/cart/items/` | Add item or increment quantity in cart | Yes |
| `PATCH`| `/api/cart/items/{id}/` | Update quantity of a specific cart item | Yes |
| `DELETE`| `/api/cart/items/{id}/` | Remove item from cart | Yes |
| `POST` | `/api/cart/clear/` | Empty the entire cart | Yes |
| `GET` | `/api/wishlist/` | Get user saved wishlist items | Yes |
| `POST` | `/api/wishlist/toggle/` | Add or remove product from wishlist | Yes |

---

## 4. Orders & Checkout (`/api/orders/`, `/api/payments/`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:--------------|
| `GET` | `/api/orders/` | List current user's past orders | Yes |
| `GET` | `/api/orders/{order_number}/` | Retrieve detailed order status & timeline | Yes |
| `POST` | `/api/orders/` | Place a new order from current cart | Yes |
| `POST` | `/api/payments/create-intent/` | Initialize payment intent | Yes |
| `POST` | `/api/payments/confirm/` | Confirm payment success and update order | Yes |

---

## 5. Reviews, Coupons & Inventory (`/api/reviews/`, `/api/coupons/`, `/api/inventory/`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:--------------|
| `GET` | `/api/reviews/?product={id}` | List approved reviews for a product | No |
| `POST` | `/api/reviews/` | Submit a product review and rating | Yes (Verified buyer) |
| `POST` | `/api/coupons/validate/` | Validate coupon code and return discount | Yes |
| `GET` | `/api/inventory/` | List stock status across products | Admin only |
| `PATCH`| `/api/inventory/{id}/` | Adjust warehouse inventory quantity | Admin only |

---

## 6. Admin & Analytics (`/api/analytics/`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:--------------|
| `GET` | `/api/analytics/dashboard/` | KPI summary (revenue, orders, new users) | Admin only |
| `GET` | `/api/analytics/sales/` | Daily/weekly revenue time series data | Admin only |
| `GET` | `/api/analytics/top-products/` | Best-selling products by units & revenue | Admin only |
| `GET` | `/api/analytics/recent-orders/`| Recent order activity feed | Admin only |
