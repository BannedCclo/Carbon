import styles from "./footer.module.css";
import textLogoBigWhite from "../../assets/img/textLogoBigWhite.png";
import Signature from "../signature/signature";

const Footer = () => {
  return (
    <>
      <footer>
        <header>
          <img src={textLogoBigWhite} alt="" />
        </header>
        <main>
          <section>
            <h1>Quer conhecer mais modelos?</h1>
            <button>Visite a loja</button>
          </section>
          <section>
            <div className={styles.signatureContainer}>
              <p>Designed and developed by Marcelo Guimarães</p>
              <Signature />
            </div>
            <ul>
              <li>
                <i className="fa-brands fa-instagram"></i> Instagram:{" "}
              </li>
              <li>
                <i className="fa-solid fa-square-envelope"></i> Email:{" "}
              </li>
              <li>
                <i className="fa-brands fa-linkedin"></i> LinkedIn:{" "}
              </li>
              <li>
                <i className="fa-brands fa-github"></i> GitHub:
              </li>
            </ul>

            <ul>
              <li>
                <a href="https://www.instagram.com/not_cecelo/" target="_blank">
                  @not_cecelo
                </a>
              </li>
              <li>
                <a
                  href="https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=marcelosg909@gmail.com"
                  target="_blank"
                >
                  marcelosg909@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/marcelo-santos-34aa98264/"
                  target="_blank"
                >
                  Marcelo Guimarães
                </a>
              </li>
              <li>
                <a href="https://github.com/BannedCclo" target="_blank">
                  BannedCclo
                </a>
              </li>
            </ul>
          </section>
        </main>
      </footer>
    </>
  );
};

export default Footer;
