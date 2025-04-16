
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useItemsStore } from "@/store/itemsStore";
import { Mic, MicOff, Globe } from "lucide-react";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportedLanguage } from "@/types";

export const VoiceInput = () => {
  const { 
    isListening, 
    startListening, 
    stopListening, 
    transcript, 
    parsedResult, 
    currentLanguage,
    setLanguage,
    supportedLanguages
  } = useSpeechRecognition();
  
  const addItem = useItemsStore((state) => state.addItem);
  
  useEffect(() => {
    if (parsedResult && !isListening) {
      addItem(parsedResult.item, parsedResult.location);
      toast({
        title: "Item Updated",
        description: `${parsedResult.item} is now at ${parsedResult.location}`,
      });
    }
  }, [parsedResult, isListening, addItem]);

  const languageDisplayNames: Record<SupportedLanguage, string> = {
    'en-US': 'English (US)',
    'es-ES': 'Español (España)',
    'fr-FR': 'Français',
    'de-DE': 'Deutsch',
    'it-IT': 'Italiano',
    'ja-JP': '日本語',
    'zh-CN': '中文 (简体)',
    'ru-RU': 'Русский'
  };
  
  return (
    <Card className="p-4 border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="flex items-center justify-center h-16 w-full sm:w-16"
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className={`h-6 w-6 ${isListening ? "animate-pulse-soft" : ""}`} />
            )}
          </Button>
          
          <Select
            value={currentLanguage}
            onValueChange={(value) => setLanguage(value as SupportedLanguage)}
          >
            <SelectTrigger className="w-[120px] sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue placeholder="Select Language" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {languageDisplayNames[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-h-[3.5rem] flex items-center">
          {isListening ? (
            <p className="text-lg animate-pulse-soft">Listening...</p>
          ) : transcript ? (
            <p className="text-lg">{transcript}</p>
          ) : (
            <p className="text-muted-foreground">
              Press the mic button and say where you put something
            </p>
          )}
        </div>
      </div>
      
      {parsedResult && (
        <div className="mt-4 p-3 bg-primary/10 rounded-md">
          <p>
            <span className="font-semibold">{parsedResult.item}</span> is at{" "}
            <span className="font-semibold">{parsedResult.location}</span>
          </p>
        </div>
      )}
    </Card>
  );
};
