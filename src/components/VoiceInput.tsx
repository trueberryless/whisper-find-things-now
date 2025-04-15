
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useItemsStore } from "@/store/itemsStore";
import { Mic, MicOff } from "lucide-react";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export const VoiceInput = () => {
  const { isListening, startListening, stopListening, transcript, parsedResult } = useSpeechRecognition();
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
  
  return (
    <Card className="p-4 border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4">
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
