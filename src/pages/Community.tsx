import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Stethoscope,
  Heart,
  Send,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  BadgeCheck,
  X,
  ImagePlus,
} from "lucide-react";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────
interface DiaryPost {
  id: string;
  author: string;
  verified: boolean;
  content: string;
  time: string;
  likes: number;
  liked: boolean;
  comments: { author: string; text: string }[];
  isStory: boolean;
}

interface ConsultationPost {
  id: string;
  author: string;
  age: number;
  gender: string;
  symptoms: string;
  duration: string;
  urgent: boolean;
  solved: boolean;
  responses: { author: string; text: string; isDoctor: boolean }[];
}

// ─── Mock Data ───────────────────────────────────────────────────────
const MOCK_DIARY: DiaryPost[] = [
  {
    id: "d1",
    author: "أحمد محمد",
    verified: true,
    content: "اليوم كانت وردية صعبة في الطوارئ، لكن الحمد لله كل المرضى استقروا. التمريض رسالة قبل ما يكون مهنة! 💪",
    time: "منذ ساعتين",
    likes: 12,
    liked: false,
    comments: [{ author: "سارة علي", text: "ما شاء الله عليك يا بطل!" }],
    isStory: true,
  },
  {
    id: "d2",
    author: "فاطمة عبدالله",
    verified: true,
    content: "نصيحة للزملاء: لا تنسوا تاخدوا بريك كل 4 ساعات. صحتكم أولاً عشان تقدروا تخدموا المرضى.",
    time: "منذ 5 ساعات",
    likes: 8,
    liked: false,
    comments: [],
    isStory: false,
  },
  {
    id: "d3",
    author: "خالد عثمان",
    verified: false,
    content: "أول يوم ليّ في قسم العناية المركزة. التجربة مختلفة تماماً عن الأقسام العادية!",
    time: "منذ يوم",
    likes: 15,
    liked: false,
    comments: [{ author: "أحمد محمد", text: "بالتوفيق! العناية المركزة بتعلمك كتير." }],
    isStory: true,
  },
];

const MOCK_CONSULTS: ConsultationPost[] = [
  {
    id: "c1",
    author: "محمد إبراهيم",
    age: 45,
    gender: "ذكر",
    symptoms: "صداع شديد مع دوخة وزغللة في العينين",
    duration: "3 أيام",
    urgent: true,
    solved: false,
    responses: [
      {
        author: "د. سلمى أحمد",
        text: "يجب قياس ضغط الدم فوراً والتوجه للطوارئ إذا كان مرتفعاً. هذه الأعراض قد تشير لارتفاع حاد في الضغط.",
        isDoctor: true,
      },
    ],
  },
  {
    id: "c2",
    author: "هالة عمر",
    age: 30,
    gender: "أنثى",
    symptoms: "ألم في أسفل الظهر مع تنميل في الساق اليسرى",
    duration: "أسبوع",
    urgent: false,
    solved: true,
    responses: [
      {
        author: "د. كمال حسن",
        text: "الأعراض تشير لانزلاق غضروفي. أنصح بعمل رنين مغناطيسي وتجنب الجلوس الطويل.",
        isDoctor: true,
      },
      {
        author: "نورا سعيد",
        text: "حصل معاي نفس الشي، الرنين بيوضح كل شي.",
        isDoctor: false,
      },
    ],
  },
];

// ─── Shift Story Card ────────────────────────────────────────────────
const StoryCard = ({
  post,
  onLike,
}: {
  post: DiaryPost;
  onLike: (id: string) => void;
}) => (
  <div className="min-w-[220px] max-w-[220px] rounded-2xl bg-card border border-primary/15 p-4 shadow-sm flex flex-col gap-2 snap-start">
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
          {post.author[0]}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-semibold text-foreground truncate">{post.author}</span>
      {post.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{post.content}</p>
    <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
      <button onClick={() => onLike(post.id)} className="flex items-center gap-1 group">
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            post.liked ? "fill-red-500 text-red-500" : "text-muted-foreground group-hover:text-red-400"
          )}
        />
        <span className="text-xs text-muted-foreground">{post.likes}</span>
      </button>
      <span className="text-[10px] text-muted-foreground">{post.time}</span>
    </div>
  </div>
);

// ─── Quick Post Input ────────────────────────────────────────────────
const QuickPostInput = ({
  activeRoom,
  isAr,
  onSubmitDiary,
  onSubmitConsult,
}: {
  activeRoom: "diary" | "consultation";
  isAr: boolean;
  onSubmitDiary: (text: string) => void;
  onSubmitConsult: (data: { age: string; gender: string; symptoms: string; duration: string; urgent: boolean }) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [consultData, setConsultData] = useState({ age: "", gender: "ذكر", symptoms: "", duration: "", urgent: false });
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const placeholder =
    activeRoom === "diary"
      ? isAr ? "يا دكتور، حابب تشاركنا شنو الليلة؟" : "What would you like to share tonight?"
      : isAr ? "أكتب استشارتك هنا..." : "Write your consultation here...";

  const handleSubmit = () => {
    if (activeRoom === "diary") {
      if (!text.trim()) return;
      onSubmitDiary(text);
      setText("");
    } else {
      if (!consultData.symptoms.trim()) return;
      onSubmitConsult(consultData);
      setConsultData({ age: "", gender: "ذكر", symptoms: "", duration: "", urgent: false });
    }
    setExpanded(false);
  };

  return (
    <div className="mb-4">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30"
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">أ</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground text-right flex-1">{placeholder}</span>
          <ImagePlus className="h-5 w-5 text-muted-foreground/50" />
        </button>
      ) : (
        <div className="bg-card border border-primary/20 rounded-2xl shadow-md overflow-hidden animate-fade-in">
          <div className="p-4 space-y-3">
            {activeRoom === "diary" ? (
              <Textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] border-0 bg-transparent resize-none text-sm focus-visible:ring-0 p-0"
              />
            ) : (
              <div className="space-y-3">
                <Textarea
                  autoFocus
                  value={consultData.symptoms}
                  onChange={(e) => setConsultData((p) => ({ ...p, symptoms: e.target.value }))}
                  placeholder={placeholder}
                  className="min-h-[80px] border-0 bg-transparent resize-none text-sm focus-visible:ring-0 p-0"
                />
                <div className="flex gap-2 flex-wrap">
                  <Input
                    value={consultData.age}
                    onChange={(e) => setConsultData((p) => ({ ...p, age: e.target.value }))}
                    placeholder={isAr ? "العمر" : "Age"}
                    className="h-8 text-xs w-20"
                    type="number"
                  />
                  <select
                    value={consultData.gender}
                    onChange={(e) => setConsultData((p) => ({ ...p, gender: e.target.value }))}
                    className="h-8 text-xs rounded-md border border-input bg-background px-2"
                  >
                    <option value="ذكر">{isAr ? "ذكر" : "Male"}</option>
                    <option value="أنثى">{isAr ? "أنثى" : "Female"}</option>
                  </select>
                  <Input
                    value={consultData.duration}
                    onChange={(e) => setConsultData((p) => ({ ...p, duration: e.target.value }))}
                    placeholder={isAr ? "المدة" : "Duration"}
                    className="h-8 text-xs w-24"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch
                      checked={consultData.urgent}
                      onCheckedChange={(v) => setConsultData((p) => ({ ...p, urgent: v }))}
                      className="scale-75"
                    />
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    {isAr ? "عاجل" : "Urgent"}
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border/50 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.click();
              }}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs">{isAr ? "إرفاق صورة" : "Attach Image"}</span>
            </button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="h-8 text-xs">
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" onClick={handleSubmit} className="h-8 px-4 text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {isAr ? "نشر" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────
const Community = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [activeRoom, setActiveRoom] = useState<"diary" | "consultation">("diary");
  const [diaryPosts, setDiaryPosts] = useState<DiaryPost[]>(MOCK_DIARY);
  const [consultPosts, setConsultPosts] = useState<ConsultationPost[]>(MOCK_CONSULTS);

  // Diary state
  const [showNewDiary, setShowNewDiary] = useState(false);
  const [newDiaryText, setNewDiaryText] = useState("");
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // Consultation state
  const [showNewConsult, setShowNewConsult] = useState(false);
  const [consultForm, setConsultForm] = useState({ age: "", gender: "ذكر", symptoms: "", duration: "", urgent: false });
  const [expandedConsultComments, setExpandedConsultComments] = useState<string | null>(null);
  const [consultReplyText, setConsultReplyText] = useState("");

  const handleLike = useCallback((id: string) => {
    setDiaryPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  }, []);

  const handleNewDiary = useCallback(() => {
    if (!newDiaryText.trim()) return;
    const post: DiaryPost = {
      id: `d${Date.now()}`,
      author: "أنت",
      verified: false,
      content: newDiaryText,
      time: "الآن",
      likes: 0,
      liked: false,
      comments: [],
      isStory: true,
    };
    setDiaryPosts((prev) => [post, ...prev]);
    setNewDiaryText("");
    setShowNewDiary(false);
  }, [newDiaryText]);

  const handleAddComment = useCallback(
    (postId: string) => {
      if (!commentText.trim()) return;
      setDiaryPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...p.comments, { author: "أنت", text: commentText }] }
            : p
        )
      );
      setCommentText("");
    },
    [commentText]
  );

  const handleNewConsult = useCallback(() => {
    if (!consultForm.symptoms.trim()) return;
    const post: ConsultationPost = {
      id: `c${Date.now()}`,
      author: "أنت",
      age: parseInt(consultForm.age) || 0,
      gender: consultForm.gender,
      symptoms: consultForm.symptoms,
      duration: consultForm.duration,
      urgent: consultForm.urgent,
      solved: false,
      responses: [],
    };
    setConsultPosts((prev) => [post, ...prev]);
    setConsultForm({ age: "", gender: "ذكر", symptoms: "", duration: "", urgent: false });
    setShowNewConsult(false);
  }, [consultForm]);

  const handleToggleSolved = useCallback((id: string) => {
    setConsultPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, solved: !p.solved } : p))
    );
  }, []);

  const handleConsultReply = useCallback(
    (postId: string) => {
      if (!consultReplyText.trim()) return;
      setConsultPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, responses: [...p.responses, { author: "أنت", text: consultReplyText, isDoctor: false }] }
            : p
        )
      );
      setConsultReplyText("");
    },
    [consultReplyText]
  );

  const stories = diaryPosts.filter((p) => p.isStory);

  return (
    <div className="min-h-screen pb-24" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <WadAlHalalAvatar size={40} />
          <h1 className="text-xl font-bold text-foreground">
            {isAr ? "مجتمع التمريض" : "Nurse Community"}
          </h1>
        </div>
        {/* Toggle Tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveRoom("diary")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
              activeRoom === "diary"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            {isAr ? "يوميات ممرض" : "Nurse Diary"}
          </button>
          <button
            onClick={() => setActiveRoom("consultation")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
              activeRoom === "consultation"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Stethoscope className="h-4 w-4" />
            {isAr ? "الاستشارة الطبية" : "Consultation"}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* ═══════════════ QUICK POST INPUT ═══════════════ */}
        <QuickPostInput
          activeRoom={activeRoom}
          isAr={isAr}
          onSubmitDiary={(text) => {
            const post: DiaryPost = {
              id: `d${Date.now()}`,
              author: "أنت",
              verified: false,
              content: text,
              time: "الآن",
              likes: 0,
              liked: false,
              comments: [],
              isStory: true,
            };
            setDiaryPosts((prev) => [post, ...prev]);
          }}
          onSubmitConsult={(data) => {
            const post: ConsultationPost = {
              id: `c${Date.now()}`,
              author: "أنت",
              age: parseInt(data.age) || 0,
              gender: data.gender,
              symptoms: data.symptoms,
              duration: data.duration,
              urgent: data.urgent,
              solved: false,
              responses: [],
            };
            setConsultPosts((prev) => [post, ...prev]);
          }}
        />

        {/* ═══════════════ DIARY ROOM ═══════════════ */}
        {activeRoom === "diary" && (
          <div className="space-y-5 animate-fade-in">
            {/* Shift Stories horizontal scroll */}
            {stories.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {isAr ? "حالة وردية" : "Shift Stories"}
                </h2>
                <ScrollArea className="w-full">
                  <div className="flex gap-3 pb-3 snap-x snap-mandatory">
                    {stories.map((s) => (
                      <StoryCard key={s.id} post={s} onLike={handleLike} />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}

            {/* Feed */}
            <div className="space-y-4">
              {diaryPosts.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <WadAlHalalAvatar size={64} />
                  <p className="text-muted-foreground font-medium">
                    {isAr
                      ? "يا بطل، شاركنا موقف حصل ليك في الوردية الليلة!"
                      : "Hero, share a moment from your shift tonight!"}
                  </p>
                </div>
              ) : (
                diaryPosts.map((post) => (
                  <div key={post.id} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {post.author[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-foreground">{post.author}</span>
                            {post.verified && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                                <BadgeCheck className="h-3 w-3" />
                                {isAr ? "موثق" : "Verified"}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{post.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                    </div>
                    <div className="border-t border-border/50 px-4 py-2.5 flex items-center gap-4">
                      <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 group">
                        <Heart
                          className={cn(
                            "h-5 w-5 transition-all",
                            post.liked
                              ? "fill-red-500 text-red-500 scale-110"
                              : "text-muted-foreground group-hover:text-red-400"
                          )}
                        />
                        <span className="text-xs text-muted-foreground">{post.likes}</span>
                      </button>
                      <button
                        onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-xs">{post.comments.length}</span>
                      </button>
                    </div>
                    {expandedComments === post.id && (
                      <div className="border-t border-border/50 px-4 py-3 bg-muted/30 space-y-2">
                        {post.comments.map((c, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Avatar className="h-6 w-6 mt-0.5">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{c.author[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-xs font-semibold text-foreground">{c.author}</span>
                              <p className="text-xs text-muted-foreground">{c.text}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <Input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={isAr ? "أضف تعليق..." : "Add comment..."}
                            className="text-xs h-8"
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                          />
                          <Button size="sm" className="h-8 px-3" onClick={() => handleAddComment(post.id)}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ CONSULTATION ROOM ═══════════════ */}
        {activeRoom === "consultation" && (
          <div className="space-y-4 animate-fade-in">
            {consultPosts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <WadAlHalalAvatar size={64} />
                <p className="text-muted-foreground font-medium">
                  {isAr ? "لا توجد استشارات حالياً.. كن أول من يسأل!" : "No consultations yet.. be the first to ask!"}
                </p>
              </div>
            ) : (
              consultPosts
                .sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1))
                .map((post) => {
                  const doctorResponses = post.responses.filter((r) => r.isDoctor);
                  const otherResponses = post.responses.filter((r) => !r.isDoctor);
                  return (
                    <div
                      key={post.id}
                      className={cn(
                        "bg-card rounded-2xl border shadow-sm overflow-hidden transition-all",
                        post.urgent
                          ? "border-destructive/50 shadow-destructive/10 animate-[pulse_3s_ease-in-out_infinite]"
                          : "border-border/60"
                      )}
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                {post.author[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-foreground">{post.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {post.urgent && (
                              <Badge variant="destructive" className="text-[10px] gap-1 animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                {isAr ? "عاجل" : "Urgent"}
                              </Badge>
                            )}
                            {post.solved && (
                              <Badge className="text-[10px] gap-1 bg-primary/15 text-primary border-0">
                                <CheckCircle2 className="h-3 w-3" />
                                {isAr ? "تم الحل" : "Solved"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Patient Info */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-[11px] gap-1">
                            <User className="h-3 w-3" />
                            {post.gender} — {post.age} {isAr ? "سنة" : "y/o"}
                          </Badge>
                          <Badge variant="outline" className="text-[11px] gap-1">
                            <Clock className="h-3 w-3" />
                            {post.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{post.symptoms}</p>
                      </div>

                      {/* Doctor Responses (pinned) */}
                      {doctorResponses.length > 0 && (
                        <div className="border-t border-primary/20">
                          {doctorResponses.map((r, i) => (
                            <div key={i} className="bg-primary/5 px-4 py-3 flex items-start gap-2.5">
                              <Avatar className="h-7 w-7 mt-0.5 ring-2 ring-primary/30">
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                                  {r.author[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-primary">{r.author}</span>
                                  <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <p className="text-xs text-foreground leading-relaxed mt-0.5">{r.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions & Other Responses */}
                      <div className="border-t border-border/50 px-4 py-2.5 flex items-center gap-3">
                        <button
                          onClick={() => handleToggleSolved(post.id)}
                          className={cn(
                            "text-xs font-medium flex items-center gap-1 transition-colors",
                            post.solved ? "text-primary" : "text-muted-foreground hover:text-primary"
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {post.solved ? (isAr ? "تم الحل" : "Solved") : (isAr ? "لم يُحل" : "Unsolved")}
                        </button>
                        <button
                          onClick={() =>
                            setExpandedConsultComments(expandedConsultComments === post.id ? null : post.id)
                          }
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {post.responses.length} {isAr ? "ردود" : "replies"}
                        </button>
                      </div>

                      {expandedConsultComments === post.id && (
                        <div className="border-t border-border/50 px-4 py-3 bg-muted/30 space-y-2">
                          {otherResponses.map((r, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Avatar className="h-6 w-6 mt-0.5">
                                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                  {r.author[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-xs font-semibold text-foreground">{r.author}</span>
                                <p className="text-xs text-muted-foreground">{r.text}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-1">
                            <Input
                              value={consultReplyText}
                              onChange={(e) => setConsultReplyText(e.target.value)}
                              placeholder={isAr ? "أضف رد..." : "Add reply..."}
                              className="text-xs h-8"
                              onKeyDown={(e) => e.key === "Enter" && handleConsultReply(post.id)}
                            />
                            <Button size="sm" className="h-8 px-3" onClick={() => handleConsultReply(post.id)}>
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>

      {/* ═══════════════ FAB ═══════════════ */}
      <button
        onClick={() => (activeRoom === "diary" ? setShowNewDiary(true) : setShowNewConsult(true))}
        className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* ═══════════════ NEW DIARY DIALOG ═══════════════ */}
      <Dialog open={showNewDiary} onOpenChange={setShowNewDiary}>
        <DialogContent className="max-w-md" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {isAr ? "مشاركة جديدة" : "New Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newDiaryText}
              onChange={(e) => setNewDiaryText(e.target.value)}
              placeholder={isAr ? "شاركنا موقف من ورديتك..." : "Share a moment from your shift..."}
              className="min-h-[120px] text-sm"
            />
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ImagePlus className="h-4 w-4 mr-1" />
                {isAr ? "صورة" : "Photo"}
              </Button>
              <Button onClick={handleNewDiary} disabled={!newDiaryText.trim()}>
                <Send className="h-4 w-4 mr-1" />
                {isAr ? "نشر" : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ NEW CONSULT DIALOG ═══════════════ */}
      <Dialog open={showNewConsult} onOpenChange={setShowNewConsult}>
        <DialogContent className="max-w-md" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {isAr ? "استشارة جديدة" : "New Consultation"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={consultForm.age}
                onChange={(e) => setConsultForm((f) => ({ ...f, age: e.target.value }))}
                placeholder={isAr ? "العمر" : "Age"}
                type="number"
                className="text-sm"
              />
              <select
                value={consultForm.gender}
                onChange={(e) => setConsultForm((f) => ({ ...f, gender: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ذكر">{isAr ? "ذكر" : "Male"}</option>
                <option value="أنثى">{isAr ? "أنثى" : "Female"}</option>
              </select>
            </div>
            <Textarea
              value={consultForm.symptoms}
              onChange={(e) => setConsultForm((f) => ({ ...f, symptoms: e.target.value }))}
              placeholder={isAr ? "الأعراض بالتفصيل..." : "Describe symptoms..."}
              className="min-h-[100px] text-sm"
            />
            <Input
              value={consultForm.duration}
              onChange={(e) => setConsultForm((f) => ({ ...f, duration: e.target.value }))}
              placeholder={isAr ? "المدة (مثال: 3 أيام)" : "Duration (e.g. 3 days)"}
              className="text-sm"
            />
            <div className="flex items-center justify-between bg-destructive/5 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {isAr ? "حالة عاجلة" : "Urgent"}
                </span>
              </div>
              <Switch
                checked={consultForm.urgent}
                onCheckedChange={(v) => setConsultForm((f) => ({ ...f, urgent: v }))}
              />
            </div>
            <Button onClick={handleNewConsult} className="w-full" disabled={!consultForm.symptoms.trim()}>
              <Send className="h-4 w-4 mr-1" />
              {isAr ? "إرسال الاستشارة" : "Submit Consultation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
