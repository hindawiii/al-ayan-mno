import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity, Pill, Users, Heart, Cross, MessageCircle, Facebook, Twitter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";

const Index = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const modules = [
    { title: t("simulations"), description: t("simulationsDesc"), icon: Activity, url: "/simulations", color: "text-primary" },
    { title: t("pharmacist"), description: t("pharmacistDesc"), icon: Pill, url: "/pharmacist", color: "text-secondary" },
    { title: t("community"), description: t("communityDesc"), icon: Users, url: "/community", color: "text-primary" },
    { title: t("massage"), description: t("massageDesc"), icon: Heart, url: "/massage", color: "text-destructive" },
    { title: t("firstAid"), description: t("firstAidDesc"), icon: Cross, url: "/first-aid", color: "text-destructive" },
  ];

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-l from-primary/5 to-transparent">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6">
          <div className="animate-float">
            <WadAlHalalAvatar size={140} />
          </div>
          <div className="flex-1 text-center sm:text-right space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("welcome")} <span className="text-primary">{t("appName")}</span>
            </h2>
            <div className="bg-card rounded-xl p-4 border shadow-sm max-w-md mx-auto sm:mx-0 sm:mr-0">
              <p className="text-muted-foreground leading-relaxed">
                💡 <strong>{t("tipOfDay")}</strong> {t("tipText")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{t("wadAlHalal")}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">{t("mainSections")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((module) => (
            <Link key={module.url} to={module.url}>
              <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group h-full">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <module.icon className={`h-7 w-7 ${module.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="mt-1">{module.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("completedSims"), value: "0", emoji: "🎯" },
          { label: t("checkedPrescriptions"), value: "0", emoji: "💊" },
          { label: t("communityPosts"), value: "0", emoji: "💬" },
          { label: t("learningDays"), value: "1", emoji: "📅" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center p-4">
            <p className="text-2xl mb-1">{stat.emoji}</p>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Social Sharing - Rectangular Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 text-center">
          {t("shareApp")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://wa.me/?text=جرّب تطبيق العيان منو — دليل طبي رقمي سوداني! https://al-ayan-mno.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[hsl(142,70%,45%)] text-white hover:opacity-90 transition-opacity font-medium"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{isAr ? "شارك عبر واتساب" : "Share on WhatsApp"}</span>
          </a>
          <a
            href="https://www.facebook.com/sharer/sharer.php?u=https://al-ayan-mno.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[hsl(220,70%,50%)] text-white hover:opacity-90 transition-opacity font-medium"
          >
            <Facebook className="h-5 w-5" />
            <span>{isAr ? "شارك عبر فيسبوك" : "Share on Facebook"}</span>
          </a>
          <a
            href="https://twitter.com/intent/tweet?text=جرّب تطبيق العيان منو — دليل طبي رقمي سوداني!&url=https://al-ayan-mno.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity font-medium"
          >
            <Twitter className="h-5 w-5" />
            <span>{isAr ? "شارك عبر X" : "Share on X"}</span>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Index;
