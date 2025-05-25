import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import { useState, useEffect } from "react";
import onlyTextWhite from "../../assets/img/onlyTextWhite.png";
import wallpaper from "../../assets/img/wallpaper2.png";
import api from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const [seePassword, setSeePassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit() {
    if (email && password) {
      api
        .post("/users/login", { email, senha: password })
        .then((response) => {
          console.log(response.data);
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            toast.success("Login realizado com sucesso");
            setTimeout(() => {
              navigate("/");
            }, 1000);
          } else {
            toast.error("Email ou senha inválidos");
          }
        })
        .catch((error) => {
          console.error("Error logging in:", error);
          toast.error("Email ou senha inválidos");
        });
    } else {
      toast.error("Preencha todos os campos");
    }
  }
  return (
    <>
      <div className={styles.bgWrapper}>
        <img src={wallpaper} alt="" />
        <div id={styles.container}>
          <img src={onlyTextWhite} alt="" />
          <form
            action=""
            id={styles.loginForm}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <h1>Faça login:</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <div className={styles.password}>
              <input
                type={seePassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <i
                className={
                  seePassword ? "fa-regular fa-eye" : "fa-regular fa-eye-slash"
                }
                onClick={() => {
                  setSeePassword(!seePassword);
                }}
              ></i>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              Enviar
            </button>
            <p>
              Não tem uma conta?{" "}
              <a
                onClick={() => {
                  navigate("/signup");
                }}
              >
                {" "}
                Cadastre-se
              </a>
            </p>
            <p>
              Ou{" "}
              <a
                onClick={() => {
                  navigate("/");
                }}
              >
                explore como visitante
              </a>
            </p>
          </form>
        </div>
        <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
      </div>
    </>
  );
};

export default Login;
