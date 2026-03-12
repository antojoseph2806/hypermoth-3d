export type AppUserRole = "admin" | "user";

export type AppUser = {
  id: string;
  email: string;
  name?: string;
  role: AppUserRole;
};

type AuthPayload = {
  access_token: string;
  user: AppUser;
};

export const getStoredUser = (): AppUser | null => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as Partial<AppUser>;

    if (!parsed.id || !parsed.email) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name || "",
      role: parsed.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
};

export const storeAuthSession = ({ access_token, user }: AuthPayload) => {
  localStorage.setItem("token", access_token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAdminUser = (user: AppUser | null) => user?.role === "admin";
