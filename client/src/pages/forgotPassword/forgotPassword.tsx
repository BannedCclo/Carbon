import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import textLogoSmallBlack from "../../assets/img/textLogoSmallBlack.png";
import styles from "./forgotPassword.module.css";
import api from "../../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      toast.error("Digite seu email");
      return;
    }

    setEnviando(true);
    try {
      await api.post("/users/forgot-password", { email });
      setEnviado(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Não existe conta cadastrada com esse email");
      } else {
        toast.error("Erro ao solicitar redefinição de senha");
      }
      console.error("Erro ao solicitar redefinição de senha:", error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div id={styles.bgWrapper}>
      <div id={styles.box}>
        <img src={textLogoSmallBlack} alt="" />
        {enviado ? (
          <>
            <h1>Verifique seu email</h1>
            <p>
              Se existir uma conta com o email <strong>{email}</strong>,
              enviamos um link para redefinir sua senha.
            </p>
            <button type="button" onClick={() => navigate("/login")}>
              Fazer login
            </button>
          </>
        ) : (
          <>
            <h1>Esqueci minha senha</h1>
            <p>Digite seu email para receber um link de redefinição de senha.</p>
            <form onSubmit={handleSubmit} style={{ display: "contents" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
