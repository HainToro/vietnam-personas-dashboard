export default function HomePage() {
  return (
    <main className="min-h-screen p-6 sm:p-10 max-w-7xl mx-auto flex flex-col justify-center items-center text-center">
      <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl mb-4 font-semibold text-xs tracking-wider uppercase">
        🚀 Phase 01 Initialized
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
        Vietnam Personas Analytics Dashboard
      </h1>
      <p className="text-slate-500 max-w-xl text-sm mb-6">
        Hệ thống phân tích và trực quan hóa bộ dữ liệu Persona Việt Nam (nvidia/Nemotron-Personas-Vietnam).
      </p>
      <div className="flex gap-3">
        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
          Next.js 14+ Ready
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 text-xs font-semibold border border-indigo-500/20">
          Tailwind CSS Ready
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-xs font-semibold border border-blue-500/20">
          Recharts Installed
        </span>
      </div>
    </main>
  );
}
