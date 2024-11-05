import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import * as LocalAuthentication from "expo-local-authentication";
import { useCheckBiometrics } from "../hooks/useCheckBiometrics";
import { Session } from "@supabase/supabase-js";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const { isBiometricsSupported } = useCheckBiometrics();

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session && isBiometricsSupported) {
        // Prompts for fingerprint authentication on app start
        await promptForFingerprint();
      } else {
        setLoading(false); // Skips authentication if no session or biometrics unsupported
      }
    };

    initializeAuth();

    // Listens for app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [isBiometricsSupported]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // If we come back from an inactive or background state,\
    // we ask for fingerprint identification
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active" &&
      session &&
      isBiometricsSupported
    ) {
      promptForFingerprint();
    }

    appState.current = nextAppState;
  };

  const promptForFingerprint = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to continue",
      fallbackLabel: "Use Passcode",
      cancelLabel: "Cancel",
    });

    if (result.success) {
      setLoading(false);
    } else {
      Alert.alert("Authentication failed. Please try again.");
      await supabase.auth.signOut();
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Text>Loading... </Text>;
  }

  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
