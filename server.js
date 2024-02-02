const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client
const client = new GoogleGenerativeAI("abc-123");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  const prompt = "What is this? Explain in detail.";
  const imagePath = req.file.path;

  const image = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
      mimeType: "image/png",
    },
  };

  try {
    // Assuming you have already authenticated and set up the client correctly
    const model = await client.getGenerativeModel({
      model: "gemini-pro-vision",
    });
    const result = await model.generateContent([prompt, image]);
    console.log(result.response.text());
    res.send(result.response.text());
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing image");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
