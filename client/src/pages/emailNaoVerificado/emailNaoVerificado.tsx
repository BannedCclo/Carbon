import { useSearchParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import textLogoSmallBlack from "../../assets/img/textLogoSmallBlack.png";
import styles from "./emailNaoVerificado.module.css";
import api from "../../services/api";

const EmailNaoVerificado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [enviando, setEnviando] = useState(false);

  const handleEnviarCodigo = async () => {
    if (!email) {
      toast.error("Erro ao carregar email");
      return;
    }

    setEnviando(true);
    try {
      await api.post("/users/resend-verification", { email });
      toast.success("Código de verificação enviado");
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Erro ao enviar código de verificação:", error);
      toast.error("Erro ao enviar código de verificação");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div id={styles.bgWrapper}>
        <div id={styles.box}>
          <img src={textLogoSmallBlack} alt="" />
          <h1>Email não verificado</h1>
          <p>
            A conta <strong>{email}</strong> ainda não foi verificada. Deseja
            verificar agora?
          </p>
          <button onClick={handleEnviarCodigo} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar código de verificação"}
          </button>
        </div>
      </div>
      <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
    </>
  );
};

export default EmailNaoVerificado;
