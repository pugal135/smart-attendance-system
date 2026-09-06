import React from "react";
import clsx from "clsx";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "indigo",
  onClick,
}) => {
  const colorMap = {
    indigo: "from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/30",
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/30",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-400 border-amber-500/30",
    rose: "from-rose-500/20 to-rose-500/0 text-rose-400 border-rose-500/30",
    purple: "from-purple-500/20 to-purple-500/0 text-purple-400 border-purple-500/30",
    cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/30",
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between",
        onClick && "cursor-pointer"
      )}
    >
      <div className={clsx("absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl rounded-bl-full pointer-events-none opacity-40", colorMap[color])} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={clsx("p-2.5 rounded-xl bg-slate-900/80 border", colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span>{subtitle}</span>
          {trend && (
            <span className={clsx("font-semibold", trend.positive ? "text-emerald-400" : "text-rose-400")}>
              {trend.positive ? "+" : ""}{trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
