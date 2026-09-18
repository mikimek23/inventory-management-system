# inventory-management-system
small business inventory management system

## Demo data

Run `npm run seed` from `backend` after applying the Prisma migrations. The seed is safe to rerun: it updates the demo catalogue and accounts, and rebuilds only transactions and adjustments marked `DEMO:`.

Development/demo credentials only:

- Admin: `admin@example.com` / `Admin@1234`
- Staff: `staff@example.com` / `Staff@1234`

The dataset includes 8 categories, 50 products, 6 suppliers, 10 customers, opening-stock adjustments, and completed, draft, and cancelled purchases and sales.
