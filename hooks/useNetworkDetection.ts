import { useState, useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";

export default function useNetworkDetection() {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");

  // Track initial connection state to avoid showing modal on app launch
  const hasCheckedInitialConnection = useRef<boolean>(false);
  const lastConnectionState = useRef<boolean | null>(null); // Track the previous connection state to detect changes

  const handleMessage = (isConnected: boolean) => {
    onlineManager.setOnline(isConnected);
    setMessage(isConnected ? "You are back online!" : "You are offline!");
    setModalVisible(true);
  };

  const checkInitialConnection = async () => {
    const state = await NetInfo.fetch();
    const isConnected = !!state.isConnected;

    hasCheckedInitialConnection.current = true;
    lastConnectionState.current = isConnected;

    if (!isConnected) {
      handleMessage(false);
    }
  };

  useEffect(() => {
    checkInitialConnection();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = !!state.isConnected;
      if (
        hasCheckedInitialConnection.current &&
        lastConnectionState.current !== isConnected
      ) {
        handleMessage(isConnected);
        lastConnectionState.current = isConnected;
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    modalVisible,
    setModalVisible,
    message,
  };
}
