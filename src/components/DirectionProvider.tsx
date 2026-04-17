import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Keeps <html dir> and <html lang> in sync with the active i18n language.
 * Arabic → rtl, anything else → ltr. Mounted once at the app root.
 */
const DirectionProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const apply = (lng: string) => {
      const isAr = lng?.startsWith("ar");
      const root = document.documentElement;
      root.dir = isAr ? "rtl" : "ltr";
      root.lang = isAr ? "ar" : "en";
    };
    apply(i18n.language);
    i18n.on("languageChanged", apply);
    return () => {
      i18n.off("languageChanged", apply);
    };
  }, [i18n]);

  return <>{children}</>;
};

export default DirectionProvider;
