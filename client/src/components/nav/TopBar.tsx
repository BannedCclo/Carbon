import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import styles from "./TopBar.module.css";

export const TopBar = () => {
  const [active, setActive] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setActive(false);
  }, [location.pathname]);

  const close = () => {
    setActive(false);
    toggleButtonRef.current?.focus();
  };

  return (
    <>
      <button
        ref={toggleButtonRef}
        type="button"
        className={styles.toggleBtn}
        onClick={() => setActive((v) => !v)}
        aria-label={active ? "Fechar menu" : "Abrir menu"}
        aria-expanded={active}
      >
        <i className={active ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
      </button>
      <MobileNav active={active} onClose={close} />
    </>
  );
};

export default TopBar;
