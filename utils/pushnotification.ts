export async function sendPushNotification(pushToken: string, message: string) {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_PUSH_SERVER}/send-notification`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pushToken,
          title: "New Movie Added",
          body: message,
          data: { someData: "goes here" },
        }),
      }
    );

    const responseData = await response.json();
    console.log("Notification response", responseData);
  } catch (error) {
    console.error("Error sending push notification", error);
  }
}
