import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "username must be 2 characters long")
  .max(20, "username must not exceed 20 character length")
  .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special characters");

export const signUpSchema=z.object({
    username:usernameValidation,
    email:z.string().email({message:"Invalid email address"}),
    password:z.string().min(6,{message:"password must be atleast 6 characters"})
})
