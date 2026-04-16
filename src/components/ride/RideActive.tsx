import { Car, Bell, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface RideActiveProps {
  status: string;
  destination: string;
  onCancel: () => void;
}

export const RideActive = ({ status, destination, onCancel }: RideActiveProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
      <div className="flex-1 bg-muted rounded-2xl mb-6 relative overflow-hidden min-h-[250px] flex items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=400&fit=crop')] bg-cover opacity-50" />
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mb-4">
              <Car className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <Badge className="bg-pyu-go-green">{status}</Badge>
         </div>
      </div>

      <Card className="border-none shadow-xl rounded-t-3xl rounded-b-none mt-auto -mx-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-muted overflow-hidden">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" alt="Driver" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">Budi Santoso</h3>
                <Badge variant="outline" className="text-[10px] h-5">D 1234 ABC</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-pyu-go-orange text-pyu-go-orange" />
                <span className="text-xs font-medium">4.9 • Toyota Avanza Putih</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="rounded-full">
                <Bell className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-full">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-2xl space-y-2">
             <p className="text-xs text-muted-foreground">Tujuan Anda:</p>
             <p className="font-bold text-sm">{destination}</p>
          </div>

          <Button variant="destructive" className="w-full mt-6 rounded-xl" onClick={onCancel}>
            Batalkan Pesanan
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
