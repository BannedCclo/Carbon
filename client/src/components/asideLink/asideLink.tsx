import { Link } from "react-router-dom";
import styles from "../nav/MobileNav.module.css";

interface AsideLinkProps {
    to?: string;
    iconClass: string;
    text: string;
    isLogout?: boolean;
}

export const AsideLink = ({ to, iconClass, text, isLogout }: AsideLinkProps) => {
    if (isLogout) {
        return (
            <button
                className={`${styles.asideLink} ${styles.logoutBtn}`}
                onClick={() => {
                    localStorage.removeItem("token");
                    window.location.reload();
                }}
            >
                <i className={iconClass}></i>
                <span>{text}</span>
            </button>
        );
    }

    if (to) {
        return (
            <Link to={to} className={styles.asideLink}>
                <i className={iconClass}></i>
                <span>{text}</span>
            </Link>
        );
    }

    return null;
};

export default AsideLink;
