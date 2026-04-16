import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { rides } from "@/data/rides";
import { RideSearch } from "@/components/ride/RideSearch";
import { RideSelection } from "@/components/ride/RideSelection";
import { RideActive } from "@/components/ride/RideActive";
import { RideCompleted } from "@/components/ride/RideCompleted";
import { GeoLocation, RouteInfo } from "@/types/maps";
import { MapService } from "@/services/mapService";

const Ride = () => {
  const [pickup, setPickup] = useState<GeoLocation | null>({
    lat: -6.9025,
    lng: 107.6188,
    name: "Gedung Sate",
    address: "Jl. Diponegoro No.22, Bandung"
  });
  const [destination, setDestination] = useState<GeoLocation | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [selectedRide, setSelectedRide] = useState(rides[0].id);
  const [step, setStep] = useState<"search" | "estimating" | "finding" | "active" | "completed">("search");
  const [rideType, setRideType] = useState<"instant" | "scheduled">("instant");
  const [status, setStatus] = useState("Driver sedang menuju lokasi...");

  const activeRide = rides.find(r => r.id === selectedRide) || rides[0];

  const handleSearch = () => {
    if (!destination) return;
    setStep("estimating");
    setTimeout(() => setStep("finding"), 1000);
  };

  const handleConfirm = () => {
    setStep("active");
    setTimeout(() => setStatus("Driver sudah sampai!"), 3000);
    setTimeout(() => setStatus("Perjalanan dimulai..."), 6000);
    setTimeout(() => {
      setStatus("Tiba di tujuan");
      setStep("completed");
    }, 10000);
  };

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Ride Hailing</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl min-h-[calc(100vh-140px)] flex flex-col">
        {step === "search" && (
          <RideSearch 
            pickup={pickup}
            setPickup={setPickup}
            destination={destination}
            setDestination={setDestination}
            rideType={rideType}
            setRideType={setRideType}
            handleSearch={handleSearch}
          />
        )}

        {step === "estimating" && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-lg">Menganalisis Rute</p>
              <p className="text-muted-foreground animate-pulse text-sm">Menghitung estimasi biaya & waktu...</p>
            </div>
          </div>
        )}

        {step === "finding" && (
          <RideSelection 
            rides={rides}
            pickup={pickup}
            destination={destination}
            route={route}
            setRoute={setRoute}
            selectedRide={selectedRide}
            setSelectedRide={setSelectedRide}
            activeRide={activeRide}
            handleConfirm={handleConfirm}
          />
        )}

        {step === "active" && (
          <RideActive 
            status={status}
            destination={destination?.name || destination?.address || "Tujuan"}
            onCancel={() => setStep("search")}
          />
        )}

        {step === "completed" && (
          <RideCompleted 
            onFinish={() => setStep("search")}
          />
        )}
      </div>
    </Layout>
  );
};

export default Ride;
