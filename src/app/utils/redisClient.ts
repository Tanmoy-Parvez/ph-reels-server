import Redis from "ioredis";
import config from "../config";

const redis = new Redis(config.redis_url || "redis://localhost:6379");
export default redis;
