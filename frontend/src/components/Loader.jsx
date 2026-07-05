export default function Loader({ label = 'Analyzing risk signals...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
