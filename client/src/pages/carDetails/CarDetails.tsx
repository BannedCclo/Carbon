import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./CarDetails.module.css";
import ContactModal from "./components/ContactModal";
import { TopBar } from "../../components/nav/TopBar";

type Carro = {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  rodagem_km: number;
  cor: string;
  cambio: string;
  combustivel: string;
  potencia_cv: number;
  descricao: string;
  categoria: string;
  imagens?: { id: number; imagem_base64: string }[];
};

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [carro, setCarro] = useState<Carro | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchCarro = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/carros/${id}`);
        if (!response.ok) throw new Error("Carro não encontrado");
        const data = await response.json();
        setCarro(data);
      } catch (error) {
        console.error("Erro ao buscar carro:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCarro();
    }
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className={styles.carDetailsContainer}>
        <div className={styles.loaderContainer}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (!carro) {
    return (
      <div className={styles.carDetailsContainer}>
        <div className={styles.notFound}>
          <h2>Veículo não encontrado</h2>
          <Link to="/shop" className={styles.backButton}>
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carDetailsContainer}>
      <TopBar />
      <header className={styles.detailsHeader}>
        <div className={styles.headerContent}>
          <Link to="/shop" className={styles.backButtonAction}>
            <i className="fa-solid fa-arrow-left"></i> Voltar
          </Link>
          <div className={styles.titleSection}>
            <h1>
              {carro.marca} <span>{carro.modelo}</span>
            </h1>
            <span className={styles.categoryBadge}>{carro.categoria}</span>
          </div>
        </div>
      </header>

      <main className={styles.detailsLayout}>
        <section className={styles.gallerySection}>
          <div
            className={`${styles.mainImageWrapper} ${carro.imagens && carro.imagens.length > 0 ? styles.clickable : ""}`}
            onClick={() => {
              if (carro.imagens && carro.imagens.length > 0) {
                setIsFullscreen(true);
              }
            }}
          >
            {carro.imagens && carro.imagens.length > 0 ? (
              <img
                src={carro.imagens[mainImageIndex].imagem_base64}
                alt={`${carro.marca} ${carro.modelo}`}
                className={styles.mainImage}
              />
            ) : (
              <div className={styles.placeholderImage}>
                <i className="fa-solid fa-car-side"></i>
              </div>
            )}
          </div>
          {carro.imagens && carro.imagens.length > 1 && (
            <div className={styles.thumbnails}>
              {carro.imagens.map((img, idx) => (
                <div
                  key={img.id}
                  className={`${styles.thumbnailWrapper} ${idx === mainImageIndex ? styles.activeThumbnail : ""}`}
                  onClick={() => setMainImageIndex(idx)}
                >
                  <img
                    src={img.imagem_base64}
                    alt={`Thumbnail ${idx + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className={styles.infoSection}>
          <div className={styles.priceCard}>
            <p className={styles.priceLabel}>Valor do veículo</p>
            <p className={styles.priceValue}>{formatCurrency(carro.preco)}</p>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className={styles.buyBtn}
            >
              Entrar em contato <i className="fa-regular fa-envelope"></i>
            </button>
          </div>

          <div className={styles.specsCard}>
            <h3>Especificações</h3>
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>
                  <i className="fa-solid fa-calendar"></i>
                </span>
                <div>
                  <span className={styles.specTitle}>Ano</span>
                  <span className={styles.specValue}>{carro.ano}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>
                  <i className="fa-solid fa-gauge"></i>
                </span>
                <div>
                  <span className={styles.specTitle}>Quilometragem</span>
                  <span className={styles.specValue}>
                    {carro.rodagem_km.toLocaleString()} km
                  </span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>
                  <i className="fa-solid fa-gas-pump"></i>
                </span>
                <div>
                  <span className={styles.specTitle}>Combustível</span>
                  <span className={styles.specValue}>{carro.combustivel}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>
                  <i className="fa-solid fa-gear"></i>
                </span>
                <div>
                  <span className={styles.specTitle}>Câmbio</span>
                  <span className={styles.specValue}>{carro.cambio}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>
                  <i className="fa-solid fa-palette"></i>
                </span>
                <div>
                  <span className={styles.specTitle}>Cor</span>
                  <span className={styles.specValue}>{carro.cor}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>
                  <i className="fa-solid fa-bolt"></i>
                </span>
                <div>
                  <span className={styles.specTitle}>Potência</span>
                  <span className={styles.specValue}>
                    {carro.potencia_cv} cv
                  </span>
                </div>
              </div>
            </div>
          </div>

          {carro.descricao && (
            <div className={styles.descCard}>
              <h3>Sobre o veículo</h3>
              <p>{carro.descricao}</p>
            </div>
          )}
        </aside>
      </main>

      {/* Fullscreen Image Overlay */}
      {isFullscreen && carro.imagens && carro.imagens.length > 0 && (
        <div
          className={styles.fullscreenOverlay}
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className={styles.closeFullscreenBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(false);
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <img
            src={carro.imagens[mainImageIndex].imagem_base64}
            alt={`${carro.marca} ${carro.modelo} - Fullscreen`}
            className={styles.fullscreenImage}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Optional: Add navigation buttons for fullscreen mode if there are multiple images */}
          {carro.imagens.length > 1 && (
            <div
              className={styles.fullscreenNav}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.fullscreenNavBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setMainImageIndex((prev) =>
                    prev > 0 ? prev - 1 : carro.imagens!.length - 1,
                  );
                }}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <div className={styles.fullscreenDots}>
                {carro.imagens.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.dot} ${idx === mainImageIndex ? styles.activeDot : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMainImageIndex(idx);
                    }}
                  />
                ))}
              </div>
              <button
                className={styles.fullscreenNavBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setMainImageIndex((prev) =>
                    prev < carro.imagens!.length - 1 ? prev + 1 : 0,
                  );
                }}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && carro && (
        <ContactModal
          carroMarca={carro.marca}
          carroModelo={carro.modelo}
          carroId={carro.id}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CarDetails;
