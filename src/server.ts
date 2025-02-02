import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { errorLogger, logger } from "./app/utils/logger";

async function main() {
  try {
    await mongoose.connect(config.db_url as string);
    logger.info("✅ Connected to MongoDB successfully.");

    app.listen(config.port, () => {
      logger.info(`🚀 PH Reel Server is running on port ${config.port}`);
    });
  } catch (error) {
    errorLogger.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function shutdown() {
  logger.info("🛑 Server shutting down gracefully...");
  await mongoose.disconnect();
  process.exit(0);
}

main();
