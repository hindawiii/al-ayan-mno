import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Heart, Wind, Droplets, Bone, Flame, Crosshair,
  Brain, Footprints, ChevronLeft, ChevronRight, Phone, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";

interface FirstAidCase {
  id: string;
  emoji: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "red" | "yellow" | "green";
  steps: string[];
  tip: string;
  subtitle?: string;
}

const cases: FirstAidCase[] = [
  {
    id: "cpr",
    emoji: "❤️",
    title: "إنعاش القلب الرئوي (CPR)",
    icon: Heart,
    color: "red",
    steps: [
      "اتصل بالإسعاف فوراً",
      "ضع كعب يدك على منتصف الصدر",
      "اضغط 30 ضغطة (عمق 5 سم)",
      "أعطِ نفسين إنقاذيين",
      "كرر الدورة",
    ],
    tip: "يا دكتور، خلي يدينك مفرودة واضغط بقوة.. انت هنا بتضخ الدم للقلب عشان يرجع يشتغل!",
  },
  {
    id: "choking",
    emoji: "🫁",
    title: "الاختناق (Choking)",
    icon: Wind,
    color: "red",
    steps: [
      "اسأل المصاب: هل تختنق؟",
      "قف خلف المصاب",
      "5 ضربات ظهر",
      "5 ضغطات بطن (هيمليك)",
      "كرر حتى الخروج",
    ],
    tip: "لو المصاب لسه بيكح، خليه يكح براهو ما تضربو في ضهرو.. التدخل بيبدأ لما الصوت يقطع!",
  },
  {
    id: "bleeding",
    emoji: "🩸",
    title: "النزيف الحاد (Severe Bleeding)",
    icon: Droplets,
    color: "red",
    steps: [
      "ارتدِ قفازات",
      "اضغط مباشرة بقطعة قماش نظيفة",
      "ارفع الطرف فوق مستوى القلب",
      "لا تزل الضمادة المشبعة",
      "اتصل بالإسعاف",
    ],
    tip: "ارفع اليد أو الرجل المصابة لفوق.. الجاذبية بتساعدنا نوقف الدم أسرع!",
  },
  {
    id: "fractures",
    emoji: "🦴",
    title: "الكسور (Fractures)",
    icon: Bone,
    color: "yellow",
    subtitle: "الأنواع: مغلق، مفتوح، متفتت",
    steps: [
      "منع الحركة تماماً",
      "التثبيت بجبيرة خشب أو كرتون",
      "تغطية الجرح في الكسر المفتوح بلطف",
      "لا تحاول إعادة العظم لمكانه",
      "اتصل بالإسعاف",
    ],
    tip: "الكسر المفتوح ما تلمسو.. غطيهو بحاجة نظيفة واستنى الإسعاف عشان ما يحصل التهاب.",
  },
  {
    id: "burns",
    emoji: "🔥",
    title: "الحروق (Burns)",
    icon: Flame,
    color: "yellow",
    subtitle: "الدرجات: أولى، ثانية، ثالثة",
    steps: [
      "تبريد بماء جارٍ فاتر (10-20 دقيقة)",
      "تغطية بشاش فازلين",
      "الطوارئ للمساحات الكبيرة",
      "لا تستخدم معجون الأسنان أو الزيت",
      "لا تفقع الفقاعات",
    ],
    tip: "يا دكتور، معجون الأسنان والزيت بيحبسوا الحرارة جوه الحرق.. الموية الجارية هي الدواء الأول!",
  },
  {
    id: "gunshot",
    emoji: "🔫",
    title: "التعامل مع طلق ناري",
    icon: Crosshair,
    color: "yellow",
    steps: [
      "سد الجرح بقماش والضغط بعمق",
      "تغطية جروح الصدر ببلاستيك من 3 جهات",
      "التدفئة ومنع الصدمة",
      "لا تزل أي جسم غريب من الجرح",
      "اتصل بالطوارئ فوراً",
    ],
    tip: "الجرح سدّو بأي قماشة نظيفة واضغط قوي عشان توقف النزيف الداخلي، وخلي الزول راقد ودافئ لحدي ما يوصل العمليات.",
  },
  {
    id: "seizures",
    emoji: "🧠",
    title: "التشنجات والصرع",
    icon: Brain,
    color: "green",
    steps: [
      "إبعاد الأشياء الحادة",
      "وسادة تحت الرأس",
      "لا تكتف المصاب",
      "لا تضع شيئاً في فمه",
      "وضعية الإفاقة بعد النوبة",
    ],
    tip: "ما تكتف الزول ولا تدسّ حاجة في خشمو، هو ما حيبلع لسانو.. بس أبعد منو الحاجات الحادة واحسب زمن النوبة.",
  },
  {
    id: "sprain",
    emoji: "🦶",
    title: "التواء الكاحل",
    icon: Footprints,
    color: "green",
    steps: [
      "أرح القدم ولا تمشِ عليها",
      "كمادات ماء بارد لمدة 20 دقيقة",
      "لف رباط ضاغط",
      "ارفع القدم فوق مستوى القلب",
      "استشر طبيباً إذا استمر الألم",
    ],
    tip: "الرجل دي أرخيها وما تمشي عليها نهائي، وكمادات الموية الباردة بتمصّ الورم وبترّيح الوجع.",
  },
  {
    id: "drowning",
    emoji: "🌊",
    title: "الغرق",
    icon: Droplets,
    color: "green",
    steps: [
      "أخرج المصاب من الماء بأمان",
      "اتصل بالإسعاف فوراً",
      "تحقق من التنفس",
      "ابدأ الإنعاش إذا لزم الأمر",
      "حتى لو أفاق، اذهب للمستشفى",
    ],
    tip: "حتى لو الزول فاق وبقى كويس، المستشفى ضروري.. أحياناً الموية في الرئة بتعمل مشاكل بعد ساعات.",
  },
  {
    id: "fainting",
    emoji: "😵",
    title: "الإغماء",
    icon: Brain,
    color: "green",
    steps: [
      "نوّم المصاب على ظهره",
      "ارفع رجليه فوق مستوى القلب",
      "فك الملابس الضيقة",
      "تأكد من التهوية الجيدة",
      "إذا لم يفق خلال دقيقة، اتصل بالإسعاف",
    ],
    tip: "نوم الزول على ضهرو وأرفع رجليهو فوق بتكاوي أو مخدات، عشان الدم يرجع للدماغ ويصحصح سريع.",
  },
  {
    id: "numbness",
    emoji: "🖐️",
    title: "التنميل المفاجئ",
    icon: Footprints,
    color: "green",
    steps: [
      "لاحظ أي جانب من الجسم متأثر",
      "تحقق من تدلي الوجه",
      "تحقق من ثقل اللسان",
      "اتصل بالطوارئ فوراً",
      "سجّل وقت بداية الأعراض",
    ],
    tip: "لو التنميل معاهو تقُل في اللسان أو جهة واحدة من الوش رخت، دي علامات جلطة.. طوالي على الطوارئ!",
  },
];

const colorMap = {
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: "text-red-500",
    headerBg: "bg-red-500/15",
    badge: "bg-red-500 text-white",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: "text-yellow-600",
    headerBg: "bg-yellow-500/15",
    badge: "bg-yellow-500 text-white",
  },
  green: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "text-primary",
    headerBg: "bg-primary/15",
    badge: "bg-primary text-primary-foreground",
  },
};

const FirstAid = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [activeCase, setActiveCase] = useState<FirstAidCase | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const openCase = (c: FirstAidCase) => {
    setActiveCase(c);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (activeCase && currentStep < activeCase.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="space-y-6 pb-8 text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          🏥 دليل الإسعافات الأولية التفاعلي
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          اضغط على أي بطاقة للحصول على الخطوات التفصيلية
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cases.map((c) => {
          const colors = colorMap[c.color];
          return (
            <Card
              key={c.id}
              onClick={() => openCase(c)}
              className={`cursor-pointer border-2 ${colors.border} ${colors.bg} hover:scale-[1.04] transition-all duration-200 hover:shadow-lg active:scale-95`}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-xl ${colors.headerBg}`}>
                  <c.icon className={`h-10 w-10 ${colors.icon}`} />
                </div>
                <span className="text-2xl">{c.emoji}</span>
                <h3 className="font-bold text-sm leading-tight text-foreground">
                  {c.title}
                </h3>
                {c.subtitle && (
                  <span className="text-xs text-muted-foreground">{c.subtitle}</span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Dialog open={!!activeCase} onOpenChange={(o) => !o && setActiveCase(null)}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
          {activeCase && (() => {
            const colors = colorMap[activeCase.color];
            return (
              <>
                {/* Header */}
                <div className={`${colors.headerBg} relative flex items-center gap-3 p-5 ${isAr ? "flex-row-reverse text-right" : ""}`}>
                  <div className={`p-2 rounded-xl ${colors.bg}`}>
                    <activeCase.icon className={`h-8 w-8 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-foreground leading-tight">
                      {activeCase.emoji} {activeCase.title}
                    </h2>
                    {activeCase.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{activeCase.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex justify-center gap-1.5 py-3 px-5">
                  {activeCase.steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? `w-8 ${colors.badge}`
                          : i < currentStep
                          ? "w-4 bg-muted-foreground/40"
                          : "w-4 bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Current step */}
                 <div className="px-5 pb-2 min-h-[100px] flex items-center">
                   <div className={`flex w-full items-start gap-4 ${isAr ? "flex-row-reverse text-right" : ""}`}>
                    <span className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.badge} font-bold text-lg flex items-center justify-center`}>
                      {currentStep + 1}
                    </span>
                    <p className="text-base text-foreground leading-relaxed pt-1.5 font-medium">
                      {activeCase.steps[currentStep]}
                    </p>
                  </div>
                </div>

                {/* Illustration placeholder */}
                <div className={`mx-5 rounded-xl ${colors.bg} border ${colors.border} h-28 flex items-center justify-center`}>
                  <span className="text-5xl">{activeCase.emoji}</span>
                </div>

                {/* Wad Al-Halal tip */}
                 <div className="px-5 py-4">
                   <div className={`flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 ${isAr ? "flex-row-reverse text-right" : ""}`}>
                    <WadAlHalalAvatar size={48} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary mb-1">نصيحة ود الحلال:</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {activeCase.tip}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                 <div className={`px-5 pb-5 flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex-shrink-0"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {currentStep < activeCase.steps.length - 1 ? (
                    <Button onClick={nextStep} className="flex-1 gap-2 font-bold">
                      الخطوة التالية
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveCase(null)}
                      className="flex-1 font-bold"
                      variant="secondary"
                    >
                      ✅ تم
                    </Button>
                  )}

                  <a href="tel:911">
                    <Button variant="destructive" size="icon" className="flex-shrink-0">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FirstAid;
