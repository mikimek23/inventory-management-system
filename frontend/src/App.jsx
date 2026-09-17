import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./store/auth.context";
import { ToastProvider } from "./components/ui/Toast";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
