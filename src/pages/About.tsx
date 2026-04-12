import { useTranslation } from "react-i18next";
import { Info, Activity, Heart, Pill, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";

const About = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Activity, text: t("aboutFeature1") },
    { icon: Heart, text: t("aboutFeature2") },
    { icon: Pill, text: t("aboutFeature3") },
    { icon: Users, text: t("aboutFeature4") },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <WadAlHalalAvatar size={100} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("aboutTitle")}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {t("aboutMission")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            {t("aboutFeatures")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {t("madeWith")}
      </p>
    </div>
  );
};

export default About;
