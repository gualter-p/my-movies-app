import { useState, useEffect, useCallback } from "react";
import {
  startListening,
  stopListening,
  addSpeechListener,
  removeSpeechListener,
} from "../modules/my-voice-module";

export const useVoiceRecognition = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    const subscription = addSpeechListener((text) => {
      console.log("text: ", text);
      onResult(text.results);
      setIsListening(false);
    });

    return () => {
      removeSpeechListener(subscription);
    };
  }, [onResult]);

  const startVoiceRecognition = useCallback(() => {
    setIsListening(true);
    startListening();
  }, []);

  const stopVoiceRecognition = useCallback(() => {
    setIsListening(false);
    stopListening();
  }, []);

  const handleMicrophonePress = useCallback(() => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  }, [isListening, startVoiceRecognition, stopVoiceRecognition]);

  return {
    isListening,
    handleMicrophonePress,
  };
};
