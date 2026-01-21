import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Good practice for production
});

export const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
    if (!file) return null;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    resource_type: "auto",
                    folder: "grocery_items", 
                }, 
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Stream Error:", error);
                        return reject(error);
                    }
                    if (!result) return reject(new Error("Upload result is undefined"));
                    resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        return uploadResult.secure_url;

    } catch (error: any) {
        console.error("Cloudinary Upload Error Details:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name
        });
        return null;
    }
};