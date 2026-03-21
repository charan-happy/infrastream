'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileJson } from 'lucide-react';

interface ExportButtonProps {
  type: 'events' | 'dora';
}

export function ExportButton({ type }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  function download(format: 'csv' | 'json') {
    const url = `/api/export?type=${type}&format=${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `infrastream-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-zinc-800 bg-zinc-900 p-1 shadow-xl">
            <button
              onClick={() => download('csv')}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Export as CSV
            </button>
            <button
              onClick={() => download('json')}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              <FileJson className="h-3.5 w-3.5 text-blue-400" />
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
