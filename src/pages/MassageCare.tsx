import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Heart, Timer, Hand, Footprints, Music, AlertTriangle,
  Play, Pause, RotateCcw, Volume2, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";

// Body pressure points data
const PRESSURE_POINTS = [
  { id: "shoulder", nameAr: "الكتفين", nameEn: "Shoulders", tipAr: "تدليك دائري بزيت السمسم لمدة 5 دقائق يخفف التوتر", tipEn: "Circular massage with sesame oil for 5 minutes relieves tension", x: 50, y: 18 },
  { id: "lower-back", nameAr: "أسفل الظهر", nameEn: "Lower Back", tipAr: "ضغط متوسط مع زيت السمسم — يساعد في آلام الفقرات", tipEn: "Medium pressure with sesame oil — helps with spinal pain", x: 50, y: 42 },
  { id: "hands", nameAr: "راحة اليد", nameEn: "Palm", tipAr: "نقطة LI4 بين الإبهام والسبابة — تخفف الصداع", tipEn: "Point LI4 between thumb and index — relieves headaches", x: 20, y: 45 },
  { id: "knee", nameAr: "الركبة", nameEn: "Knee", tipAr: "تدليك حول الرضفة بالقرض — مفيد لالتهاب المفاصل", tipEn: "Massage around kneecap with Garad — good for arthritis", x: 40, y: 65 },
  { id: "feet", nameAr: "باطن القدم", nameEn: "Sole of Foot", tipAr: "ضغط على نقطة KD1 — يحسن النوم والاسترخاء", tipEn: "Press KD1 point — improves sleep and relaxation", x: 55, y: 88 },
];

const STRETCHES = [
  { nameAr: "تمدد الرقبة", nameEn: "Neck Stretch", descAr: "أمل رأسك ببطء يميناً ويساراً — 10 ثوانٍ لكل جانب", descEn: "Slowly tilt head left and right — 10 seconds each side", emoji: "🧘" },
  { nameAr: "دوران الكتفين", nameEn: "Shoulder Rolls", descAr: "ارفع كتفيك نحو أذنيك ثم أدرهما للخلف — 10 مرات", descEn: "Raise shoulders to ears then roll backward — 10 times", emoji: "💪" },
  { nameAr: "تمدد الظهر", nameEn: "Back Extension", descAr: "قف وضع يديك على خصرك ثم انحنِ للخلف ببطء", descEn: "Stand, hands on hips, slowly arch backward", emoji: "🔄" },
  { nameAr: "تمدد المعصم", nameEn: "Wrist Stretch", descAr: "مد ذراعك وافرد أصابعك للأعلى باليد الأخرى — 15 ثانية", descEn: "Extend arm and pull fingers back — 15 seconds", emoji: "✋" },
];

const AMBIENT_SOUNDS = [
  { id: "nile", nameAr: "أمواج النيل", nameEn: "Nile Waves", emoji: "🌊" },
  { id: "rain", nameAr: "مطر الخريف", nameEn: "Autumn Rain", emoji: "🌧️" },
  { id: "madih", nameAr: "مديح هادئ", nameEn: "Soft Madih", emoji: "🎵" },
];

const MassageCare = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [activeTab, setActiveTab] = useState("timer");

  // Rotation Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pressure point
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  // Stretches
  const [expandedStretch, setExpandedStretch] = useState<number | null>(null);

  // Ambient
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timeLeft]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const timerProgress = ((7200 - timeLeft) / 7200) * 100;
  const isAlertTime = timeLeft === 0;

  const resetTimer = () => { setTimerRunning(false); setTimeLeft(7200); };

  const selectedPointData = PRESSURE_POINTS.find(p => p.id === selectedPoint);

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-primary/10">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{isAr ? "التدليك والرعاية" : "Massage & Care"}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? "أدوات رعاية المرضى والعناية الذاتية للممرضين" : "Patient care & self-care tools for nurses"}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timer" className="text-xs gap-1"><Timer className="h-3.5 w-3.5" />{isAr ? "تقليب" : "Timer"}</TabsTrigger>
          <TabsTrigger value="acupressure" className="text-xs gap-1"><Hand className="h-3.5 w-3.5" />{isAr ? "ضغط" : "Press"}</TabsTrigger>
          <TabsTrigger value="stretches" className="text-xs gap-1"><RotateCcw className="h-3.5 w-3.5" />{isAr ? "تمارين" : "Stretch"}</TabsTrigger>
          <TabsTrigger value="footsoak" className="text-xs gap-1"><Footprints className="h-3.5 w-3.5" />{isAr ? "نقع" : "Soak"}</TabsTrigger>
          <TabsTrigger value="sounds" className="text-xs gap-1"><Music className="h-3.5 w-3.5" />{isAr ? "أصوات" : "Sounds"}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Patient Rotation Timer */}
        <TabsContent value="timer" className="space-y-4 mt-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                {isAr ? "مؤقت تقليب المريض (Patient Rotation)" : "Patient Rotation Timer"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {isAr ? "مؤقت كل ساعتين لتذكيرك بتقليب المريض لمنع قرح الفراش" : "2-hour timer to remind you to reposition the patient to prevent bedsores"}
              </p>

              <div className="flex flex-col items-center gap-4 py-4">
                <div className="text-5xl font-mono font-bold text-foreground tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={timerProgress} className="h-3 w-full" />
                <div className="flex gap-3">
                  <Button
                    onClick={() => setTimerRunning(!timerRunning)}
                    variant={timerRunning ? "secondary" : "default"}
                    className="gap-2"
                  >
                    {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {timerRunning ? (isAr ? "إيقاف" : "Pause") : (isAr ? "تشغيل" : "Start")}
                  </Button>
                  <Button onClick={resetTimer} variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    {isAr ? "إعادة" : "Reset"}
                  </Button>
                </div>
              </div>

              {isAlertTime && (
                <Alert variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>{isAr ? "⏰ حان وقت تقليب المريض!" : "⏰ Time to reposition the patient!"}</AlertTitle>
                  <AlertDescription className="font-semibold">
                    {isAr ? "يا دكتور، حان وقت تقليب المريض — منع قرح الفراش واجب!" : "Doctor, it's time to reposition — preventing bedsores is essential!"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <WadAlHalalAvatar size={36} />
                <p className="text-xs text-foreground">
                  {isAr ? "💡 نصيحة ود الحلال: قلّب المريض كل ساعتين بالتناوب — يمين، ظهر، يسار. استخدم وسائد لدعم الوضعية." : "💡 Wad Al-Halal Tip: Rotate patient every 2h alternating — right, back, left. Use pillows for positioning support."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Acupressure Map */}
        <TabsContent value="acupressure" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                {isAr ? "خريطة نقاط الضغط (Acupressure Map)" : "Acupressure Point Map"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {isAr ? "اضغط على نقطة لعرض نصائح التدليك بزيت السمسم والقرض" : "Tap a point for massage tips with Sesame Oil & Garad"}
              </p>

              {/* Body silhouette with pressure points */}
              <div className="relative aspect-[2/3] bg-muted/50 rounded-xl border mx-auto max-w-[280px]">
                {/* Simple body outline using CSS */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl opacity-20">🧍</div>
                </div>
                {PRESSURE_POINTS.map(point => (
                  <button
                    key={point.id}
                    onClick={() => setSelectedPoint(selectedPoint === point.id ? null : point.id)}
                    className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      selectedPoint === point.id
                        ? "bg-primary text-primary-foreground border-primary scale-125 shadow-lg"
                        : "bg-primary/20 text-primary border-primary/40 hover:scale-110"
                    }`}
                    style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    •
                  </button>
                ))}
              </div>

              {selectedPointData && (
                <Card className="border-primary/30 bg-primary/5 animate-in fade-in-50">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold text-sm text-primary">
                      📍 {isAr ? selectedPointData.nameAr : selectedPointData.nameEn}
                    </p>
                    <p className="text-sm text-foreground">
                      {isAr ? selectedPointData.tipAr : selectedPointData.tipEn}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-300">
                  {isAr ? "⚠️ تحذير طبي: تجنب التدليك القوي لمرضى هشاشة العظام وتخثر الدم. استشر الطبيب أولاً." : "⚠️ Medical Warning: Avoid strong massage for osteoporosis and blood clot patients. Consult doctor first."}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Nursing Stretches */}
        <TabsContent value="stretches" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                {isAr ? "تمارين تمدد للممرضين (Nursing Stretches)" : "Nursing Stretches"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {isAr ? "تمارين سريعة لتخفيف آلام الظهر والرقبة أثناء المناوبة" : "Quick exercises for back and neck relief during shifts"}
              </p>
              {STRETCHES.map((s, i) => (
                <Card key={i} className="cursor-pointer" onClick={() => setExpandedStretch(expandedStretch === i ? null : i)}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{s.emoji}</span>
                        <p className="font-medium text-sm">{isAr ? s.nameAr : s.nameEn}</p>
                      </div>
                      {expandedStretch === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    {expandedStretch === i && (
                      <p className="text-sm text-muted-foreground mt-2 ps-10 animate-in fade-in-50">
                        {isAr ? s.descAr : s.descEn}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Foot Soak Guide */}
        <TabsContent value="footsoak" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Footprints className="h-5 w-5 text-primary" />
                {isAr ? "دليل نقع القدمين (Foot Soak Guide)" : "Foot Soak Guide"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium mb-1">🦶 {isAr ? "الخطوة 1: تحضير الماء" : "Step 1: Prepare Water"}</p>
                  <p className="text-xs text-muted-foreground">{isAr ? "سخّن ماء دافئ (37-40°م) في وعاء واسع" : "Heat warm water (37-40°C) in a wide basin"}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium mb-1">🧴 {isAr ? "الخطوة 2: إضافات طبيعية" : "Step 2: Natural Additives"}</p>
                  <p className="text-xs text-muted-foreground">{isAr ? "أضف ملعقة زيت سمسم أو أعشاب مهدئة" : "Add a spoon of sesame oil or soothing herbs"}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium mb-1">⏱️ {isAr ? "الخطوة 3: النقع" : "Step 3: Soaking"}</p>
                  <p className="text-xs text-muted-foreground">{isAr ? "انقع القدمين لمدة 15-20 دقيقة مع تدليك خفيف" : "Soak feet for 15-20 minutes with gentle massage"}</p>
                </div>
              </div>

              {/* RED ALERT */}
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold">
                  {isAr ? "🔴 إنذار أحمر — ممنوع الملح!" : "🔴 Red Alert — No Salt!"}
                </AlertTitle>
                <AlertDescription className="font-semibold">
                  {isAr ? "لا تضف ملحاً لمرضى ضغط الدم المرتفع (Hypertension) — قد يُمتص عبر الجلد ويرفع الضغط!" : "Do NOT add salt for Hypertension patients — it may be absorbed through skin and raise blood pressure!"}
                </AlertDescription>
              </Alert>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <WadAlHalalAvatar size={36} />
                <p className="text-xs text-foreground">
                  {isAr ? "💡 نصيحة ود الحلال: نقع القدمين يحسن الدورة الدموية ويخفف التورم — مثالي بعد مناوبة طويلة!" : "💡 Wad Al-Halal: Foot soaking improves circulation and reduces swelling — perfect after a long shift!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Ambient Sounds */}
        <TabsContent value="sounds" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                {isAr ? "أصوات سودانية مهدئة (Ambient Sounds)" : "Sudanese Ambient Sounds"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {isAr ? "أصوات مهدئة لبيئة علاجية مريحة" : "Soothing sounds for a relaxing therapeutic environment"}
              </p>
              {AMBIENT_SOUNDS.map(sound => (
                <Card
                  key={sound.id}
                  className={`cursor-pointer transition-all ${playingSound === sound.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setPlayingSound(playingSound === sound.id ? null : sound.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sound.emoji}</span>
                      <div>
                        <p className="font-medium text-sm">{isAr ? sound.nameAr : sound.nameEn}</p>
                        {playingSound === sound.id && (
                          <p className="text-xs text-primary animate-pulse">{isAr ? "▶ قيد التشغيل..." : "▶ Playing..."}</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant={playingSound === sound.id ? "default" : "outline"} className="h-8 w-8 p-0">
                      {playingSound === sound.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <p className="text-xs text-center text-muted-foreground">
                {isAr ? "🔊 صوت تجريبي — سيتم إضافة أصوات حقيقية قريباً" : "🔊 Demo audio — real sounds coming soon"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MassageCare;
