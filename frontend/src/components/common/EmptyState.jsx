import React from "react";
import { Inbox, Plus } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data available yet",
  description = "No records found in the database. When new entries are created, they will appear here dynamically.",
  actionText,
  onAction,
}) => {
  return (
    <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center border-dashed border-slate-800 max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-slate-100">{title}</h4>
      <p className="text-sm text-slate-400 mt-1.5 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
