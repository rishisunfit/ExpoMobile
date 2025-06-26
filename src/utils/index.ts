import { supabase } from "../../lib/supabase";
import { jwtDecode, JwtPayload } from "jwt-decode";

type CustomJwtType = JwtPayload & {
  user_role: string;
};

export const getUserRole = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const jwt: CustomJwtType = jwtDecode(session.access_token);
  if (!jwt.user_role) {
    throw new Error("User role not found");
  }
  return jwt.user_role;
};
