import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
import AppRouter from "./routes/Router";

function App() {
  useEffect(() => {
    if (sessionStorage.getItem("logoutToast")) {
      sessionStorage.removeItem("logoutToast");
      toast.success("Você saiu da sua conta");
    }
  }, []);

  return (
    <>
      <AppRouter />
      <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
    </>
  );
}

export default App;
