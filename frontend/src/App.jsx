import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';

import PageTransition from './components/PageTransition.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Awareness from './pages/Awareness.jsx';
import AnalyzeImage from './pages/AnalyzeImage.jsx';
import AnalyzeText from './pages/AnalyzeText.jsx';
import Checker from './pages/Checker.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmergencyGuide from './pages/EmergencyGuide.jsx';
import History from './pages/History.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import QuickScan from './pages/QuickScan.jsx';
import Register from './pages/Register.jsx';
import ReportScam from './pages/ReportScam.jsx';

function withTransition(page) {
  return <PageTransition>{page}</PageTransition>;
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={withTransition(<Landing />)} />
        <Route path="/login" element={withTransition(<Login />)} />
        <Route path="/register" element={withTransition(<Register />)} />
        <Route path="/awareness" element={withTransition(<Awareness />)} />
        <Route path="/checker" element={withTransition(<Checker />)} />
        <Route path="/emergency-guide" element={withTransition(<EmergencyGuide />)} />
        <Route path="/quick-scan" element={withTransition(<QuickScan />)} />
        <Route path="/dashboard" element={withTransition(<ProtectedRoute><Dashboard /></ProtectedRoute>)} />
        <Route path="/analyze-text" element={withTransition(<ProtectedRoute><AnalyzeText /></ProtectedRoute>)} />
        <Route path="/analyze-image" element={withTransition(<ProtectedRoute><AnalyzeImage /></ProtectedRoute>)} />
        <Route path="/history" element={withTransition(<ProtectedRoute><History /></ProtectedRoute>)} />
        <Route path="/report-scam" element={withTransition(<ProtectedRoute><ReportScam /></ProtectedRoute>)} />
        <Route path="/profile" element={withTransition(<ProtectedRoute><Profile /></ProtectedRoute>)} />
      </Routes>
    </AnimatePresence>
  );
}
