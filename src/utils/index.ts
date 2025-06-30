import { supabase } from "../../lib/supabase";
import { jwtDecode, JwtPayload } from "jwt-decode";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

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

export const downloadAndSharePdf = async (
  remoteUrl: string,
  fileName: string
) => {
  try {
    const localUri = FileSystem.documentDirectory + fileName;
    const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);

    if (downloadResult.status !== 200) {
      throw new Error("Download failed");
    }

    await Sharing.shareAsync(downloadResult.uri);
  } catch (err) {
    console.error("Download failed:", err);
    throw err;
  }
};
