import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/data/dummyData";

interface Booking {
  id: string;
  user_id: string;
  booking_type: string;
  status: string;
  total_price: number;
  booking_date: string;
  created_at: string;
  details: any;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      setBookings((data ?? []) as Booking[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground">{bookings.length} total booking</p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : bookings.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada booking</TableCell></TableRow>
              ) : bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="text-xs">{new Date(b.created_at).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell><Badge variant="outline">{b.booking_type}</Badge></TableCell>
                  <TableCell className="text-xs max-w-xs truncate">
                    {b.details?.name || b.details?.room || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(b.total_price))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
