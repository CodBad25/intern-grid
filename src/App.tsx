
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster as HotToast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationPreferencesProvider } from './context/NotificationPreferencesContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Seances } from './components/Seances';
import { Documents } from './components/Documents';
import { Commentaires } from './components/Commentaires';
import { Planning } from './components/Planning';
import { Features } from './pages/Features';
import { Auth } from './pages/Auth';
import Index from './pages/Index';
import { LoadingSpinner } from './components/LoadingSpinner';
import NotFound from "./pages/NotFound";
import NotificationSettingsPage from './pages/NotificationSettings';
import UserSettingsPage from './pages/UserSettings';

const queryClient = new QueryClient();

function AppContent() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si on n'est pas connecté ET qu'on est sur une route protégée
  const protectedRoutes = ['/dashboard', '/seances', '/documents', '/commentaires', '/planning', '/notification-settings', '/user-settings'];
  if (!user && protectedRoutes.includes(location.pathname)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" replace />} />
      <Route path="/seances" element={user ? <Layout><Seances /></Layout> : <Navigate to="/auth" replace />} />
      <Route path="/documents" element={user ? <Layout><Documents /></Layout> : <Navigate to="/auth" replace />} />
      <Route path="/commentaires" element={user ? <Layout><Commentaires /></Layout> : <Navigate to="/auth" replace />} />
      <Route path="/planning" element={user ? <Layout><Planning /></Layout> : <Navigate to="/auth" replace />} />
      <Route path="/features" element={user ? <Layout><Features /></Layout> : <Features />} />
      <Route path="/notification-settings" element={user ? <Layout><NotificationSettingsPage /></Layout> : <Navigate to="/auth" replace />} />
      <Route path="/user-settings" element={user ? <Layout><UserSettingsPage /></Layout> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <NotificationPreferencesProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </NotificationPreferencesProvider>
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const App = () => (
  <BrowserRouter 
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <AppProviders>
      <AppContent />
      <Toaster />
      <Sonner />
      <HotToast 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'var(--shadow-medium)',
          }
        }}
      />
    </AppProviders>
  </BrowserRouter>
);

export default App;
