import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

interface Promo {
  id: string;
  title: string;
  description: string | null;
  discount_percent: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  valid_until: string | null;
}

const blank: Partial<Promo> = {
  title: "",
  description: "",
  discount_percent: 10,
  category: "general",
  image_url: "",
  is_active: true,
};

export default function AdminPromos() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Promo> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("promos").select("*").order("created_at", { ascending: false });
    setPromos((data ?? []) as Promo[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title) return;
    const payload = {
      title: editing.title!,
      description: editing.description || null,
      discount_percent: editing.discount_percent ?? 0,
      category: editing.category || "general",
      image_url: editing.image_url || null,
      is_active: editing.is_active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("promos").update(payload).eq("id", editing.id)
      : await supabase.from("promos").insert(payload);
    if (error) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tersimpan" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus promo ini?")) return;
    const { error } = await supabase.from("promos").delete().eq("id", id);
    if (error) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promos</h1>
          <p className="text-sm text-muted-foreground">{promos.length} promo</p>
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
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : promos.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada promo</TableCell></TableRow>
              ) : promos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                  <TableCell>{p.discount_percent}%</TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
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
            <DialogTitle>{editing?.id ? "Edit Promo" : "Promo Baru"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Judul</Label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Diskon (%)</Label>
                  <Input type="number" value={editing.discount_percent ?? 0} onChange={(e) => setEditing({ ...editing, discount_percent: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>URL Gambar</Label>
                <Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Aktif</Label>
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
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
