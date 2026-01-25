import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OtpVerification from "./pages/OtpVerification";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import CategoryListing from "./pages/CategoryListing";
import Search from "./pages/Search";
import MyPrograms from "./pages/MyPrograms";
import Profile from "./pages/Profile";
import ProgramDetails from "./pages/ProgramDetails";
import TrackPlayer from "./pages/TrackPlayer";
import Subscription from "./pages/Subscription";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import Onboarding from "./pages/Onboarding";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ListeningHistory from "./pages/ListeningHistory";
import Downloads from "./pages/Downloads";
import GoogleCallback from "./pages/GoogleCallback";

import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminTracks from "./pages/admin/Tracks";
import AdminPrograms from "./pages/admin/Programs";
import AdminUsers from "./pages/admin/Users";
import AdminUserDetails from "./pages/admin/UserDetails";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminCoupons from "./pages/admin/Coupons";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminPackages from "./pages/admin/Packages";
import AdminPayments from "./pages/admin/Payments";
import AdminNotifications from "./pages/admin/Notifications";
import AdminSettings from "./pages/admin/Settings";
import { FCMInitializer } from "./components/FCMInitializer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AudioPlayerProvider>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <FCMInitializer />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/otp" element={<OtpVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/discover" element={<CategoryListing />} />
                  <Route path="/category/:id" element={<CategoryListing />} />
                  <Route path="/my-programs" element={<MyPrograms />} />
                  <Route path="/program/:id" element={<ProgramDetails />} />
                  <Route path="/player/:id" element={<TrackPlayer />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-failure" element={<PaymentFailure />} />
                  <Route path="/history" element={<ListeningHistory />} />
                  <Route path="/downloads" element={<Downloads />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/tracks" element={<AdminTracks />} />
                  <Route path="/admin/programs" element={<AdminPrograms />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/users/:userId" element={<AdminUserDetails />} />
                  <Route path="/admin/packages" element={<AdminPackages />} />
                  <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                  <Route path="/admin/coupons" element={<AdminCoupons />} />
                  <Route path="/admin/payments" element={<AdminPayments />} />
                  <Route path="/admin/notifications" element={<AdminNotifications />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
      </AudioPlayerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
