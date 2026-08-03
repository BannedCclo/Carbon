import React, { useState } from "react";
import styles from "./CarDetailsModal.module.css";
import toast from "react-hot-toast";
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
};

type CarDetailsModalProps = {
  carro: Carro;
  onClose: () => void;
  onUpdate: () => void;
};

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({
  carro,
  onClose,
  onUpdate,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Edit states
  const [marca, setMarca] = useState(carro.marca);
  const [modelo, setModelo] = useState(carro.modelo);
  const [ano, setAno] = useState(carro.ano.toString());
  const [preco, setPreco] = useState(carro.preco.toString());
  const [rodagem_km, setRodagemKm] = useState(carro.rodagem_km.toString());
  const [cor, setCor] = useState(carro.cor);
  const [cambio, setCambio] = useState(carro.cambio);
  const [combustivel, setCombustivel] = useState(carro.combustivel);
  const [potencia_cv, setPotenciaCv] = useState(carro.potencia_cv.toString());
  const [descricao, setDescricao] = useState(carro.descricao);
  const [categoria, setCategoria] = useState(carro.categoria);
  const [imagens, setImagens] = useState<string[]>(
    carro.imagens ? carro.imagens.map((img) => img.imagem_base64) : [],
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagens((prev) => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImagens((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o ${carro.marca} ${carro.modelo}? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/carros/${carro.id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        toast.success("Carro removido com sucesso!");
        onUpdate();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(
          `Erro ao remover: ${errorData.erro || "Falha na comunicação"}`,
        );
      }
    } catch (error) {
      console.error("Erro ao deletar carro:", error);
      toast.error("Ocorreu um erro ao tenta remover o carro.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marca || !modelo || !ano || !preco || !rodagem_km || !categoria) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsSaving(true);
    const updatedCar = {
      marca,
      modelo,
      ano: parseInt(ano),
      preco: parseFloat(preco),
      rodagem_km: parseInt(rodagem_km),
      cor: cor || "Não especificada",
      cambio: cambio || "Não especificado",
      combustivel: combustivel || "Não especificado",
      potencia_cv: parseInt(potencia_cv) || 0,
      descricao,
      categoria,
      imagensBase64: imagens,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/carros/${carro.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCar),
        },
      );

      if (response.ok) {
        toast.success("Carro atualizado com sucesso!");
        onUpdate();
        setIsEditing(false);
      } else {
        toast.error("Erro ao atualizar o carro.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {isEditing ? "Editando Veículo" : "Detalhes do Veículo"}{" "}
            <span className={styles.carIdBadge}>ID {carro.id}</span>
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {!isEditing ? (
            <>
              {carro.imagens && carro.imagens.length > 0 ? (
                <div className={styles.imageGallery}>
                  <div className={styles.mainImageContainer}>
                    <img
                      src={
                        carro.imagens[mainImageIndex]?.imagem_base64 ||
                        carro.imagens[0].imagem_base64
                      }
                      alt="Carro principal"
                    />
                  </div>
                  {carro.imagens.length > 1 && (
                    <div className={styles.thumbnails}>
                      {carro.imagens.map((img, idx) => (
                        <div
                          key={idx}
                          className={`${styles.thumbWrapper} ${idx === mainImageIndex ? styles.activeThumb : ""}`}
                          onClick={() => setMainImageIndex(idx)}
                        >
                          <img
                            src={img.imagem_base64}
                            alt={`Miniatura ${idx + 1}`}
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.noImageBanner}>
                  <i className="fa-solid fa-car-side"></i>
                  <p>O veículo não possui imagens cadastradas</p>
                </div>
              )}

              <div className={styles.detailsGrid}>
                <div className={styles.detailRow}>
                  <strong>Marca/Modelo</strong>
                  <span>
                    {carro.marca} {carro.modelo}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Preço</strong>
                  <span className={styles.priceHighlight}>
                    {formatCurrency(carro.preco)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Ano</strong>
                  <span>{carro.ano}</span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Categoria</strong>
                  <span className={styles.categoryBadge}>
                    {carro.categoria.toUpperCase()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Cor</strong>
                  <span>{carro.cor}</span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Rodagem</strong>
                  <span>{carro.rodagem_km.toLocaleString("pt-BR")} km</span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Câmbio</strong>
                  <span>{carro.cambio}</span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Combustível</strong>
                  <span>{carro.combustivel}</span>
                </div>
                <div className={styles.detailRow}>
                  <strong>Potência</strong>
                  <span>{carro.potencia_cv} cv</span>
                </div>
              </div>

              <div className={styles.descriptionSection}>
                <strong>Descrição</strong>
                <p>{carro.descricao}</p>
              </div>
            </>
          ) : (
            <form
              id="edit-car-form"
              onSubmit={handleSaveEdit}
              className={styles.editForm}
            >
              <div className={styles.inputGrid}>
                <div className={styles.inputWrapper}>
                  <label>Marca *</label>
                  <input
                    type="text"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Modelo *</label>
                  <input
                    type="text"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Ano *</label>
                  <input
                    type="number"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Preço *</label>
                  <input
                    type="number"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    step="0.01"
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Rodagem (km) *</label>
                  <input
                    type="number"
                    value={rodagem_km}
                    onChange={(e) => setRodagemKm(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="sport">Sport</option>
                    <option value="suv">SUV</option>
                    <option value="sedan">Sedan</option>
                  </select>
                </div>
                <div className={styles.inputWrapper}>
                  <label>Cor</label>
                  <input
                    type="text"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Câmbio</label>
                  <input
                    type="text"
                    value={cambio}
                    onChange={(e) => setCambio(e.target.value)}
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Combustível</label>
                  <input
                    type="text"
                    value={combustivel}
                    onChange={(e) => setCombustivel(e.target.value)}
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Potência (cv)</label>
                  <input
                    type="number"
                    value={potencia_cv}
                    onChange={(e) => setPotenciaCv(e.target.value)}
                  />
                </div>
                <div className={`${styles.inputWrapper} ${styles.fullWidth}`}>
                  <label>Descrição</label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className={`${styles.inputWrapper} ${styles.fullWidth}`}>
                  <label>Imagens do Carro</label>
                  <div className={styles.imageUploadContainer}>
                    <input
                      type="file"
                      id="editCarImages"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                    />
                    <label
                      htmlFor="editCarImages"
                      className={`${styles.fileUploadLabel} ${isDragging ? styles.dragActive : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      <span>
                        Clique ou arraste para adicionar novas imagens ou
                        de-selecionar antigas
                      </span>
                    </label>
                  </div>
                  {imagens.length > 0 && (
                    <div className={styles.imagePreviews}>
                      {imagens.map((base64, idx) => (
                        <div key={idx} className={styles.previewCard}>
                          <img src={base64} alt={`Preview ${idx}`} />
                          <button
                            type="button"
                            className={styles.removeImageBtn}
                            onClick={() => removeImage(idx)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        <div className={styles.modalFooter}>
          {!isEditing ? (
            <>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  "Deletando..."
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i> Deletar
                  </>
                )}
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fa-solid fa-pen"></i> Editar
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                >
                  Fechar
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="edit-car-form"
                className={styles.saveBtn}
                disabled={isSaving}
              >
                {isSaving ? (
                  "Salvando..."
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i> Salvar
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal;
