import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      level: string;
      score: number;
      avatar?: string;
    } & DefaultSession["user"];
  }
}
