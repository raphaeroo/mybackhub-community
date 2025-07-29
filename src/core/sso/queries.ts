import { SSO_API } from "../api";

export type SSOUser = {
  email: string;
  isEmailVerified: boolean;
  firstName: string;
  lastName: string;
  heightFeet: number | null;
  heightInches: number | null;
  weightLbs: number | null;
  gender: "male" | "female" | null;
  dominantHand: "right" | "left" | null;
  roles: string[];
  createdAt: string;
  id: string;
  subscriptionName: string | null;
  subscriptionType: string | null;
};

enum SSOQueryKeys {
  UserData = "fetchUserData",
}

const ssoFetchUserData = async () => {
  try {
    const { data } = await SSO_API.get<SSOUser>("/users/me");
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch user data"
    );
  }
};

export { SSOQueryKeys, ssoFetchUserData };
