import { Link } from "react-router-dom";
import { ArrowLeft, Bus } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";

const Shuttle = () => {
  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Shuttle</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Bus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Shuttle Booking Segera Hadir</h2>
            <p className="text-sm text-muted-foreground">
              Fitur pemesanan shuttle sedang dalam pengembangan.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Shuttle;
