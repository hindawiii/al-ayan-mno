import { useTranslation } from "react-i18next";
import { Heart, Wind, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FirstAid = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("cpr"),
      icon: Heart,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      steps: t("cprSteps", { returnObjects: true }) as string[],
      emoji: "❤️",
    },
    {
      title: t("choking"),
      icon: Wind,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      steps: t("chokingSteps", { returnObjects: true }) as string[],
      emoji: "🫁",
    },
    {
      title: t("bleeding"),
      icon: Droplets,
      color: "text-primary",
      bgColor: "bg-primary/10",
      steps: t("bleedingSteps", { returnObjects: true }) as string[],
      emoji: "🩸",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          🏥 {t("firstAidFull")}
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          {t("firstAid")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <CardHeader className={`${section.bgColor} pb-4`}>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-card shadow-sm">
                  <section.icon className={`h-8 w-8 ${section.color}`} />
                </div>
                <CardTitle className="text-lg">{section.emoji} {section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ol className="space-y-3">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FirstAid;
