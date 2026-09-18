export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "StockFlow Inventory Management API",
    version: "1.0.0",
    description:
      "Enterprise REST API for inventory tracking, procurement purchases, sales order management, stock adjustments, and role-based access control.\n\n• **Live Web App**: https://inventory-management-system-rose-seven.vercel.app\n• **Production Backend**: https://inventory-management-system-w3pz.onrender.com",
    contact: {
      name: "StockFlow API Support",
      email: "support@stockflow.local",
    },
  },
  servers: [
    {
      url: "https://inventory-management-system-w3pz.onrender.com/api",
      description: "Production Cloud Server (Render)",
    },
    {
      url: "/api",
      description: "Current Backend Server",
    },
    {
      url: "http://localhost:5000/api",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token obtained from /auth/login.",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message description" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: {
            type: "string",
            format: "password",
            example: "SecurePass@123",
            description:
              "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&)",
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", format: "password", example: "Admin@1234" },
        },
      },
      ProfileUpdateInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Jane Doe Updated" },
          email: { type: "string", format: "email", example: "jane.updated@example.com" },
        },
      },
      CategoryInput: {
        type: "object",
        required: ["name", "code"],
        properties: {
          name: { type: "string", example: "Beverages" },
          code: { type: "string", example: "BEV" },
          description: { type: "string", example: "Packaged drinks and refreshments" },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "categoryId", "unit", "costPrice", "sellingPrice"],
        properties: {
          name: { type: "string", example: "Sparkling Mineral Water" },
          sku: { type: "string", example: "BEV-001" },
          categoryId: { type: "string", format: "uuid", example: "22e6bb45-d856-4c4d-91b5-12cf1fa0be98" },
          unit: { type: "string", example: "bottle" },
          costPrice: { type: "number", example: 1.25 },
          sellingPrice: { type: "number", example: 2.50 },
          minimumStock: { type: "number", example: 20 },
        },
      },
      ContactInput: {
        type: "object",
        required: ["name", "phone"],
        properties: {
          name: { type: "string", example: "Apex Wholesale Ltd" },
          phone: { type: "string", example: "+1-555-0199" },
          email: { type: "string", format: "email", example: "orders@apex.test" },
          address: { type: "string", example: "123 Industrial Way" },
          notes: { type: "string", example: "Primary vendor" },
        },
      },
      PurchaseItemInput: {
        type: "object",
        required: ["productId", "quantity", "unitCost"],
        properties: {
          productId: { type: "string", format: "uuid", example: "73e9eb90-7d68-45ee-9fa9-4b61fa1cfa28" },
          quantity: { type: "number", example: 50 },
          unitCost: { type: "number", example: 1.25 },
        },
      },
      PurchaseInput: {
        type: "object",
        required: ["supplierId", "items"],
        properties: {
          supplierId: { type: "string", format: "uuid", example: "c869ba17-640a-41f8-9a63-4a15a0cba481" },
          notes: { type: "string", example: "Stock replenishment" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/PurchaseItemInput" },
          },
        },
      },
      SaleItemInput: {
        type: "object",
        required: ["productId", "quantity", "unitPrice"],
        properties: {
          productId: { type: "string", format: "uuid", example: "73e9eb90-7d68-45ee-9fa9-4b61fa1cfa28" },
          quantity: { type: "number", example: 2 },
          unitPrice: { type: "number", example: 2.50 },
        },
      },
      SaleInput: {
        type: "object",
        required: ["items"],
        properties: {
          customerId: { type: "string", format: "uuid", example: "81f18e9a-7a5d-4f11-9a99-b1d5fa023e19" },
          notes: { type: "string", example: "Counter sale" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/SaleItemInput" },
          },
        },
      },
      StockAdjustmentInput: {
        type: "object",
        required: ["productId", "type", "quantity", "reason"],
        properties: {
          productId: { type: "string", format: "uuid", example: "73e9eb90-7d68-45ee-9fa9-4b61fa1cfa28" },
          type: { type: "string", enum: ["INCREASE", "DECREASE"], example: "INCREASE" },
          quantity: { type: "number", example: 5 },
          reason: { type: "string", example: "Physical inventory audit count correction" },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check Server Health",
        description: "Returns server status and connectivity.",
        security: [],
        responses: {
          200: {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "healthy" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register New User",
        description: "Creates a new user account with STAFF role.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
          409: { description: "User with this email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login User",
        description:
          "Authenticates user, sets HTTP-only refreshToken cookie, and returns accessToken.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          200: { description: "Logged in successfully with accessToken" },
          401: { description: "Incorrect email or password" },
          403: { description: "User account is inactive" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get Current Authenticated User",
        description: "Returns currently authenticated user profile and role.",
        responses: {
          200: { description: "Current user profile" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh Access Token",
        description:
          "Uses the refreshToken cookie to generate a fresh accessToken.",
        security: [],
        responses: {
          200: { description: "Token refreshed successfully" },
          403: { description: "Invalid or expired refresh token" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout User",
        description: "Clears refresh token from DB and revokes cookie.",
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/profile": {
      patch: {
        tags: ["Profile"],
        summary: "Update Current User Profile",
        description: "Updates display name or email for authenticated user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileUpdateInput" },
            },
          },
        },
        responses: {
          200: { description: "Profile updated successfully" },
          400: { description: "Validation failure" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/users": {
      get: {
        tags: ["User Management (Admin)"],
        summary: "List All Users",
        description: "Retrieves list of all registered users. Requires ADMIN role.",
        responses: {
          200: { description: "List of users" },
          403: { description: "Forbidden - Admin required" },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["User Management (Admin)"],
        summary: "Get User by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "User details" },
          404: { description: "User not found" },
        },
      },
    },
    "/users/{id}/role": {
      patch: {
        tags: ["User Management (Admin)"],
        summary: "Update User Role",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: { type: "string", enum: ["ADMIN", "STAFF"], example: "STAFF" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Role updated" },
        },
      },
    },
    "/users/{id}/status": {
      patch: {
        tags: ["User Management (Admin)"],
        summary: "Update User Status",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Status updated" },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List All Categories",
        responses: {
          200: { description: "Categories list" },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create Category (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryInput" },
            },
          },
        },
        responses: {
          201: { description: "Category created" },
          403: { description: "Forbidden - Admin required" },
        },
      },
    },
    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get Category by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Category details" },
          404: { description: "Category not found" },
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update Category (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Category updated" },
        },
      },
    },
    "/categories/{id}/status": {
      post: {
        tags: ["Categories"],
        summary: "Toggle Category Status (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Status toggled" },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List Products",
        responses: {
          200: { description: "Products list" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create Product (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          201: { description: "Product created" },
          403: { description: "Forbidden - Admin required" },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get Product by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Product details" },
          404: { description: "Product not found" },
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Update Product (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          200: { description: "Product updated" },
        },
      },
    },
    "/products/{id}/status": {
      patch: {
        tags: ["Products"],
        summary: "Toggle Product Status (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Product status toggled" },
        },
      },
    },
    "/suppliers": {
      get: {
        tags: ["Contacts - Suppliers"],
        summary: "List Suppliers",
        responses: { 200: { description: "Suppliers list" } },
      },
      post: {
        tags: ["Contacts - Suppliers"],
        summary: "Create Supplier (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactInput" },
            },
          },
        },
        responses: { 201: { description: "Supplier created" } },
      },
    },
    "/suppliers/{id}": {
      patch: {
        tags: ["Contacts - Suppliers"],
        summary: "Update Supplier (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactInput" },
            },
          },
        },
        responses: { 200: { description: "Supplier updated" } },
      },
    },
    "/suppliers/{id}/status": {
      patch: {
        tags: ["Contacts - Suppliers"],
        summary: "Toggle Supplier Status (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Status updated" } },
      },
    },
    "/customers": {
      get: {
        tags: ["Contacts - Customers"],
        summary: "List Customers",
        responses: { 200: { description: "Customers list" } },
      },
      post: {
        tags: ["Contacts - Customers"],
        summary: "Create Customer (Admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactInput" },
            },
          },
        },
        responses: { 201: { description: "Customer created" } },
      },
    },
    "/customers/{id}": {
      patch: {
        tags: ["Contacts - Customers"],
        summary: "Update Customer (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactInput" },
            },
          },
        },
        responses: { 200: { description: "Customer updated" } },
      },
    },
    "/customers/{id}/status": {
      patch: {
        tags: ["Contacts - Customers"],
        summary: "Toggle Customer Status (Admin)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Status updated" } },
      },
    },
    "/purchases": {
      get: {
        tags: ["Purchases (Stock-In)"],
        summary: "List Purchases",
        responses: { 200: { description: "Purchases list" } },
      },
      post: {
        tags: ["Purchases (Stock-In)"],
        summary: "Create Purchase Draft",
        description: "Creates a purchase order in DRAFT status.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PurchaseInput" },
            },
          },
        },
        responses: { 201: { description: "Purchase draft created" } },
      },
    },
    "/purchases/{id}": {
      get: {
        tags: ["Purchases (Stock-In)"],
        summary: "Get Purchase by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Purchase details" } },
      },
      patch: {
        tags: ["Purchases (Stock-In)"],
        summary: "Update Purchase Draft",
        description: "Modifies draft line items and recalculates totals. Only allowed for DRAFT status.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PurchaseInput" },
            },
          },
        },
        responses: {
          200: { description: "Purchase draft updated" },
          409: { description: "Conflict - Only draft purchases can be updated" },
        },
      },
    },
    "/purchases/{id}/complete": {
      patch: {
        tags: ["Purchases (Stock-In)"],
        summary: "Complete Purchase",
        description: "Finalizes draft and increments inventory stock.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Purchase completed and stock updated" } },
      },
    },
    "/purchases/{id}/cancel": {
      patch: {
        tags: ["Purchases (Stock-In)"],
        summary: "Cancel Purchase",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Purchase cancelled" } },
      },
    },
    "/sales": {
      get: {
        tags: ["Sales (Stock-Out)"],
        summary: "List Sales",
        responses: { 200: { description: "Sales list" } },
      },
      post: {
        tags: ["Sales (Stock-Out)"],
        summary: "Create Sale Draft",
        description: "Creates a sale in DRAFT status.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SaleInput" },
            },
          },
        },
        responses: { 201: { description: "Sale draft created" } },
      },
    },
    "/sales/{id}": {
      get: {
        tags: ["Sales (Stock-Out)"],
        summary: "Get Sale by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Sale details" } },
      },
    },
    "/sales/{id}/complete": {
      patch: {
        tags: ["Sales (Stock-Out)"],
        summary: "Complete Sale",
        description: "Verifies stock availability, deducts inventory, and marks sale COMPLETED.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Sale completed and stock deducted" },
          409: { description: "Conflict - Insufficient stock" },
        },
      },
    },
    "/sales/{id}/cancel": {
      patch: {
        tags: ["Sales (Stock-Out)"],
        summary: "Cancel Sale",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Sale cancelled" } },
      },
    },
    "/stock": {
      get: {
        tags: ["Stock & Adjustments"],
        summary: "Get Live Stock Balance",
        description: "Calculates on-hand stock and threshold status for all products.",
        responses: { 200: { description: "Stock balance list" } },
      },
    },
    "/stock-adjustments": {
      get: {
        tags: ["Stock & Adjustments"],
        summary: "Get Stock Adjustments (Admin)",
        description: "Lists manual audit adjustment logs.",
        responses: { 200: { description: "Stock adjustments audit list" } },
      },
      post: {
        tags: ["Stock & Adjustments"],
        summary: "Create Stock Adjustment (Admin)",
        description: "Manually increases or decreases product stock.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StockAdjustmentInput" },
            },
          },
        },
        responses: { 201: { description: "Stock adjustment created" } },
      },
    },
  },
};

export default swaggerSpec;
