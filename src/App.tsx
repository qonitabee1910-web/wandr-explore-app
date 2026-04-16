import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Shuttle from "./pages/Shuttle";
import ShuttleBooking from "./pages/ShuttleBooking";
import Ride from "./pages/Ride";

import Promos from "./pages/Promos";
import Account from "./pages/Account";
import Booking from "./pages/Booking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hotels" element={<NotFound />} />
          <Route path="/hotels/:id" element={<NotFound />} />
          <Route path="/shuttle" element={<Shuttle />} />
          <Route path="/shuttle/booking" element={<ShuttleBooking />} />
          <Route path="/ride" element={<Ride />} />
          <Route path="/promos" element={<Promos />} />
          <Route path="/account" element={<Account />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
