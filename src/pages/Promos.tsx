import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Tag, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface PromoRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  discount_percent: number;
  valid_until: string | null;
}

const Promos = () => {
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      const { data, error } = await supabase
        .from("promos")
        .select("id, title, description, image_url, category, discount_percent, valid_until")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) setPromos(data as PromoRow[]);
      setLoading(false);
    };
    fetchPromos();
  }, []);

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6" /> Promo & Diskon
          </h1>
          <p className="text-sm text-primary-foreground/80 mt-1">Temukan penawaran terbaik untuk perjalananmu</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : promos.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Belum ada promo aktif.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((promo) => (
              <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {promo.image_url && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full">
                      Diskon {promo.discount_percent}%
                    </div>
                    <Badge className="absolute top-3 right-3" variant="secondary">
                      {promo.category}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground">{promo.title}</h3>
                  {promo.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{promo.description}</p>
                  )}
                  {promo.valid_until && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Berlaku sampai {new Date(promo.valid_until).toLocaleDateString("id-ID")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Promos;
