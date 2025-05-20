import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import { useState } from "react";
import onlyTextWhite from "../../assets/img/onlyTextWhite.png";
import wallpaper from "../../assets/img/wallpaper2.png";

const Login = () => {
  const navigate = useNavigate();

  const [seePassword, setSeePassword] = useState(false);
  return (
    <>
      <div className={styles.bgWrapper}>
        <img src={wallpaper} alt="" />
        <div id={styles.container}>
          <img src={onlyTextWhite} alt="" />
          <form action="" id={styles.loginForm}>
            <h1>Faça login:</h1>
            <input type="text" placeholder="Login" />
            <div className={styles.password}>
              <input
                type={seePassword ? "text" : "password"}
                placeholder="Senha"
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
            <button>Enviar</button>
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
              Ou <a href="#">explore como visitante</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
