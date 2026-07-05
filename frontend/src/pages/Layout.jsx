import Sidebar from '../components/Sidebar.jsx';

export default function Layout({ children, title, subtitle, action }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <Sidebar />
      <main className="pb-28 md:ml-64 md:pb-10">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
              {subtitle && <p className="mt-2 max-w-3xl leading-7 text-slate-600">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
