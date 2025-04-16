
import { useState, useEffect, useCallback } from 'react';
import { SpeechRecognitionResult, SupportedLanguage, LanguagePatterns } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Add type definitions for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface WebkitSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => WebkitSpeechRecognition;
    webkitSpeechRecognition: new () => WebkitSpeechRecognition;
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  resetTranscript: () => void;
  parsedResult: SpeechRecognitionResult | null;
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  supportedLanguages: SupportedLanguage[];
}

// Language-specific patterns for parsing speech
const languagePatterns: Record<SupportedLanguage, LanguagePatterns> = {
  'en-US': {
    putPattern: /(?:I\s+(?:put|placed|left)\s+(?:my|the)\s+)(\w+(?:\s+\w+)*)\s+(?:on|in|at|near|by|inside|under|above|behind|beside)\s+(?:the|my)\s+(\w+(?:\s+\w+)*)/i,
    isPattern: /(?:my|the)\s+(\w+(?:\s+\w+)*)\s+(?:is|are)\s+(?:on|in|at|near|by|inside|under|above|behind|beside)\s+(?:the|my)\s+(\w+(?:\s+\w+)*)/i,
    notUnderstoodMessage: "Try saying 'I put my [item] on/in the [location]'",
    itemUpdatedMessage: (item, location) => `${item} is now at ${location}`,
  },
  'es-ES': {
    putPattern: /(?:(?:puse|coloqué|dejé)\s+(?:mi|el|la)\s+)(\w+(?:\s+\w+)*)\s+(?:en|sobre|cerca de|junto a|dentro de|debajo de|encima de|detrás de|al lado de)\s+(?:el|la|mi)\s+(\w+(?:\s+\w+)*)/i,
    isPattern: /(?:mi|el|la)\s+(\w+(?:\s+\w+)*)\s+(?:está|están)\s+(?:en|sobre|cerca de|junto a|dentro de|debajo de|encima de|detrás de|al lado de)\s+(?:el|la|mi)\s+(\w+(?:\s+\w+)*)/i,
    notUnderstoodMessage: "Intente decir 'Puse mi [objeto] en/sobre [ubicación]'",
    itemUpdatedMessage: (item, location) => `${item} está ahora en ${location}`,
  },
  'fr-FR': {
    putPattern: /(?:(?:j'ai mis|j'ai placé|j'ai laissé)\s+(?:mon|ma|mes|le|la|les)\s+)(\w+(?:\s+\w+)*)\s+(?:sur|dans|à|près de|à côté de|à l'intérieur de|sous|au-dessus de|derrière|à côté de)\s+(?:le|la|les|mon|ma|mes)\s+(\w+(?:\s+\w+)*)/i,
    isPattern: /(?:mon|ma|mes|le|la|les)\s+(\w+(?:\s+\w+)*)\s+(?:est|sont)\s+(?:sur|dans|à|près de|à côté de|à l'intérieur de|sous|au-dessus de|derrière|à côté de)\s+(?:le|la|les|mon|ma|mes)\s+(\w+(?:\s+\w+)*)/i,
    notUnderstoodMessage: "Essayez de dire 'J'ai mis mon [objet] sur/dans [emplacement]'",
    itemUpdatedMessage: (item, location) => `${item} est maintenant à ${location}`,
  },
  'de-DE': {
    putPattern: /(?:(?:ich habe|ich habe mein|ich habe meine)\s+)(\w+(?:\s+\w+)*)\s+(?:auf|in|an|nahe|neben|drinnen|unter|über|hinter|neben)\s+(?:den|die|das|mein|meine)\s+(\w+(?:\s+\w+)*)/i,
    isPattern: /(?:mein|meine|der|die|das)\s+(\w+(?:\s+\w+)*)\s+(?:ist|sind)\s+(?:auf|in|an|nahe|neben|drinnen|unter|über|hinter|neben)\s+(?:den|die|das|mein|meine)\s+(\w+(?:\s+\w+)*)/i,
    notUnderstoodMessage: "Versuchen Sie zu sagen 'Ich habe mein [Gegenstand] auf/in [Ort] gelegt'",
    itemUpdatedMessage: (item, location) => `${item} ist jetzt bei ${location}`,
  },
  'it-IT': {
    putPattern: /(?:(?:ho messo|ho posato|ho lasciato)\s+(?:il mio|la mia|i miei|le mie|il|la|i|le)\s+)(\w+(?:\s+\w+)*)\s+(?:su|in|a|vicino a|accanto a|dentro|sotto|sopra|dietro|accanto a)\s+(?:il|la|i|le|il mio|la mia|i miei|le mie)\s+(\w+(?:\s+\w+)*)/i,
    isPattern: /(?:il mio|la mia|i miei|le mie|il|la|i|le)\s+(\w+(?:\s+\w+)*)\s+(?:è|sono)\s+(?:su|in|a|vicino a|accanto a|dentro|sotto|sopra|dietro|accanto a)\s+(?:il|la|i|le|il mio|la mia|i miei|le mie)\s+(\w+(?:\s+\w+)*)/i,
    notUnderstoodMessage: "Prova a dire 'Ho messo il mio [oggetto] su/in [posizione]'",
    itemUpdatedMessage: (item, location) => `${item} è ora a ${location}`,
  },
  'ja-JP': {
    putPattern: /(?:(?:私は|わたしは)(?:私の|わたしの)?\s*)(\S+(?:\s+\S+)*)\s*(?:を|に)\s*(\S+(?:\s+\S+)*)\s*(?:に|へ|で)\s*(?:置きました|置いた|入れました|入れた)/i,
    isPattern: /(?:(?:私の|わたしの)?\s*)(\S+(?:\s+\S+)*)\s*(?:は|が)\s*(\S+(?:\s+\S+)*)\s*(?:に|へ|で)\s*(?:あります|います|ある|いる)/i,
    notUnderstoodMessage: "'私の[アイテム]を[場所]に置きました'と言ってみてください",
    itemUpdatedMessage: (item, location) => `${item}は現在${location}にあります`,
  },
  'zh-CN': {
    putPattern: /(?:(?:我|我把|我将)(?:我的|我们的)?\s*)(\S+(?:\s+\S+)*)\s*(?:放|放在|放到|放进|放入|置|置于|置入|放置|放置在|放置到)\s*(\S+(?:\s+\S+)*)/i,
    isPattern: /(?:(?:我的|我们的)?\s*)(\S+(?:\s+\S+)*)\s*(?:在|位于|是在)\s*(\S+(?:\s+\S+)*)/i,
    notUnderstoodMessage: "请尝试说'我把[物品]放在[位置]'",
    itemUpdatedMessage: (item, location) => `${item}现在在${location}`,
  },
  'ru-RU': {
    putPattern: /(?:(?:я|я положил|я поставил|я оставил)(?:свой|свою|свои|мой|моя|мои)?\s*)(\S+(?:\s+\S+)*)\s*(?:на|в|у|рядом с|около|внутри|под|над|за|рядом с)\s*(\S+(?:\s+\S+)*)/i,
    isPattern: /(?:(?:мой|моя|мои|свой|свою|свои)?\s*)(\S+(?:\s+\S+)*)\s*(?:находится|лежит|стоит|есть)\s*(?:на|в|у|рядом с|около|внутри|под|над|за|рядом с)\s*(\S+(?:\s+\S+)*)/i,
    notUnderstoodMessage: "Попробуйте сказать 'Я положил [предмет] на/в [место]'",
    itemUpdatedMessage: (item, location) => `${item} сейчас находится в ${location}`,
  }
};

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [recognition, setRecognition] = useState<WebkitSpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<SpeechRecognitionResult | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en-US');
  const supportedLanguages: SupportedLanguage[] = Object.keys(languagePatterns) as SupportedLanguage[];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Define the Speech Recognition API with browser compatibility
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = currentLanguage;
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          parseTranscript(result);
        };
        
        recognitionInstance.onerror = (event: SpeechRecognitionError) => {
          console.error('Speech recognition error', event);
          toast({
            title: "Speech Recognition Error",
            description: "There was a problem recognizing your speech. Please try again.",
            variant: "destructive",
          });
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      } else {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        });
      }
    }
  }, [currentLanguage]); // Re-initialize when language changes

  const parseTranscript = (text: string) => {
    const patterns = languagePatterns[currentLanguage];
    
    // Parse using the language-specific patterns
    let match = text.match(patterns.putPattern) || text.match(patterns.isPattern);
    
    if (match) {
      setParsedResult({
        item: match[1].trim(),
        location: match[2].trim(),
      });
      return;
    }
    
    // If no match, reset parsed result
    setParsedResult(null);
    toast({
      title: "Couldn't Understand",
      description: patterns.notUnderstoodMessage,
      variant: "destructive",
    });
  };

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.lang = currentLanguage; // Update language before starting
        recognition.start();
        setIsListening(true);
        setParsedResult(null);
        setTranscript('');
      } catch (error) {
        console.error('Failed to start speech recognition', error);
      }
    }
  }, [recognition, isListening, currentLanguage]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setParsedResult(null);
  }, []);

  const setLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    resetTranscript,
    parsedResult,
    currentLanguage,
    setLanguage,
    supportedLanguages,
  };
};
