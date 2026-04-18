import { useEffect, useState } from "react";
import { Calendar, Users, DollarSign, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/data/dummyData";

export default function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, users: 0, revenue: 0, promos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [b, u, p] = await Promise.all([
        supabase.from("bookings").select("total_price"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("promos").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      const revenue = (b.data ?? []).reduce((sum, r: any) => sum + Number(r.total_price ?? 0), 0);
      setStats({
        bookings: b.data?.length ?? 0,
        users: u.count ?? 0,
        revenue,
        promos: p.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { title: "Total Bookings", value: stats.bookings, icon: Calendar, color: "text-blue-600" },
    { title: "Total Users", value: stats.users, icon: Users, color: "text-green-600" },
    { title: "Revenue", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-amber-600" },
    { title: "Active Promos", value: stats.promos, icon: Tag, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan aktivitas platform</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.title}
              </CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{loading ? "—" : c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
