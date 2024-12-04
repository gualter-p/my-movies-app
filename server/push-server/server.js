import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.post("/send-notification", async (req, res) => {
  const { pushToken, title, body, data } = req.body;

  if (!pushToken || !title || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const messageToSend = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data: data || {},
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageToSend),
    });

    const responseData = await response.json();

    if (response.ok) {
      res.json({ success: true, data: responseData });
    } else {
      res.status(response.status).json({ error: responseData });
    }
  } catch (error) {
    console.error("Error sending push notification", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Push notification server running on http://localhost:${PORT}`);
});
