import React, { useEffect } from "react";
import { useAppStore } from "./stores/useAppStore";
import { ApiClient } from "./services/api";

export const App: React.FC = () => {
  const { systemStatus, setSystemStatus, initialize } = useAppStore();

  useEffect(() => {
    initialize();
    setSystemStatus("checking");

    ApiClient.checkHealth()
      .then((res) => {
        if (res.data?.status === "ok") {
          setSystemStatus("connected");
        } else {
          setSystemStatus("error");
        }
      })
      .catch(() => {
        setSystemStatus("idle");
      });
  }, [initialize, setSystemStatus]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0c10] text-slate-100">
      <header className="border-b border-slate-800 bg-[#12161f]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-wider text-orange-500">
            OFFBEAT
          </span>
          <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            Phase 0 Foundation
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Backend API:</span>
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              systemStatus === "connected"
                ? "bg-emerald-500 animate-pulse"
                : systemStatus === "checking"
                ? "bg-amber-500 animate-pulse"
                : systemStatus === "error"
                ? "bg-rose-500"
                : "bg-slate-600"
            }`}
          />
          <span className="capitalize text-slate-300">{systemStatus}</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-400 mb-3">
          Travel & Local Discovery
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Let&apos;s discover where you should go.
        </h1>
        <p className="text-slate-400 max-w-xl text-base mb-8">
          The development foundation is initialized. Monorepo workspaces, shared types,
          Vite frontend, and Express backend are linked.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-1">Architecture</div>
            <div className="font-semibold text-slate-200">Domain Monorepo</div>
            <div className="text-xs text-slate-500 mt-2">Frontend + Backend + Packages</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-1">API Base</div>
            <div className="font-semibold text-slate-200">/api/v1</div>
            <div className="text-xs text-slate-500 mt-2">Envelope response contract</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-1">Database</div>
            <div className="font-semibold text-slate-200">PostgreSQL + Prisma</div>
            <div className="text-xs text-slate-500 mt-2">Baseline User & Profile models</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 font-mono">
        OFFBEAT — Phase 0 Foundation
      </footer>
    </div>
  );
};
