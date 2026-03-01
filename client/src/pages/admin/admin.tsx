import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "./admin.module.css";
import UsersList from "./components/UsersList";
import EstoqueList from "./components/EstoqueList";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
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
            const response = await fetch("http://localhost:3000/api/users");
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
                    <h2>Painel Admin</h2>
                </div>
                <nav className={styles.sidebarNav}>
                    <ul>
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <li>
                                <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i> Voltar
                            </li>
                        </Link>
                        <li
                            className={activeTab === "dashboard" ? styles.active : ""}
                            onClick={() => setActiveTab("dashboard")}
                        >
                            Painel
                        </li>
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
                        <li>Configurações</li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                <header className={styles.topbar}>
                    <h1>
                        {activeTab === "dashboard" ? "Visão Geral"
                            : activeTab === "users" ? "Gerenciamento de Usuários"
                                : "Gerenciamento de Estoque"}
                    </h1>
                </header>
                <section className={styles.contentArea}>
                    {activeTab === "dashboard" && (
                        <div className={styles.card}>
                            <h3>Bem-vindo ao Admin</h3>
                            <p>Esta é a estrutura básica do painel administrativo. Aqui você poderá ver gráficos e métricas.</p>
                        </div>
                    )}

                    {activeTab === "users" && (
                        loading ? <p>Carregando usuários...</p> : <UsersList users={users} onUserUpdate={fetchUsers} currentUserId={currentUserId} />
                    )}

                    {activeTab === "estoque" && (
                        <EstoqueList />
                    )}
                </section>
            </main>
        </div>
    );
};

export default Admin;
