import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.VITE_REACT_APP_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
// eslint-disable-next-line no-undef
const MONGODB_URI = process.env.VITE_REACT_APP_MONGODB_URI;
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "sav_db",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Definición del esquema y modelo para las imágenes
const ImageSchema = new mongoose.Schema({
  category: String,
  urls: [String],
});

const Image = mongoose.model("Image", ImageSchema);

// Ruta para subir imágenes
app.post("/upload-images", async (req, res) => {
  const { category, urls } = req.body;
  try {
    let imageRecord = await Image.findOne({ category });

    if (imageRecord) {
      imageRecord.urls = [...imageRecord.urls, ...urls];
    } else {
      imageRecord = new Image({ category, urls });
    }

    await imageRecord.save();
    res
      .status(200)
      .json({ message: "Images uploaded successfully", imageRecord });
  } catch (error) {
    console.error("Error uploading images", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

// Ruta para obtener la imagen de "about"
app.get("/api/get-images/about", async (req, res) => {
  try {
    const imageRecord = await Image.findOne({ category: "about" });
    if (!imageRecord) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.status(200).json({ imageUrls: imageRecord.urls });
  } catch (error) {
    console.error("Error fetching about image:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

// Configuración para servir archivos estáticos desde la carpeta 'build'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../dist")));

// Ruta de fallback para SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
