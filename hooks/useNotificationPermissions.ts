import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import { supabase } from "../lib/supabase";
import Constants from "expo-constants";

export function useNotificationPermissions(userId?: string) {
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== "granted") {
          console.log("Push notification permission denied");
          return;
        }
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;

        const token = await Notifications.getExpoPushTokenAsync({ projectId });

        if (userId && token.data) {
          // Send token to db
          await supabase
            .from("profiles")
            .upsert({ id: userId, push_token: token.data });
        }

        setPushToken(token.data);
      } catch (error) {
        console.error("Error getting push token", error);
      }
    };

    if (userId && (Platform.OS === "ios" || Platform.OS === "android")) {
      registerForPushNotifications();
    } else {
      console.log(
        "Push notifications not available on a simulator or emulator"
      );
    }
  }, [userId]);
  return pushToken;
}
