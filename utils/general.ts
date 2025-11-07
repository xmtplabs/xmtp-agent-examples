import { existsSync } from "fs";

export function loadEnvFile() {
  // Only do this in the gm example because it's called from the root
  if (existsSync(".env")) {
    process.loadEnvFile(".env");
  } else if (existsSync(`../../.env`)) {
    process.loadEnvFile(`../../.env`);
  }
}
