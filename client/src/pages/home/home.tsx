import styles from "./home.module.css";
import { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import textLogoBigWhite from "../../assets/img/textLogoBigWhite.png";
import FerrariLogo from "../../assets/svg/ferrarilogo.svg";
import carSvg from "../../assets/svg/car.svg";
import { jwtDecode } from "jwt-decode";
import Footer from "../../components/footer/footer";
import { MobileNav } from "../../components/nav/MobileNav";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/api";

const HERO_VIDEO_SRC = "/ferrari-812-superfast.mp4";
const HERO_POSTER_SRC = "/ferrari-812-poster.jpg";
const HERO_TITLE_FALLBACK = "Ferrari 812 Superfast";

type Carro = {
  id: number;
  marca: string;
  modelo: string;
  descricao: string;
  destaque?: boolean;
  hero?: boolean;
  hero_imagem_base64?: string | null;
  imagens?: { id: number; imagem_base64: string }[];
};

const Home = () => {
  const navigate = useNavigate();
  const [carros, setCarros] = useState<Carro[]>([]);
  const [carrosLoaded, setCarrosLoaded] = useState(false);

  useEffect(() => {
    const fetchCarros = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/carros`);
        const data = await response.json();
        setCarros(data);
      } catch (error) {
        console.error("Erro ao buscar carros em destaque:", error);
      } finally {
        setCarrosLoaded(true);
      }
    };
    fetchCarros();
  }, []);

  const heroCarro = carros.find((c) => c.hero) || null;
  const heroTitulo = heroCarro
    ? `${heroCarro.marca} ${heroCarro.modelo}`
    : HERO_TITLE_FALLBACK;
  const heroPoster = heroCarro?.hero_imagem_base64 || HERO_POSTER_SRC;

  const destaques = carros
    .filter((c) => c.destaque)
    .map((c) => {
      const imagem = c.imagens?.[0]?.imagem_base64 || "";
      return {
        id: c.id,
        marca: c.marca,
        modelo: c.modelo,
        desc: c.descricao,
        bg: imagem,
        card: imagem,
        float: imagem,
      };
    });

  const [active, setActive] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const token = localStorage.getItem("token");
  const [cards, setCards] = useState<
    { card: string; id: number; float: string }[]
  >([]);
  const [banner, setBanner] = useState<string[]>([]);

  useEffect(() => {
    setCards(
      destaques.map((item) => ({
        card: item.card,
        id: item.id,
        float: item.float,
      })),
    );
    setBanner(destaques.map((item) => item.bg));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrosLoaded]);

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
    if (animating || cards.length === 0) return;

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

  function test() {
    if (token) {
      const data = jwtDecode(token);
      console.log(data);
    }
  }

  function toggleAside() {
    setActive((prev) => !prev);
  }

  function closeAside() {
    setActive(false);
    toggleButtonRef.current?.focus();
  }

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <div className={styles.bgWrapper}>
        <MobileNav active={active} onClose={closeAside} />
        <section id={styles.new}>
          {isDesktop ? (
            <video
              className={styles.heroMedia}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              poster={heroPoster}
            >
              <source src={HERO_VIDEO_SRC} />
            </video>
          ) : (
            <img
              className={styles.heroMedia}
              src={heroPoster}
              alt=""
              loading="eager"
              fetchPriority="high"
            />
          )}
          <header>
            <button
              ref={toggleButtonRef}
              type="button"
              className={`${styles.toggleAsideBtn} ${
                active ? styles.active : ""
              } ${buttonDark ? styles.dark : ""}`}
              onClick={toggleAside}
              aria-label={active ? "Fechar menu" : "Abrir menu"}
              aria-expanded={active}
            >
              <i className={active ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
            </button>
            <img src={textLogoBigWhite} alt="" />
          </header>
          <div id={styles.newTitle} className={styles.scrollOuter}>
            <h1>{heroTitulo}</h1>
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
        {cards.length > 0 && (
        <section
          id={styles.highlights}
          className={animating ? styles[animating] : ""}
        >
          <h1>Destaques</h1>
          <div id={styles.info}>
            <h1>
              {animating != "prev"
                ? `${destaques.find((item) => item.id === cards[0]?.id)?.marca}`
                : `${destaques.find((item) => item.id === cards[1]?.id)?.marca}`}
            </h1>
            <h2>
              {animating != "prev"
                ? `${destaques.find((item) => item.id === cards[0]?.id)?.modelo}`
                : `${
                    destaques.find((item) => item.id === cards[1]?.id)?.modelo
                  }`}
            </h2>
            <p>
              {animating != "prev"
                ? `${destaques.find((item) => item.id === cards[0]?.id)?.desc}`
                : `${destaques.find((item) => item.id === cards[1]?.id)?.desc}`}
            </p>
          </div>
          <div id={styles.floatCar}>
            <img
              src={
                animating != "prev"
                  ? `${
                      destaques.find((item) => item.id === cards[0]?.id)?.float
                    }`
                  : `${
                      destaques.find((item) => item.id === cards[1]?.id)?.float
                    }`
              }
              alt=""
            />
          </div>
          {banner.filter(Boolean).map((src, index) => (
            <img src={src} alt={`Carro ${index}`} id={styles.bgImg} key={index} />
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
            {cards.filter(Boolean).map((item, index) => (
              <div key={index} className={styles.item}>
                <img src={item?.card} alt={`Carro ${index}`} />
              </div>
            ))}
          </div>
        </section>
        )}
        <Footer />
        <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
      </div>
    </>
  );
};

export default Home;
