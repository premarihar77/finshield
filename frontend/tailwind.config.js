export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        page: '#F8FAFC',
        panel: '#FFFFFF',
        primaryBlue: '#2563EB',
        dangerRed: '#DC2626',
        successGreen: '#16A34A'
      },
      boxShadow: {
        glow: '0 18px 45px rgba(15, 23, 42, 0.08)',
        soft: '0 14px 35px rgba(15, 23, 42, 0.07)'
      }
    }
  },
  plugins: []
};
