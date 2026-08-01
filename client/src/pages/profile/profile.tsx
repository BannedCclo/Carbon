import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import styles from "./profile.module.css";
import api from "../../services/api";
import { TopBar } from "../../components/nav/TopBar";

interface UserProfile {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  tipo: string;
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [oldEmailCodeInput, setOldEmailCodeInput] = useState("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState("");

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [cep, setCep] = useState("");

  useEffect(() => {
    if (isEditing) consultarCep(cep);
  }, [cep, isEditing]);

  const consultarCep = async (cep: string) => {
    if (cep.length == 8) {
      await api
        .get(`/cep/${cep}`)
        .then((res) => {
          setEstado(res.data.state);
          setCidade(res.data.city);
          setBairro(res.data.neighborhood);
          setLogradouro(res.data.street);
        })
        .catch(() => {});
    }
  };

  const formatarCep = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);
    if (numeros.length <= 5) return numeros;
    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length === 0) return "";
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 6)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10)
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const openEditModal = () => {
    if (user) {
      setNome(user.nome || "");
      setSobrenome(user.sobrenome || "");
      setTelefone(user.telefone || "");
      if (user.endereco) {
        setEstado(user.endereco.estado || "");
        setCidade(user.endereco.cidade || "");
        setBairro(user.endereco.bairro || "");
        setLogradouro(user.endereco.logradouro || "");
        setNumero(user.endereco.numero || "");
        setCep(user.endereco.cep || "");
      }
      setIsEditing(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !nome ||
      !sobrenome ||
      !telefone ||
      !estado ||
      !cidade ||
      !bairro ||
      !logradouro ||
      !numero ||
      !cep
    ) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const promise = api.put(`/users/id/${user!.id}`, {
        nome,
        sobrenome,
        telefone,
        endereco: {
          estado,
          cidade,
          bairro,
          logradouro,
          numero,
          cep,
        },
      });

      await toast.promise(promise, {
        loading: "Salvando...",
        success: "Perfil atualizado com sucesso!",
        error: (err) =>
          `Erro ao atualizar: ${err.response?.data?.erro || "tente novamente."}`,
      });

      const res = await promise;
      setUser(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput) {
      toast.error("Preencha o novo e-mail.");
      return;
    }
    if (newEmailInput === user?.email) {
      toast.error("O novo e-mail deve ser diferente do atual.");
      return;
    }

    try {
      const promise = api.post("/users/request-email-change", { id: user!.id });
      await toast.promise(promise, {
        loading: "Enviando código...",
        success: "Código enviado para o e-mail atual!",
        error: (err) =>
          `Erro: ${err.response?.data?.erro || "tente novamente."}`,
      });
      setEmailStep(2);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldEmailCodeInput) {
      toast.error("Preencha o código de verificação.");
      return;
    }

    try {
      const promise = api.post("/users/confirm-email-change", {
        id: user!.id,
        code: oldEmailCodeInput,
        newEmail: newEmailInput,
      });
      await toast.promise(promise, {
        loading: "Confirmando...",
        success: "E-mail alterado com sucesso! Verifique o novo e-mail.",
        error: (err) =>
          `Erro: ${err.response?.data?.erro || "tente novamente."}`,
      });

      setIsEmailModalOpen(false);
      localStorage.removeItem("token");
      navigate(`/verify?email=${encodeURIComponent(newEmailInput)}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promise = api.post("/users/request-password-change", {
        id: user!.id,
      });
      await toast.promise(promise, {
        loading: "Enviando link...",
        success: "Link de redefinição enviado para o seu e-mail!",
        error: (err) =>
          `Erro: ${err.response?.data?.erro || "tente novamente."}`,
      });
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePasswordInput) {
      toast.error("Por favor, digite sua senha para confirmar a exclusão.");
      return;
    }

    try {
      const promise = api.delete(`/users/id/${user!.id}`, {
        data: { senha: deletePasswordInput },
      });
      await toast.promise(promise, {
        loading: "Deletando conta...",
        success: "Conta deletada com sucesso.",
        error: (err) =>
          `Erro: ${err.response?.data?.erro || "tente novamente."}`,
      });
      handleLogout();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      setUser(decoded);

      api
        .get(`/users/id/${decoded.id}`)
        .then((response) => {
          setUser(response.data);
        })
        .catch((err) => {
          console.error("Error fetching full profile data", err);
        });
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className={styles.pageContainer}>
      <TopBar />
      <main className={styles.mainContent}>
        <div className={styles.dashboardContainer}>
          <div className={styles.profileTitle}>
            <h1>Meu Perfil</h1>
          </div>
          <div className={styles.leftColumn}>
            <div className={styles.userSummary}>
              <h2>
                {user.nome} {user.sobrenome || ""}
              </h2>
              <span className={styles.roleBadge}>
                {user.tipo === "admin" ? "Administrador" : "Cliente"}
              </span>
            </div>
            <div className={styles.optionsList}>
              <Link to="/" className={styles.optionBtnLink}>
                <i className="fa-solid fa-arrow-left"></i> Voltar
              </Link>
              <button className={styles.optionBtn} onClick={openEditModal}>
                <i className="fa-solid fa-pen"></i> Editar Perfil
              </button>
              <button
                className={styles.optionBtn}
                onClick={() => {
                  setIsEmailModalOpen(true);
                  setEmailStep(1);
                  setNewEmailInput("");
                  setOldEmailCodeInput("");
                }}
              >
                <i className="fa-solid fa-at"></i> Alterar Email
              </button>
              <button
                className={styles.optionBtn}
                onClick={() => {
                  setIsPasswordModalOpen(true);
                }}
              >
                <i className="fa-solid fa-lock"></i> Alterar Senha
              </button>
              <button
                className={`${styles.optionBtn} ${styles.red}`}
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket"></i> Sair da Conta
              </button>
              <button
                className={`${styles.optionBtn} ${styles.red}`}
                onClick={() => {
                  setIsDeleteModalOpen(true);
                  setDeletePasswordInput("");
                }}
              >
                <i className="fa-solid fa-trash"></i> Deletar Conta
              </button>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>Informações</h3>
              <div className={styles.infoGroup}>
                <p>
                  <strong>Nome:</strong> <span>{user.nome || ""}</span>
                </p>
              </div>
              <div className={styles.infoGroup}>
                <p>
                  <strong>Sobrenome:</strong>{" "}
                  <span>{user.sobrenome || ""}</span>
                </p>
              </div>
              <div className={styles.infoGroup}>
                <p>
                  <strong>Email:</strong> <span>{user.email || ""}</span>
                </p>
              </div>
              <div className={styles.infoGroup}>
                <p>
                  <strong>Telefone:</strong>{" "}
                  <span>{formatarTelefone(user.telefone || "")}</span>
                </p>
              </div>
            </div>

            {user.endereco && (
              <div className={styles.sectionBlock}>
                <h3 className={styles.sectionTitle}>Endereço</h3>
                <div className={styles.infoGroup}>
                  <p>
                    <strong>Rua e Número:</strong>{" "}
                    <span>
                      {user.endereco.logradouro}, {user.endereco.numero}
                    </span>
                  </p>
                </div>
                <div className={styles.infoGroup}>
                  <p>
                    <strong>Bairro:</strong> <span>{user.endereco.bairro}</span>
                  </p>
                </div>
                <div className={styles.infoGroup}>
                  <p>
                    <strong>Cidade e Estado:</strong>{" "}
                    <span>
                      {user.endereco.cidade} - {user.endereco.estado}
                    </span>
                  </p>
                </div>
                <div className={styles.infoGroup}>
                  <p>
                    <strong>CEP:</strong> <span>{user.endereco.cep}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {isEditing && (
        <div className={styles.editModalOverlay}>
          <div className={styles.editModal}>
            <div className={styles.editHeader}>
              <h2>Editar Perfil</h2>
              <button
                onClick={() => setIsEditing(false)}
                className={styles.closeBtn}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className={styles.editForm}>
              <div className={styles.inputGrid}>
                <div className={styles.inputWrapper}>
                  <label>Nome</label>
                  <input
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Sobrenome</label>
                  <input
                    type="text"
                    placeholder="Sobrenome"
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Telefone</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Telefone"
                    value={formatarTelefone(telefone)}
                    onChange={(e) =>
                      setTelefone(e.target.value.replace(/\D/g, ""))
                    }
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>CEP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="CEP"
                    value={formatarCep(cep)}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Estado</label>
                  <input
                    type="text"
                    placeholder="Estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Cidade</label>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Bairro</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Logradouro</label>
                  <input
                    type="text"
                    placeholder="Logradouro"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Número</label>
                  <input
                    type="text"
                    placeholder="Número"
                    value={numero}
                    onChange={(e) =>
                      setNumero(e.target.value.replace(/\D/g, ""))
                    }
                    required
                  />
                </div>
              </div>
              <button type="submit" className={styles.saveBtn}>
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {isEmailModalOpen && (
        <div className={styles.editModalOverlay}>
          <div className={styles.editModal}>
            <div className={styles.editHeader}>
              <h2>Alterar E-mail</h2>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className={styles.closeBtn}
              >
                &times;
              </button>
            </div>
            {emailStep === 1 ? (
              <form
                onSubmit={handleRequestEmailChange}
                className={styles.editForm}
              >
                <div className={styles.inputWrapper}>
                  <label>Novo E-mail</label>
                  <input
                    type="email"
                    placeholder="Digite o novo e-mail"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      height: "3rem",
                      paddingLeft: "1rem",
                      boxSizing: "border-box",
                      border: "none",
                    }}
                  />
                </div>
                <button type="submit" className={styles.saveBtn}>
                  Continuar
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleConfirmEmailChange}
                className={styles.editForm}
              >
                <p style={{ fontSize: "0.95rem", color: "#444" }}>
                  Um código de verificação foi enviado para o seu e-mail atual (
                  <strong>{user.email}</strong>).
                </p>
                <div className={styles.inputWrapper}>
                  <label>Código de Verificação</label>
                  <input
                    type="text"
                    placeholder="Digite o código"
                    value={oldEmailCodeInput}
                    onChange={(e) =>
                      setOldEmailCodeInput(e.target.value.replace(/\D/g, ""))
                    }
                    required
                    style={{
                      width: "100%",
                      height: "3rem",
                      paddingLeft: "1rem",
                      boxSizing: "border-box",
                      border: "none",
                    }}
                  />
                </div>
                <button type="submit" className={styles.saveBtn}>
                  Confirmar e Alterar
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className={styles.editModalOverlay}>
          <div className={styles.editModal}>
            <div className={styles.editHeader}>
              <h2>Alterar Senha</h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className={styles.closeBtn}
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={handleRequestPasswordChange}
              className={styles.editForm}
            >
              <p
                style={{
                  fontSize: "1rem",
                  color: "#444",
                  marginBottom: "10px",
                }}
              >
                Tem certeza de que deseja alterar sua senha? Um link de
                redefinição será enviado para o seu e-mail:{" "}
                <strong>{user.email}</strong>.
              </p>
              <button type="submit" className={styles.saveBtn}>
                Enviar Link
              </button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.editModalOverlay}>
          <div className={styles.editModal}>
            <div className={styles.editHeader}>
              <h2>Deletar Conta</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className={styles.closeBtn}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleDeleteAccount} className={styles.editForm}>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#444",
                  marginBottom: "10px",
                }}
              >
                Tem certeza que deseja deletar sua conta? Esta ação é{" "}
                <strong>irreversível</strong>. Para confirmar, digite sua senha
                abaixo.
              </p>
              <div className={styles.inputWrapper}>
                <label>Senha de Confirmação</label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={deletePasswordInput}
                  onChange={(e) => setDeletePasswordInput(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "3rem",
                    paddingLeft: "1rem",
                    boxSizing: "border-box",
                    border: "none",
                  }}
                />
              </div>
              <button
                type="submit"
                className={styles.saveBtn}
                style={{ backgroundColor: "#e74c3c" }}
              >
                Deletar Definitivamente
              </button>
            </form>
          </div>
        </div>
      )}
      <Toaster toastOptions={{ style: { borderRadius: 0 } }} />
    </div>
  );
};

export default Profile;
