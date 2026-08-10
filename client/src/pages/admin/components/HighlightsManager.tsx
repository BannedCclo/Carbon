import React, { useState, useEffect } from "react";
import gridStyles from "./EstoqueList.module.css";
import styles from "./HomeCuration.module.css";
import { API_BASE_URL } from "../../../services/api";
import toast from "react-hot-toast";

type Carro = {
  id: number;
  marca: string;
  modelo: string;
  preco: number;
  categoria: string;
  destaque?: boolean;
  imagens?: { id: number; imagem_base64: string }[];
};

const HighlightsManager: React.FC = () => {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

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

  const toggleDestaque = async (carro: Carro) => {
    const proximoValor = !carro.destaque;
    setSavingId(carro.id);
    try {
      const response = await fetch(`${API_BASE_URL}/carros/${carro.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destaque: proximoValor }),
      });
      if (response.ok) {
        setCarros((prev) =>
          prev.map((c) =>
            c.id === carro.id ? { ...c, destaque: proximoValor } : c,
          ),
        );
        toast.success(
          proximoValor ? "Adicionado aos Destaques" : "Removido dos Destaques",
        );
      } else {
        toast.error("Erro ao atualizar destaque");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão ao salvar");
    } finally {
      setSavingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const filteredCarros = carros.filter((carro) => {
    const term = searchTerm.toLowerCase();
    return (
      carro.marca.toLowerCase().includes(term) ||
      carro.modelo.toLowerCase().includes(term)
    );
  });

  const destaquesCount = carros.filter((c) => c.destaque).length;

  return (
    <div className={gridStyles.estoqueContainer}>
      <div className={gridStyles.headerRow}>
        <div className={gridStyles.headerLeft}>
          <h2>Destaques da Home ({destaquesCount})</h2>
        </div>
        <div className={gridStyles.searchContainer}>
          <i className={`fa-solid fa-search ${gridStyles.searchIcon}`}></i>
          <input
            type="text"
            placeholder="Buscar por Marca ou Modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={gridStyles.searchInput}
          />
        </div>
      </div>

      <p className={styles.helperText}>
        Selecione quais carros aparecem no carrossel "Destaques" da home.
        Alguns modelos têm arte original própria; os demais usam a primeira
        foto cadastrada no próprio anúncio.
      </p>

      {loading ? (
        <p>Carregando estoque...</p>
      ) : (
        <div className={gridStyles.carsGrid}>
          {filteredCarros.length === 0 ? (
            <p className={gridStyles.noResults}>Nenhum carro encontrado.</p>
          ) : (
            filteredCarros.map((carro) => (
              <div
                key={carro.id}
                className={`${gridStyles.carCard} ${carro.destaque ? styles.selectedCard : ""}`}
              >
                <div className={gridStyles.carImageContainer}>
                  {carro.imagens && carro.imagens.length > 0 ? (
                    <img
                      src={carro.imagens[0].imagem_base64}
                      alt={`${carro.marca} ${carro.modelo}`}
                      className={gridStyles.carImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={gridStyles.noImagePlaceholder}>
                      <i className="fa-solid fa-car"></i>
                      <span>Sem Imagem</span>
                    </div>
                  )}
                </div>

                <div className={gridStyles.cardContent}>
                  <div className={gridStyles.cardHeader}>
                    <span className={gridStyles.carId}>ID: {carro.id}</span>
                    <span className={gridStyles.carCategory}>
                      {carro.categoria.toUpperCase()}
                    </span>
                  </div>
                  <h3 className={gridStyles.carTitle}>
                    {carro.marca} {carro.modelo}
                  </h3>
                  <h4 className={gridStyles.carPrice}>
                    {formatCurrency(carro.preco)}
                  </h4>
                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={!!carro.destaque}
                      disabled={savingId === carro.id}
                      onChange={() => toggleDestaque(carro)}
                    />
                    {carro.destaque ? "Nos Destaques" : "Adicionar aos Destaques"}
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HighlightsManager;
