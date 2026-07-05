export const riskStyles = {
  Safe: { text: 'text-green-700', bg: 'bg-green-50', bar: 'bg-green-500', border: 'border-green-200' },
  'Low Risk': { text: 'text-blue-700', bg: 'bg-blue-50', bar: 'bg-blue-500', border: 'border-blue-200' },
  Suspicious: { text: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-500', border: 'border-amber-200' },
  'High Risk': { text: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500', border: 'border-orange-200' },
  Critical: { text: 'text-red-700', bg: 'bg-red-50', bar: 'bg-red-600', border: 'border-red-200' }
};

export const getRiskStyle = (level = 'Safe') => riskStyles[level] || riskStyles.Safe;

export const chartColors = ['#16A34A', '#2563EB', '#F59E0B', '#F97316', '#DC2626'];

export const riskChartColor = (name = '') => ({
  Safe: '#16A34A',
  'Low Risk': '#2563EB',
  Suspicious: '#F59E0B',
  'High Risk': '#F97316',
  Critical: '#DC2626'
}[name] || '#2563EB');
