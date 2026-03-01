import React, { useState } from "react";
import styles from "./ContactModal.module.css";

interface ContactModalProps {
  carroMarca: string;
  carroModelo: string;
  carroId: number;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({
  carroMarca,
  carroModelo,
  carroId,
  onClose,
}) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número

    if (value.length > 11) {
      value = value.slice(0, 11); // Limita a 11 dígitos
    }

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`; // Coloca parenteses (DD)
    }

    // Adjusted logic: only apply hyphen if we truly have the numbers for the second half
    // AND if the user is typing, not deleting
    // To handle deletions naturally without complicated cursor tracking,
    // we just format based strictly on current numeric length.
    if (value.length > 10) {
      // This is for XXXXX-XXXX with the space from (XX)
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }

    setTelefone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/contact/purchase-interest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            email,
            telefone,
            mensagem,
            carroMarca,
            carroModelo,
            carroId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao enviar e-mail. Tente novamente mais tarde.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        {isSuccess ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h2>Interesse Enviado!</h2>
            <p>Nossa equipe entrará em contato com você em breve.</p>
          </div>
        ) : (
          <>
            <h2>Entrar em Contato</h2>
            <p className={styles.subtitle}>
              Demonstrando interesse em:{" "}
              <strong>
                {carroMarca} {carroModelo}
              </strong>
            </p>

            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="nome">Nome Completo *</label>
                <div className={styles.inputWrapper}>
                  <i className="fa-regular fa-user"></i>
                  <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">E-mail *</label>
                <div className={styles.inputWrapper}>
                  <i className="fa-regular fa-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="telefone">Telefone / WhatsApp *</label>
                <div className={styles.inputWrapper}>
                  <i className="fa-solid fa-phone"></i>
                  <input
                    type="tel"
                    id="telefone"
                    value={telefone}
                    onChange={handlePhoneChange}
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="mensagem">Mensagem Adicional (Opcional)</label>
                <div className={styles.inputWrapper}>
                  <i
                    className="fa-regular fa-comment-dots"
                    style={{ top: "15px" }}
                  ></i>
                  <textarea
                    id="mensagem"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Gostaria de mais detalhes, agendar uma visita..."
                    rows={4}
                  ></textarea>
                </div>
              </div>

              {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className={styles.spinner}></span>
                ) : (
                  <>
                    Enviar Interesse <i className="fa-solid fa-paper-plane"></i>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
