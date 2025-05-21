import { useSearchParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "./verify.module.css";
import { useState, useEffect } from "react";
import textLogoSmallBlack from "../../assets/img/textLogoSmallBlack.png";
import api from "../../services/api";

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);

  const formatarCodigo = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 6);
    return numeros;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (email) {
        const user = await api.get(`/users/${encodeURIComponent(email)}`, {});
        console.log(user.data);
        if (user.data.verificado == true) {
          toast.error((t) => (
            <span>
              Essa conta já está verificada
              <button onClick={() => navigate("/")} id="alertButton">
                Fazer login
              </button>
            </span>
          ));
          return;
        }
        console.log(email, code);
        const response = await api.post("/users/verify", { email, code });
        console.log(response.data);
        toast.success(
          (t) => (
            <span>
              Email verificado com sucesso
              <button onClick={() => navigate("/")} id="alertButton">
                Fazer login
              </button>
            </span>
          ),
          { duration: Infinity }
        );
      } else {
        toast.error("Erro ao carregar email");
      }
    } catch (error) {
      toast.error("Código inválido");
      setInvalid(true);
      console.error("Error verifying code:", error);
    }
  };

  return (
    <>
      <div id={styles.bgWrapper}>
        <form action="" id={styles.verifyForm}>
          <img src={textLogoSmallBlack} alt="" />
          <h1>Verifique o seu Email</h1>
          <p>Digite o código enviado para:</p>
          <strong>{email}</strong>
          <input
            type="text"
            placeholder="Código"
            value={formatarCodigo(code)}
            onChange={(e) => {
              const apenasNumeros = e.target.value.replace(/\D/g, "");
              setCode(apenasNumeros);
            }}
            className={invalid ? styles.invalido : ""}
          />
          <button type="submit" onClick={handleSubmit}>
            Verificar
          </button>
        </form>
      </div>
      <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
    </>
  );
};

export default Verify;
