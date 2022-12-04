export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      NODE_ENV: "local" | "test" | "prod";
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
    }
  }
}
