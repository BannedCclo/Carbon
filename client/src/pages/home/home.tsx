import styles from "./home.module.css";
import { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import Ferrari812Superfast from "../../assets/video/Ferrari 812 Superfast.mp4";
import textLogoBigWhite from "../../assets/img/textLogoBigWhite.png";
import FerrariLogo from "../../assets/svg/ferrarilogo.svg";
import sennaCard from "../../assets/img/sennaCard.png";
import gt3Card from "../../assets/img/gt3Card.png";
import huayraCard from "../../assets/img/huayraCard.png";
import svjCard from "../../assets/img/svjCard.png";
import gt3Float from "../../assets/img/gt3Float.png";
import sennaFloat from "../../assets/img/sennaFloat.png";
import huayraFloat from "../../assets/img/huayraFloat.png";
import svjFloat from "../../assets/img/svjFloat.png";
import sennaBg from "../../assets/img/sennaBg.jpg";
import gt3Bg from "../../assets/img/gt3Bg.jpg";
import huayraBg from "../../assets/img/huayraBg.jpg";
import svjBg from "../../assets/img/svjBg.jpg";
import carSvg from "../../assets/svg/car.svg";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "../../components/footer/footer";
import { AsideLink } from "../../components/asideLink/asideLink";
import { useMediaLoader } from "../../hooks/useMediaLoader";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const destaques = [
    {
      id: 1,
      marca: "Porsche",
      modelo: "911 GT3-RS",
      desc: "Um 911 feito para as pistas. Leve, afiado e com alma de corrida. É a Porsche em sua forma mais pura.",
      bg: gt3Bg,
      card: gt3Card,
      float: gt3Float,
    },
    {
      id: 2,
      marca: "McLaren",
      modelo: "Senna",
      desc: "Criado para honrar uma lenda, o Senna é pista pura. Brutal, leve, sem frescura. Como o próprio Ayrton.",
      bg: sennaBg,
      card: sennaCard,
      float: sennaFloat,
    },
    {
      id: 3,
      marca: "Pagani",
      modelo: "Huayra BC",
      desc: "Uma obra de arte sobre rodas, feita à mão em carbono e emoção. Mais raro que veloz, e ele é muito veloz.",
      bg: huayraBg,
      card: huayraCard,
      float: huayraFloat,
    },
    {
      id: 4,
      marca: "Lamborghini",
      modelo: "Aventador Svj ",
      desc: "O V12 em sua forma mais selvagem. Aberto ao céu, barulhento por natureza e sem nenhum filtro.",
      bg: svjBg,
      card: svjCard,
      float: svjFloat,
    },
  ];
  const [active, setActive] = useState(false);
  const token = localStorage.getItem("token");
  const [cards, setCards] = useState(
    destaques.map((item) => {
      return {
        card: item.card,
        id: item.id,
        float: item.float,
      };
    }),
  );
  const [banner, setBanner] = useState(destaques.map((item) => item.bg));
  const [animating, setAnimating] = useState<"next" | "prev" | null>(null);
  const [buttonDark, setBtnDark] = useState(false);
  const timeout = 7000;
  let autoRun = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const whiteSection = document.querySelector(`#${styles.seeTypes}`);
    if (!whiteSection) {
      console.log("erro");
      return;
    }

    let animationFrameId: number;

    const checkOverlap = () => {
      const rect = whiteSection.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom >= 0) {
        setBtnDark(true);
      } else {
        setBtnDark(false);
      }
      animationFrameId = requestAnimationFrame(checkOverlap);
    };

    animationFrameId = requestAnimationFrame(checkOverlap);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    console.log(cards);
  }, [cards]);

  useEffect(() => {
    if (autoRun) {
      if (autoRun.current !== null) {
        clearTimeout(autoRun.current);
      }
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

  let isAdmin = false;
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken && decodedToken.tipo === "admin") {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  function toggleAside() {
    setActive(!active);
  }

  const allImages = [
    ...destaques.map((d) => d.bg),
    ...destaques.map((d) => d.card),
    ...destaques.map((d) => d.float),
    textLogoBigWhite,
    FerrariLogo,
    carSvg,
  ];

  const isMediaLoaded = useMediaLoader(allImages, [Ferrari812Superfast]);

  if (!isMediaLoaded) return null;

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
                <div className={styles.asideContent}>
                  <AsideLink
                    to={token ? "/profile" : "/login"}
                    iconClass={
                      token
                        ? "fa-solid fa-user"
                        : "fa-solid fa-right-to-bracket"
                    }
                    text={token ? "Perfil" : "Entrar"}
                  />
                  <AsideLink
                    to="/shop"
                    iconClass="fa-solid fa-shop"
                    text="Loja"
                  />
                  {isAdmin && (
                    <AsideLink
                      to="/admin"
                      iconClass="fa-solid fa-lock"
                      text="Admin"
                    />
                  )}
                  {token && (
                    <AsideLink
                      iconClass="fa-solid fa-arrow-right-from-bracket"
                      text="Sair"
                      isLogout={true}
                    />
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <section id={styles.new}>
          <video muted loop autoPlay>
            <source src={Ferrari812Superfast} />
          </video>
          <header>
            <button
              className={`${styles.toggleAsideBtn} ${
                active ? styles.active : ""
              } ${buttonDark ? styles.dark : ""}`}
              onClick={toggleAside}
            >
              <i className="fa-solid fa-bars" />
            </button>
            <img src={textLogoBigWhite} alt="" />
          </header>
          <div id={styles.newTitle} className={styles.scrollOuter}>
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
          <h1 className={styles.scrollInner}>Conheça as nossas categorias:</h1>
          <div id={styles.animatedCar} className={styles.scrollInner}>
            <img src={carSvg} alt="" />
            <div id={styles.roadsContainer}>
              <div className={styles.road}></div>
              <div className={styles.road}></div>
            </div>
          </div>

          <div id={styles.buttons} className={styles.scrollInner}>
            <button onClick={() => navigate("/shop?categoria=sedan")}>
              Sedan
            </button>
            <button onClick={() => navigate("/shop?categoria=sport")}>
              Sport
            </button>
            <button onClick={() => navigate("/shop?categoria=suv")}>SUV</button>
          </div>
        </section>
        <section
          id={styles.highlights}
          className={animating ? styles[animating] : ""}
        >
          <h1>Destaques</h1>
          <div id={styles.info}>
            <h1>
              {animating != "prev"
                ? `${destaques.find((item) => item.id === cards[0].id)?.marca}`
                : `${destaques.find((item) => item.id === cards[1].id)?.marca}`}
            </h1>
            <h2>
              {animating != "prev"
                ? `${destaques.find((item) => item.id === cards[0].id)?.modelo}`
                : `${
                    destaques.find((item) => item.id === cards[1].id)?.modelo
                  }`}
            </h2>
            <p>
              {animating != "prev"
                ? `${destaques.find((item) => item.id === cards[0].id)?.desc}`
                : `${destaques.find((item) => item.id === cards[1].id)?.desc}`}
            </p>
          </div>
          <div id={styles.floatCar}>
            <img
              src={
                animating != "prev"
                  ? `${
                      destaques.find((item) => item.id === cards[0].id)?.float
                    }`
                  : `${
                      destaques.find((item) => item.id === cards[1].id)?.float
                    }`
              }
              alt=""
            />
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
            {cards.map((item, index) => (
              <div key={index} className={styles.item}>
                <img src={item.card} alt={`Carro ${index}`} />
              </div>
            ))}
          </div>
        </section>
        <Footer />
        <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
      </div>
    </>
  );
};

export default Home;
