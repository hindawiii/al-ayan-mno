import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useTranslation } from "react-i18next";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const dir = isAr ? "rtl" : "ltr";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" dir={dir}>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 gap-3" dir={dir}>
            <SidebarTrigger />
            <h1 className="flex-1 text-lg font-bold text-primary text-start">{t("appName")}</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 text-start" dir={dir}>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
