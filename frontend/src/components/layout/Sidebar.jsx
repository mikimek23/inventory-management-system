import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Badge from "../ui/Badge";

export const Sidebar = ({ onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navGroups = [
    {
      title: "MAIN",
      items: [{ to: "/dashboard", label: "Dashboard", icon: "dashboard" }],
    },
    {
      title: "INVENTORY",
      items: [
        { to: "/products", label: "Products", icon: "products" },
        { to: "/categories", label: "Categories", icon: "categories" },
        { to: "/stock", label: "Stock Overview", icon: "stock" },
        ...(isAdmin
          ? [{ to: "/stock/adjustments", label: "Adjustments", icon: "adjustments" }]
          : []),
      ],
    },
    {
      title: "TRANSACTIONS",
      items: [
        { to: "/purchases", label: "Purchases", icon: "purchases" },
        { to: "/sales", label: "Sales", icon: "sales" },
      ],
    },
    {
      title: "CONTACTS",
      items: [
        { to: "/suppliers", label: "Suppliers", icon: "suppliers" },
        { to: "/customers", label: "Customers", icon: "customers" },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "ADMIN",
            items: [{ to: "/users", label: "User Management", icon: "users" }],
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs">
            IM
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">StockFlow</h1>
            <p className="text-[10px] text-emerald-400 font-medium tracking-wide">INVENTORY OS</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {group.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-semibold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Account Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "User"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <Badge value={user?.role} size="sm" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
