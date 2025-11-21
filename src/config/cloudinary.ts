import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateUploadSignature = (
  filename: string,
  mimeType: string,
  fileSizeBytes: number,
): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
} => {
  if (mimeType !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (fileSizeBytes > maxSize) {
    throw new Error("File size exceeds 5MB limit");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "job-board/resumes";

  // Sanitize filename for public_id
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const publicId = `${timestamp}_${safeFilename}`; // eg: 1763661276_Resume.pdf

  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
    use_filename: true,
    unique_filename: false,
  };

  // Generate signature - handles sorting & hashing automatically
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
    publicId,
  };
};
