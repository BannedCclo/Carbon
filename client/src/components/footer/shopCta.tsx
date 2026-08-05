import { Link } from "react-router-dom";
import styles from "./shopCta.module.css";

const ShopCta = () => {
  return (
    <div className={styles.shopCta}>
      <h1>Quer conhecer mais modelos?</h1>
      <Link to="/shop">
        <button>Visite a loja</button>
      </Link>
    </div>
  );
};

export default ShopCta;
