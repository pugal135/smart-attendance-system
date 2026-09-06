import React from "react";
import clsx from "clsx";

export const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    info: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase",
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
};
