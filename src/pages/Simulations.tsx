import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Play, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const YOUTUBE_VIDEOS = [
  { id: "nKluv7MzgEY", titleAr: "الحقن العضلي — الطريقة الصحيحة", titleEn: "IM Injection — Correct Technique" },
  { id: "VOib-onRM5g", titleAr: "مواقع الحقن العضلي الآمنة", titleEn: "Safe IM Injection Sites" },
  { id: "z4FGEEg7Lxg", titleAr: "أخطاء شائعة في الحقن العضلي", titleEn: "Common IM Injection Mistakes" },
];

const ANATOMY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=800&q=80", titleAr: "التشريح العضلي للمنطقة الألوية", titleEn: "Gluteal Muscle Anatomy" },
  { src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80", titleAr: "مواقع الحقن الآمنة", titleEn: "Safe Injection Sites" },
  { src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80", titleAr: "الأدوات الطبية المطلوبة", titleEn: "Required Medical Tools" },
  { src: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80", titleAr: "تحضير المريض للحقن", titleEn: "Patient Preparation" },
];

const Simulations = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [activeVideo, setActiveVideo] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const navigateImage = (dir: 1 | -1) => {
    setActiveImage((prev) => (prev + dir + ANATOMY_IMAGES.length) % ANATOMY_IMAGES.length);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAr ? "مركز التدريب على الحقن" : "Injection Training Center"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? "فيديوهات وصور تعليمية احترافية" : "Professional educational videos & images"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="videos" className="gap-2">
            <Play className="h-4 w-4" />
            {isAr ? "الفيديوهات" : "Videos"}
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            {isAr ? "الصور التشريحية" : "Anatomy Images"}
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEOS[activeVideo].id}`}
                  title={isAr ? YOUTUBE_VIDEOS[activeVideo].titleAr : YOUTUBE_VIDEOS[activeVideo].titleEn}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </AspectRatio>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {YOUTUBE_VIDEOS.map((video, i) => (
              <Card
                key={video.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                  i === activeVideo ? "ring-2 ring-primary border-primary" : "hover:border-primary/30"
                }`}
                onClick={() => setActiveVideo(i)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${i === activeVideo ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <Play className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {isAr ? video.titleAr : video.titleEn}
                    </p>
                    <Badge variant={i === activeVideo ? "default" : "secondary"} className="mt-1 text-[10px]">
                      {isAr ? `فيديو ${i + 1}` : `Video ${i + 1}`}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-xl relative group">
              <AspectRatio ratio={16 / 9}>
                <img
                  key={activeImage}
                  src={ANATOMY_IMAGES[activeImage].src}
                  alt={isAr ? ANATOMY_IMAGES[activeImage].titleAr : ANATOMY_IMAGES[activeImage].titleEn}
                  className="w-full h-full object-contain bg-muted/30 animate-fade-in"
                  loading="lazy"
                />
              </AspectRatio>
              {/* Navigation arrows */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => navigateImage(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => navigateImage(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {/* Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent p-4">
                <p className="text-sm font-bold text-foreground">
                  {isAr ? ANATOMY_IMAGES[activeImage].titleAr : ANATOMY_IMAGES[activeImage].titleEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeImage + 1} / {ANATOMY_IMAGES.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ANATOMY_IMAGES.map((img, i) => (
              <Card
                key={i}
                className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                  i === activeImage ? "ring-2 ring-primary" : "hover:border-primary/30"
                }`}
                onClick={() => setActiveImage(i)}
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={img.src}
                    alt={isAr ? img.titleAr : img.titleEn}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulations;
