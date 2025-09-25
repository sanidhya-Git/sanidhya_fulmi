import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    if (process.env.NODE_ENV !== 'production') continue;
    throw new Error(`Missing required env var ${key}`);
  }
}

export {};
