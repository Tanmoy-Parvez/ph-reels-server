import { Client } from "minio";
import config from "../config";

const minioClient = new Client({
  endPoint: config.minio_endpoint || "localhost",
  port: Number(config.minio_port) || 9000,
  useSSL: config.minio_use_ssl === "true",
  accessKey: config.minio_access_key || "minioadmin",
  secretKey: config.minio_secret_key || "minioadmin",
});

export const bucketName = "videos";

(async () => {
  const exists = await minioClient.bucketExists(bucketName).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    console.log(`Bucket "${bucketName}" created.`);
  }
})();

export default minioClient;
