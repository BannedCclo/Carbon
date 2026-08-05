import React, { useState, useEffect } from "react";
import styles from "./EstoqueList.module.css";
import AddCarModal from "./AddCarModal.tsx";
import CarDetailsModal from "./CarDetailsModal.tsx";
import { API_BASE_URL } from "../../../services/api";

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
  destaque?: boolean;
  hero?: boolean;
};

const EstoqueList: React.FC = () => {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Carro | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCarros = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/carros`);
      const data = await response.json();
      setCarros(data);
    } catch (error) {
      console.error("Erro ao buscar carros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarros();
  }, []);

  const filteredCarros = carros
    .filter((carro) => {
      const term = searchTerm.toLowerCase();
      return (
        carro.id.toString().includes(term) ||
        carro.marca.toLowerCase().includes(term) ||
        carro.modelo.toLowerCase().includes(term) ||
        carro.categoria.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => b.preco - a.preco);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className={styles.estoqueContainer}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <h2>Estoque de Veículos</h2>
          <button
            className={styles.addBtn}
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="fa-solid fa-plus"></i> Adicionar Carro
          </button>
        </div>
        <div className={styles.searchContainer}>
          <i className={`fa-solid fa-search ${styles.searchIcon}`}></i>
          <input
            type="text"
            placeholder="Buscar por ID, Marca, Modelo ou Categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <p>Carregando estoque...</p>
      ) : (
        <div className={styles.carsGrid}>
          {filteredCarros.length === 0 ? (
            <p className={styles.noResults}>Nenhum carro encontrado.</p>
          ) : (
            filteredCarros.map((carro) => (
              <div
                key={carro.id}
                className={styles.carCard}
                onClick={() => setSelectedCar(carro)}
              >
                {/* Imagem do Carro */}
                <div className={styles.carImageContainer}>
                  {carro.imagens && carro.imagens.length > 0 ? (
                    <img
                      src={carro.imagens[0].imagem_base64}
                      alt={`${carro.marca} ${carro.modelo}`}
                      className={styles.carImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.noImagePlaceholder}>
                      <i className="fa-solid fa-car"></i>
                      <span>Sem Imagem</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <span className={styles.carId}>ID: {carro.id}</span>
                    <div className={styles.badgeGroup}>
                      {carro.destaque && (
                        <span className={styles.carCategory}>Destaque</span>
                      )}
                      {carro.hero && (
                        <span className={styles.carCategory}>Hero</span>
                      )}
                      <span className={styles.carCategory}>
                        {carro.categoria.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <h3 className={styles.carTitle}>
                    {carro.marca} {carro.modelo}
                  </h3>
                  <div className={styles.carDetails}>
                    <p>
                      <i className="fa-solid fa-calendar"></i> {carro.ano}
                    </p>
                    <p>
                      <i className="fa-solid fa-gauge"></i> {carro.rodagem_km}{" "}
                      km
                    </p>
                    <p>
                      <i className="fa-solid fa-droplet"></i> {carro.cor}
                    </p>
                  </div>
                  <h4 className={styles.carPrice}>
                    {formatCurrency(carro.preco)}
                  </h4>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isAddModalOpen && (
        <AddCarModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchCarros}
        />
      )}

      {selectedCar && (
        <CarDetailsModal
          carro={selectedCar}
          onClose={() => setSelectedCar(null)}
          onUpdate={fetchCarros}
        />
      )}
    </div>
  );
};

export default EstoqueList;
