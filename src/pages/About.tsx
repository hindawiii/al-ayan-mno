import { useTranslation } from "react-i18next";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex justify-center animate-float">
        <WadAlHalalAvatar size={120} />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {t("aboutTitle")}
      </h1>

      <p className="text-muted-foreground text-lg leading-loose px-4">
        {t("aboutDescription")}
      </p>

      <p className="text-sm text-muted-foreground">
        {t("madeWith")}
      </p>
    </div>
  );
};

export default About;
