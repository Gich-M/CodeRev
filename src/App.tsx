import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, UNSAFE_NavigationContext } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard';
import { CodeSnippet } from './pages/CodeSnippet';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { MySubmissions } from './pages/MySubmissions';
import { NewSnippet } from './pages/NewSnippet';
import { Feed } from './pages/Feed';
import { PendingReviews } from './pages/PendingReviews';
import { useAuth } from './hooks/useAuth';
import Footer from './components/Footer';

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/snippet/:id" element={
              <ProtectedRoute>
                <CodeSnippet />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/my-submissions" element={
              <ProtectedRoute>
                <MySubmissions />
              </ProtectedRoute>
            } />
            <Route path="/new-snippet" element={
              <ProtectedRoute>
                <NewSnippet />
              </ProtectedRoute>
            } />
            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />
            <Route path="/pending-reviews" element={
              <ProtectedRoute>
                <PendingReviews />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}