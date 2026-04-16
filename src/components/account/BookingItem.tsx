import { Building2, Bus, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Booking } from "@/types";
import { formatCurrency } from "@/data/dummyData";

const statusColor: Record<string, string> = {
  Confirmed: "bg-pyu-go-green text-white",
  Completed: "bg-muted text-muted-foreground",
  Pending: "bg-pyu-go-orange text-white",
};

interface BookingItemProps {
  booking: Booking;
}

export const BookingItem = ({ booking }: BookingItemProps) => {
  const Icon = booking.type === "hotel" ? Building2 : (booking.type === "shuttle" ? Bus : Car);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{booking.name}</p>
          <p className="text-xs text-muted-foreground">{booking.date}</p>
        </div>
        <div className="text-right shrink-0">
          <Badge className={`${statusColor[booking.status]} text-xs mb-1`}>{booking.status}</Badge>
          <p className="text-sm font-bold text-primary">{formatCurrency(booking.total)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
