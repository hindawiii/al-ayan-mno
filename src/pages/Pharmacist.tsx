import { useState, useMemo, useCallback, DragEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Pill, Search, AlertTriangle, ShieldAlert, ShieldCheck, X, Bot, Sparkles,
  Calculator, BookOpen, Activity, Weight, Droplets, Baby, ChevronRight,
  Camera, ScanBarcode, Check, Edit, Loader2, CloudUpload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";

const SUDAN_DRUGS = [
  { id: 1, generic: "Paracetamol", brand: "Panadol / بنادول", dosage: "500mg", category: "Analgesic", storage: "Store below 25°C / يُحفظ تحت 25°م", sideEffects: "Nausea, rash / غثيان، طفح جلدي", precautions: "لا تتجاوز 4g يومياً — خطر على الكبد", pediatricDose: 15 },
  { id: 2, generic: "Amoxicillin", brand: "Amoxil / أموكسيل", dosage: "500mg", category: "Antibiotic", storage: "Store in dry place / يُحفظ في مكان جاف", sideEffects: "Diarrhea, allergy / إسهال، حساسية", precautions: "تحقق من حساسية البنسلين", pediatricDose: 25 },
  { id: 3, generic: "Ibuprofen", brand: "Brufen / بروفين", dosage: "400mg", category: "NSAID", storage: "Store below 30°C / يُحفظ تحت 30°م", sideEffects: "Stomach pain, dizziness / ألم معدة، دوخة", precautions: "تجنب مع قرحة المعدة", pediatricDose: 10 },
  { id: 4, generic: "Metformin", brand: "Glucophage / جلوكوفاج", dosage: "850mg", category: "Antidiabetic", storage: "Store below 25°C / يُحفظ تحت 25°م", sideEffects: "Nausea, diarrhea / غثيان، إسهال", precautions: "راقب وظائف الكلى", pediatricDose: 0 },
  { id: 5, generic: "Warfarin", brand: "Coumadin / كومادين", dosage: "5mg", category: "Anticoagulant", storage: "Protect from light / يُحفظ بعيداً عن الضوء", sideEffects: "Bleeding, bruising / نزيف، كدمات", precautions: "فحص INR دوري — تداخلات كثيرة", pediatricDose: 0 },
  { id: 6, generic: "Omeprazole", brand: "Losec / لوسك", dosage: "20mg", category: "PPI", storage: "Store below 25°C / يُحفظ تحت 25°م", sideEffects: "Headache, nausea / صداع، غثيان", precautions: "لا تستخدم لأكثر من 8 أسابيع بدون إشراف", pediatricDose: 1 },
  { id: 7, generic: "Aspirin", brand: "Aspirin / أسبرين", dosage: "100mg", category: "Antiplatelet", storage: "Store in dry place / يُحفظ في مكان جاف", sideEffects: "Stomach upset, bleeding / اضطراب معدة، نزيف", precautions: "تجنب عند الأطفال — متلازمة راي", pediatricDose: 0 },
  { id: 8, generic: "Ciprofloxacin", brand: "Cipro / سيبرو", dosage: "500mg", category: "Antibiotic", storage: "Store below 30°C / يُحفظ تحت 30°م", sideEffects: "Nausea, tendon pain / غثيان، ألم أوتار", precautions: "تجنب مع منتجات الألبان", pediatricDose: 0 },
  { id: 9, generic: "Gentamicin", brand: "Garamycin / جاراميسين", dosage: "80mg/2ml", category: "Antibiotic", storage: "Store below 25°C / يُحفظ تحت 25°م", sideEffects: "Nephrotoxicity, ototoxicity / سمية كلوية، سمية سمعية", precautions: "راقب مستوى الدم ووظائف الكلى", pediatricDose: 5 },
  { id: 10, generic: "Ceftriaxone", brand: "Rocephin / روسيفين", dosage: "1g IV/IM", category: "Antibiotic", storage: "Store below 25°C / يُحفظ تحت 25°م", sideEffects: "Diarrhea, injection pain / إسهال، ألم موضع الحقن", precautions: "لا يُخلط مع محاليل الكالسيوم", pediatricDose: 50 },
];

const INTERACTIONS: Record<string, { severity: "danger" | "caution"; ar: string; en: string }> = {
  "Warfarin+Aspirin": { severity: "danger", ar: "تداخل خطير: زيادة خطر النزيف الحاد", en: "Dangerous: Increased bleeding risk" },
  "Warfarin+Ibuprofen": { severity: "danger", ar: "تداخل خطير: مضادات الالتهاب تزيد خطر النزيف مع مميعات الدم", en: "Dangerous: NSAIDs increase bleeding with anticoagulants" },
  "Ibuprofen+Aspirin": { severity: "caution", ar: "يحتاج حذر: قد يقلل فعالية الأسبرين القلبي", en: "Caution: May reduce cardioprotective aspirin effect" },
  "Ciprofloxacin+Metformin": { severity: "caution", ar: "يحتاج حذر: قد يسبب تغيرات في سكر الدم", en: "Caution: May cause blood sugar changes" },
  "Omeprazole+Metformin": { severity: "caution", ar: "يحتاج حذر: قد يؤثر على امتصاص الميتفورمين", en: "Caution: May affect metformin absorption" },
  "Warfarin+Omeprazole": { severity: "caution", ar: "يحتاج حذر: قد يزيد تأثير الوارفارين", en: "Caution: May increase warfarin effect" },
  "Gentamicin+Ceftriaxone": { severity: "caution", ar: "يحتاج حذر: زيادة خطر السمية الكلوية", en: "Caution: Increased nephrotoxicity risk" },
};

function getInteraction(a: string, b: string) {
  return INTERACTIONS[`${a}+${b}`] || INTERACTIONS[`${b}+${a}`] || null;
}

const Pharmacist = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [activeTab, setActiveTab] = useState("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDrug, setExpandedDrug] = useState<number | null>(null);

  // Interaction checker
  const [drugA, setDrugA] = useState("");
  const [drugB, setDrugB] = useState("");

  // Dosage calculator
  const [weight, setWeight] = useState("");
  const [selectedCalcDrug, setSelectedCalcDrug] = useState("");
  const [dripVolume, setDripVolume] = useState("");
  const [dripHours, setDripHours] = useState("");

  // AI tip
  const [showTip, setShowTip] = useState(false);

  // OCR Scanner
  const [showOCR, setShowOCR] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResults, setOcrResults] = useState<{ name: string; confidence: number; matched?: typeof SUDAN_DRUGS[0] }[]>([]);
  const [ocrDragOver, setOcrDragOver] = useState(false);

  // Barcode Scanner
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState<typeof SUDAN_DRUGS[0] | null>(null);
  const [barcodeDragOver, setBarcodeDragOver] = useState(false);

  const simulateOCR = () => {
    setOcrScanning(true);
    setOcrResults([]);
    setTimeout(() => {
      setOcrResults([
        { name: "Amoxicillin 500mg", confidence: 92, matched: SUDAN_DRUGS[1] },
        { name: "Paracetamol 500mg", confidence: 87, matched: SUDAN_DRUGS[0] },
        { name: "Omeprazole 20mg", confidence: 78, matched: SUDAN_DRUGS[5] },
      ]);
      setOcrScanning(false);
    }, 2500);
  };

  const simulateBarcode = () => {
    setBarcodeScanning(true);
    setBarcodeResult(null);
    setTimeout(() => {
      const randomDrug = SUDAN_DRUGS[Math.floor(Math.random() * SUDAN_DRUGS.length)];
      setBarcodeResult(randomDrug);
      setBarcodeScanning(false);
    }, 2000);
  };

  const isValidImage = (file: File) => ["image/jpeg", "image/png", "image/webp"].includes(file.type);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, type: "ocr" | "barcode") => {
    e.preventDefault();
    if (type === "ocr") setOcrDragOver(false);
    else setBarcodeDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && isValidImage(file)) {
      if (type === "ocr") simulateOCR();
      else simulateBarcode();
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: "ocr" | "barcode") => {
    const file = e.target.files?.[0];
    if (file && isValidImage(file)) {
      if (type === "ocr") simulateOCR();
      else simulateBarcode();
    }
  };
  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return SUDAN_DRUGS;
    const q = searchQuery.toLowerCase();
    return SUDAN_DRUGS.filter(d =>
      d.generic.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Interaction result
  const interactionResult = useMemo(() => {
    if (!drugA || !drugB || drugA === drugB) return null;
    const nameA = SUDAN_DRUGS.find(d => String(d.id) === drugA)?.generic || "";
    const nameB = SUDAN_DRUGS.find(d => String(d.id) === drugB)?.generic || "";
    const inter = getInteraction(nameA, nameB);
    if (inter) return { ...inter, nameA, nameB };
    return { severity: "safe" as const, nameA, nameB, ar: "لا توجد تداخلات معروفة — آمن للاستخدام معاً", en: "No known interactions — safe to use together" };
  }, [drugA, drugB]);

  // Dosage calc
  const calcDrug = SUDAN_DRUGS.find(d => String(d.id) === selectedCalcDrug);
  const pediatricResult = weight && calcDrug && calcDrug.pediatricDose > 0
    ? (parseFloat(weight) * calcDrug.pediatricDose).toFixed(1)
    : null;

  const dripRate = dripVolume && dripHours && parseFloat(dripHours) > 0
    ? ((parseFloat(dripVolume) * 20) / (parseFloat(dripHours) * 60)).toFixed(1)
    : null;

  const tipText = isAr
    ? "💡 نصيحة الصيدلي — ود الحلال:\n\nدائماً تأكد من حساسية المريض قبل إعطاء أي مضاد حيوي.\nراجع الجرعة مع وزن المريض خاصة للأطفال.\nاحفظ الأدوية بعيداً عن الحرارة والرطوبة في مناخ السودان الحار."
    : "💡 Pharmacist Tip — Wad Al-Halal:\n\nAlways check patient allergies before administering any antibiotic.\nVerify dosage against patient weight, especially for children.\nStore medications away from heat and humidity in Sudan's hot climate.";

  return (
    <div className="flex flex-col gap-4 pb-6 text-start" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
        <div className="p-3 rounded-full bg-primary/10">
          <Pill className="h-8 w-8 text-primary" />
        </div>
        <div className="text-start">
          <h1 className="text-xl font-bold text-foreground">{isAr ? "الصيدلي الذكي" : "Smart Pharmacist"}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? "مساعدك الدوائي الذكي" : "Your AI Medication Assistant"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="directory" className="text-xs gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {isAr ? "الأدوية" : "Drugs"}
          </TabsTrigger>
          <TabsTrigger value="checker" className="text-xs gap-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            {isAr ? "التداخلات" : "Interact"}
          </TabsTrigger>
          <TabsTrigger value="dosage" className="text-xs gap-1">
            <Calculator className="h-3.5 w-3.5" />
            {isAr ? "الجرعات" : "Dosage"}
          </TabsTrigger>
          <TabsTrigger value="ocr" className="text-xs gap-1">
            <Camera className="h-3.5 w-3.5" />
            {isAr ? "الروشتة" : "OCR"}
          </TabsTrigger>
          <TabsTrigger value="barcode" className="text-xs gap-1">
            <ScanBarcode className="h-3.5 w-3.5" />
            {isAr ? "باركود" : "Barcode"}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Drug Directory */}
        <TabsContent value="directory" className="space-y-4 mt-4">
          <div className="relative">
            <Input
              placeholder={isAr ? "ابحث بالاسم العلمي أو التجاري..." : "Search by generic or brand name..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pe-10"
            />
            <Search className="absolute top-3 end-3 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Drug Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? "الدواء" : "Drug"}</TableHead>
                  <TableHead>{isAr ? "التصنيف" : "Category"}</TableHead>
                  <TableHead className="text-center">{isAr ? "الجرعة" : "Dose"}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrugs.map(drug => (
                  <TableRow key={drug.id} className="cursor-pointer" onClick={() => setExpandedDrug(expandedDrug === drug.id ? null : drug.id)}>
                    <TableCell>
                      <p className="font-medium text-sm">{drug.generic}</p>
                      <p className="text-xs text-muted-foreground">{drug.brand}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{drug.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{drug.dosage}</TableCell>
                    <TableCell>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedDrug === drug.id ? "rotate-90" : ""}`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Expanded Quick Info Card */}
          {expandedDrug && (() => {
            const drug = SUDAN_DRUGS.find(d => d.id === expandedDrug);
            if (!drug) return null;
            return (
              <Card className="border-primary/30 bg-primary/5 animate-in fade-in-50">
                <CardHeader className="pb-2">
                  <CardTitle className={`text-base flex items-center gap-2 ${isAr ? "flex-row-reverse justify-end text-right" : ""}`}>
                    <Pill className="h-5 w-5 text-primary" />
                    {drug.generic} — {isAr ? "بطاقة معلومات سريعة" : "Quick Info Card"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-start">
                    <div>
                      <p className="text-xs text-muted-foreground">{isAr ? "الاسم العلمي (Generic)" : "Generic Name"}</p>
                      <p className="font-semibold text-sm">{drug.generic}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{isAr ? "الاسم التجاري (Brand)" : "Brand Name"}</p>
                      <p className="font-semibold text-sm">{drug.brand}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-card border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">📦 {isAr ? "التخزين (Storage)" : "Storage Tips"}</p>
                    <p className="text-sm">{drug.storage}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">⚠️ {isAr ? "الأعراض الجانبية (Side Effects)" : "Common Side Effects"}</p>
                    <p className="text-sm">{drug.sideEffects}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                    <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">🇸🇩 {isAr ? "احتياطات في السودان" : "Sudan Precautions"}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300">{drug.precautions}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* Tab 2: Interaction Checker */}
        <TabsContent value="checker" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                {isAr ? "فاحص التداخلات الدوائية" : "Drug Interaction Checker"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {isAr ? "اختر دواءين لفحص التداخلات المحتملة بينهما" : "Select two drugs to check for potential contraindications"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">{isAr ? "الدواء الأول" : "Drug 1"}</Label>
                  <Select value={drugA} onValueChange={setDrugA}>
                    <SelectTrigger><SelectValue placeholder={isAr ? "اختر دواء..." : "Select drug..."} /></SelectTrigger>
                    <SelectContent>
                      {SUDAN_DRUGS.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.generic} ({d.brand.split("/")[0].trim()})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{isAr ? "الدواء الثاني" : "Drug 2"}</Label>
                  <Select value={drugB} onValueChange={setDrugB}>
                    <SelectTrigger><SelectValue placeholder={isAr ? "اختر دواء..." : "Select drug..."} /></SelectTrigger>
                    <SelectContent>
                      {SUDAN_DRUGS.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.generic} ({d.brand.split("/")[0].trim()})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {drugA && drugB && drugA === drugB && (
                <p className="text-sm text-muted-foreground text-center">
                  {isAr ? "اختر دواءين مختلفين" : "Please select two different drugs"}
                </p>
              )}
            </CardContent>
          </Card>

          {interactionResult && interactionResult.severity === "danger" && (
            <Alert variant="destructive">
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle>{isAr ? "🔴 إنذار أحمر — تداخل خطير (Dangerous)" : "🔴 Red Alert — Dangerous Interaction"}</AlertTitle>
              <AlertDescription>
                <span className="font-semibold">{interactionResult.nameA} + {interactionResult.nameB}</span>
                <br />{isAr ? interactionResult.ar : interactionResult.en}
              </AlertDescription>
            </Alert>
          )}
          {interactionResult && interactionResult.severity === "caution" && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-700 dark:text-yellow-400">
                {isAr ? "🟡 تنبيه أصفر — يحتاج حذر (Caution)" : "🟡 Yellow Alert — Caution Required"}
              </AlertTitle>
              <AlertDescription className="text-yellow-600 dark:text-yellow-300">
                <span className="font-semibold">{interactionResult.nameA} + {interactionResult.nameB}</span>
                <br />{isAr ? interactionResult.ar : interactionResult.en}
              </AlertDescription>
            </Alert>
          )}
          {interactionResult && interactionResult.severity === "safe" && (
            <Alert>
              <ShieldCheck className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary">
                {isAr ? "✅ آمن (Safe)" : "✅ Safe — No Known Interactions"}
              </AlertTitle>
              <AlertDescription>
                <span className="font-semibold">{interactionResult.nameA} + {interactionResult.nameB}</span>
                <br />{isAr ? interactionResult.ar : interactionResult.en}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Tab 3: Dosage Calculator */}
        <TabsContent value="dosage" className="space-y-4 mt-4">
          {/* Pediatric Dosage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Baby className="h-5 w-5 text-primary" />
                {isAr ? "حاسبة جرعات الأطفال (Pediatric Dosage)" : "Pediatric Dosage Calculator"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Weight className="h-3 w-3" />
                    {isAr ? "وزن الطفل (كجم)" : "Child Weight (kg)"}
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 12"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{isAr ? "الدواء" : "Drug"}</Label>
                  <Select value={selectedCalcDrug} onValueChange={setSelectedCalcDrug}>
                    <SelectTrigger><SelectValue placeholder={isAr ? "اختر دواء..." : "Select drug..."} /></SelectTrigger>
                    <SelectContent>
                      {SUDAN_DRUGS.filter(d => d.pediatricDose > 0).map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.generic} ({d.pediatricDose} mg/kg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {pediatricResult && calcDrug && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">
                    {isAr ? "📋 الجرعة المحسوبة (Calculated Dose):" : "📋 Calculated Dose:"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{pediatricResult} mg</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calcDrug.generic} @ {calcDrug.pediatricDose} mg/kg × {weight} kg
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* IV Drip Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                {isAr ? "حاسبة معدل التنقيط الوريدي (IV Drip Rate)" : "IV Drip Rate Calculator"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                {isAr ? "الصيغة: (الحجم × 20) ÷ (الوقت بالدقائق) = نقط/دقيقة" : "Formula: (Volume × 20) ÷ (Time in min) = drops/min"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">{isAr ? "الحجم (مل)" : "Volume (ml)"}</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={dripVolume}
                    onChange={e => setDripVolume(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{isAr ? "المدة (ساعة)" : "Duration (hours)"}</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 4"
                    value={dripHours}
                    onChange={e => setDripHours(e.target.value)}
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>

              {dripRate && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">
                    <Activity className="h-4 w-4 inline me-1" />
                    {isAr ? "معدل التنقيط (Drip Rate):" : "Drip Rate:"}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{dripRate} {isAr ? "نقطة/دقيقة" : "drops/min"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dripVolume} ml ÷ {dripHours} hrs (macro drip set = 20 gtt/ml)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Hybrid Prescription Scanner */}
        <TabsContent value="ocr" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                {isAr ? "قارئ الروشتة الذكي (Prescription OCR)" : "AI Prescription Reader"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Unified Hybrid Zone */}
              <div
                onDrop={(e) => handleDrop(e, "ocr")}
                onDragOver={handleDragOver}
                onDragEnter={() => setOcrDragOver(true)}
                onDragLeave={() => setOcrDragOver(false)}
                className={`relative rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                  ocrDragOver
                    ? "border-primary bg-primary/15 scale-[1.02] animate-pulse"
                    : "border-primary/30 bg-muted/50 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <input
                  id="ocr-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, "ocr")}
                />
                <input
                  id="ocr-camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, "ocr")}
                />

                {/* Camera icon - triggers device camera */}
                <div
                  onClick={(e) => { e.stopPropagation(); document.getElementById("ocr-camera-input")?.click(); }}
                  className="p-5 rounded-full bg-primary/10 hover:bg-primary/20 cursor-pointer transition-all duration-200 hover:scale-110"
                >
                  <Camera className="h-10 w-10 text-primary" />
                </div>

                <p className="text-sm text-center font-semibold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isAr ? "صور الروشتة الآن أو اسحب ملف الروشتة هنا" : "Capture prescription now or drag the file here"}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-px w-8 bg-border" />
                  <span>{isAr ? "أو" : "or"}</span>
                  <div className="h-px w-8 bg-border" />
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); document.getElementById("ocr-file-input")?.click(); }}
                  className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer font-medium"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  <CloudUpload className="h-4 w-4 inline me-1" />
                  {isAr ? "اضغط لرفع ملف" : "Click to upload a file"}
                </button>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
              </div>

              {/* Wad Al-Halal tip */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <WadAlHalalAvatar size={36} />
                <p className="text-xs text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isAr ? "💡 يا دكتور، الخيار ليك.. صور مباشرة أو اسحب الصورة الجاهزة!" : "💡 Doctor, your choice — capture directly or drag the ready image!"}
                </p>
              </div>

              {ocrScanning && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isAr ? "جاري تحليل الروشتة..." : "Analyzing prescription..."}
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              )}

              {ocrResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary">{isAr ? "📋 النتائج المُتعرّف عليها:" : "📋 Recognized Results:"}</p>
                  {ocrResults.map((r, i) => (
                    <Card key={i} className="border-primary/20">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{r.name}</p>
                          {r.matched && <p className="text-xs text-muted-foreground">{isAr ? "مطابقة:" : "Match:"} {r.matched.brand}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={r.confidence > 85 ? "default" : "secondary"} className="text-xs">
                            {r.confidence}%
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Check className="h-3.5 w-3.5 text-primary" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Hybrid Barcode Scanner */}
        <TabsContent value="barcode" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanBarcode className="h-5 w-5 text-primary" />
                {isAr ? "ماسح الباركود (Barcode Scanner)" : "Drug Barcode Scanner"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Unified Hybrid Zone */}
              <div
                onDrop={(e) => handleDrop(e, "barcode")}
                onDragOver={handleDragOver}
                onDragEnter={() => setBarcodeDragOver(true)}
                onDragLeave={() => setBarcodeDragOver(false)}
                className={`relative rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                  barcodeDragOver
                    ? "border-primary bg-primary/15 scale-[1.02] animate-pulse"
                    : "border-primary/30 bg-muted/50 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <input
                  id="barcode-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, "barcode")}
                />
                <input
                  id="barcode-camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, "barcode")}
                />

                {/* Camera icon - triggers device camera */}
                <div
                  onClick={(e) => { e.stopPropagation(); document.getElementById("barcode-camera-input")?.click(); }}
                  className="p-5 rounded-full bg-primary/10 hover:bg-primary/20 cursor-pointer transition-all duration-200 hover:scale-110"
                >
                  <ScanBarcode className="h-10 w-10 text-primary" />
                </div>

                <p className="text-sm text-center font-semibold text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isAr ? "امسح الباركود مباشرة بالكاميرا أو اسحب الصورة هنا" : "Scan barcode with camera or drag the image here"}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-px w-8 bg-border" />
                  <span>{isAr ? "أو" : "or"}</span>
                  <div className="h-px w-8 bg-border" />
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); document.getElementById("barcode-file-input")?.click(); }}
                  className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer font-medium"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  <CloudUpload className="h-4 w-4 inline me-1" />
                  {isAr ? "اضغط لرفع ملف" : "Click to upload a file"}
                </button>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
              </div>

              {/* Wad Al-Halal tip */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <WadAlHalalAvatar size={36} />
                <p className="text-xs text-foreground" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isAr ? "💡 يا دكتور، الخيار ليك.. صور مباشرة أو اسحب الصورة الجاهزة!" : "💡 Doctor, your choice — capture directly or drag the ready image!"}
                </p>
              </div>

              {barcodeScanning && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isAr ? "جاري مسح الباركود..." : "Scanning barcode..."}
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              )}

              {barcodeResult && (
                <Card className="border-primary/30 bg-primary/5 animate-in fade-in-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      {isAr ? "بطاقة معلومات سريعة" : "Quick Info Card"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{isAr ? "الاسم العلمي (Generic)" : "Generic Name"}</p>
                        <p className="font-semibold text-sm">{barcodeResult.generic}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{isAr ? "الاسم التجاري (Brand)" : "Brand Name"}</p>
                        <p className="font-semibold text-sm">{barcodeResult.brand}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-card border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">💊 {isAr ? "الجرعة (Dosage)" : "Dosage"}</p>
                      <p className="text-sm font-semibold">{barcodeResult.dosage}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">📦 {isAr ? "التخزين (Storage)" : "Storage"}</p>
                      <p className="text-sm">{barcodeResult.storage}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                      <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">🇸🇩 {isAr ? "احتياطات في السودان" : "Sudan Precautions"}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-300">{barcodeResult.precautions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wad Al-Halal FAB */}
      <div className="fixed bottom-20 end-4 z-40">
        <Button
          onClick={() => setShowTip(!showTip)}
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 p-0"
        >
          <div className="relative">
            <Bot className="h-7 w-7 text-primary-foreground" />
            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -end-1" />
          </div>
        </Button>
      </div>

      {showTip && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <WadAlHalalAvatar />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-primary flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    {isAr ? "نصيحة الصيدلي — ود الحلال" : "Pharmacist Tip — Wad Al-Halal"}
                  </p>
                  <Button size="sm" variant="ghost" onClick={() => setShowTip(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-foreground whitespace-pre-line">{tipText}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pharmacist;
