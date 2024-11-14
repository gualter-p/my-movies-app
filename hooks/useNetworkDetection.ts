import { useState, useEffect, useRef, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager, QueryClient } from "@tanstack/react-query";
import { processPendingMutations } from "./useProcessPendingMutations";

export default function useNetworkDetection(queryClient: QueryClient) {
  const [modalVisible, setModalVisible] = useState(<boolean>false);
  const [message, setMessage] = useState<string>("");

  // Track initial connection state to avoid showing modal on app launch
  const hasCheckedInitialConnection = useRef<boolean>(false);
  const lastConnectionState = useRef<boolean | null>(null); // Track the previous connection state to detect changes

  const handleMessage = useCallback(
    (isConnected: boolean) => {
      onlineManager.setOnline(isConnected);
      if (isConnected) {
        setMessage("You are back online!");
        queryClient.resumePausedMutations(); // Handle pending mutations (using queryClient)
        // processPendingMutations(queryClient); // Handle pending mutations (ourselves)
      } else {
        setMessage("You are offline!");
      }
      setModalVisible(true);
    },
    [queryClient]
  );

  const checkInitialConnection = useCallback(async () => {
    const state = await NetInfo.fetch();
    const isConnected = !!state.isConnected;

    hasCheckedInitialConnection.current = true;
    lastConnectionState.current = isConnected;

    if (!isConnected) {
      handleMessage(false);
    }
  }, [handleMessage]);

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
  }, [checkInitialConnection, handleMessage]);

  return {
    modalVisible,
    setModalVisible,
    message,
  };
}
