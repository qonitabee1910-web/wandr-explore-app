import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Hotel } from "@/types";
import { formatCurrency } from "@/data/dummyData";

interface HotelCardProps {
  hotel: Hotel;
}

export const HotelCard = ({ hotel }: HotelCardProps) => {
  return (
    <Link to={`/hotels/${hotel.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 bg-pyu-go-orange text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((hotel.originalPrice - hotel.price) / hotel.originalPrice) * 100)}% OFF
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground">{hotel.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {hotel.city}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-pyu-go-orange text-pyu-go-orange" />
            <span className="text-sm font-medium">{hotel.rating}</span>
            <span className="text-xs text-muted-foreground">({hotel.reviews})</span>
            <span className="ml-auto text-xs text-muted-foreground">{"★".repeat(hotel.stars)}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(hotel.originalPrice)}
            </span>
            <span className="text-primary font-bold text-lg">
              {formatCurrency(hotel.price)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">/malam</p>
        </CardContent>
      </Card>
    </Link>
  );
};
