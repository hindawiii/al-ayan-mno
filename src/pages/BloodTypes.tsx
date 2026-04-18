import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Droplet,
  HeartPulse,
  FlaskConical,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// ─── Static data ─────────────────────────────────────────────────────
type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface BloodInfo {
  type: BloodType;
  rarityAr: string;
  rarityEn: string;
  charsAr: string;
  charsEn: string;
  noteAr: string;
  noteEn: string;
}

const BLOOD_DATA: Record<BloodType, BloodInfo> = {
  "O+": {
    type: "O+",
    rarityAr: "≈ 38% — الأكثر شيوعاً",
    rarityEn: "≈ 38% — Most common",
    charsAr: "لا تحمل مستضدات A أو B، تحمل عامل Rh الموجب.",
    charsEn: "No A/B antigens, Rh positive.",
    noteAr: "متبرع شائع لكل أصحاب الـ Rh الموجب.",
    noteEn: "Universal donor for all Rh positive recipients.",
  },
  "O-": {
    type: "O-",
    rarityAr: "≈ 7% — نادرة وثمينة",
    rarityEn: "≈ 7% — Rare & precious",
    charsAr: "لا تحمل أي مستضدات (A، B، أو Rh).",
    charsEn: "No antigens at all (A, B, or Rh).",
    noteAr: "🌟 المتبرع العالمي — يُعطى في الطوارئ قبل معرفة الفصيلة.",
    noteEn: "🌟 Universal donor — used in emergencies.",
  },
  "A+": {
    type: "A+",
    rarityAr: "≈ 34%",
    rarityEn: "≈ 34%",
    charsAr: "تحمل مستضد A وعامل Rh الموجب.",
    charsEn: "Has A antigen and Rh positive.",
    noteAr: "يستقبل من A+, A-, O+, O-.",
    noteEn: "Receives from A+, A-, O+, O-.",
  },
  "A-": {
    type: "A-",
    rarityAr: "≈ 6%",
    rarityEn: "≈ 6%",
    charsAr: "تحمل مستضد A وRh سالب.",
    charsEn: "Has A antigen, Rh negative.",
    noteAr: "مهمة للأمهات الحوامل ذوات Rh السالب.",
    noteEn: "Critical for Rh-negative pregnant women.",
  },
  "B+": {
    type: "B+",
    rarityAr: "≈ 9%",
    rarityEn: "≈ 9%",
    charsAr: "تحمل مستضد B وRh موجب.",
    charsEn: "Has B antigen, Rh positive.",
    noteAr: "يستقبل من B+, B-, O+, O-.",
    noteEn: "Receives from B+, B-, O+, O-.",
  },
  "B-": {
    type: "B-",
    rarityAr: "≈ 2% — نادرة",
    rarityEn: "≈ 2% — Rare",
    charsAr: "تحمل مستضد B وRh سالب.",
    charsEn: "Has B antigen, Rh negative.",
    noteAr: "صعب الإيجاد في بنوك الدم.",
    noteEn: "Hard to find in blood banks.",
  },
  "AB+": {
    type: "AB+",
    rarityAr: "≈ 3%",
    rarityEn: "≈ 3%",
    charsAr: "تحمل مستضدي A وB وعامل Rh الموجب.",
    charsEn: "Has both A & B antigens, Rh positive.",
    noteAr: "🌟 المستقبل العالمي — يستقبل من جميع الفصائل.",
    noteEn: "🌟 Universal recipient — receives from all.",
  },
  "AB-": {
    type: "AB-",
    rarityAr: "≈ 1% — الأندر",
    rarityEn: "≈ 1% — Rarest",
    charsAr: "تحمل مستضدي A وB وRh سالب.",
    charsEn: "Has A & B antigens, Rh negative.",
    noteAr: "أندر فصيلة — متبرع البلازما العالمي.",
    noteEn: "Rarest type — universal plasma donor.",
  },
};

// Donor compatibility (RBC)
const CAN_GIVE_TO: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

const CAN_RECEIVE_FROM: Record<BloodType, BloodType[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

// ─── Genetics calculator ────────────────────────────────────────────
type ABOAllele = "A" | "B" | "O";
type RhAllele = "+" | "-";

function aboGenotypes(type: "A" | "B" | "AB" | "O"): ABOAllele[][] {
  // possible parental ABO genotypes given phenotype (heuristic average)
  if (type === "A") return [["A", "A"], ["A", "O"]];
  if (type === "B") return [["B", "B"], ["B", "O"]];
  if (type === "AB") return [["A", "B"]];
  return [["O", "O"]];
}

function rhGenotypes(rh: "+" | "-"): RhAllele[][] {
  if (rh === "-") return [["-", "-"]];
  return [["+", "+"], ["+", "-"]];
}

function aboPhenotype(a1: ABOAllele, a2: ABOAllele): "A" | "B" | "AB" | "O" {
  const set = [a1, a2].sort().join("");
  if (set === "AA" || set === "AO") return "A";
  if (set === "BB" || set === "BO") return "B";
  if (set === "AB") return "AB";
  return "O";
}

function rhPhenotype(r1: RhAllele, r2: RhAllele): "+" | "-" {
  return r1 === "+" || r2 === "+" ? "+" : "-";
}

function calcChildren(father: BloodType, mother: BloodType): { type: BloodType; pct: number }[] {
  const fAbo = father.replace(/[+-]/, "") as "A" | "B" | "AB" | "O";
  const mAbo = mother.replace(/[+-]/, "") as "A" | "B" | "AB" | "O";
  const fRh = father.includes("+") ? "+" : "-";
  const mRh = mother.includes("+") ? "+" : "-";

  const counts: Record<string, number> = {};
  let total = 0;

  for (const fG of aboGenotypes(fAbo)) {
    for (const mG of aboGenotypes(mAbo)) {
      for (const fR of rhGenotypes(fRh)) {
        for (const mR of rhGenotypes(mRh)) {
          for (const a1 of fG) {
            for (const a2 of mG) {
              for (const r1 of fR) {
                for (const r2 of mR) {
                  const p = aboPhenotype(a1, a2);
                  const r = rhPhenotype(r1, r2);
                  const key = `${p}${r}`;
                  counts[key] = (counts[key] || 0) + 1;
                  total++;
                }
              }
            }
          }
        }
      }
    }
  }
  return Object.entries(counts)
    .map(([type, n]) => ({ type: type as BloodType, pct: Math.round((n / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

// ─── Component ───────────────────────────────────────────────────────
const BloodTypes = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { toast } = useToast();

  const [father, setFather] = useState<BloodType>("O+");
  const [mother, setMother] = useState<BloodType>("A+");
  const [donorSelect, setDonorSelect] = useState<BloodType>("O-");

  // Urgent need form
  const [needType, setNeedType] = useState<BloodType>("O+");
  const [needCity, setNeedCity] = useState("");
  const [needPhone, setNeedPhone] = useState("");
  const [needNote, setNeedNote] = useState("");
  const [needUrgent, setNeedUrgent] = useState(true);
  const [posting, setPosting] = useState(false);

  const childResults = useMemo(() => calcChildren(father, mother), [father, mother]);

  const submitUrgentNeed = useCallback(async () => {
    if (!needCity.trim() || !needPhone.trim()) {
      toast({
        title: isAr ? "بيانات ناقصة" : "Missing info",
        description: isAr ? "أدخل المدينة ورقم التواصل" : "Enter city and contact number",
        variant: "destructive",
      });
      return;
    }
    setPosting(true);
    try {
      await addDoc(collection(db, "posts"), {
        type: "consultation",
        author: isAr ? "طلب دم عاجل 🩸" : "Urgent Blood Request 🩸",
        age: 0,
        gender: "-",
        symptoms:
          (isAr
            ? `🩸 مطلوب فصيلة ${needType} في ${needCity}\n📞 ${needPhone}`
            : `🩸 Need ${needType} blood in ${needCity}\n📞 ${needPhone}`) +
          (needNote ? `\n${needNote}` : ""),
        durationField: "-",
        urgent: needUrgent,
        solved: false,
        responses: [],
        likes: 0,
        liked: false,
        createdAt: serverTimestamp(),
      });
      toast({
        title: isAr ? "تم النشر في المجتمع ✅" : "Posted to community ✅",
        description: isAr
          ? "ينقذ الله بك حياة — شكراً يا دكتور"
          : "May your post save a life",
      });
      setNeedCity("");
      setNeedPhone("");
      setNeedNote("");
    } catch {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr ? "حاول مرة أخرى" : "Please try again",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }, [needType, needCity, needPhone, needNote, needUrgent, isAr, toast]);

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Hero */}
      <Card className={`overflow-hidden border-blood/30 bg-gradient-to-${isAr ? "l" : "r"} from-blood/10 via-blood/5 to-transparent`}>
        <CardContent className={`flex flex-col items-center gap-5 p-6 sm:flex-row ${isAr ? "sm:flex-row-reverse" : ""}`}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blood/30 blur-2xl animate-pulse" />
            <Droplet className="relative h-16 w-16 text-blood drop-shadow-lg" fill="currentColor" />
          </div>
          <div className="flex-1 text-center sm:text-start space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {isAr ? "🩸 فصائل الدم" : "🩸 Blood Types & Groups"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {isAr
                ? "موسوعة تفاعلية: تعرّف على فصيلتك، احسب فصائل أبنائك، وتعلّم طريقة الفحص."
                : "Interactive encyclopedia: learn your type, predict children's types, and master testing."}
            </p>
            <div className="bg-card border rounded-lg p-3 text-sm flex items-start gap-2 max-w-md mx-auto sm:mx-0">
              <WadAlHalalAvatar size={36} />
              <p className="text-muted-foreground text-start">
                {isAr
                  ? "يا دكتور، معرفة فصيلتك ممكن تنقذ حياتك يوماً ما — وحياة غيرك دايماً."
                  : "Doctor, knowing your blood type may save your life one day — and others' every day."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="encyclopedia" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="encyclopedia" className="data-[state=active]:bg-blood data-[state=active]:text-blood-foreground gap-1">
            <Droplet className="h-4 w-4" />
            <span className="hidden sm:inline">{isAr ? "الموسوعة" : "Encyclopedia"}</span>
          </TabsTrigger>
          <TabsTrigger value="genetics" className="data-[state=active]:bg-blood data-[state=active]:text-blood-foreground gap-1">
            <HeartPulse className="h-4 w-4" />
            <span className="hidden sm:inline">{isAr ? "الوراثة" : "Genetics"}</span>
          </TabsTrigger>
          <TabsTrigger value="lab" className="data-[state=active]:bg-blood data-[state=active]:text-blood-foreground gap-1">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">{isAr ? "المختبر" : "Lab"}</span>
          </TabsTrigger>
          <TabsTrigger value="donor" className="data-[state=active]:bg-blood data-[state=active]:text-blood-foreground gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{isAr ? "التبرع" : "Donor"}</span>
          </TabsTrigger>
          <TabsTrigger value="urgent" className="data-[state=active]:bg-blood data-[state=active]:text-blood-foreground gap-1">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{isAr ? "حاجة عاجلة" : "Urgent"}</span>
          </TabsTrigger>
        </TabsList>

        {/* ENCYCLOPEDIA */}
        <TabsContent value="encyclopedia" className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOOD_TYPES.map((type) => {
              const info = BLOOD_DATA[type];
              return (
                <Card
                  key={type}
                  className="border-blood/20 hover:border-blood/60 hover:shadow-lg hover:shadow-blood/10 transition-all group overflow-hidden"
                >
                  <CardHeader className="bg-gradient-to-br from-blood to-blood/70 text-blood-foreground p-4">
                    <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                      <span className="text-3xl font-extrabold tracking-tight">{type}</span>
                      <Droplet className="h-8 w-8 opacity-90 group-hover:scale-110 transition-transform" fill="currentColor" />
                    </div>
                    <Badge variant="secondary" className="mt-1 w-fit bg-blood-foreground/90 text-[10px] text-blood self-start">
                      {isAr ? info.rarityAr : info.rarityEn}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-sm text-start">
                    <div>
                      <p className="font-semibold text-foreground">
                        {isAr ? "الخصائص:" : "Characteristics:"}
                      </p>
                      <p className="text-muted-foreground">{isAr ? info.charsAr : info.charsEn}</p>
                    </div>
                    <div className="border-t pt-2">
                      <p className="font-semibold text-foreground">
                        {isAr ? "ملاحظة طبية:" : "Medical Note:"}
                      </p>
                      <p className="text-muted-foreground">{isAr ? info.noteAr : info.noteEn}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* GENETICS */}
        <TabsContent value="genetics" className="mt-5">
          <Card className="border-blood/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-blood" />
                {isAr ? "حاسبة فصيلة الطفل" : "Child Blood Type Calculator"}
              </CardTitle>
              <CardDescription>
                {isAr
                  ? "اختر فصيلة الأب والأم لرؤية الفصائل المحتملة للطفل."
                  : "Select father's and mother's blood types to see possible child types."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isAr ? "👨 فصيلة الأب" : "👨 Father"}
                  </label>
                  <Select value={father} onValueChange={(v) => setFather(v as BloodType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isAr ? "👩 فصيلة الأم" : "👩 Mother"}
                  </label>
                  <Select value={mother} onValueChange={(v) => setMother(v as BloodType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blood" />
                  {isAr ? "الفصائل المحتملة للطفل:" : "Possible child types:"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {childResults.map((r) => (
                    <div
                      key={r.type}
                      className="relative overflow-hidden rounded-lg border border-blood/30 bg-card p-3 text-center"
                    >
                      <div
                        className="absolute top-0 bottom-0 bg-blood/10"
                        style={{
                          width: `${r.pct}%`,
                          [isAr ? "right" : "left"]: 0,
                        }}
                      />
                      <div className="relative text-center">
                        <p className="text-xl font-extrabold text-blood">{r.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.pct}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  {isAr
                    ? "* الحساب تقريبي بناءً على متوسط التركيب الجيني لكل فصيلة."
                    : "* Estimate based on average genotype distribution for each phenotype."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LAB */}
        <TabsContent value="lab" className="mt-5 space-y-4">
          <Card className="border-blood/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-blood" />
                {isAr ? "1. أخذ العينة" : "1. Sample Collection"}
              </CardTitle>
              <CardDescription>
                {isAr ? "خطوات سحب الدم بأمان (Venipuncture & Finger Prick)" : "Safe blood drawing steps"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-blood/20 p-4 bg-blood/5">
                <p className="font-semibold mb-2 text-blood">
                  {isAr ? "🩸 السحب الوريدي (Venipuncture)" : "🩸 Venipuncture"}
                </p>
                <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
                  {(isAr
                    ? [
                        "اغسل يديك والبس قفازات معقمة.",
                        "ثبت العاصبة (Tourniquet) فوق المرفق بـ 4 أصابع.",
                        "اختر الوريد المناسب (Median Cubital عادة).",
                        "عقّم المنطقة بكحول 70% بحركة دائرية للخارج.",
                        "أدخل الإبرة بزاوية 15-30 درجة.",
                        "حرر العاصبة قبل سحب الإبرة.",
                        "اضغط بشاش معقم 2-3 دقائق.",
                        "تخلص من الإبرة في Sharps Container.",
                      ]
                    : [
                        "Wash hands & wear sterile gloves.",
                        "Apply tourniquet ~4 fingers above elbow.",
                        "Select proper vein (usually Median Cubital).",
                        "Disinfect with 70% alcohol, circular outward.",
                        "Insert needle at 15-30° angle.",
                        "Release tourniquet before withdrawing needle.",
                        "Apply gauze pressure 2-3 minutes.",
                        "Discard needle in Sharps Container.",
                      ]
                  ).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              <div className="rounded-lg border border-blood/20 p-4 bg-blood/5">
                <p className="font-semibold mb-2 text-blood">
                  {isAr ? "💉 وخز الإصبع (Finger Prick)" : "💉 Finger Prick"}
                </p>
                <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
                  {(isAr
                    ? [
                        "دفّئ يد المريض لتحسين تدفق الدم.",
                        "عقّم جانب طرف الإصبع (الوسطى أو البنصر).",
                        "استخدم Lancet معقم لمرة واحدة.",
                        "تجاهل أول قطرة (تحتوي سائل نسيجي).",
                        "اجمع القطرات على شريحة الفحص.",
                        "اضغط بقطن جاف لإيقاف النزيف.",
                      ]
                    : [
                        "Warm patient's hand to improve flow.",
                        "Disinfect side of fingertip (middle/ring).",
                        "Use a sterile single-use lancet.",
                        "Wipe away first drop (tissue fluid).",
                        "Collect drops onto the test slide.",
                        "Apply dry cotton to stop bleeding.",
                      ]
                  ).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blood/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-blood" />
                {isAr ? "2. طريقة معرفة الفصيلة (Forward Grouping)" : "2. Forward Grouping Method"}
              </CardTitle>
              <CardDescription>
                {isAr
                  ? "نضع قطرة دم مع كاشف Anti-A، Anti-B، Anti-D ونلاحظ التجلط."
                  : "Mix blood with Anti-A, Anti-B, and Anti-D reagents and observe agglutination."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blood text-blood-foreground">
                      <th className="p-2 text-start">{isAr ? "الفصيلة" : "Type"}</th>
                      <th className="p-2">Anti-A</th>
                      <th className="p-2">Anti-B</th>
                      <th className="p-2">Anti-D (Rh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { t: "A+", a: true, b: false, d: true },
                      { t: "A-", a: true, b: false, d: false },
                      { t: "B+", a: false, b: true, d: true },
                      { t: "B-", a: false, b: true, d: false },
                      { t: "AB+", a: true, b: true, d: true },
                      { t: "AB-", a: true, b: true, d: false },
                      { t: "O+", a: false, b: false, d: true },
                      { t: "O-", a: false, b: false, d: false },
                    ].map((row) => (
                      <tr key={row.t} className="border-b border-blood/10">
                        <td className="p-2 font-bold text-blood">{row.t}</td>
                        {[row.a, row.b, row.d].map((agg, i) => (
                          <td key={i} className="p-2 text-center">
                            <span
                              className={
                                agg
                                  ? "inline-block rounded-full bg-blood text-blood-foreground px-2 py-0.5 text-xs font-semibold"
                                  : "inline-block rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs"
                              }
                            >
                              {agg ? (isAr ? "تجلط ✓" : "Agglut. ✓") : (isAr ? "صافٍ" : "Clear")}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 rounded-lg bg-blood/5 border border-blood/20 p-3 text-sm text-muted-foreground">
                <strong className="text-blood">
                  {isAr ? "💡 ملاحظة:" : "💡 Note:"}
                </strong>{" "}
                {isAr
                  ? "التجلط (Agglutination) يظهر كتجمع حبيبات حمراء واضحة على الشريحة خلال ثوانٍ. الفصيلة الصافية بدون تجلط تعني عدم وجود المستضد."
                  : "Agglutination appears as clear red clumps on the slide within seconds. A clear reaction means the antigen is absent."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DONOR */}
        <TabsContent value="donor" className="mt-5">
          <Card className="border-blood/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blood" />
                {isAr ? "من يتبرع لمن؟" : "Who can give to whom?"}
              </CardTitle>
              <CardDescription>
                {isAr ? "اختر فصيلتك لرؤية المتوافقين." : "Pick your blood type to see matches."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="max-w-xs">
                <Select value={donorSelect} onValueChange={(v) => setDonorSelect(v as BloodType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border-2 border-blood/30 p-4 bg-gradient-to-br from-blood/10 to-transparent">
                  <p className={`mb-3 flex items-center gap-2 font-bold text-blood ${isAr ? "flex-row-reverse justify-end text-right" : ""}`}>
                    <ArrowRight className="h-4 w-4" />
                    {isAr ? "أتبرع لـ:" : "I can give to:"}
                  </p>
                  <div className={`flex flex-wrap gap-2 ${isAr ? "justify-end" : ""}`}>
                    {CAN_GIVE_TO[donorSelect].map((b) => (
                      <span
                        key={b}
                        className="px-3 py-1.5 rounded-full bg-blood text-blood-foreground font-bold text-sm shadow-sm"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border-2 border-primary/30 p-4 bg-gradient-to-br from-primary/10 to-transparent">
                  <p className={`mb-3 flex items-center gap-2 font-bold text-primary ${isAr ? "flex-row-reverse justify-end text-right" : ""}`}>
                    <CheckCircle2 className="h-4 w-4" />
                    {isAr ? "أستقبل من:" : "I can receive from:"}
                  </p>
                  <div className={`flex flex-wrap gap-2 ${isAr ? "justify-end" : ""}`}>
                    {CAN_RECEIVE_FROM[donorSelect].map((b) => (
                      <span
                        key={b}
                        className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-sm"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* URGENT */}
        <TabsContent value="urgent" className="mt-5">
          <Card className="border-blood/40 bg-gradient-to-br from-blood/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blood">
                <AlertCircle className="h-5 w-5" />
                {isAr ? "🚨 طلب تبرع عاجل" : "🚨 Urgent Blood Request"}
              </CardTitle>
              <CardDescription>
                {isAr
                  ? "سننشر طلبك مباشرة في مجتمع التمريض ليصل لأكبر عدد ممكن."
                  : "Your request will be posted instantly to the Nurse Community feed."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isAr ? "الفصيلة المطلوبة" : "Blood type needed"}
                  </label>
                  <Select value={needType} onValueChange={(v) => setNeedType(v as BloodType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isAr ? "المدينة / المستشفى" : "City / Hospital"}
                  </label>
                  <Input
                    value={needCity}
                    onChange={(e) => setNeedCity(e.target.value)}
                    placeholder={isAr ? "الخرطوم — مستشفى ..." : "Khartoum — Hospital..."}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {isAr ? "رقم التواصل" : "Contact number"}
                </label>
                <Input
                  value={needPhone}
                  onChange={(e) => setNeedPhone(e.target.value)}
                  placeholder="+249 ..."
                  type="tel"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
                </label>
                <Textarea
                  value={needNote}
                  onChange={(e) => setNeedNote(e.target.value)}
                  placeholder={isAr ? "حالة المريض، عدد الأكياس..." : "Patient condition, units..."}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
                <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                  <AlertCircle className="h-4 w-4 text-blood" />
                  <span className="text-sm font-medium">
                    {isAr ? "وضع علامة عاجل" : "Mark as urgent"}
                  </span>
                </div>
                <Switch checked={needUrgent} onCheckedChange={setNeedUrgent} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={submitUrgentNeed}
                  disabled={posting}
                  className="bg-blood hover:bg-blood/90 text-blood-foreground gap-2 flex-1"
                >
                  <Send className="h-4 w-4" />
                  {posting
                    ? (isAr ? "جاري النشر..." : "Posting...")
                    : (isAr ? "نشر في المجتمع" : "Post to Community")}
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/community">
                    {isAr ? "فتح مجتمع التمريض" : "Open Community"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodTypes;
