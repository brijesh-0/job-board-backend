import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "";

export const generatePresignedUrl = async (
  filename: string,
  mimeType: string,
  fileSizeBytes: number,
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> => {
  // Validate file
  if (mimeType !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (fileSizeBytes > maxSize) {
    throw new Error("File size exceeds 5MB limit");
  }

  // Generate unique key
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const key = `resumes/${uniqueId}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  // Generate presigned URL (valid for 15 minutes)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    publicUrl,
    key,
  };
};
