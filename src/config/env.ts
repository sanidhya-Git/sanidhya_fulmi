import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.resolve(__dirname, "../../.env") });


if (!process.env.JWT_SECRET) {
  console.error(" JWT_SECRET is missing in environment variables");
} else {
  console.log(" Environment variables loaded successfully");
}

export const {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;
