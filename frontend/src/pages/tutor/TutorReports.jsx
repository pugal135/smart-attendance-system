import React from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

export const TutorReports = () => {
  const download = (format) => {
    window.open(`/api/v1/reports/export/${format}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Class Attendance Exports</h2>
        <p className="text-xs text-slate-400 mt-0.5">Download officially formatted student registers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <FileText className="w-8 h-8 text-rose-400 mb-3" />
          <h4 className="font-bold text-white text-sm">Download PDF Class Register</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">Formatted printable document for official submissions.</p>
          <button onClick={() => download("pdf")} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-3" />
          <h4 className="font-bold text-white text-sm">Download Excel Register (.XLSX)</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">Spreadsheet with individual period entries and percentages.</p>
          <button onClick={() => download("excel")} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Excel
          </button>
        </div>
      </div>
    </div>
  );
};
