import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  db_url: process.env.DB_URL,

  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
  },

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  redis_url: process.env.REDIS_URL,

  minio_endpoint: process.env.MINIO_ENDPOINT,
  minio_port: process.env.MINIO_PORT,
  minio_use_ssl: process.env.MINIO_USE_SSL,
  minio_access_key: process.env.MINIO_ACCESS_KEY,
  minio_secret_key: process.env.MINIO_SECRET_KEY,
  minio_public_url: process.env.MINIO_PUBLIC_URL,
};
