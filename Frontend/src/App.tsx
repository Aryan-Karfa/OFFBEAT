import React, { useEffect } from "react";
import { useAppStore } from "./stores/useAppStore";
import { ApiClient } from "./services/api";
import { AppRoutes } from "./routes/AppRoutes";

export const App: React.FC = () => {
  const { setSystemStatus, initialize } = useAppStore();

  useEffect(() => {
    initialize();
    setSystemStatus("checking");

    ApiClient.checkHealth()
      .then((res) => {
        if (res.data?.status === "ok") {
          setSystemStatus("connected");
        } else {
          setSystemStatus("error");
        }
      })
      .catch(() => {
        setSystemStatus("idle");
      });
  }, [initialize, setSystemStatus]);

  return <AppRoutes />;
};
