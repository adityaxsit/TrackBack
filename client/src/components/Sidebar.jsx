import styles from "./Sidebar.module.css";
import { NavLink } from "react-router-dom";

function Sidebar({ sidebarOpen,setSidebarOpen }) {
  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
      <div className={styles.menu}>
        <NavLink
          to="/dashboard"
          onClick={()=> setSidebarOpen(false)}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.active : ""}`
          }
        >
          <span>▣</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/problems"
          onClick={()=> setSidebarOpen(false)}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.active : ""}`
          }
        >
          <span>✓</span>
          <span>Problems</span>
        </NavLink>

        <NavLink
          to="/revision"
          onClick={()=> setSidebarOpen(false)}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.active : ""}`
          }
        >
          <span>↻</span>
          <span>Revision</span>
        </NavLink>

        <NavLink
          to="/analytics"
          onClick={()=> setSidebarOpen(false)}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.active : ""}`
          }
        >
          <span>📈</span>
          <span>Analytics</span>
        </NavLink>

        <p className={styles.sectionTitle}>PREPARATION</p>

        <NavLink
          to="/patterns"
          onClick={()=> setSidebarOpen(false)}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.active : ""}`
          }
        >
          <span>🎓</span>
          <span>Patterns</span>
        </NavLink>

        <p className={styles.sectionTitle}>LIBRARY</p>

        <NavLink
          to="/collections"
          onClick={()=> setSidebarOpen(false)}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.active : ""}`
          }
        >
          <span>▤</span>
          <span>Collections</span>
        </NavLink>
      </div>

      <div className={styles.bottomMenu}>
        <NavLink
          to="/settings"
          onClick={()=> setSidebarOpen(false)}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.active : ""}`
          }
        >
          <span>⚙</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
