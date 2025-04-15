
import { useState, useEffect, useCallback } from 'react';
import { SpeechRecognitionResult } from '@/types';
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
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<SpeechRecognitionResult | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Define the Speech Recognition API with browser compatibility
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          parseTranscript(result);
        };
        
        recognitionInstance.onerror = (event: any) => {
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
  }, []);

  const parseTranscript = (text: string) => {
    // Parse for patterns like "I put my [item] on/in/at the [location]"
    const putPattern = /(?:I\s+(?:put|placed|left)\s+(?:my|the)\s+)(\w+(?:\s+\w+)*)\s+(?:on|in|at|near|by|inside|under|above|behind|beside)\s+(?:the|my)\s+(\w+(?:\s+\w+)*)/i;
    
    // Also parse for direct statements like "[item] is on/in/at the [location]"
    const isPattern = /(?:my|the)\s+(\w+(?:\s+\w+)*)\s+(?:is|are)\s+(?:on|in|at|near|by|inside|under|above|behind|beside)\s+(?:the|my)\s+(\w+(?:\s+\w+)*)/i;
    
    let match = text.match(putPattern) || text.match(isPattern);
    
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
      description: "Try saying 'I put my [item] on/in the [location]'",
      variant: "destructive",
    });
  };

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        setParsedResult(null);
        setTranscript('');
      } catch (error) {
        console.error('Failed to start speech recognition', error);
      }
    }
  }, [recognition, isListening]);

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

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    resetTranscript,
    parsedResult,
  };
};
