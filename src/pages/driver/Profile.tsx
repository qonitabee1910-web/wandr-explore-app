import DriverLayout from '@/components/driver/DriverLayout';
import { useUserAuth } from '@/context/UserAuthContext';
import { useDriver } from '@/context/DriverContext';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Car, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  Star,
  Bell,
  HelpCircle
} from 'lucide-react';

const DriverProfile = () => {
  const { user, logout } = useUserAuth();
  const { driverState } = useDriver();

  const menuItems = [
    { icon: Car, label: 'Informasi Kendaraan', sub: 'Toyota Avanza • B 1234 ABC', color: 'bg-blue-100 text-blue-600' },
    { icon: ShieldCheck, label: 'Dokumen & Verifikasi', sub: 'SIM, STNK Aktif', color: 'bg-green-100 text-green-600' },
    { icon: CreditCard, label: 'Metode Penarikan', sub: 'Bank Central Asia (BCA)', color: 'bg-purple-100 text-purple-600' },
    { icon: Bell, label: 'Notifikasi', sub: 'Suara & Getar Aktif', color: 'bg-orange-100 text-orange-600' },
    { icon: HelpCircle, label: 'Pusat Bantuan', sub: 'Pertanyaan umum & kontak', color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <DriverLayout title="Profil Driver">
      <div className="space-y-6 pb-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-[40px] bg-muted overflow-hidden border-4 border-background shadow-xl">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-2xl shadow-lg border-2 border-background">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black">{user?.fullName || 'Driver PYU-GO'}</h2>
            <p className="text-sm font-bold text-muted-foreground">{user?.phone || user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-full text-[10px] uppercase">
              Driver Terverifikasi
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-none font-black px-4 py-1.5 rounded-full text-[10px] uppercase">
              {driverState?.isOnline ? 'Aktif' : 'Offline'}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-4 rounded-3xl border border-border/50 text-center space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Rating</p>
            <p className="text-xl font-black text-primary">{(user as any)?.rating || '5.0'}</p>
          </div>
          <div className="bg-background p-4 rounded-3xl border border-border/50 text-center space-y-1 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Trip</p>
            <p className="text-xl font-black text-primary">{driverState?.completedTrips || 0}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button 
              key={i}
              className="w-full flex items-center justify-between p-4 bg-background rounded-3xl border border-border/50 hover:bg-muted/30 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm">{item.label}</p>
                  <p className="text-xs font-bold text-muted-foreground">{item.sub}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button 
          variant="destructive" 
          className="w-full h-16 rounded-3xl font-black text-lg gap-3 shadow-xl shadow-red-500/20"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" /> KELUAR APLIKASI
        </Button>

        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-4">
          PYU-GO Driver v1.0.0
        </p>
      </div>
    </DriverLayout>
  );
};

const Badge = ({ children, className }: any) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);

export default DriverProfile;
