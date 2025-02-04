import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // Return null if no file path is provided

        // Upload an fie to Cloudinary
        const uploadResult = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: "auto", // The type of file. 'auto' will automatically detect the type of file
            })
            .catch((error) => {
                console.log(error);
            });

        //console.log(`Files is uploaded successfully: ${uploadResult.url}`);
        fs.unlinkSync(localFilePath); //Delete the locally saved file if it successfully uploaded
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the locally saved file if it fails to upload
        return null;
    }
};

// Optimize delivery by resizing and applying auto-format and auto-quality
const optimizeUrl = cloudinary.url("file", {
    fetch_format: "auto",
    quality: "auto",
});

//console.log(optimizeUrl);

// Transform the image: auto-crop to square aspect_ratio
const autoCropUrl = cloudinary.url("file", {
    crop: "auto",
    gravity: "auto",
    width: 500,
    height: 500,
});

//console.log(autoCropUrl);

export { uploadOnCloudinary, optimizeUrl, autoCropUrl };
