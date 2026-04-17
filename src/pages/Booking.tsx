import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { User, Mail, Phone, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { formatCurrency } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUserAuth } from "@/context/UserAuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Booking = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const { toast } = useToast();

  const type = params.get("type") || "hotel";
  const name = params.get("name") || "Booking";
  const room = params.get("room") || "";
  const price = Number(params.get("price")) || 0;

  const [step, setStep] = useState<"form" | "confirm">("form");
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Login diperlukan", variant: "destructive" });
      navigate("/login");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      booking_type: type,
      details: { name, room, contact: { fullName, email, phone } },
      total_price: price,
      status: "confirmed",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Gagal menyimpan booking", description: error.message, variant: "destructive" });
      return;
    }

    setStep("confirm");
  };

  if (step === "confirm") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 max-w-lg text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-pyu-go-green/20 flex items-center justify-center mb-4">
            <span className="text-4xl text-pyu-go-green">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Pemesanan Berhasil!</h1>
          <p className="text-muted-foreground mb-2">Terima kasih telah memilih layanan kami.</p>
          <Card className="text-left mt-6">
            <CardContent className="p-5 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipe</span>
                <span className="text-sm font-medium capitalize">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Layanan</span>
                <span className="text-sm font-medium">{name}</span>
              </div>
              {room && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Detail</span>
                  <span className="text-sm font-medium">{room}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/">Kembali ke Home</Link>
            </Button>
            <Button asChild>
              <Link to="/account">Lihat Riwayat</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Konfirmasi Pemesanan</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="text-muted-foreground">Produk:</span> <span className="font-medium capitalize">{type}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Nama:</span> <span className="font-medium">{name}</span></p>
            {room && <p className="text-sm"><span className="text-muted-foreground">Detail:</span> <span className="font-medium">{room}</span></p>}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(price)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Data Pemesan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Nama Lengkap" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Nomor Telepon" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Separator />
            <p className="text-sm font-medium text-foreground">Metode Pembayaran</p>
            <div className="flex gap-2">
              {["Kartu Kredit", "Transfer Bank", "E-Wallet"].map((m) => (
                <Button key={m} variant="outline" size="sm" className="text-xs rounded-full">
                  <CreditCard className="w-3 h-3 mr-1" /> {m}
                </Button>
              ))}
            </div>
            <Button className="w-full mt-4" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Bayar {formatCurrency(price)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Booking;
