import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary and returns the secure URL.
 * @param file - The File object from the request.
 * @param folder - The folder name in Cloudinary (e.g., 'products', 'stores').
 * @returns The secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Convert buffer to base64 data URI
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
        
        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(base64Image, {
            folder: `Shopix/${folder}`,
            resource_type: 'auto',
        });
        
        return response.secure_url;
    } catch (error: any) {
        console.error("Cloudinary upload error:", error);
        throw new Error(error.message || "Failed to upload image to Cloudinary");
    }
};

/**
 * Deletes an image from Cloudinary using its public ID extracted from the URL.
 * @param imageUrl - The full URL of the Cloudinary image.
 */
export const deleteFromCloudinary = async (imageUrl: string) => {
    try {
        if (!imageUrl || !imageUrl.includes('cloudinary')) return;
        
        // Extract public ID from the URL
        // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v12345678/Shopix/products/filename.jpg
        const splitUrl = imageUrl.split('/');
        const fileNameWithExt = splitUrl[splitUrl.length - 1];
        const fileName = fileNameWithExt.split('.')[0];
        const folderPath = splitUrl.slice(splitUrl.indexOf('Shopix'), splitUrl.length - 1).join('/');
        const publicId = `${folderPath}/${fileName}`;
        
        await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
        console.error("Cloudinary delete error:", error);
        // We don't necessarily want to fail the whole request if deletion fails
    }
};

export default cloudinary;
