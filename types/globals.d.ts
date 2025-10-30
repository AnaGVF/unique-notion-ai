import { User } from "@clerk/nextjs/server";

declare global {
  interface CustomJwtSessionClaims {
    email?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    [key: string]: any;
  }
}