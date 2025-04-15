
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
