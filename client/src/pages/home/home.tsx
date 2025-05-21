import styles from "./home.module.css";
import toast, { Toaster } from "react-hot-toast";
import Ferrari812Superfast from "../../assets/video/Ferrari 812 Superfast.mp4";
import textLogoBigWhite from "../../assets/img/textLogoBigWhite.png";
import FerrariLogo from "../../assets/svg/ferrarilogo.svg";

const Home = () => {
  return (
    <>
      <div className={styles.bgWrapper}>
        <section id={styles.new}>
          <video muted loop autoPlay>
            <source src={Ferrari812Superfast} />
          </video>
          <header>
            <img src={textLogoBigWhite} alt="" />
          </header>
          <div id={styles.newTitle}>
            <h1>Ferrari 812 Superfast</h1>
            <button>
              Conheça
              <div>
                <div>
                  <img src={FerrariLogo} alt="" />
                </div>
                <div id={styles.flag}>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
      <Toaster />
    </>
  );
};

export default Home;
