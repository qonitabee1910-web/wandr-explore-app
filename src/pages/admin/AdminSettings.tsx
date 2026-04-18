import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";

const MAINT_KEY = "app_maintenance_mode";

export default function AdminSettings() {
  const { user, refreshUser } = useUserAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
    setAvatar(user?.avatar ?? "");
    setMaintenance(localStorage.getItem(MAINT_KEY) === "1");
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, avatar_url: avatar || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
      return;
    }
    await refreshUser();
    toast({ title: "Profil diperbarui" });
  };

  const toggleMaintenance = (v: boolean) => {
    setMaintenance(v);
    localStorage.setItem(MAINT_KEY, v ? "1" : "0");
    toast({ title: v ? "Maintenance ON" : "Maintenance OFF" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Pengaturan profil & aplikasi</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Profil Admin</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div>
            <Label>Nama Lengkap</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Telepon</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>URL Avatar</Label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Pengaturan Aplikasi</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mode Maintenance</Label>
              <p className="text-xs text-muted-foreground">Disimpan lokal di browser ini</p>
            </div>
            <Switch checked={maintenance} onCheckedChange={toggleMaintenance} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
