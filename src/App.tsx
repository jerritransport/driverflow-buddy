import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Saps from "./pages/Saps";
import FollowUps from "./pages/FollowUps";
import IntakeForms from "./pages/IntakeForms";
import TestResults from "./pages/TestResults";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Students from "./pages/Students";
import StudentSettings from "./pages/StudentSettings";
import StudentSetupWizard from "./pages/StudentSetupWizard";
import GmailCallback from "./pages/GmailCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers"
              element={
                <ProtectedRoute>
                  <Drivers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saps"
              element={
                <ProtectedRoute>
                  <Saps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/follow-ups"
              element={
                <ProtectedRoute>
                  <FollowUps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intake-forms"
              element={
                <ProtectedRoute>
                  <IntakeForms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-results"
              element={
                <ProtectedRoute>
                  <TestResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute requireAdmin>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute requireAdmin>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-settings"
              element={
                <ProtectedRoute>
                  <StudentSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/gmail/callback" element={<GmailCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
