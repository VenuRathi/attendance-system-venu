import { Link, useLocation } from "wouter";
import { 
  Activity, 
  BookOpen, 
  BarChart3, 
  RotateCcw,
  Zap,
  Users
} from "lucide-react";
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

const NAV_ITEMS = [
  { title: "Dashboard", href: "/", icon: Activity },
  { title: "Lectures", href: "/lectures", icon: BookOpen },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Reset System", href: "/reset", icon: RotateCcw },
  { title: "About Us", href: "/about", icon: Users },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="flex flex-row items-center gap-2 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-mono font-bold tracking-wider text-primary">RFID_CTRL</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground uppercase text-xs tracking-widest">Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                          <Link href={item.href} className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
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

        <main className="flex-1 flex flex-col min-h-[100dvh] overflow-hidden">
          <header className="h-16 flex items-center px-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger />
            <div className="ml-4 font-mono text-sm text-muted-foreground flex items-center gap-2">
              <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-primary" />
              SYSTEM ONLINE
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
