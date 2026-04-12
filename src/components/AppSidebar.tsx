import { Activity, Pill, Users, Heart, Home, Cross, Info, Moon, Sun, Globe } from "lucide-react";
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
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const isAr = i18n.language === "ar";

  const toggleLang = () => {
    const newLang = isAr ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const items = [
    { title: t("home"), url: "/", icon: Home },
    { title: t("simulations"), url: "/simulations", icon: Activity },
    { title: t("pharmacist"), url: "/pharmacist", icon: Pill },
    { title: t("community"), url: "/community", icon: Users },
    { title: t("massage"), url: "/massage", icon: Heart },
    { title: t("firstAid"), url: "/first-aid", icon: Cross },
    { title: t("about"), url: "/about", icon: Info },
  ];

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" side={isAr ? "right" : "left"}>
      <SidebarHeader className="flex items-center justify-center py-4">
        <WadAlHalalAvatar size={collapsed ? 32 : 56} />
        {!collapsed && (
          <h2 className="text-lg font-bold text-primary mt-2">{t("appName")}</h2>
        )}
        {/* Theme & Language toggles */}
        <div className={`flex items-center gap-1 mt-2 ${collapsed ? "flex-col" : ""}`}>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleLang} className="h-8 w-8">
            <Globe className="h-4 w-4" />
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
                      className="hover:bg-sidebar-accent/50"
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
            {isAr ? "AR" : "EN"} • {theme === "dark" ? "🌙" : "☀️"}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
