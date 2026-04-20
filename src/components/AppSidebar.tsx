import { Activity, Pill, Users, Heart, Home, Cross, Info, Moon, Sun, Droplet, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeProvider";
import WadAlHalalAvatar from "./WadAlHalalAvatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const items = [
    { title: t("home"), url: "/", icon: Home },
    { title: t("simulations"), url: "/simulations", icon: Activity },
    { title: t("pharmacist"), url: "/pharmacist", icon: Pill },
    { title: t("community"), url: "/community", icon: Users },
    { title: t("massage"), url: "/massage", icon: Heart },
    { title: t("firstAid"), url: "/first-aid", icon: Cross },
    { title: t("bloodTypes"), url: "/blood-types", icon: Droplet },
    { title: "مكافحة العدوى", url: "/infection-control", icon: ShieldCheck },
    { title: t("about"), url: "/about", icon: Info },
  ];

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="flex items-center justify-center py-4">
        <WadAlHalalAvatar size={collapsed ? 32 : 56} />
        {!collapsed && (
          <h2 className="mt-2 text-lg font-bold text-primary text-center">{t("appName")}</h2>
        )}
        {/* Theme toggle */}
        <div className={`flex items-center gap-1 mt-2 ${collapsed ? "flex-col" : ""}`}>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8" aria-label="تبديل الوضع">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 justify-start text-start"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="py-2">
        {!collapsed && (
          <p className="text-xs text-center text-muted-foreground">
            AR • {theme === "dark" ? "🌙" : "☀️"}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
