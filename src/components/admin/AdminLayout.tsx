import { Outlet, Link } from "react-router-dom";
import { LogOut, Home } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";
import { useUserAuth } from "@/context/UserAuthContext";

export default function AdminLayout() {
  const { logout, user } = useUserAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-background px-4 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Site</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
