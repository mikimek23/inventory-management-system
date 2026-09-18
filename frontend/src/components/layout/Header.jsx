import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Badge from "../ui/Badge";

export const Header = ({ onOpenMobileNav, title }) => {
  const { user } = useAuth();
  const today = new Date();
  const dateFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(today);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          {title ? (
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-xs font-semibold text-slate-500">{dateFormatted}</span>
            </div>
          )}
        </div>
      </div>

      <Link
        to="/profile"
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
        title="View Profile"
      >
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-900 leading-none group-hover:text-blue-700 transition-colors">
            {user?.name}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{user?.email}</p>
        </div>
        <Badge value={user?.role} />
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center group-hover:bg-blue-200 transition-colors shrink-0">
          {user?.name ? user.name[0].toUpperCase() : "U"}
        </div>
      </Link>
    </header>
  );
};

export default Header;
