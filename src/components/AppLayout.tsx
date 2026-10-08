import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Building2, Network, AlertTriangle, Wrench, Flame, Battery, Radio } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const items = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Fours", url: "/producteurs", icon: Flame },
  { title: "Consommateurs", url: "/consommateurs", icon: Building2 },
  { title: "Réseau", url: "/reseau", icon: Network },
  { title: "Batteries", url: "/batteries", icon: Battery },
  { title: "Alertes", url: "/alertes", icon: AlertTriangle },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
];

function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const alertesActives = useStore((s) => s.alerts.filter((a) => !a.fermee).length);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Flame className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">HeatNet</span>
            <span className="text-xs text-sidebar-foreground/70">Réseau intelligent</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.url === "/alertes" && alertesActives > 0 && (
                          <Badge className="ml-auto bg-secondary text-secondary-foreground">
                            {alertesActives}
                          </Badge>
                        )}
                      </Link>
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

function useSimulation() {
  const tick = useStore((s) => s.tickSimulation);
  useEffect(() => {
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [tick]);
}

export function AppLayout() {
  useSimulation();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-1 rounded"
                style={{ background: "var(--gradient-heat)" }}
              />
              <h1 className="text-sm font-semibold">Gestion du réseau de chaleur</h1>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>Temps réel · 5s</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
