import { Link } from "react-router-dom";
import styles from "./HomeNavbar.module.css";

function HomeNavbar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>∞</span>
        <span>TrackBack</span>
      </Link>

      <div className={styles.navLinks}>
        <a href="#features">Features</a>

        <Link to="/login" className={styles.loginButton}>
          Login
        </Link>

        <Link to="/register" className={styles.signupButton}>
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default HomeNavbar;