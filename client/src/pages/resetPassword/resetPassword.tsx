import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../../services/api";
import styles from "./resetPassword.module.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token || !id) {
      toast.error("Link de redefinição inválido ou expirado.");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [token, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const promise = api.post("/users/confirm-password-change", {
        id,
        code: token,
        newPassword: newPassword,
      });

      await toast.promise(promise, {
        loading: "Redefinindo senha...",
        success: "Senha redefinida com sucesso!",
        error: (err) =>
          `Erro: ${err.response?.data?.erro || "tente novamente."}`,
      });

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        {!isSuccess ? (
          <>
            <h1 className={styles.title}>Redefinir Senha</h1>
            <p className={styles.description}>
              Digite sua nova senha abaixo para acessar sua conta.
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputWrapper}>
                <label>Nova Senha</label>
                <input
                  type="password"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputWrapper}>
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !token || !id}
              >
                {isSubmitting ? "Salvando..." : "Redefinir Senha"}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>Senha Atualizada!</h2>
            <p className={styles.successText}>
              Sua senha foi redefinida com sucesso.
            </p>
            <Link to="/login" className={styles.loginLink}>
              Fazer Login
            </Link>
          </div>
        )}
      </div>
      <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
    </div>
  );
};

export default ResetPassword;
