import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import TMIPage from "./pages/TMIPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data } = useApp();
  
  if (!data.currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data } = useApp();
  
  if (!data.currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // 관리자만 접근 가능
  if (!data.currentUser.isAdmin) {
    return <Navigate to="/main" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { data } = useApp();
  
  return (
    <Routes>
      <Route path="/login" element={
        data.currentUser ? <Navigate to="/main" replace /> : <LoginPage />
      } />
      <Route path="/main" element={
        <ProtectedRoute><MainPage /></ProtectedRoute>
      } />
      <Route path="/tmi" element={
        <ProtectedRoute><TMIPage /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <AdminRoute><SettingsPage /></AdminRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
