import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import AppSidebar from "@/components/AppSidebar";
import PasswordChangeModal from "@/components/PasswordChangeModal";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import TMIPage from "./pages/TMIPage";
import MeetingsPage from "./pages/MeetingsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useIsMobile } from "@/hooks/use-mobile";

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

function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data, logout, verifyPassword, changePassword } = useApp();
  const isMobile = useIsMobile();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast('다음에 또 만나요! 👋');
  };

  const handlePasswordChange = () => {
    setIsPasswordModalOpen(true);
  };

  if (!data.currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar onLogout={handleLogout} onPasswordChange={handlePasswordChange} />
      <main className={isMobile ? "flex-1 w-full" : "flex-1 ml-16"}>
        {children}
      </main>
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userId={data.currentUser.id}
        verifyPassword={verifyPassword}
        changePassword={changePassword}
      />
    </div>
  );
}

function AppRoutes() {
  const { data } = useApp();
  
  return (
    <Routes>
      <Route path="/login" element={
        data.currentUser ? <Navigate to="/main" replace /> : <LoginPage />
      } />
      <Route path="/main" element={
        <ProtectedRoute>
          <AppLayout><MainPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tmi" element={
        <ProtectedRoute>
          <AppLayout><TMIPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/meetings" element={
        <ProtectedRoute>
          <AppLayout><MeetingsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <AdminRoute>
          <AppLayout><SettingsPage /></AppLayout>
        </AdminRoute>
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
