import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";

const ImageCropper = () => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.match("image.*")) {
        setImageError("Please select an image file");
        return;
      }

      setImageError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImage(reader.result);
        setCroppedImage(null);
      };
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    try {
      const croppedImg = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );
      setCroppedImage(croppedImg);
    } catch (e) {
      console.error("Error creating cropped image:", e);
    }
  }, [croppedAreaPixels, rotation, image]);

  const downloadCroppedImage = () => {
    if (!croppedImage) return;

    const link = document.createElement("a");
    link.href = croppedImage;
    link.download = "cropped-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetCropper = () => {
    setCroppedImage(null);
  };

  const selectNewImage = () => {
    setCroppedImage(null);
    setImage(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Image Cropper</h1>

      {!image && (
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <label
              className="flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white"
              style={{
                backgroundColor: "#fff",
                color: "#3b82f6",
                borderColor: "#3b82f6",
              }}
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
              </svg>
              <span className="mt-2 text-base leading-normal">
                Select an image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
                ref={fileInputRef}
              />
            </label>
          </div>
          {imageError && (
            <p className="text-red-500 text-center mt-2">{imageError}</p>
          )}
        </div>
      )}

      {image && !croppedImage && (
        <div>
          {/* Cropper Container */}
          <div className="relative h-64 md:h-96 bg-gray-200 mb-4">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              rotation={rotation}
            />
          </div>

          {/* Zoom Control */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ background: "#e5e7eb" }}
            />
          </div>

          {/* Rotation Control */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rotation: {rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ background: "#e5e7eb" }}
            />
          </div>

          {/* Controls */}
          <div className="flex justify-between">
            <button
              onClick={selectNewImage}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              style={{ backgroundColor: "#6b7280" }}
            >
              Cancel
            </button>
            <button
              onClick={createCroppedImage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              style={{ backgroundColor: "#3b82f6" }}
            >
              Crop Image
            </button>
          </div>
        </div>
      )}

      {croppedImage && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Cropped Result:</h2>
          <div className="mb-6 flex justify-center">
            <img
              src={croppedImage}
              alt="Cropped"
              className="max-w-full h-auto border rounded shadow-sm"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={resetCropper}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              style={{ backgroundColor: "#6b7280" }}
            >
              Crop Again
            </button>
            <button
              onClick={downloadCroppedImage}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              style={{ backgroundColor: "#10b981" }}
            >
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to create a cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Set canvas dimensions to handle the rotation
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate canvas center point to the origin
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw the rotated image and drop off-canvas pixels
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  // Extract the cropped portion
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas width to final desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Place the cropped data into a new canvas with proper position
  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );

  // Return as data URL
  return canvas.toDataURL("image/png");
};

export default ImageCropper;
