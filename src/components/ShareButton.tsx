import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const APP_URL = "https://al-ayan-mno-app-2.vercel.app/";

const ShareButton = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const handleShare = async () => {
    const shareData = {
      title: "العيان منو — Al-Ayan Mno",
      text: isAr
        ? "جرّب تطبيق العيان منو — أول دليل طبي رقمي سوداني لتعليم التمريض والإسعافات الأولية!"
        : "Try Al-Ayan Mno — the first Sudanese digital medical guide for nursing and first aid!",
      url: APP_URL,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${APP_URL}`);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
      <Share2 className="h-4 w-4" />
      {isAr ? "مشاركة" : "Share"}
    </Button>
  );
};

export default ShareButton;
