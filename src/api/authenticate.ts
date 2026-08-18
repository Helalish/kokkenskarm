import type { ShopboxLoginResponse } from "@/types/auth";
import { getConfig, getLang, getErrorMessage } from "@/api/client";

/** POST /authenticate/credentials */
export async function authenticateCredentials(
  username: string,
  password: string,
  rememberMe: boolean | null = null
): Promise<ShopboxLoginResponse> {
  const { baseUrl } = getConfig();
  const url = new URL(`${baseUrl}/authenticate/credentials`);
  url.searchParams.set("lang", getLang());

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      remember_me: rememberMe,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getErrorMessage(data, "Unable to sign in with those credentials.");
    throw new Error(message);
  }

  const login = data as Partial<ShopboxLoginResponse>;
  if (!login.accessToken || !login.account?.uid) {
    throw new Error("Shopbox returned an invalid login response.");
  }

  return login as ShopboxLoginResponse;
}
