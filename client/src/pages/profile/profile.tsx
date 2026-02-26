import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "./profile.module.css";
import wallpaper from "../../assets/img/wallpaper2.png";
import onlyTextWhite from "../../assets/img/onlyTextWhite.png";
import api from "../../services/api";

interface UserProfile {
    id: number;
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    tipo: string;
}

const Profile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decoded: any = jwtDecode(token);
            // Initially set user with decoded data so the page renders fast
            setUser(decoded);

            // Fetch full profile data based on decoded token ID
            api.get(`/users/id/${decoded.id}`)
                .then(response => {
                    setUser(response.data);
                })
                .catch(err => {
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
        <div className={styles.bgWrapper}>
            <img src={wallpaper} className={styles.wallpaper} alt="" />

            <Link to="/" className={styles.backBtn}>
                <i className="fa-solid fa-arrow-left"></i> Voltar
            </Link>

            <main className={styles.container}>
                <img src={onlyTextWhite} alt="Carbon" className={styles.logo} />

                <div className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <h2>{user.nome} {user.sobrenome || ""}</h2>
                        <span className={styles.roleBadge}>
                            {user.tipo === "admin" ? "Administrador" : "Cliente"}
                        </span>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.infoGroup}>
                            <p><strong>Email:</strong> {user.email || ""}</p>
                        </div>
                        <div className={styles.infoGroup}>
                            <p><strong>Telefone:</strong> {user.telefone || ""}</p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.logoutBtn}
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/");
                            }}
                        >
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Sair
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
