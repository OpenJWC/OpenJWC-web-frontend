import { useEffect } from "react";
import { setAccessToken } from "./api/client";
import { useAppSelector } from "./store/hooks";
export default function AxiosAuthSync() {
  const { jwt } = useAppSelector((state) => state.auth);
  useEffect(() => {
    setAccessToken(jwt);
  }, [jwt]);
  return null;
}
