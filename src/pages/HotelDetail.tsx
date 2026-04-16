import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Wifi, Waves, Dumbbell, UtensilsCrossed, ArrowLeft, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { hotels, formatCurrency } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const facilityIcons: Record<string, any> = {
  WiFi: Wifi,
  Pool: Waves,
  "Infinity Pool": Waves,
  "Private Beach": Waves,
  Gym: Dumbbell,
  Restaurant: UtensilsCrossed,
};

const HotelDetail = () => {
  const { id } = useParams();
  const hotel = hotels.find((h) => h.id === id);

  if (!hotel) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Hotel tidak ditemukan.</p>
          <Button asChild className="mt-4"><Link to="/hotels">Kembali</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <Link
          to="/hotels"
          className="absolute top-4 left-4 bg-card/80 backdrop-blur rounded-full p-2 hover:bg-card"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-10">
        <Card className="shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{hotel.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {hotel.city}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-pyu-go-orange text-pyu-go-orange" />
                <span className="text-sm font-bold">{hotel.rating}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-3">{hotel.description}</p>

            {/* Facilities */}
            <div className="mt-5">
              <h3 className="font-semibold mb-2 text-foreground">Fasilitas</h3>
              <div className="flex flex-wrap gap-2">
                {hotel.facilities.map((f) => {
                  const Icon = facilityIcons[f];
                  return (
                    <Badge key={f} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {Icon && <Icon className="w-3 h-3" />}
                      {f}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Rooms */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-foreground">Pilih Kamar</h3>
              <div className="space-y-3">
                {hotel.rooms.map((room, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{room.type}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {room.capacity} tamu
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(room.price)}</p>
                      <p className="text-xs text-muted-foreground">/malam</p>
                      <Button asChild size="sm" className="mt-2 rounded-full text-xs">
                        <Link to={`/booking?type=hotel&name=${encodeURIComponent(hotel.name)}&room=${encodeURIComponent(room.type)}&price=${room.price}`}>
                          Pesan
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HotelDetail;
