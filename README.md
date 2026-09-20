# StockFlow — Inventory Management System

A production-ready, full-stack web application for small and medium retail/wholesale businesses to manage catalog products, stock levels, suppliers, customers, purchases, sales, and executive financial analytics in real time.

### 🌐 Live Deployment Links

| Service | Link / URL | Status |
| :--- | :--- | :--- |
| **Live Web App (Frontend)** | [https://inventory-management-system-rose-seven.vercel.app](https://inventory-management-system-rose-seven.vercel.app) | Production (Vercel) |
| **Backend API Base URL** | `https://inventory-management-system-w3pz.onrender.com/api` | Production (Render) |
| **Interactive Swagger Docs** | [https://inventory-management-system-w3pz.onrender.com/api/doc](https://inventory-management-system-w3pz.onrender.com/api/doc) | Live Swagger Console |
| **API Health Check** | [https://inventory-management-system-w3pz.onrender.com/api/health](https://inventory-management-system-w3pz.onrender.com/api/health) | System Health |

---

## 1. Project Overview & Key Features

StockFlow provides business owners and warehouse operators with an intuitive, unified workspace to track goods from procurement to customer sale with audit trails and real-time inventory adjustments.

### Key Features

- **Executive Analytics & Reporting**: Interactive data visualizations for Revenue vs. Expenses across 30 Days (weekly trajectory buckets), 6 Months, and All Time, complete with Inventory Valuation by Category and Stock Health breakdown.
- **Product & Category Management**: Categorized product catalog with auto-generated SKUs (`SKU-{CAT}-{001}`), cost/selling price tracking, unit definitions, and minimum threshold alerts.
- **Stock Tracking & Real-Time Valuation**: Live inventory on hand, automated calculations derived from completed transactions, and low stock warnings.
- **Stock Adjustments & Audit Logs**: Increase or decrease stock with mandatory audit reasons (e.g., damaged stock, inventory write-off, count corrections).
- **Purchases (Inbound Procurement)**: Complete procurement cycle supporting `DRAFT`, `COMPLETED`, and `CANCELLED` states, with full inline editing for draft orders and stock incrementation upon completion.
- **Sales (Outbound Orders)**: Point-of-sale and invoice generation supporting `DRAFT`, `COMPLETED`, and `CANCELLED` states, with draft order editing and automatic stock decrementing upon completion.
- **Supplier & Customer Directories**: Comprehensive directories with transaction histories, contact details, and balance tracking.
- **Role-Based Access Control (RBAC)**: Distinct permissions for ADMIN (user management, stock adjustments, full configuration) and STAFF (sales and purchasing workflows).
- **Interactive API Documentation**: Embedded Swagger UI available directly at `/api/doc`.

---

## 2. Technology Stack & Versions

### Backend

- **Runtime**: Node.js (`>= 18.x`, ESM module system)
- **Framework**: Express.js `v5.2.1`
- **ORM & Database**: Prisma ORM `v7.10.0` with `@prisma/adapter-pg` driver adapter
- **Database Engine**: PostgreSQL (`14+` or `15+`)
- **Authentication**: JWT (`jsonwebtoken v9.0.3`) with dual-token strategy (short-lived access tokens + secure HTTP-only refresh tokens) & `bcrypt v6.0.0`
- **Validation**: Zod `v4.6.5`
- **API Documentation**: `swagger-ui-express` & `swagger-jsdoc`

### Frontend

- **Framework**: React `v19.2.8` with Vite `v8.3.0`
- **Routing**: React Router DOM `v7.18.3`
- **Server State & Caching**: `@tanstack/react-query v5.102.8`
- **Styling**: TailwindCSS `v4.3.3` with customized design system (slate `#0F172A`, surface `#F8FAFC`, accent `#1D4ED8`)
- **HTTP Client**: Axios `v1.20.0` with automated token refresh interceptors
- **Forms & Validation**: Zod `v4.6.5`

---

## 3. Architecture & Project Structure

The project follows a decoupled client-server architecture with separation of concerns across service, repository, and controller layers:

```
inventory-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma schema definition (PostgreSQL)
│   │   └── seed.js                # Database seeder (52 products, 6 categories, transactions)
│   ├── src/
│   │   ├── config/                # Database and Swagger OpenAPI configuration
│   │   ├── controllers/           # HTTP request parsing and response delivery
│   │   ├── middleware/            # Auth, RBAC guards, and global error handling
│   │   ├── repositories/          # Prisma database query layer
│   │   ├── routes/                # Express API endpoint declarations
│   │   ├── services/              # Core business rules and transactional logic
│   │   ├── utils/                 # Token helpers, asyncHandler, and custom API errors
│   │   ├── app.js                 # Express application middleware assembly
│   │   └── server.js              # Server bootstrapper and port binding
│   └── tests/                     # Integration and unit tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/            # Custom SVG Charts (AreaTrend, BarComparison, Donut)
│   │   │   ├── forms/             # Product, Purchase, and Sale form components
│   │   │   ├── layout/            # AppLayout, Header, and Sidebar navigation
│   │   │   ├── tables/            # Reusable DataTable and Pagination
│   │   │   └── ui/                # Button, Input, Select, Modal, Badge, Toast
│   │   ├── context/               # AuthContext (login, register, user profile state)
│   │   ├── hooks/                 # React Query custom hooks (useProducts, usePurchases, etc.)
│   │   ├── pages/                 # Route views (Dashboard, Analysis, Products, Sales, etc.)
│   │   ├── services/              # Axios API client modules
│   │   └── utils/                 # Currency and date formatters
│   ├── index.html
│   └── vite.config.js
├── API_DOCUMENTATION.md           # Markdown reference for all backend endpoints
└── README.md
```

---

## 4. Database Setup, Migrations & Seeding

### Prerequisites

- Node.js (v18.0.0 or higher)
- PostgreSQL running locally or remotely (e.g., Docker, Supabase, Neon)
_ Clone the Repository
```bash
git clone https://github.com/mikimek23/inventory-management-system
cd inventory-management-system
```

### 1. Database Creation

Ensure a PostgreSQL database exists:

```sql
CREATE DATABASE inventory_management_system;
```

### 2. Configure Environment

In `backend/`, copy the example file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your credentials:

```env
DATABASE_URL="postgres://postgres:your_password@localhost:5432/inventory_management_system"
```

### 3. Run Migrations & Generate Prisma Client

```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Seed the Database

Run the seed script to populate realistic real-world data:

```bash
npm run seed
```

This loads:

- **6 Business Categories**: Beverages, Produce, Bakery, Pantry, Dairy, Personal Care.
- **52 Products**: Real items with units, minimum threshold levels, and pricing.
- **6 Suppliers & 12 Customers**: Real contact details and addresses.
- **24 Transactions**: 10 Purchases and 14 Sales spread across 30 days.
- **Stock Threshold Alerts**: 2 calibrated low-stock items.

---

## 5. How to Run Locally

### Start Backend

```bash
cd backend
npm install
npm run dev
```

The API server will start at `http://localhost:5000`.

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will open at `http://localhost:5173`.

---

## 6. Environment Variables

### Backend (`backend/.env` & `backend/.env.example`)

```env
# Server
PORT=5000
FRONTEND_URL="http://localhost:5173"

# Database
DATABASE_URL="postgres://postgres:your_password@localhost:5432/inventory_management_system"

# Authentication Secrets
JWT_ACCESS_SECRET="your_long_random_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_long_random_jwt_refresh_secret_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Frontend (`frontend/.env` & `frontend/.env.example`)

```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 7. Demo Credentials

The database seeder provisions two default accounts for testing:

| Role                     | Email               | Password     | Access Scope                                                                                                           |
| ------------------------ | ------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **System Administrator** | `admin@example.com` | `Admin@1234` | Full system access: User management, stock adjustments, products, reports, purchases, and sales.                       |
| **Staff Member**         | `staff@example.com` | `Staff@1234` | Operational access: Products overview, stock inspection, creating/editing sales & purchases, customers, and suppliers. |

---

## 8. API Documentation & Endpoints Summary

### Interactive Swagger UI

Access the interactive Swagger UI console in your browser:

- **Production Cloud Documentation**: [https://inventory-management-system-w3pz.onrender.com/api/doc](https://inventory-management-system-w3pz.onrender.com/api/doc)
- **Production Backend Base URL**: `https://inventory-management-system-w3pz.onrender.com/api`
- **Live Frontend Web App**: [https://inventory-management-system-rose-seven.vercel.app](https://inventory-management-system-rose-seven.vercel.app)
- **Local Development URL**: `http://localhost:5000/api/doc`

### Endpoint Overview

| Module         | Method  | Endpoint                    | Description                                | Auth Required |
| -------------- | ------- | --------------------------- | ------------------------------------------ | ------------- |
| **Auth**       | `POST`  | `/api/auth/register`        | Register a new user account                | No            |
| **Auth**       | `POST`  | `/api/auth/login`           | Log in and receive access + refresh tokens | No            |
| **Auth**       | `POST`  | `/api/auth/refresh`         | Refresh expired access token               | No (Cookie)   |
| **Auth**       | `POST`  | `/api/auth/logout`          | Invalidate active session                  | Yes           |
| **Profile**    | `GET`   | `/api/profile`              | Retrieve logged-in user profile            | Yes           |
| **Profile**    | `PATCH` | `/api/profile`              | Update profile details / password          | Yes           |
| **Products**   | `GET`   | `/api/products`             | List all products with filtering           | Yes           |
| **Products**   | `POST`  | `/api/products`             | Create product (Admin only)                | Admin         |
| **Products**   | `GET`   | `/api/products/:id`         | Get single product details                 | Yes           |
| **Products**   | `PATCH` | `/api/products/:id`         | Update product details                     | Admin         |
| **Products**   | `PATCH` | `/api/products/:id/status`  | Toggle active/inactive state               | Admin         |
| **Categories** | `GET`   | `/api/categories`           | List categories with SKU counts            | Yes           |
| **Categories** | `POST`  | `/api/categories`           | Create new category                        | Admin         |
| **Stock**      | `GET`   | `/api/stock`                | On-hand quantity and stock status          | Yes           |
| **Stock**      | `GET`   | `/api/stock-adjustments`    | View adjustment audit logs                 | Yes           |
| **Stock**      | `POST`  | `/api/stock-adjustments`    | Post inventory increase/decrease           | Admin         |
| **Purchases**  | `GET`   | `/api/purchases`            | List procurement purchases                 | Yes           |
| **Purchases**  | `POST`  | `/api/purchases`            | Create purchase order (Draft/Complete)     | Yes           |
| **Purchases**  | `GET`   | `/api/purchases/:id`        | Retrieve purchase order with items         | Yes           |
| **Purchases**  | `PATCH` | `/api/purchases/:id`        | Edit draft purchase order                  | Yes           |
| **Purchases**  | `PATCH` | `/api/purchases/:id/status` | Transition status (COMPLETED/CANCELLED)    | Yes           |
| **Sales**      | `GET`   | `/api/sales`                | List customer sales orders                 | Yes           |
| **Sales**      | `POST`  | `/api/sales`                | Create new sale order                      | Yes           |
| **Sales**      | `GET`   | `/api/sales/:id`            | Retrieve sale order with items             | Yes           |
| **Sales**      | `PATCH` | `/api/sales/:id`            | Edit draft sale order                      | Yes           |
| **Sales**      | `PATCH` | `/api/sales/:id/status`     | Transition status (COMPLETED/CANCELLED)    | Yes           |
| **Suppliers**  | `GET`   | `/api/suppliers`            | List all active suppliers                  | Yes           |
| **Suppliers**  | `POST`  | `/api/suppliers`            | Register new supplier                      | Yes           |
| **Customers**  | `GET`   | `/api/customers`            | List all active customers                  | Yes           |
| **Customers**  | `POST`  | `/api/customers`            | Register new customer                      | Yes           |
| **Users**      | `GET`   | `/api/users`                | List system users                          | Admin         |
| **Users**      | `PATCH` | `/api/users/:id/role`       | Modify user role                           | Admin         |
| **Users**      | `PATCH` | `/api/users/:id/status`     | Activate or suspend user account           | Admin         |

> For comprehensive schema samples, request bodies, and error codes, refer to [API_DOCUMENTATION.md](API_DOCUMENTATION.md) or inspect live schemas via Swagger UI at `/api/doc`.

---

## 9. Testing & Quality Verification

### Automated Backend Integration Tests

Run the automated integration test suite to verify core transactional business rules, inventory ledger updates, and authorization boundaries:

```bash
cd backend
npm test
```

The test suite verifies:
1. **Negative Stock Prevention (Rule 1)**: Rejection of sales when available stock is insufficient (`HTTP 409 Conflict`).
2. **Purchase Stock-In (Rule 2)**: Accurate increment of available product inventory upon purchase order completion.
3. **Sale Stock-Out (Rule 3)**: Accurate decrement of product inventory upon customer sale completion.
4. **Role-Based Authorization (Rule 4)**: Strict enforcement ensuring Staff users cannot execute Admin-restricted actions (`HTTP 403 Forbidden`).

### Frontend Build & Type Validation

Verify that the React application compiles, bundles all assets cleanly, and passes syntax validation without errors:

```bash
cd frontend
npm run build
```

To run the ESLint code quality checks:

```bash
cd frontend
npm run lint
```

### Interactive API Verification

You can directly explore, validate, and test all live backend endpoints using the interactive Swagger documentation interface while the backend server is running:

- **Swagger UI**: Visit `http://localhost:5000/api/doc` in your browser.
- Authorize your session with an Admin or Staff token from `/api/auth/login`.
- Execute live queries and inspect request schemas, status responses, and validation error messages.

---

## 10. Known Limitations & Assumptions

### Assumptions

- **Single Currency Assumption**: All currency valuations, purchase costs, and sales prices are modeled in Ethiopian Birr (`ETB`) formatted via `Intl.NumberFormat`. Multi-currency conversion is not enabled in the current release.
- **FIFO / Average Costing**: Valuation calculations reflect the current registered `costPrice` on the product record rather than batch-level FIFO (First-In, First-Out) lots.
- **Single Warehouse**: Inventory tracking currently assumes a single centralized warehouse location per business entity.

### Known Limitations

- **File Uploads**: Product images and receipts are currently represented via clean typography and icons rather than multi-part S3/cloud binary uploads.
- **Refund Workflows**: Partial refunds are managed via stock adjustments and replacement transactions rather than automated partial credit notes.

---

## 11. AI Tool Usage & Attribution

In accordance with transparent engineering practices:

- **AI Tool Utilization**: An AI coding assistant (Antigravity) was used for scaffolding boilerplate code, optimizing SVG chart mathematics for responsive viewports, drafting initial Swagger OpenAPI specifications, and writing database seed datasets.
- **Human Review & Modifications**:
  - Personally designed and verified all database relationships and migration files in `prisma/schema.prisma`.
  - Audited transactional safety to prevent stock discrepancies on concurrent purchases and sales.
  - Custom-tailored the UI design system (Tailwind v4 color palette, typography scales, responsive KPI cards, and custom CSS).
  - Validated authentication middleware, cookie security flags, and role authorization policies across all API routes.
