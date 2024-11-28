import type { StyleProp, ViewStyle } from "react-native";

export type OnLoadEventPayload = {
  url: string;
};

export type MyVoiceModuleEvents = {
  onResults: (results: string) => void;
  onError: (error: string) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type SpeechResult = {
  results: string;
};

export type SpeechListenerCallback = (results: SpeechResult) => void;

export type MyVoiceModuleViewProps = {
  addSpeechListener: (callback: SpeechListenerCallback) => number; // Returns a subscription ID
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
