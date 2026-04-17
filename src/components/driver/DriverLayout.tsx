import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, History, User, Settings } from 'lucide-react';

interface DriverLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DriverLayout: React.FC<DriverLayoutProps> = ({ children, title }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Beranda', path: '/driver' },
    { icon: Map, label: 'Trip', path: '/driver/trip' },
    { icon: History, label: 'Riwayat', path: '/driver/history' },
    { icon: User, label: 'Profil', path: '/driver/profile' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 sticky top-0 z-30 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 pb-safe">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DriverLayout;
