import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { AsideLink } from "../asideLink/asideLink";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import styles from "./MobileNav.module.css";

interface MobileNavProps {
  active: boolean;
  onClose: () => void;
}

export const MobileNav = ({ active, onClose }: MobileNavProps) => {
  const panelRef = useRef<HTMLElement>(null);
  useBodyScrollLock(active);

  const token = localStorage.getItem("token");
  let isAdmin = false;
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken && decodedToken.tipo === "admin") {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    const firstFocusable = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstFocusable?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onClose]);

  return (
    <AnimatePresence>
      {active && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.aside
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className={styles.panelContent}>
              <AsideLink
                to={token ? "/profile" : "/login"}
                iconClass={
                  token ? "fa-solid fa-user" : "fa-solid fa-right-to-bracket"
                }
                text={token ? "Perfil" : "Entrar"}
              />
              <AsideLink to="/" iconClass="fa-solid fa-house" text="Início" />
              <AsideLink to="/shop" iconClass="fa-solid fa-shop" text="Loja" />
              {isAdmin && (
                <AsideLink
                  to="/admin"
                  iconClass="fa-solid fa-lock"
                  text="Admin"
                />
              )}
              {token && (
                <AsideLink
                  iconClass="fa-solid fa-arrow-right-from-bracket"
                  text="Sair"
                  isLogout={true}
                />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
