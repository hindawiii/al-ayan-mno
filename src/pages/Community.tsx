import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  MessageSquare, Stethoscope, Heart, Users, BookOpen,
  Activity, Shield, Handshake, GraduationCap, Syringe,
  ClipboardList, HeartPulse
} from "lucide-react";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";
import { cn } from "@/lib/utils";

interface CommunityCard {
  id: string;
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  shade: string;
}

const CARDS: CommunityCard[] = [
  {
    id: "general",
    icon: MessageSquare,
    titleAr: "الساحة العامة",
    titleEn: "General Square",
    descAr: "تعارف ونقاش عام بين الممرضين والممرضات",
    descEn: "Introductions and general discussion among nurses",
    shade: "142 60% 30%",
  },
  {
    id: "medical",
    icon: Stethoscope,
    titleAr: "استشارات طبية",
    titleEn: "Medical Consultations",
    descAr: "استشارات مهنية وحالات سريرية للنقاش",
    descEn: "Professional consultations and clinical case discussions",
    shade: "142 55% 35%",
  },
  {
    id: "education",
    icon: GraduationCap,
    titleAr: "التعليم المستمر",
    titleEn: "Continuing Education",
    descAr: "دورات تدريبية ومصادر تعليمية للتطوير المهني",
    descEn: "Training courses and educational resources",
    shade: "142 50% 28%",
  },
  {
    id: "firstaid",
    icon: HeartPulse,
    titleAr: "الإسعافات الأولية",
    titleEn: "First Aid",
    descAr: "نصائح وإرشادات للتعامل مع الحالات الطارئة",
    descEn: "Tips and guidelines for emergency situations",
    shade: "142 45% 38%",
  },
  {
    id: "support",
    icon: Handshake,
    titleAr: "الدعم النفسي",
    titleEn: "Peer Support",
    descAr: "مساحة آمنة لمشاركة التجارب والدعم المتبادل",
    descEn: "A safe space for sharing experiences and mutual support",
    shade: "142 60% 25%",
  },
  {
    id: "protocols",
    icon: ClipboardList,
    titleAr: "البروتوكولات الطبية",
    titleEn: "Medical Protocols",
    descAr: "أحدث البروتوكولات والإرشادات السريرية المعتمدة",
    descEn: "Latest approved protocols and clinical guidelines",
    shade: "142 50% 32%",
  },
  {
    id: "safety",
    icon: Shield,
    titleAr: "سلامة المرضى",
    titleEn: "Patient Safety",
    descAr: "معايير الجودة وسلامة المرضى في المنشآت الصحية",
    descEn: "Quality standards and patient safety in healthcare",
    shade: "142 55% 40%",
  },
  {
    id: "wellness",
    icon: Heart,
    titleAr: "صحة الممرض",
    titleEn: "Nurse Wellness",
    descAr: "العناية بصحة وسلامة الطاقم التمريضي",
    descEn: "Caring for the health and wellbeing of nursing staff",
    shade: "142 40% 33%",
  },
];

const Community = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <WadAlHalalAvatar size={48} />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {isAr ? "مجتمع التمريض" : "Nurse Community"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "انضم إلى مجتمعك المهني وشارك خبراتك"
              : "Join your professional community and share your expertise"}
          </p>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              className={cn(
                "group relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl",
                "shadow-md hover:shadow-xl transition-all duration-300 ease-out",
                "hover:scale-[1.04] active:scale-[0.98]",
                "cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              style={{
                backgroundColor: `hsl(${card.shade})`,
                color: "hsl(0 0% 98%)",
              }}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/15 backdrop-blur-sm group-hover:bg-white/25 transition-colors duration-300">
                <Icon className="h-8 w-8" strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold leading-tight">
                {isAr ? card.titleAr : card.titleEn}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed opacity-85">
                {isAr ? card.descAr : card.descEn}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Community;
