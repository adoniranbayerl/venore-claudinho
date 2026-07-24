export type AuthenticatedUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

export type UserRegistrationStatus = "pending" | "approved";
