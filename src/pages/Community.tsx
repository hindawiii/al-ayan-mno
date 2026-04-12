import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Send, Mic, MicOff, Play, Pause, Smile, Sticker,
  MessageSquare, Stethoscope, Heart, ThumbsUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import WadAlHalalAvatar from "@/components/WadAlHalalAvatar";
import { cn } from "@/lib/utils";

type Channel = "general" | "medical";

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text?: string;
  sticker?: string;
  voiceNote?: boolean;
  voiceDuration?: number;
  time: string;
  isOwn: boolean;
  reactions: Reaction[];
  channel: Channel;
}

const STICKERS = [
  "يا دكتور 👨‍⚕️",
  "الحالة استقرت ✅",
  "يديك العافية 💪",
  "شكراً جزيلاً 🙏",
  "الله يشفيه 🤲",
  "تمام يا باشا 👍",
];

const EMOJIS = ["❤️", "👍", "😂", "😮", "🙏", "💪", "🎉", "👏"];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1", sender: "أحمد محمد", text: "السلام عليكم يا جماعة، أنا ممرض جديد من الخرطوم",
    time: "10:30", isOwn: false, reactions: [{ emoji: "❤️", count: 3, reacted: false }], channel: "general",
  },
  {
    id: "2", sender: "فاطمة علي", text: "أهلاً وسهلاً يا أحمد! نورت المجتمع 🌟",
    time: "10:32", isOwn: false, reactions: [{ emoji: "👍", count: 2, reacted: false }], channel: "general",
  },
  {
    id: "3", sender: "أنت", text: "مرحباً بالجميع! سعيد بالانضمام",
    time: "10:35", isOwn: true, reactions: [], channel: "general",
  },
  {
    id: "4", sender: "أنت", voiceNote: true, voiceDuration: 12,
    time: "10:36", isOwn: true, reactions: [{ emoji: "👏", count: 1, reacted: false }], channel: "general",
  },
  {
    id: "5", sender: "د. خالد", text: "حالة مريض عمره 45 سنة، ضغط مرتفع مع سكري — ما هو البروتوكول المناسب؟",
    time: "11:00", isOwn: false, reactions: [{ emoji: "🙏", count: 4, reacted: false }], channel: "medical",
  },
  {
    id: "6", sender: "سارة أحمد", text: "يجب فحص وظائف الكلى أولاً قبل وصف أي علاج — هذا أساسي",
    time: "11:05", isOwn: false, reactions: [{ emoji: "👍", count: 5, reacted: false }], channel: "medical",
  },
  {
    id: "7", sender: "أنت", text: "أوافق، وأضيف أن مراقبة HbA1c مهمة جداً في هذه الحالة",
    time: "11:08", isOwn: true, reactions: [{ emoji: "💪", count: 2, reacted: false }], channel: "medical",
  },
];

const VoiceNotePlayer = ({ duration }: { duration: number }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = () => {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(intervalRef.current!);
            setPlaying(false);
            return 0;
          }
          return p + 100 / (duration * 10);
        });
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={toggle}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{duration}s</span>
    </div>
  );
};

const Community = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [channel, setChannel] = useState<Channel>("general");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages.filter((m) => m.channel === channel);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: "أنت",
      text: input,
      time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      reactions: [],
      channel,
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const sendSticker = (sticker: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: "أنت",
      sticker,
      time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      reactions: [],
      channel,
    };
    setMessages((prev) => [...prev, msg]);
  };

  const sendVoiceNote = () => {
    if (recording) {
      setRecording(false);
      const msg: ChatMessage = {
        id: Date.now().toString(),
        sender: "أنت",
        voiceNote: true,
        voiceDuration: Math.floor(Math.random() * 15) + 3,
        time: new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
        reactions: [],
        channel,
      };
      setMessages((prev) => [...prev, msg]);
    } else {
      setRecording(true);
    }
  };

  const addReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...m,
            reactions: m.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
                : r
            ),
          };
        }
        return { ...m, reactions: [...m.reactions, { emoji, count: 1, reacted: true }] };
      })
    );
  };

  const channels = [
    { id: "general" as Channel, label: isAr ? "الساحة العامة" : "General Square", icon: MessageSquare },
    { id: "medical" as Channel, label: isAr ? "استشارات طبية" : "Medical Consultations", icon: Stethoscope },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-card">
        <WadAlHalalAvatar size={36} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{t("community")}</h2>
          <p className="text-xs text-muted-foreground">
            {isAr ? `${channelMessages.length} رسالة` : `${channelMessages.length} messages`}
          </p>
        </div>
        {/* Channel tabs */}
        <div className="flex gap-1">
          {channels.map((ch) => (
            <Button
              key={ch.id}
              size="sm"
              variant={channel === ch.id ? "default" : "outline"}
              onClick={() => setChannel(ch.id)}
              className="gap-1.5 text-xs"
            >
              <ch.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{ch.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Channel description */}
      <div className="px-3 py-2 bg-muted/50 border-b">
        <p className="text-xs text-muted-foreground text-center">
          {channel === "general"
            ? isAr ? "💬 ساحة للتعارف والنقاش العام بين الممرضين" : "💬 A space for introductions and general discussion"
            : isAr ? "🏥 للاستشارات الطبية المهنية فقط" : "🏥 For professional medical consultations only"}
        </p>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {channelMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 animate-fade-in",
                msg.isOwn ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-1">
                {msg.isOwn ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <WadAlHalalAvatar size={32} />
                  </div>
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {msg.sender.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Bubble */}
              <div className={cn("max-w-[75%] space-y-1", msg.isOwn ? "items-end" : "items-start")}>
                {!msg.isOwn && (
                  <span className="text-xs font-medium text-primary">{msg.sender}</span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 shadow-sm",
                    msg.isOwn
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border rounded-tl-sm"
                  )}
                >
                  {msg.sticker && (
                    <span className="text-lg font-bold">{msg.sticker}</span>
                  )}
                  {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                  {msg.voiceNote && <VoiceNotePlayer duration={msg.voiceDuration || 5} />}
                </div>

                {/* Time + Reactions row */}
                <div className={cn("flex items-center gap-1.5 flex-wrap", msg.isOwn ? "justify-end" : "justify-start")}>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  {msg.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      onClick={() => addReaction(msg.id, r.emoji)}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full border transition-all hover:scale-110 active:scale-95",
                        r.reacted ? "bg-primary/10 border-primary/30" : "bg-muted border-transparent"
                      )}
                    >
                      {r.emoji} {r.count}
                    </button>
                  ))}
                  {/* Add reaction */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Smile className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side="top">
                      <div className="flex gap-1">
                        {EMOJIS.map((e) => (
                          <button
                            key={e}
                            onClick={() => addReaction(msg.id, e)}
                            className="text-lg hover:scale-125 active:scale-95 transition-transform p-1"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sticky Input */}
      <div className="border-t bg-card p-3 space-y-2">
        {/* Stickers bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STICKERS.map((s) => (
            <button
              key={s}
              onClick={() => sendSticker(s)}
              className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 border hover:border-primary/30 transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={recording ? "destructive" : "ghost"}
            className="shrink-0 h-9 w-9"
            onClick={sendVoiceNote}
          >
            {recording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={isAr ? "اكتب رسالتك..." : "Type a message..."}
            className="flex-1 rounded-full bg-muted border-0 h-9"
            dir={isAr ? "rtl" : "ltr"}
          />

          <Button
            size="icon"
            className="shrink-0 h-9 w-9 rounded-full"
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {recording && (
          <div className="flex items-center justify-center gap-2 text-destructive animate-pulse">
            <Mic className="h-4 w-4" />
            <span className="text-xs font-medium">{isAr ? "جاري التسجيل..." : "Recording..."}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
