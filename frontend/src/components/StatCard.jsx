const toneClasses = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
  green: 'bg-green-50 text-green-600'
};

export default function StatCard({ icon: Icon, label, value = 0, tone = 'blue' }) {
  const isLongText = typeof value === 'string' && value.length > 12;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={`mt-2 font-bold text-slate-950 ${isLongText ? 'text-lg leading-6' : 'text-3xl'}`}>{value ?? 0}</p>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneClasses[tone] || toneClasses.blue}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
