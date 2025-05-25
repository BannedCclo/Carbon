import styles from "./home.module.css";
import { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import Ferrari812Superfast from "../../assets/video/Ferrari 812 Superfast.mp4";
import textLogoBigWhite from "../../assets/img/textLogoBigWhite.png";
import FerrariLogo from "../../assets/svg/ferrarilogo.svg";
import sennaCard from "../../assets/img/sennaCard.png";
import gt3Card from "../../assets/img/gt3Card.png";
import huayraCard from "../../assets/img/huayraCard.png";
import svjCard from "../../assets/img/svjCard.png";
import sennaBg from "../../assets/img/sennaBg.jpg";
import gt3Bg from "../../assets/img/gt3Bg.jpg";
import huayraBg from "../../assets/img/huayraBg.jpg";
import svjBg from "../../assets/img/svjBg.jpg";
import carSvg from "../../assets/svg/car.svg";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence, motion } from "framer-motion";

const Home = () => {
  const [active, setActive] = useState(false);
  const token = localStorage.getItem("token");
  const [cards, setCards] = useState([gt3Card, sennaCard, huayraCard, svjCard]);
  const [banner, setBanner] = useState([gt3Bg, sennaBg, huayraBg, svjBg]);
  const [animating, setAnimating] = useState<"next" | "prev" | null>(null);
  const timeout = 7000;
  let autoRun = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoRun) {
      clearTimeout(autoRun.current);
      autoRun.current = setTimeout(() => {
        click("next");
      }, timeout);
    }
  }, [cards]);

  const click = (type: "next" | "prev") => {
    if (animating) return;

    requestAnimationFrame(() => {
      setAnimating(type);
      if (type == "prev") {
        setCards((prev) => [
          prev[prev.length - 1],
          ...prev.slice(0, -1),
          prev[prev.length - 1],
        ]);
      }
      if (type == "next") {
        setCards((prev) => [...prev, prev[0]]);
      }
    });

    setTimeout(() => {
      setAnimating(null);
      if (type === "next") {
        setCards((prev) => [...prev.slice(1)]);
        setBanner((prev) => [...prev.slice(1), prev[0]]);
      } else {
        setCards((prev) => [...prev.slice(0, -1)]);
        setBanner((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
      }
    }, 700);
  };

  useEffect(() => {
    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [active]);

  function test() {
    if (token) {
      const data = jwtDecode(token);
      console.log(data);
    }
  }

  function toggleAside() {
    setActive(!active);
  }

  return (
    <>
      <div className={styles.bgWrapper}>
        <AnimatePresence>
          {active && (
            <>
              <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={toggleAside}
              />

              <motion.aside
                className={styles.aside}
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <header></header>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        {/* <section id={styles.new}>
          <video muted loop autoPlay>
            <source src={Ferrari812Superfast} />
          </video>
          <header>
            <button
              className={`${styles.toggleAsideBtn} ${
                active ? styles.active : ""
              }`}
              onClick={toggleAside}
            >
              <i className="fa-solid fa-bars" />
            </button>
            <img src={textLogoBigWhite} alt="" />
          </header>
          <div id={styles.newTitle} className={styles.fadeOuter}>
            <h1>Ferrari 812 Superfast</h1>
            <button onClick={test}>
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
          <h1 className={styles.fadeInner}>Conheça as nossas categorias:</h1>
          <div id={styles.animatedCar} className={styles.fadeInner}>
            <img src={carSvg} alt="" />
            <div id={styles.roadsContainer}>
              <div className={styles.road}></div>
              <div className={styles.road}></div>
            </div>
          </div>

          <div id={styles.buttons} className={styles.fadeInner}>
            <button>Sedan</button>
            <button>Sport</button>
            <button>SUV</button>
          </div>
        </section> */}
        <section
          id={styles.details}
          className={animating ? styles[animating] : ""}
        >
          <div id={styles.info}>
            <h1>MARCA</h1>
            <h2>MODELO</h2>
            <p>
              Descrição muito top sobre o carro em destaque aparecendo na tela
            </p>
          </div>
          {banner.map((src, index) => (
            <img src={src} alt={`Carro ${index}`} id={styles.bgImg} />
          ))}
          <div id={styles.sliderBtns}>
            <button
              onClick={() => {
                click("prev");
              }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button
              onClick={() => {
                click("next");
              }}
            >
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          <div id={styles.slider}>
            {cards.map((src, index) => (
              <div key={index} className={styles.item}>
                <img src={src} alt={`Carro ${index}`} />
              </div>
            ))}
          </div>
        </section>
        <section className={styles.placeholder}></section>
        <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
      </div>
    </>
  );
};

export default Home;
