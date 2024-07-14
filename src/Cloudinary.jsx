import { useState } from "react";
import axios from "axios";

const Cloudinary = () => {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const preset_name = import.meta.env.VITE_REACT_APP_CLOUDINARY_PRESET_NAME;
  const cloud_name = import.meta.env.VITE_REACT_APP_CLOUDINARY_CLOUD_NAME;
  const serverUrl = import.meta.env.VITE_REACT_APP_SERVER_URL;

  const uploadImages = async (files) => {
    setLoading(true);
    const uploadedImages = [];

    for (let file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset_name);
      data.append("folder", `SAV/${category}`);

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedImages.push(response.data.secure_url);
      } catch (error) {
        console.error("Error uploading image", error);
      }
    }

    // Ahora enviamos las URLs y la categoría al servidor Node.js
    try {
      const response = await axios.post(`${serverUrl}/upload-images`, {
        category,
        urls: uploadedImages,
      });

      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error sending images to server", error);
    }

    setImages(uploadedImages);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    uploadImages(files);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
  };

  return (
    <>
      <h1>Subir fotos</h1>
      <select name="options" id="options" onChange={handleCategoryChange}>
        <option value="" disabled selected>
          Selecciona categoría
        </option>
        <option value="beauty">Beauty</option>
        <option value="retrato">Retrato</option>
        <option value="about">About</option>
      </select>

      <div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <div>
          {loading ? (
            <h3>Cargando...</h3>
          ) : (
            images.map((image, index) => (
              <img
                key={index}
                className="circular-image"
                src={image}
                alt={`Foto subida ${index + 1}`}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Cloudinary;
