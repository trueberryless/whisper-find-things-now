
export type Item = {
  id: string;
  name: string;
  location: string;
  lastUpdated: Date;
};

export type SpeechRecognitionResult = {
  item: string;
  location: string;
};

export type SupportedLanguage = 
  | 'en-US' 
  | 'es-ES' 
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'ja-JP'
  | 'zh-CN'
  | 'ru-RU';

export type LanguagePatterns = {
  putPattern: RegExp;
  isPattern: RegExp;
  notUnderstoodMessage: string;
  itemUpdatedMessage: (item: string, location: string) => string;
};
