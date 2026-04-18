import { LayoutDashboard, Calendar, Tag, Armchair, Users, Settings, Truck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar, end: false },
  { title: "Promos", url: "/admin/promos", icon: Tag, end: false },
  { title: "Vehicles", url: "/admin/vehicles", icon: Truck, end: false },
  { title: "Seat Editor", url: "/admin/seat-editor", icon: Armchair, end: false },
  { title: "Users", url: "/admin/users", icon: Users, end: false },
  { title: "Settings", url: "/admin/settings", icon: Settings, end: false },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const getCls = (active: boolean) =>
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  item.end
                    ? location.pathname === item.url
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end={item.end} className={getCls(active)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
