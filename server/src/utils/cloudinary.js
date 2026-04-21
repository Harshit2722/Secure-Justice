const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        return response;
    } catch (error) {
        return null;
    }
};

const uploadBufferToCloudinary = (buffer, publicId, resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const options = { resource_type: resourceType };
        if (publicId) {
            options.public_id = publicId;
        }
        
        // Only apply format if passed explicitly (handled per case)
        
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

module.exports = { cloudinary, uploadOnCloudinary, uploadBufferToCloudinary };
