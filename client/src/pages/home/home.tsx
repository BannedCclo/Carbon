import styles from "./home.module.css";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Ferrari812Superfast from "../../assets/video/Ferrari 812 Superfast.mp4";
import textLogoBigWhite from "../../assets/img/textLogoBigWhite.png";
import FerrariLogo from "../../assets/svg/ferrarilogo.svg";
import Suv from "../../assets/svg/suv.svg";
import Sport from "../../assets/svg/sport.svg";
import Sedan from "../../assets/svg/sedan.svg";
import Loading from "../../components/loading/loading";

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const imagens = Array.from(document.images);
    const videos = Array.from(document.querySelectorAll("video"));

    const promessasImagem = imagens.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve(true);
          else img.onload = img.onerror = () => resolve(true);
        })
    );

    const promessasVideo = videos.map(
      (video) =>
        new Promise((resolve) => {
          if (video.readyState >= 4) resolve(true); // HAVE_ENOUGH_DATA
          else {
            const limpar = () => {
              video.removeEventListener("canplaythrough", limpar);
              video.removeEventListener("error", limpar);
              resolve(true);
            };
            video.addEventListener("canplaythrough", limpar);
            video.addEventListener("error", limpar);
          }
        })
    );

    Promise.all([...promessasImagem, ...promessasVideo]).then(() => {
      setTimeout(() => setLoading(false), 300); // ou direto: setLoading(false)
    });
  }, []);

  return (
    <>
      {loading && <Loading />}
      {!loading && (
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
          <section id={styles.seeTypes}>
            <h1>Conheça as nossas categorias:</h1>
            <div id={styles.buttons}>
              <button>
                <img src={Sedan} alt="" />
                <h2>Sedan</h2>
              </button>
              <button>
                <img src={Sport} alt="" />
                <h2>Sport</h2>
              </button>
              <button>
                <img src={Suv} alt="" />
                <h2>SUV</h2>
              </button>
            </div>
          </section>
          <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
        </div>
      )}
    </>
  );
};

export default Home;
