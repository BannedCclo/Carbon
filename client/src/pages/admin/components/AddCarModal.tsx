import React, { useState } from "react";
import styles from "./AddCarModal.module.css";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../../../services/api";

type AddCarModalProps = {
  onClose: () => void;
  onAdd: () => void;
};

const AddCarModal: React.FC<AddCarModalProps> = ({ onClose, onAdd }) => {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [preco, setPreco] = useState("");
  const [rodagem_km, setRodagemKm] = useState("");
  const [cor, setCor] = useState("");
  const [cambio, setCambio] = useState("");
  const [combustivel, setCombustivel] = useState("");
  const [potencia_cv, setPotenciaCv] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("sport");
  const [imagens, setImagens] = useState<string[]>([]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!marca || !modelo || !ano || !preco || !rodagem_km || !categoria) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const newCar = {
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
      const response = await fetch(`${API_BASE_URL}/carros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCar),
      });

      if (response.ok) {
        toast.success("Carro adicionado com sucesso!");
        setTimeout(() => {
          onAdd();
          onClose();
        }, 1000);
      } else {
        toast.error("Erro ao adicionar carro");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar ao servidor");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Adicionar Novo Carro</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          <form
            id="add-car-form"
            onSubmit={handleSave}
            className={styles.editForm}
          >
            <div className={styles.inputGrid}>
              <div className={styles.inputWrapper}>
                <label>Marca *</label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ex: Porsche"
                  required
                />
              </div>
              <div className={styles.inputWrapper}>
                <label>Modelo *</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: 911 GT3-RS"
                  required
                />
              </div>
              <div className={styles.inputWrapper}>
                <label>Ano *</label>
                <input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  placeholder="Ex: 2024"
                  required
                />
              </div>
              <div className={styles.inputWrapper}>
                <label>Preço *</label>
                <input
                  type="number"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="Ex: 1500000"
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
                  placeholder="Ex: 5000"
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
                  placeholder="Ex: Vermelho"
                />
              </div>
              <div className={styles.inputWrapper}>
                <label>Câmbio</label>
                <input
                  type="text"
                  value={cambio}
                  onChange={(e) => setCambio(e.target.value)}
                  placeholder="Ex: Automático 8 Marchas"
                />
              </div>
              <div className={styles.inputWrapper}>
                <label>Combustível</label>
                <input
                  type="text"
                  value={combustivel}
                  onChange={(e) => setCombustivel(e.target.value)}
                  placeholder="Ex: Gasolina"
                />
              </div>
              <div className={styles.inputWrapper}>
                <label>Potência (cv)</label>
                <input
                  type="number"
                  value={potencia_cv}
                  onChange={(e) => setPotenciaCv(e.target.value)}
                  placeholder="Ex: 600"
                />
              </div>
              <div className={`${styles.inputWrapper} ${styles.fullWidth}`}>
                <label>Descrição</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Pequena descrição ou destaques sobre o carro..."
                  rows={3}
                />
              </div>

              <div className={`${styles.inputWrapper} ${styles.fullWidth}`}>
                <label>Imagens do Carro</label>
                <div className={styles.imageUploadContainer}>
                  <input
                    type="file"
                    id="carImages"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                  <label
                    htmlFor="carImages"
                    className={`${styles.fileUploadLabel} ${isDragging ? styles.dragActive : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>Clique ou arraste as imagens aqui</span>
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
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.saveBtn} type="submit" form="add-car-form">
            Salvar
          </button>
        </div>
      </div>
      <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
    </div>
  );
};

export default AddCarModal;
