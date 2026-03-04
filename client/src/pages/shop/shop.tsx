import React, { useState, useEffect } from "react";
import styles from "./shop.module.css";
import { useMediaLoader } from "../../hooks/useMediaLoader";
import { Link, useSearchParams } from "react-router-dom";

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

const Shop: React.FC = () => {
  const isLoaded = useMediaLoader();
  const [searchParams] = useSearchParams();
  const [carros, setCarros] = useState<Carro[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const initialCategoria = searchParams.get("categoria") || "todos";
  const [categoria, setCategoria] = useState(initialCategoria);
  const [precoMin, setPrecoMin] = useState<string>("");
  const [precoMax, setPrecoMax] = useState<string>("");
  const [anoMin, setAnoMin] = useState<string>("");
  const [anoMax, setAnoMax] = useState<string>("");
  const [kmMax, setKmMax] = useState<string>("200000"); // Standard high cap

  useEffect(() => {
    const fetchEstoque = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/carros");
        const data = await response.json();
        setCarros(data);
      } catch (error) {
        console.error("Erro ao buscar catálogo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEstoque();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const filteredCarros = carros.filter((carro) => {
    // 1. Term Search (Brand or Model)
    const matchTerm =
      carro.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carro.modelo.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category
    const matchCategoria =
      categoria === "todos" || carro.categoria === categoria;

    // 3. Price
    const matchPreco =
      (precoMin === "" || carro.preco >= parseFloat(precoMin)) &&
      (precoMax === "" || carro.preco <= parseFloat(precoMax));

    // 4. Year
    const matchAno =
      (anoMin === "" || carro.ano >= parseInt(anoMin)) &&
      (anoMax === "" || carro.ano <= parseInt(anoMax));

    // 5. Mileage
    const matchKm = carro.rodagem_km <= parseInt(kmMax);

    return matchTerm && matchCategoria && matchPreco && matchAno && matchKm;
  });

  if (!isLoaded) return null; // App global loader takes care of this

  return (
    <div className={styles.shopContainer}>
      <header className={styles.shopHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logoAndTitle}>
            <Link to="/" className={styles.backButton}>
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <h1>O Nosso Catálogo</h1>
          </div>
          <p>Selecione o suprassumo da engenharia e da exclusividade.</p>
        </div>
      </header>

      <div className={styles.shopLayout}>
        {/* Sidebar Filters */}
        <aside className={styles.filterSidebar}>
          <div className={styles.filterGroup}>
            <h3>Pesquisar</h3>
            <div className={styles.searchInputWrapper}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3>Categoria</h3>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={styles.elegantSelect}
            >
              <option value="todos">Todos os Modelos</option>
              <option value="sport">Sport</option>
              <option value="suv">SUV / Utilitários</option>
              <option value="sedan">Sedan Premium</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <h3>Preço (R$)</h3>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                placeholder="Min"
                value={precoMin}
                onChange={(e) => setPrecoMin(e.target.value)}
                title="Preço mínimo"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Máx"
                value={precoMax}
                onChange={(e) => setPrecoMax(e.target.value)}
                title="Preço máximo"
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3>Ano</h3>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                placeholder="De"
                value={anoMin}
                onChange={(e) => setAnoMin(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Ate"
                value={anoMax}
                onChange={(e) => setAnoMax(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3>
              Quilometragem Máxima{" "}
              <span>{parseInt(kmMax).toLocaleString()} km</span>
            </h3>
            <input
              type="range"
              min="0"
              max="200000"
              step="5000"
              value={kmMax}
              onChange={(e) => setKmMax(e.target.value)}
              className={styles.rangeSlider}
            />
          </div>

          <button
            className={styles.clearFiltersBtn}
            onClick={() => {
              setSearchTerm("");
              setCategoria("todos");
              setPrecoMin("");
              setPrecoMax("");
              setAnoMin("");
              setAnoMax("");
              setKmMax("200000");
            }}
          >
            Limpar Filtros
          </button>
        </aside>

        {/* Main Grid */}
        <main className={styles.mainContent}>
          <div className={styles.resultsCount}>
            <span>
              Exibindo <strong>{filteredCarros.length}</strong> veículos
            </span>
          </div>

          {loading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            <div className={styles.carsGrid}>
              {filteredCarros.length > 0 ? (
                filteredCarros.map((carro) => (
                  <div key={carro.id} className={styles.carCard}>
                    <div className={styles.imageWrapper}>
                      {carro.imagens && carro.imagens.length > 0 ? (
                        <img
                          src={carro.imagens[0].imagem_base64}
                          alt={`${carro.marca} ${carro.modelo}`}
                        />
                      ) : (
                        <div className={styles.placeholderImage}>
                          <i className="fa-solid fa-car-side"></i>
                        </div>
                      )}

                      <div className={styles.badgeWrap}>
                        <span className={styles.categoryBadge}>
                          {carro.categoria}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardInfo}>
                      <div className={styles.cardTop}>
                        <h2 className={styles.carTitle}>
                          {carro.marca} <span>{carro.modelo}</span>
                        </h2>
                        <span className={styles.carYear}>{carro.ano}</span>
                      </div>

                      <p className={styles.carPrice}>
                        {formatCurrency(carro.preco)}
                      </p>

                      <div className={styles.carSpecs}>
                        <div className={styles.specItem}>
                          <i className="fa-solid fa-gauge"></i>
                          <span>{carro.rodagem_km.toLocaleString()} km</span>
                        </div>
                        <div className={styles.specItem}>
                          <i className="fa-solid fa-gas-pump"></i>
                          <span>{carro.combustivel}</span>
                        </div>
                        <div className={styles.specItem}>
                          <i className="fa-solid fa-gear"></i>
                          <span>{carro.cambio.split(" ")[0]}</span>
                        </div>
                      </div>

                      <Link to={`/car/${carro.id}`} className={styles.viewBtn}>
                        Ver detalhes <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  <i className="fa-solid fa-magnifying-glass-minus"></i>
                  <p>Nenhum veículo corresponde a esses critérios de busca.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
