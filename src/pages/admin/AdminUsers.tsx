import { useEffect, useState } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  isAdmin: boolean;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    setRows((profiles ?? []).map((p) => ({ ...p, isAdmin: adminIds.has(p.id) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (userId: string, makeAdmin: boolean) => {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
      toast({ title: "Promote berhasil" });
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
      toast({ title: "Demote berhasil" });
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{rows.length} user terdaftar</p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.full_name || "—"}</TableCell>
                  <TableCell className="text-xs">{r.phone || "—"}</TableCell>
                  <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge variant={r.isAdmin ? "default" : "secondary"}>
                      {r.isAdmin ? "admin" : "user"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.isAdmin ? (
                      <Button size="sm" variant="outline" onClick={() => toggleAdmin(r.id, false)}>
                        <ShieldOff className="h-4 w-4" /> Demote
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => toggleAdmin(r.id, true)}>
                        <Shield className="h-4 w-4" /> Promote
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
