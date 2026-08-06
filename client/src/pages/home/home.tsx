import styles from "./home.module.css";
import { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
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
import Footer from "../../components/footer/footer";
import ShopCta from "../../components/footer/shopCta";
import { MobileNav } from "../../components/nav/MobileNav";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/api";

const HERO_VIDEO_SRC = "/ferrari-812-superfast.mp4";
const HERO_VIDEO_SRC_MOBILE = "/ferrari-812-superfast-mobile.mp4";
const HERO_POSTER_SRC = "/ferrari-812-poster.jpg";
const HERO_TITLE_FALLBACK = "Ferrari 812 Superfast";

// Arte original de destaque para os modelos "ícone" do catálogo. Quando um
// carro marcado como destaque bate com uma dessas chaves (marca+modelo,
// normalizado), usamos as imagens/descrição curadas em vez da primeira foto
// cadastrada no anúncio - assim o visual volta a ser o mesmo de antes,
// mas a associação com o carro real do estoque continua existindo.
const CURATED_HIGHLIGHTS: Record<
  string,
  { desc: string; bg: string; card: string; float: string }
> = {
  "porsche|911 gt3-rs": {
    desc: "Um 911 feito para as pistas. Leve, afiado e com alma de corrida. É a Porsche em sua forma mais pura.",
    bg: gt3Bg,
    card: gt3Card,
    float: gt3Float,
  },
  "mclaren|senna": {
    desc: "Criado para honrar uma lenda, o Senna é pista pura. Brutal, leve, sem frescura. Como o próprio Ayrton.",
    bg: sennaBg,
    card: sennaCard,
    float: sennaFloat,
  },
  "pagani|huayra bc": {
    desc: "Uma obra de arte sobre rodas, feita à mão em carbono e emoção. Mais raro que veloz, e ele é muito veloz.",
    bg: huayraBg,
    card: huayraCard,
    float: huayraFloat,
  },
  "lamborghini|aventador svj": {
    desc: "O V12 em sua forma mais selvagem. Aberto ao céu, barulhento por natureza e sem nenhum filtro.",
    bg: svjBg,
    card: svjCard,
    float: svjFloat,
  },
};

function curatedKey(marca: string, modelo: string) {
  return `${marca}|${modelo}`.toLowerCase().trim().replace(/\s+/g, " ");
}

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
    // Sem timeout, uma porta filtrada (ex: firewall bloqueando conexão de
    // outro aparelho na rede) faz o fetch ficar pendurado indefinidamente -
    // nem resolve nem rejeita, então o `finally` nunca roda e carrosLoaded
    // fica false para sempre, travando a tela de loading do hero.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const fetchCarros = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/carros/destaques`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setCarros(data);
      } catch (error) {
        console.error("Erro ao buscar carros em destaque:", error);
      } finally {
        clearTimeout(timeoutId);
        setCarrosLoaded(true);
      }
    };
    fetchCarros();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const heroCarro = carros.find((c) => c.hero) || null;
  const heroTitulo = heroCarro
    ? `${heroCarro.marca} ${heroCarro.modelo}`
    : HERO_TITLE_FALLBACK;
  const heroPoster = heroCarro?.hero_imagem_base64 || HERO_POSTER_SRC;
  // Fotos da loja (não o frame do vídeo) - ficam nítidas, centralizadas, por
  // cima do vídeo desfocado no mobile (ver seção #new abaixo). Todas as fotos
  // cadastradas para o carro em destaque entram no carrossel; sem nenhuma
  // cadastrada, cai no poster estático de sempre.
  const heroImages =
    heroCarro?.imagens && heroCarro.imagens.length > 0
      ? heroCarro.imagens.map((img) => img.imagem_base64)
      : [heroPoster];

  const destaques = carros
    .filter((c) => c.destaque)
    .map((c) => {
      const curada = CURATED_HIGHLIGHTS[curatedKey(c.marca, c.modelo)];
      const imagem = c.imagens?.[0]?.imagem_base64 || "";
      return {
        id: c.id,
        marca: c.marca,
        modelo: c.modelo,
        desc: curada?.desc || c.descricao,
        bg: curada?.bg || imagem,
        card: curada?.card || imagem,
        float: curada?.float || imagem,
      };
    });

  const [heroImageIndex, setHeroImageIndex] = useState(0);
  // Enquanto a primeira foto do carrossel não carrega, o quadro mostra uma
  // loading screen em vez de deixar o frame borrado do vídeo (que já está
  // por baixo, ver .heroBlur) aparecer através dele. Também é preciso
  // esperar `carrosLoaded`: até a API responder, heroImages cai no fallback
  // HERO_POSTER_SRC, que é literalmente um frame estático extraído do
  // próprio vídeo - exibi-lo mais cedo (só porque é local e carrega rápido)
  // reproduziria exatamente o "frame travado" que essa loading screen existe
  // para evitar.
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  useEffect(() => {
    setHeroImageIndex(0);
    setHeroImageLoaded(false);
  }, [heroCarro?.id]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroImages.length]);

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

    // #floatCar só renderiza a imagem do carro ativo no momento - as dos
    // outros destaques nunca chegam a entrar no DOM até você navegar até
    // eles, então o navegador só começa a baixar aquele PNG (pesado) na
    // hora da troca, e por ~2s a imagem antiga continua na tela. Criar um
    // Image() para cada asset força o carregamento/cache adiantado.
    destaques.forEach((item) => {
      [item.bg, item.card, item.float].forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrosLoaded]);

  const [animating, setAnimating] = useState<"next" | "prev" | null>(null);
  const [buttonDark, setBtnDark] = useState(false);
  const timeout = 7000;
  let autoRun = useRef<NodeJS.Timeout | null>(null);
  const finalizeRun = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (finalizeRun.current !== null) {
        clearTimeout(finalizeRun.current);
      }
    };
  }, []);

  // Revela (tira o blur inicial) a seção de destaques quando ela entra na
  // tela. Antes isso era feito com animation-timeline: view(), um recurso
  // CSS ainda experimental e com suporte inconsistente em navegadores
  // mobile - o blur ficava sem terminar de sumir. IntersectionObserver
  // tem suporte universal e não depende do navegador aceitar scroll-driven
  // animations, então funciona igual em qualquer dispositivo.
  const highlightsRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = highlightsRef.current;
    if (!el || revealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [revealed, cards.length]);

  useEffect(() => {
    const whiteSection = document.querySelector(`#${styles.seeTypes}`);
    if (!whiteSection) {
      console.log("erro");
      return;
    }

    let animationFrameId: number;

    // #highlights usa scroll-snap-align: start logo depois desta seção, então
    // o snap trava com rect.bottom rente a 0 - às vezes alguns px acima por
    // arredondamento de subpixel, faixa em que a seção de destaques (fundo
    // escuro) já cobre visualmente o resto da seção branca. Sem tolerância,
    // esse resto "tecnicamente ainda sobrepondo" prendia o ícone na cor
    // escura, ilegível sobre o fundo escuro, até um scroll extra reavaliar.
    const SNAP_TOLERANCE = 16;

    const checkOverlap = () => {
      const rect = whiteSection.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom > SNAP_TOLERANCE) {
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
    if (cards.length <= 1) return;

    const schedule = () => {
      autoRun.current = setTimeout(() => {
        click("next");
      }, timeout);
    };

    const clearAutoRun = () => {
      if (autoRun.current !== null) {
        clearTimeout(autoRun.current);
        autoRun.current = null;
      }
    };

    schedule();

    // Com a aba em segundo plano, esse setTimeout continua contando
    // normalmente (só é jogado para intervalos de ~1s, não pausado), mas
    // o requestAnimationFrame que o click() usava para iniciar a
    // animação fica parado até a aba voltar ao foco - então um avanço
    // automático disparado em background terminava sem nunca ter
    // começado, dessincronizando cards/banner. Por isso pausamos o
    // agendamento enquanto oculto e recomeçamos do zero ao voltar.
    const handleVisibility = () => {
      clearAutoRun();
      if (document.hidden) return;
      setAnimating(null);
      schedule();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearAutoRun();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const click = (type: "next" | "prev") => {
    if (animating || cards.length <= 1 || document.hidden) return;

    // Início e fim da troca agora usam o mesmo mecanismo de timer. Antes
    // o início rodava atrás de um requestAnimationFrame (pausado com a
    // aba em segundo plano) enquanto o fim usava setTimeout (que continua
    // contando em background) - um avanço automático disparado nesse
    // meio tempo terminava a transição sem ela ter começado, corrompendo
    // os arrays de cards/banner. CSS `animation` (keyframes) não precisa
    // do truque de "esperar um frame" que `transition` exigiria, então
    // dá para atualizar o estado direto aqui.
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

    finalizeRun.current = setTimeout(() => {
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
            <>
              <video
                className={styles.heroMedia}
                muted
                loop
                autoPlay
                playsInline
                preload="auto"
                poster={heroPoster}
              >
                <source src={HERO_VIDEO_SRC_MOBILE} />
              </video>
              <div className={styles.heroBlur}></div>
              <div className={styles.heroPosterWrap}>
                {(!carrosLoaded || !heroImageLoaded) && (
                  <div className={styles.heroPosterLoading}>
                    <span className={styles.heroPosterSpinner} />
                  </div>
                )}
                {heroImages.map((src, index) => (
                  <img
                    key={index}
                    className={`${styles.heroPoster} ${
                      index === heroImageIndex ? styles.heroPosterActive : ""
                    }`}
                    src={src}
                    alt=""
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    onLoad={
                      index === 0
                        ? () => setHeroImageLoaded(true)
                        : undefined
                    }
                    onError={
                      // Sem isso, uma foto que falha ao carregar (rede
                      // instável, foto corrompida) nunca dispara onLoad e a
                      // tela de loading fica travada para sempre - melhor
                      // liberar a tela mesmo que a foto não apareça do que
                      // bloquear o hero inteiro indefinidamente.
                      index === 0
                        ? () => setHeroImageLoaded(true)
                        : undefined
                    }
                  />
                ))}
                {heroImages.length > 1 && (
                  <div className={styles.heroPosterDots}>
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`${styles.heroPosterDot} ${
                          index === heroImageIndex ? styles.active : ""
                        }`}
                        aria-label={`Ver foto ${index + 1}`}
                        onClick={() => setHeroImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
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
              <i
                className={active ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
              />
            </button>
            <img src={textLogoBigWhite} alt="" />
          </header>
          <div id={styles.newTitle}>
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
          <h1>Conheça as nossas categorias:</h1>
          <div id={styles.animatedCar}>
            <img src={carSvg} alt="" />
            <div id={styles.roadsContainer}>
              <div className={styles.road}></div>
              <div className={styles.road}></div>
            </div>
          </div>

          <div id={styles.buttons}>
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
            ref={highlightsRef}
            id={styles.highlights}
            className={`${animating ? styles[animating] : ""} ${
              revealed ? styles.revealed : ""
            }`}
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
                        destaques.find((item) => item.id === cards[0]?.id)
                          ?.float
                      }`
                    : `${
                        destaques.find((item) => item.id === cards[1]?.id)
                          ?.float
                      }`
                }
                alt=""
              />
            </div>
            {banner.filter(Boolean).map((src, index) => (
              <img
                src={src}
                alt={`Carro ${index}`}
                id={styles.bgImg}
                key={index}
              />
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
        <Footer logo={<img src={textLogoBigWhite} alt="" />} backgroundColor="#0e0b25">
          <ShopCta />
        </Footer>
        <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
      </div>
    </>
  );
};

export default Home;
