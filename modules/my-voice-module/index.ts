// Reexport the native module. On web, it will be resolved to MyVoiceModule.web.ts
// and on native platforms to MyVoiceModule.ts
export { default } from "./src/MyVoiceModule";
export * from "./src/MyVoiceModule.types";

import { EventEmitter } from "expo-modules-core";
import MyVoiceModule from "./src/MyVoiceModule";
import { SpeechListenerCallback } from "./src/MyVoiceModule.types";

const voiceEventEmitter = new EventEmitter(MyVoiceModule);

export const startListening = () => {
  MyVoiceModule.startListening();
};

export const stopListening = () => {
  MyVoiceModule.stopListening();
};

export const addSpeechListener = (callback: SpeechListenerCallback) => {
  const subscription = voiceEventEmitter.addListener("onResults", callback);
  return subscription;
};

export const removeSpeechListener = (subscription: any) => {
  subscription.remove();
};
