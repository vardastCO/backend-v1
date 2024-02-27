import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";

config();
const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST"),
  port: configService.get("DB_PORT"),
  username: configService.get("DB_USERNAME"),
  password: configService.get("DB_PASSWORD"),
  database: configService.get("DB_NAME"),
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/src/migrations/*.js"],
  extra: {
    max: 10, // Maximum number of connections in the pool
    min: 2,  // Minimum number of connections in the pool
    connectionTimeoutMillis: 30000, // The maximum time, in milliseconds, that the pool will try to get connection before throwing an error
  },
});
