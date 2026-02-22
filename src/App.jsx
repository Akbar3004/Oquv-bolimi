
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useWorkers } from './contexts/WorkersContext';

// Pages
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Exams from './pages/Exams';
import Reports from './pages/Reports';
import Workers from './pages/Workers';
import AdminUsers from './pages/AdminUsers';
import LoginPage from './pages/LoginPage';
import ExamLoginPage from './pages/ExamLoginPage';
import ExamInterface from './pages/ExamInterface';

// === Himoyalangan route ===
function ProtectedRoute({ permission, children }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// === Asosiy ilova (kirish qilingan holat) ===
function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors duration-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-[hsl(var(--secondary)/0.1)]">
          <div className="max-w-7xl mx-auto w-full min-h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lessons" element={
                <ProtectedRoute permission="lessons"><Lessons /></ProtectedRoute>
              } />
              <Route path="/exams" element={
                <ProtectedRoute permission="exams"><Exams /></ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute permission="reports"><Reports /></ProtectedRoute>
              } />
              <Route path="/workers" element={
                <ProtectedRoute permission="workers"><Workers /></ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute permission="users"><AdminUsers /></ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <footer className="mt-10 py-6 border-t border-[hsl(var(--border))] text-center text-sm text-[hsl(var(--muted-foreground))] w-full">
            <p>&copy; {new Date().getFullYear()} O'zbekiston Lokomotiv Deposi. Barcha huquqlar himoyalangan.</p>
            <p className="mt-1 font-mono text-xs">Nazirov Akbarbek | AI Texnalogiyalar</p>
          </footer>
        </main>
      </div>
    </div>
  );
}



// === Auth Wrapper — tizim holati boshqaruvi ===
function AppContent() {
  const { currentUser, isLoading, loginByTabel } = useAuth();
  const { getAllWorkersForExam } = useWorkers();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'exam'

  // Yuklanish holati
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Agar foydalanuvchi kirgan bo'lsa
  if (currentUser) {
    // Imtihon topshiruvchi uchun maxsus interfeys
    if (currentUser.role === 'exam_taker') {
      return <ExamInterface />;
    }
    // Boshqa rollar uchun asosiy interfeys
    return <MainApp />;
  }

  // Haqiqiy xodimlar bazasidan ma'lumot olish
  const workersForExam = getAllWorkersForExam();

  // Kirish sahifasi
  if (authMode === 'exam') {
    return (
      <ExamLoginPage
        onSwitchToLogin={() => setAuthMode('login')}
        workers={workersForExam}
        onVerified={(worker) => loginByTabel(worker.tabelId || (1000 + worker.id).toString(), worker)}
      />
    );
  }

  return <LoginPage onSwitchToExam={() => setAuthMode('exam')} />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
