import { useEffect, useState } from "react";
import { History, LogOut, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserAuth } from "@/context/UserAuthContext";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/data/dummyData";

interface BookingRow {
  id: string;
  booking_type: string;
  details: { name?: string } & Record<string, any>;
  total_price: number;
  status: string;
  booking_date: string;
}

const statusColor: Record<string, string> = {
  confirmed: "bg-pyu-go-green text-white",
  completed: "bg-muted text-muted-foreground",
  pending: "bg-pyu-go-orange text-white",
  cancelled: "bg-destructive text-destructive-foreground",
};

const Account = () => {
  const { user, logout } = useUserAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_type, details, total_price, status, booking_date")
        .order("booking_date", { ascending: false });
      if (!error && data) setBookings(data as BookingRow[]);
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  const initial = (user?.fullName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="mb-6">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {initial}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{user?.fullName || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Riwayat Booking</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Belum ada booking. Mulai pesan layanan favoritmu!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {b.details?.name || b.booking_type}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{b.booking_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.booking_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={`${statusColor[b.status] || "bg-muted"} text-xs mb-1 capitalize`}>{b.status}</Badge>
                    <p className="text-sm font-bold text-primary">{formatCurrency(Number(b.total_price))}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Account;
