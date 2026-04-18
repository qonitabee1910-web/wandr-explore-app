import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Armchair } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  layout: any;
  is_active: boolean;
}

const blank: Partial<Vehicle> = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  layout: [],
  is_active: true,
};

export default function AdminVehicles() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Vehicle> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    setVehicles((data ?? []) as Vehicle[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing?.slug) {
      toast({ title: "Nama & slug wajib diisi", variant: "destructive" });
      return;
    }
    const payload = {
      name: editing.name!,
      slug: editing.slug!,
      description: editing.description || null,
      image_url: editing.image_url || null,
      layout: editing.layout ?? [],
      is_active: editing.is_active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("vehicles").update(payload).eq("id", editing.id)
      : await supabase.from("vehicles").insert(payload);
    if (error) return toast({ title: "Gagal", description: error.message, variant: "destructive" });
    toast({ title: "Tersimpan" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus kendaraan ini?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return toast({ title: "Gagal", variant: "destructive" });
    load();
  };

  const seatCount = (layout: any) => Array.isArray(layout) ? layout.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">{vehicles.length} kendaraan</p>
        </div>
        <Button onClick={() => setEditing({ ...blank })}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Kursi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada kendaraan</TableCell></TableRow>
              ) : vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-xs"><code>{v.slug}</code></TableCell>
                  <TableCell>{seatCount(v.layout)}</TableCell>
                  <TableCell>
                    <Badge variant={v.is_active ? "default" : "secondary"}>
                      {v.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost" title="Edit layout kursi">
                      <Link to={`/admin/seat-editor?vehicle=${v.id}`}>
                        <Armchair className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(v)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(v.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Vehicle" : "Vehicle Baru"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Nama</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug (unik)</Label>
                <Input
                  value={editing.slug ?? ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="hiace, elf, dll"
                />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label>URL Gambar Denah</Label>
                <Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Aktif</Label>
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              <p className="text-xs text-muted-foreground">
                Setelah disimpan, klik ikon kursi pada baris untuk mengedit posisi kursi.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
