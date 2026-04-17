import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { DriverProvider } from "@/context/DriverContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminRouter from "@/admin/AdminRouter";
import Index from "./pages/Index";
import Shuttle from "./pages/Shuttle";
import ShuttleBooking from "./pages/ShuttleBooking";
import Ride from "./pages/Ride";
import Promos from "./pages/Promos";
import Account from "./pages/Account";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Driver Pages
import DriverDashboard from "./pages/driver/Dashboard";
import DriverActiveTrip from "./pages/driver/ActiveTrip";
import DriverHistory from "./pages/driver/History";
import DriverProfile from "./pages/driver/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserAuthProvider>
        <DriverProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/hotels" element={<NotFound />} />
              <Route path="/hotels/:id" element={<NotFound />} />
              
              {/* Protected user routes */}
              <Route path="/shuttle" element={<ProtectedRoute><Shuttle /></ProtectedRoute>} />
              <Route path="/shuttle/booking" element={<ProtectedRoute><ShuttleBooking /></ProtectedRoute>} />
              <Route path="/ride" element={<ProtectedRoute><Ride /></ProtectedRoute>} />
              <Route path="/promos" element={<ProtectedRoute><Promos /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              
              {/* Driver routes */}
              <Route path="/driver" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />
              <Route path="/driver/trip" element={<ProtectedRoute><DriverActiveTrip /></ProtectedRoute>} />
              <Route path="/driver/history" element={<ProtectedRoute><DriverHistory /></ProtectedRoute>} />
              <Route path="/driver/profile" element={<ProtectedRoute><DriverProfile /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminRouter />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DriverProvider>
      </UserAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
