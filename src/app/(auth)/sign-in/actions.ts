"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth/config";

export interface SignInState {
  error?: string;
}

export async function authenticate(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error; // includes the NEXT_REDIRECT control-flow signal
  }
}
