
import styles from "./home.module.css";
import onlyTextWhite from "../../assets/img/onlyTextWhite.png";

const Home = () => {

  return (
    <>
      <div className={styles.bgWrapper}>
        <div id={styles.container}>
          <img src={onlyTextWhite} alt="" />
          <form action="">
            <h1>Faça login:</h1>
            <input type="text" placeholder="Login"/>
            <input type="text" placeholder="Senha"/>
            <button>
              Enviar
            </button>
            <p>Não tem uma conta? <a href="#"> Cadastre-se</a></p>
            <p>Ou <a href="#">explore como visitante</a></p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;
