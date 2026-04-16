import { CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RideCompletedProps {
  onFinish: () => void;
}

export const RideCompleted = ({ onFinish }: RideCompletedProps) => {
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-pyu-go-green/20 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-pyu-go-green" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Sampai di Tujuan!</h2>
      <p className="text-muted-foreground text-center mb-8">Terima kasih telah menggunakan Ride.</p>

      <Card className="w-full mb-8">
        <CardContent className="p-6 text-center space-y-4">
          <p className="font-medium">Bagaimana perjalanan Anda?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-8 h-8 text-pyu-go-orange cursor-pointer hover:fill-pyu-go-orange" />
            ))}
          </div>
          <Input placeholder="Tulis ulasan (opsional)..." className="mt-4" />
        </CardContent>
      </Card>

      <div className="w-full space-y-3">
        <Button className="w-full py-6 rounded-xl font-bold" onClick={onFinish}>
          Selesai
        </Button>
        <Button variant="outline" className="w-full py-6 rounded-xl font-bold">
          Download Resi
        </Button>
      </div>
    </motion.div>
  );
};
