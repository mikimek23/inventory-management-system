import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AppLayout from "../components/layout/AppLayout";

// Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Profile from "../pages/profile/Profile";
import Dashboard from "../pages/dashboard/Dashboard";
import Analysis from "../pages/analysis/Analysis";
import Products from "../pages/products/Products";
import ProductCreate from "../pages/products/ProductCreate";
import ProductDetails from "../pages/products/ProductDetails";
import ProductEdit from "../pages/products/ProductEdit";
import Categories from "../pages/categories/Categories";
import Suppliers from "../pages/suppliers/Suppliers";
import Customers from "../pages/customers/Customers";
import Purchases from "../pages/purchases/Purchases";
import PurchaseCreate from "../pages/purchases/PurchaseCreate";
import PurchaseDetails from "../pages/purchases/PurchaseDetails";
import PurchaseEdit from "../pages/purchases/PurchaseEdit";
import Sales from "../pages/sales/Sales";
import SaleCreate from "../pages/sales/SaleCreate";
import SaleDetails from "../pages/sales/SaleDetails";
import SaleEdit from "../pages/sales/SaleEdit";
import Stock from "../pages/stock/Stock";
import StockAdjustments from "../pages/stock/StockAdjustments";
import Users from "../pages/users/Users";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/profile" element={<Profile />} />

          {/* Products */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductCreate />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/products/:id/edit" element={<ProductEdit />} />

          {/* Categories */}
          <Route path="/categories" element={<Categories />} />

          {/* Contacts */}
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/customers" element={<Customers />} />

          {/* Purchases */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/new" element={<PurchaseCreate />} />
          <Route path="/purchases/:id" element={<PurchaseDetails />} />
          <Route path="/purchases/:id/edit" element={<PurchaseEdit />} />

          {/* Sales */}
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<SaleCreate />} />
          <Route path="/sales/:id" element={<SaleDetails />} />
          <Route path="/sales/:id/edit" element={<SaleEdit />} />

          {/* Stock Overview */}
          <Route path="/stock" element={<Stock />} />

          {/* Admin Only Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/stock/adjustments" element={<StockAdjustments />} />
            <Route path="/users" element={<Users />} />
          </Route>

          {/* Redirect index to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
