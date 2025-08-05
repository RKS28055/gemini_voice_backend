import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import textToSpeech from "@google-cloud/text-to-speech";

dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ttsClient = new textToSpeech.TextToSpeechClient();

app.post("/voice", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;
    const audioBody = fs.readFileSync(audioPath).toString("base64");
    fs.unlinkSync(audioPath);

    // Transcription
    const transcribeResp = await gemini.generate({
      model: "gemini-1.5-turbo",
      prompt: [{ 
        content_type: "audio", 
        audio: { mime_type: "audio/wav", data: audioBody } 
      }],
    });
    const text = transcribeResp.content;

    // Chat response
    const chatResp = await gemini.generate({
      model: "gemini-1.5-turbo",
      prompt: [{ content_type: "text", text }],
    });
    const replyText = chatResp.content;

    // TTS
    const [ttsResponse] = await ttsClient.synthesizeSpeech({
      input: { text: replyText },
      voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "MP3" },
    });

    res.set("Content-Type", "audio/mpeg");
    res.send(ttsResponse.audioContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Gemini Voice Backend running on port ${PORT}`));