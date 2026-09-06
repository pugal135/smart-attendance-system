import React, { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

export const AnalyticsReports = () => {
  const [selectedDate, setSelectedDate] = useState("");

  const downloadReport = (format) => {
    const url = `/api/v1/reports/export/${format}${selectedDate ? `?date=${selectedDate}` : ""}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Academic Analytics & Formal Reports</h2>
        <p className="text-xs text-slate-400 mt-0.5">Export officially endorsed attendance logs, registers, and audit ledgers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PDF Export */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Official PDF Attendance Ledger</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Formatted printable university attendance document complete with headers, period columns, and verification seals.
            </p>
          </div>

          <button
            onClick={() => downloadReport("pdf")}
            className="mt-6 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>

        {/* Excel Export */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Excel Workbook (.XLSX)</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Structured multi-sheet workbook with student register numbers, percentage formulas, and faculty markings.
            </p>
          </div>

          <button
            onClick={() => downloadReport("excel")}
            className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Excel Sheet
          </button>
        </div>

        {/* CSV Export */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Raw CSV Dataset</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Machine-readable attendance dataset suitable for data science, SIS ingestion, and archival storage.
            </p>
          </div>

          <button
            onClick={() => downloadReport("csv")}
            className="mt-6 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV Data
          </button>
        </div>
      </div>
    </div>
  );
};
