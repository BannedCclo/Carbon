import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "./admin.module.css";
import UsersList from "./components/UsersList";
import EstoqueList from "./components/EstoqueList";
import HighlightsManager from "./components/HighlightsManager";
import HeroManager from "./components/HeroManager";
import { API_BASE_URL } from "../../services/api";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.backButton} aria-label="Voltar">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <h2>Painel Admin</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <ul>
            <li
              className={activeTab === "users" ? styles.active : ""}
              onClick={() => setActiveTab("users")}
            >
              Usuários
            </li>
            <li
              className={activeTab === "estoque" ? styles.active : ""}
              onClick={() => setActiveTab("estoque")}
            >
              Estoque
            </li>
            <li
              className={activeTab === "highlights" ? styles.active : ""}
              onClick={() => setActiveTab("highlights")}
            >
              Destaques
            </li>
            <li
              className={activeTab === "hero" ? styles.active : ""}
              onClick={() => setActiveTab("hero")}
            >
              Hero
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <h1>
            {activeTab === "users" && "Gerenciamento de Usuários"}
            {activeTab === "estoque" && "Gerenciamento de Estoque"}
            {activeTab === "highlights" && "Destaques da Home"}
            {activeTab === "hero" && "Destaque Principal (Hero) da Home"}
          </h1>
        </header>
        <section className={styles.contentArea}>

          {activeTab === "users" &&
            (loading ? (
              <p>Carregando usuários...</p>
            ) : (
              <UsersList
                users={users}
                onUserUpdate={fetchUsers}
                currentUserId={currentUserId}
              />
            ))}

          {activeTab === "estoque" && <EstoqueList />}

          {activeTab === "highlights" && <HighlightsManager />}

          {activeTab === "hero" && <HeroManager />}
        </section>
      </main>
    </div>
  );
};

export default Admin;
