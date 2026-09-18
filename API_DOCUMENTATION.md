# Inventory Management System API Documentation

Comprehensive REST API documentation for the Inventory Management System backend.

---

## 1. Overview & Interactive Swagger Documentation

- **Base URL**: `http://localhost:5000/api`
- **Interactive Swagger UI**: [**`http://localhost:5000/api/doc`**](http://localhost:5000/api/doc)
- **OpenAPI 3.0 Raw Spec**: [**`http://localhost:5000/api/doc/swagger.json`**](http://localhost:5000/api/doc/swagger.json)
- **Default Port**: `5000`
- **Content-Type**: `application/json`
- **Database**: PostgreSQL with Prisma ORM
- **Session Auth**: JWT Access Token (Header) + HTTP-Only Refresh Token (Cookie)

### Interactive Swagger UI Console
Navigate to `http://localhost:5000/api/doc` in any browser to access the live Swagger UI console:
1. Click **Authorize** (top right) and paste your Bearer token.
2. Click **Try it out** on any endpoint to send live requests directly from your browser.
3. Inspect request schemas, sample responses, and query parameters interactively.

### Seed Accounts (Pre-configured)
| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@1234` | Full access (Users, Stock Adjustments, Master Data) |
| **Staff Member** | `staff@example.com` | `Staff@1234` | Operational access (Purchases, Sales, Stock View) |

---

## 2. Interactive Swagger UI Quick Start

Interactive OpenAPI/Swagger documentation is built directly into the backend server:
- **Swagger Documentation URL**: `http://localhost:5000/api/doc`

### How to Test with Swagger UI
1. **Start the backend server** (`npm run dev` in `backend/`).
2. Open your browser and navigate to `http://localhost:5000/api/doc`.
3. Locate the **`POST /api/auth/login`** endpoint, click **Try it out**, enter demo credentials (`admin@example.com` / `Admin@1234`), and execute.
4. Copy the `accessToken` from the response body.
5. Click the green **Authorize** button at the top right of the Swagger UI page, enter `Bearer YOUR_ACCESS_TOKEN`, and click **Authorize**.
6. All secured endpoints (`Products`, `Purchases`, `Sales`, `Stock`, `Categories`, `Users`) can now be tested directly in your browser with pre-populated schemas.

---

## 3. Standard Request & Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation error or business logic failure",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure (Zod schema mismatch).
- `401 Unauthorized`: Missing, expired, or invalid JWT access token.
- `403 Forbidden`: Insufficient permissions (e.g. Staff attempting Admin-only routes) or inactive account.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Business logic conflict (e.g. attempting to edit a non-draft transaction, duplicate email, insufficient stock).

---

## 4. Endpoints Reference

### Health Check

#### `GET /health`
- **Access**: Public
- **Description**: Verifies backend server health.
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "healthy"
}
```

---

### Authentication (`/api/auth`)

#### `POST /auth/register`
- **Access**: Public
- **Description**: Registers a new user account.
- **Request Body**:
```json
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "SecurePassword@123"
}
```
> **Validation Rules**:
> - `name`: string, min 3 characters
> - `email`: valid email, unique
> - `password`: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character (`[@$!%*?&]`)

#### `POST /auth/login`
- **Access**: Public
- **Description**: Authenticates credentials, sets `refreshToken` HTTP-only cookie, returns JWT `accessToken`.
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "Admin@1234"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "id": "c1f72ef1-95ad-47ec-a6be-73a4bbf79344",
    "name": "Demo Administrator",
    "email": "admin@example.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2026-09-18T00:00:00.000Z",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### `GET /auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Description**: Returns profile details of the currently authenticated user.

#### `POST /auth/refresh`
- **Access**: Public (Requires `refreshToken` cookie)
- **Description**: Rotates access token and returns updated credentials.

#### `POST /auth/logout`
- **Access**: Public
- **Description**: Clears `refreshToken` in DB and deletes cookie.

---

### User Profile (`/api/profile`)

#### `PATCH /profile`
- **Access**: Authenticated
- **Description**: Updates display name or email for current authenticated user.
- **Request Body**:
```json
{
  "name": "Alex Mercer Updated",
  "email": "alex.new@example.com"
}
```

---

### User Management (`/api/users`)

*All routes in this group require role: `ADMIN`.*

#### `GET /users`
- **Access**: Admin Only
- **Description**: Lists all user accounts.

#### `GET /users/:id`
- **Access**: Admin Only
- **Description**: Get user details by UUID.

#### `PATCH /users/:id/role`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "role": "STAFF" // "ADMIN" | "STAFF"
}
```

#### `PATCH /users/:id/status`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "status": "ACTIVE" // "ACTIVE" | "INACTIVE"
}
```

---

### Categories (`/api/categories`)

#### `GET /categories`
- **Access**: Authenticated
- **Description**: Returns active and cataloged categories.

#### `POST /categories`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "name": "Consumer Electronics",
  "code": "ELE",
  "description": "Smartphones, accessories and computers"
}
```

#### `PATCH /categories/:id`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "name": "Consumer Electronics & Gadgets",
  "description": "Updated category description"
}
```

#### `POST /categories/:id/status`
- **Access**: Admin Only
- **Description**: Toggles status between `ACTIVE` and `INACTIVE`.

---

### Products (`/api/products`)

#### `GET /products`
- **Access**: Authenticated
- **Description**: Returns all catalog products with category details.

#### `GET /products/:id`
- **Access**: Authenticated
- **Description**: Returns single product with transaction relationships.

#### `POST /products`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "name": "Wireless Noise Cancelling Headphones",
  "sku": "AUD-ELE-001",
  "categoryId": "22e6bb45-d856-4c4d-91b5-12cf1fa0be98",
  "unit": "pcs",
  "costPrice": 45.00,
  "sellingPrice": 79.99,
  "minimumStock": 10
}
```

#### `PATCH /products/:id`
- **Access**: Admin Only
- **Request Body**: Same fields as POST, all optional.

#### `PATCH /products/:id/status`
- **Access**: Admin Only
- **Description**: Toggles product between `ACTIVE` and `INACTIVE`.

---

### Contacts (`/api/suppliers` & `/api/customers`)

#### Suppliers (`/api/suppliers`)
- `GET /suppliers`: List suppliers.
- `POST /suppliers`: Create supplier (*Admin Only*).
- `PATCH /suppliers/:id`: Edit supplier details (*Admin Only*).
- `PATCH /suppliers/:id/status`: Toggle supplier active status (*Admin Only*).

**Supplier Body Schema**:
```json
{
  "name": "Apex Wholesale Ltd",
  "phone": "+1-555-0199",
  "email": "orders@apexwholesale.test",
  "address": "400 Logistics Blvd",
  "notes": "Fast fulfillment supplier"
}
```

#### Customers (`/api/customers`)
- `GET /customers`: List customers.
- `POST /customers`: Create customer (*Admin Only*).
- `PATCH /customers/:id`: Edit customer details (*Admin Only*).
- `PATCH /customers/:id/status`: Toggle customer active status (*Admin Only*).

---

### Purchases (`/api/purchases`) — Stock-In

Purchases follow a **Draft -> Completed / Cancelled** state machine. Stock is **only incremented** when the purchase is moved to `COMPLETED`.

#### `GET /purchases`
- **Access**: Authenticated
- **Description**: Lists purchase orders sorted by date.

#### `POST /purchases`
- **Access**: Authenticated
- **Description**: Creates a purchase in `DRAFT` status.
- **Request Body**:
```json
{
  "supplierId": "c869ba17-640a-41f8-9a63-4a15a0cba481",
  "notes": "Quarterly stock replenishment",
  "items": [
    {
      "productId": "73e9eb90-7d68-45ee-9fa9-4b61fa1cfa28",
      "quantity": 50,
      "unitCost": 35.00
    }
  ]
}
```

#### `PATCH /purchases/:id`
- **Access**: Authenticated
- **Description**: Updates draft purchase supplier, notes, or item lines. Only allowed if status is `DRAFT`.
- **Request Body**: Same fields as POST.

#### `PATCH /purchases/:id/complete`
- **Access**: Authenticated
- **Description**: Completes the purchase and increments product inventory stock.

#### `PATCH /purchases/:id/cancel`
- **Access**: Authenticated
- **Description**: Cancels the purchase draft.

---

### Sales (`/api/sales`) — Stock-Out

Sales follow a **Draft -> Completed / Cancelled** state machine. Stock is validated and **deducted** when completed.

#### `GET /sales`
- **Access**: Authenticated
- **Description**: Lists sales transactions.

#### `POST /sales`
- **Access**: Authenticated
- **Description**: Creates a sale in `DRAFT` status (`customerId` optional for walk-in sales).
- **Request Body**:
```json
{
  "customerId": "81f18e9a-7a5d-4f11-9a99-b1d5fa023e19",
  "notes": "Retail store sale",
  "items": [
    {
      "productId": "73e9eb90-7d68-45ee-9fa9-4b61fa1cfa28",
      "quantity": 2,
      "unitPrice": 59.99
    }
  ]
}
```

#### `PATCH /sales/:id/complete`
- **Access**: Authenticated
- **Description**: Verifies that current stock is sufficient for all items, deducts inventory, and marks sale as `COMPLETED`. Returns `409 Conflict` if stock is insufficient.

#### `PATCH /sales/:id/cancel`
- **Access**: Authenticated
- **Description**: Cancels draft sale.

---

### Stock & Adjustments (`/api/stock` & `/api/stock-adjustments`)

#### `GET /stock`
- **Access**: Authenticated
- **Description**: Returns live stock on hand, acquisition cost, and minimum stock threshold for all products.
- **Response Sample**:
```json
{
  "success": true,
  "data": [
    {
      "id": "73e9eb90-7d68-45ee-9fa9-4b61fa1cfa28",
      "name": "Mineral Water",
      "sku": "BEV-001",
      "currentStock": "120.00",
      "minimumStock": "20.00",
      "status": "ACTIVE"
    }
  ]
}
```

#### `GET /stock-adjustments`
- **Access**: Admin Only
- **Description**: Returns audit log of manual stock adjustments.

#### `POST /stock-adjustments`
- **Access**: Admin Only
- **Description**: Manually increases or decreases product stock with a required business reason.
- **Request Body**:
```json
{
  "productId": "73e9eb90-7d68-45ee-9fa9-4b61fa1cfa28",
  "type": "INCREASE", // "INCREASE" | "DECREASE"
  "quantity": 10,
  "reason": "Warehouse annual physical audit reconciliation"
}
```

---

## 5. End-to-End API Verification Flow (via Swagger UI)

You can verify the entire business lifecycle directly inside Swagger UI:

1. Execute **`POST /api/auth/login`** with Admin credentials and authorize the session.
2. Execute **`GET /api/products`** and copy an active `productId`.
3. Execute **`GET /api/suppliers`** and copy a `supplierId`.
4. Execute **`POST /api/purchases`** with status `DRAFT` using the copied IDs.
5. Execute **`PATCH /api/purchases/{id}/status`** with `{ "status": "COMPLETED" }`.
6. Execute **`GET /api/stock`** to observe the on-hand stock quantity increase automatically.
7. Execute **`POST /api/sales`** with status `DRAFT` and then transition to `COMPLETED`.
8. Re-execute **`GET /api/stock`** to verify that stock quantity has been deducted.
9. Execute **`GET /api/stock-adjustments`** to verify recorded stock movement logs.
