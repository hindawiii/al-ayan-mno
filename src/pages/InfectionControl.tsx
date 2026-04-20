import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Droplets,
  Trash2,
  DoorClosed,
  Syringe,
  HardHat,
  AlertTriangle,
  Calculator,
  Camera,
  Send,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// ─── Local storage helpers ──────────────────────────────────────────
const useLocalState = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
};

// ─── Chlorine Calculator ────────────────────────────────────────────
function ChlorineCalculator() {
  const [stock, setStock] = useState<number>(5); // % of stock bleach
  const [target, setTarget] = useState<number>(0.5); // % desired
  const [volume, setVolume] = useState<number>(1000); // ml of final solution

  const partsWater = stock / target - 1;
  const bleachMl = partsWater > 0 ? volume / (partsWater + 1) : 0;
  const waterMl = volume - bleachMl;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary font-semibold">
        <Calculator className="h-4 w-4" />
        حاسبة محلول الكلور
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">تركيز العبوة الشائع في السودان:</span>
        <Button type="button" size="sm" variant={stock === 5 ? "default" : "outline"} onClick={() => setStock(5)}>
          5%
        </Button>
        <Button type="button" size="sm" variant={stock === 6 ? "default" : "outline"} onClick={() => setStock(6)}>
          6%
        </Button>
        <span className="text-xs text-muted-foreground self-center mx-1">| الهدف:</span>
        <Button type="button" size="sm" variant={target === 0.5 ? "default" : "outline"} onClick={() => setTarget(0.5)}>
          0.5% (أسطح/دم)
        </Button>
        <Button type="button" size="sm" variant={target === 0.05 ? "default" : "outline"} onClick={() => setTarget(0.05)}>
          0.05% (أدوات)
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">تركيز الكلور المركّز %</label>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="text-right"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">التركيز المطلوب %</label>
          <Input
            type="number"
            step="0.05"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="text-right"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">حجم المحلول (مل)</label>
          <Input
            type="number"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="text-right"
          />
        </div>
      </div>
      <div className="rounded-md bg-background p-3 text-sm space-y-1">
        <div>
          🧪 <strong>{bleachMl.toFixed(0)} مل</strong> من الكلور المركّز
        </div>
        <div>
          💧 <strong>{waterMl.toFixed(0)} مل</strong> ماء نظيف
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          0.5% للأسطح والدم • 0.05% للأدوات والملابس
        </p>
      </div>
    </div>
  );
}

// ─── Checklist component ───────────────────────────────────────────
function Checklist({
  storageKey,
  items,
}: {
  storageKey: string;
  items: string[];
}) {
  const [checked, setChecked] = useLocalState<Record<number, boolean>>(storageKey, {});
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => {
        const done = !!checked[idx];
        return (
          <li
            key={idx}
            onClick={() => setChecked({ ...checked, [idx]: !done })}
            className="flex items-start gap-2 cursor-pointer rounded-md p-2 hover:bg-muted/60 transition"
          >
            {done ? (
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <span className={done ? "line-through text-muted-foreground" : ""}>
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Numbered sequence ─────────────────────────────────────────────
function Sequence({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {i + 1}
          </span>
          <p className="pt-0.5">{s}</p>
        </li>
      ))}
    </ol>
  );
}

// ─── Vaccine tracker ───────────────────────────────────────────────
const VACCINES = [
  { name: "التهاب الكبد B (Hepatitis B)", doses: 3 },
  { name: "السل (BCG)", doses: 1 },
  { name: "الإنفلونزا الموسمية", doses: 1 },
  { name: "كزاز / دفتيريا (Td)", doses: 1 },
  { name: "كوفيد-19", doses: 2 },
];

function VaccineTracker() {
  const [doses, setDoses] = useLocalState<Record<string, number>>(
    "ic_vaccines",
    {},
  );
  return (
    <div className="space-y-2">
      {VACCINES.map((v) => {
        const taken = doses[v.name] ?? 0;
        const complete = taken >= v.doses;
        return (
          <div
            key={v.name}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{v.name}</p>
              <p className="text-xs text-muted-foreground">
                {taken} / {v.doses} جرعة {complete && "✅"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setDoses({ ...doses, [v.name]: Math.max(0, taken - 1) })
                }
              >
                −
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setDoses({
                    ...doses,
                    [v.name]: Math.min(v.doses, taken + 1),
                  })
                }
              >
                +
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Hazard Report Dialog ──────────────────────────────────────────
function HazardReportDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("سكب مواد ملوثة");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!location.trim() || !description.trim()) {
      toast({
        title: "الرجاء إكمال البيانات",
        description: "حدد الموقع ووصف الخطر.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        type: "hazard",
        hazardType: type,
        location,
        description,
        createdAt: serverTimestamp(),
        author: "ممرض/ة",
      });
      toast({
        title: "تم إرسال التبليغ ✅",
        description: "شكراً لحرصك على سلامة الزملاء.",
      });
      setLocation("");
      setDescription("");
      setOpen(false);
    } catch (e) {
      toast({
        title: "تعذر الإرسال",
        description: "تحقق من اتصالك بالإنترنت.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="lg" className="gap-2">
          <AlertTriangle className="h-5 w-5" />
          تبليغ عن خطر
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            تبليغ عن خطر في بيئة العمل
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">نوع الخطر</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option>سكب مواد ملوثة</option>
              <option>إبرة مكشوفة</option>
              <option>نقص معدات وقاية</option>
              <option>تلوث في غرفة عزل</option>
              <option>عطل في الأوتوكليف</option>
              <option>أخرى</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">الموقع</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: قسم الطوارئ — غرفة 3"
              className="text-right"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">الوصف</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اوصف الخطر باختصار..."
              rows={4}
              className="text-right"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Camera className="h-4 w-4" />
            رفع الصور سيُتاح قريباً
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={submit} disabled={submitting} className="gap-2">
            <Send className="h-4 w-4" />
            {submitting ? "جاري الإرسال..." : "إرسال التبليغ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Waste color card ──────────────────────────────────────────────
const WASTE = [
  {
    color: "أصفر",
    bg: "bg-yellow-400",
    text: "text-yellow-950",
    title: "النفايات المعدية",
    items: ["ضمادات ملوثة بالدم", "قفازات مستعملة", "أنابيب عينات", "حفاضات معدية"],
  },
  {
    color: "أحمر",
    bg: "bg-red-600",
    text: "text-white",
    title: "النفايات الكيميائية والخطرة",
    items: ["أدوية منتهية", "مواد كيميائية", "عينات أنسجة", "زئبق ومذيبات"],
  },
  {
    color: "أسود",
    bg: "bg-neutral-800",
    text: "text-white",
    title: "النفايات العامة",
    items: ["ورق وكرتون", "بقايا طعام", "أكياس تغليف غير ملوثة"],
  },
  {
    color: "صندوق الأمان",
    bg: "bg-amber-500",
    text: "text-amber-950",
    title: "الأدوات الحادة (Sharps)",
    items: ["إبر الحقن", "المشارط", "أمبولات مكسورة", "كانيولا مستعملة"],
  },
];

export default function InfectionControl() {
  return (
    <div dir="rtl" className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Header */}
      <header className="text-right space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold">مكافحة العدوى</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          🛡️ مكافحة العدوى — دليل المستشفى السوداني
        </h1>
        <p className="text-muted-foreground">
          بروتوكولات التعقيم، التخلص من النفايات، العزل، ومعدات الحماية حسب
          الممارسة السودانية.
        </p>
      </header>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <HazardReportDialog />
      </div>

      {/* Modules */}
      <Accordion type="single" collapsible className="space-y-3">
        {/* 1. Sterilization */}
        <AccordionItem
          value="sterilization"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-right">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">التعقيم والتطهير</p>
                <p className="text-xs text-muted-foreground font-normal">
                  مستويات التطهير، الأوتوكليف، ومحلول الكلور
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <h4 className="font-semibold mb-2">خطوات تنظيف الأدوات الطبية</h4>
              <Sequence
                steps={[
                  "ارتدِ القفازات الواقية والمئزر قبل التعامل مع الأدوات.",
                  "اشطف الأدوات بالماء البارد لإزالة الدم والأنسجة (لا تستخدم الماء الساخن).",
                  "انقع الأدوات في محلول كلور 0.5% لمدة 10 دقائق لتعطيل الفيروسات.",
                  "افرك الأدوات بفرشاة ومنظف إنزيمي مع تفكيك القطع المتحركة.",
                  "اشطف بالماء النظيف وجفف تماماً قبل التعقيم.",
                  "غلّف الأدوات وضعها في الأوتوكليف على 121°م لمدة 30 دقيقة (أو 134°م لمدة 7 دقائق).",
                ]}
              />
            </div>
            <div>
              <h4 className="font-semibold mb-2">مستويات التطهير</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className="border-emerald-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">تطهير عالٍ</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    جلوتارالدهيد 2% — للمناظير والأدوات شبه الحرجة.
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">تطهير متوسط</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    كحول 70% أو كلور 0.5% — لسماعة الطبيب وموازين الحرارة.
                  </CardContent>
                </Card>
                <Card className="border-sky-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">تطهير منخفض</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    كلور 0.05% — للأسطح والأرضيات والأسرّة.
                  </CardContent>
                </Card>
              </div>
            </div>
            <ChlorineCalculator />
          </AccordionContent>
        </AccordionItem>

        {/* 2. Waste */}
        <AccordionItem
          value="waste"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-right">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">التخلص من النفايات الطبية</p>
                <p className="text-xs text-muted-foreground font-normal">
                  نظام الترميز اللوني وصندوق الأمان
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-2 gap-3">
              {WASTE.map((w) => (
                <div
                  key={w.color}
                  className={`rounded-lg p-4 ${w.bg} ${w.text} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg">{w.title}</h4>
                    <Badge variant="secondary">{w.color}</Badge>
                  </div>
                  <ul className="text-sm space-y-1 list-disc list-inside opacity-95">
                    {w.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-semibold mb-2">من الفرز إلى التخلص الآمن</h4>
              <Sequence
                steps={[
                  "افرز النفايات عند نقطة إنتاجها — لا تخلطها أبداً.",
                  "املأ الأكياس وصناديق الأمان حتى ¾ السعة فقط.",
                  "أغلق الكيس بإحكام واكتب عليه القسم والتاريخ.",
                  "انقل النفايات في عربة مخصصة إلى نقطة التجميع المركزية.",
                  "خزّنها في غرفة باردة لا تتجاوز 48 ساعة.",
                  "تخلص منها عن طريق المحرقة الطبية (Incinerator) المعتمدة.",
                ]}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Isolation */}
        <AccordionItem
          value="isolation"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-right">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DoorClosed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">العزل الطبي</p>
                <p className="text-xs text-muted-foreground font-normal">
                  بروتوكولات الملامسة والرذاذ والهواء
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-3 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">عزل الملامسة</CardTitle>
                  <CardDescription>MRSA، C.difficile، الجرب</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>• قفازات + مئزر عند الدخول</p>
                  <p>• معدات مخصصة للمريض</p>
                  <p>• تطهير الأسطح يومياً</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">عزل الرذاذ</CardTitle>
                  <CardDescription>الإنفلونزا، السحايا</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>• كمامة جراحية على بُعد &lt;1م</p>
                  <p>• كمامة على المريض عند النقل</p>
                  <p>• غرفة مفردة مفضلة</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">العزل الهوائي</CardTitle>
                  <CardDescription>السل، الحصبة، جدري الماء</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>• كمامة N95 إجبارية</p>
                  <p>• غرفة ضغط سالب</p>
                  <p>• الباب مغلق دائماً</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-semibold text-primary">قائمة الدخول لغرفة العزل</h4>
                <Checklist
                  storageKey="ic_isolation_in"
                  items={[
                    "اغسل اليدين بالماء والصابون 40 ثانية",
                    "ارتدِ المئزر الواقي",
                    "ارتدِ الكمامة المناسبة (N95 أو جراحية)",
                    "ارتدِ النظارات الواقية",
                    "ارتدِ القفازات فوق كم المئزر",
                  ]}
                />
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-semibold text-destructive">قائمة الخروج من غرفة العزل</h4>
                <Checklist
                  storageKey="ic_isolation_out"
                  items={[
                    "انزع القفازات أولاً وألقها في الكيس الأصفر",
                    "اغسل اليدين بالكحول",
                    "انزع المئزر بطيّه للداخل",
                    "انزع النظارات من الخلف",
                    "انزع الكمامة من الأشرطة دون لمس الأمام",
                    "اغسل اليدين بالماء والصابون",
                  ]}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Vaccinations */}
        <AccordionItem
          value="vaccines"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-right">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Syringe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">تطعيمات الكوادر الصحية</p>
                <p className="text-xs text-muted-foreground font-normal">
                  متابعة جرعاتك الإجبارية
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <VaccineTracker />
          </AccordionContent>
        </AccordionItem>

        {/* 5. PPE */}
        <AccordionItem
          value="ppe"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-right">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HardHat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">معدات الوقاية الشخصية (PPE)</p>
                <p className="text-xs text-muted-foreground font-normal">
                  تسلسل اللبس والنزع بدقة
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border-2 border-emerald-500/40 p-4 space-y-2">
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400">
                  تسلسل اللبس (Donning)
                </h4>
                <Sequence
                  steps={[
                    "غسل اليدين جيداً",
                    "ارتداء المئزر (Gown)",
                    "ارتداء الكمامة N95 أو الجراحية",
                    "ارتداء النظارات الواقية أو واقي الوجه",
                    "ارتداء القفازات فوق كم المئزر",
                  ]}
                />
              </div>
              <div className="rounded-lg border-2 border-destructive/40 p-4 space-y-2">
                <h4 className="font-bold text-destructive">
                  تسلسل النزع (Doffing)
                </h4>
                <Sequence
                  steps={[
                    "نزع القفازات (الأكثر تلوثاً)",
                    "غسل اليدين",
                    "نزع المئزر بطيّه للداخل",
                    "نزع النظارات من الخلف",
                    "نزع الكمامة من الأشرطة فقط",
                    "غسل اليدين بالماء والصابون",
                  ]}
                />
              </div>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-sm">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                ⚠️ N95 مقابل الكمامة الجراحية
              </h4>
              <p>
                <strong>N95:</strong> ترشّح 95% من الجزيئات ≥0.3 ميكرون. إجبارية مع
                مرضى السل، COVID، الحصبة. تتطلب اختبار مطابقة (Fit Test).
              </p>
              <p className="mt-2">
                <strong>الجراحية:</strong> تحجب الرذاذ الكبير فقط. مناسبة للحالات
                العادية وحماية المريض من رذاذ الطاقم.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Needlestick */}
        <AccordionItem
          value="needlestick"
          className="border-2 border-destructive/40 rounded-lg bg-destructive/5 px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-right">
              <div className="h-10 w-10 rounded-lg bg-destructive/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">
                  بروتوكول وخز الإبر — طوارئ
                </p>
                <p className="text-xs text-muted-foreground font-normal">
                  ماذا تفعل خلال أول 60 دقيقة
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="rounded-lg bg-background p-4">
              <h4 className="font-bold text-destructive mb-2">
                🚨 الإسعاف الفوري
              </h4>
              <Sequence
                steps={[
                  "اترك الدم ينزف بحرية — لا تعصر الإصبع.",
                  "اغسل المنطقة بالماء الجاري والصابون لمدة 5 دقائق.",
                  "لا تستخدم الكحول أو اليود مباشرة على الجرح.",
                  "في حال تلوث العين أو الفم: اشطف بالماء أو المحلول الملحي 15 دقيقة.",
                  "غطِّ الجرح بضمادة معقمة.",
                ]}
              />
            </div>
            <div className="rounded-lg bg-background p-4">
              <h4 className="font-bold mb-2">📋 الإجراءات الإدارية</h4>
              <Sequence
                steps={[
                  "أبلغ المشرف فوراً وسجّل الحادثة.",
                  "اعرف مصدر الإبرة وحالة المريض المصدر (HBV/HCV/HIV).",
                  "توجه إلى قسم الطوارئ خلال ساعة لتقييم خطر العدوى.",
                  "ابدأ الوقاية بعد التعرض (PEP) لـ HIV خلال 2-72 ساعة إذا لزم.",
                  "أخذ جرعة معززة من لقاح Hepatitis B إذا لم تكتمل المناعة.",
                  "متابعة فحوصات بعد 6 أسابيع و3 و6 أشهر.",
                ]}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <p className="text-center text-xs text-muted-foreground pt-4">
        💚 العيان منو — مكافحة العدوى مسؤولية كل ممرض وممرضة
      </p>
    </div>
  );
}
