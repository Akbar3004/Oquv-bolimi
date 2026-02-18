
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Exams from './pages/Exams';
import Reports from './pages/Reports';
import Workers from './pages/Workers';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Assalomu alaykum! Men Lokomotiv deposining sun\'iy intellekt yordamchisiman. Sizga qanday yordam bera olaman?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: 'Uzr, hozircha men faqat namoyish rejimida ishlayapman. Tez orada to\'liq ishga tushaman!' }]);
    }, 1000);
  };


  return (
    <Router>
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
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/workers" element={<Workers />} />
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
    </Router>
  );
}

export default App;
