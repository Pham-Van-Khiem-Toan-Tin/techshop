import { useEffect } from "react";
import { fetchMe } from "./features/auth/auth.slice";
import { useAppDispatch } from "./store/hook";

export default function AppBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  console.log("test");
  
  useEffect(() => {
    dispatch(fetchMe()); // ✅ hỏi backend xem có login không
  }, [dispatch]);

  return <>{children}</>;
}
