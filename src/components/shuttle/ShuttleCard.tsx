import { Link } from "react-router-dom";
import { Bus, Clock, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shuttle } from "@/types";
import { formatCurrency } from "@/data/dummyData";

interface ShuttleCardProps {
  shuttle: Shuttle;
}

export const ShuttleCard = ({ shuttle }: ShuttleCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{shuttle.operator}</p>
              <p className="text-xs text-muted-foreground">{shuttle.operatorCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground line-through">{formatCurrency(shuttle.originalPrice)}</p>
            <p className="text-primary font-bold text-lg">{formatCurrency(shuttle.price)}</p>
            <p className="text-xs text-muted-foreground">/pax</p>
          </div>
        </div>

        <div className="flex items-center gap-3 my-3">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{shuttle.departureTime}</p>
            <p className="text-xs text-muted-foreground">{shuttle.from.split("(")[0]}</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {shuttle.duration}
            </p>
            <div className="w-full border-t border-border relative my-1">
              <ArrowRight className="w-4 h-4 text-primary absolute -right-1 -top-2" />
            </div>
            <p className="text-xs text-pyu-go-green font-medium">
              {shuttle.transit === 0 ? "Langsung" : `${shuttle.transit} Transit`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{shuttle.arrivalTime}</p>
            <p className="text-xs text-muted-foreground">{shuttle.to.split("(")[0]}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          <Badge variant="secondary" className="text-xs">
            <Briefcase className="w-3 h-3 mr-1" /> {shuttle.baggage}
          </Badge>
          {shuttle.meal && <Badge variant="secondary" className="text-xs">🍽️ Makan</Badge>}
          <div className="ml-auto">
            <Button asChild size="sm" className="rounded-full">
              <Link to="/shuttle/booking">
                Pilih
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
