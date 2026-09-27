import { useNavigate } from "react-router-dom";
import HomeNavbar from "../components/HomeNavbar";
import styles from "./Home.module.css";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "✓",
      title: "Track Problems",
      description:
        "Keep track of solved problems, difficulty levels, and topics in one place.",
    },
    {
      icon: "↻",
      title: "Smart Revision",
      description:
        "Revisit important problems so concepts stay fresh when you need them.",
    },
    {
      icon: "↗",
      title: "Progress Analytics",
      description:
        "Understand your strengths, weak topics, and overall DSA progress.",
    },
    {
      icon: "⌁",
      title: "Focused Preparation",
      description:
        "Organize your preparation and focus on the problems that matter.",
    },
  ];

  return (
    <div className={styles.home}>
      <HomeNavbar />

      <main>
        <section className={styles.hero}>
          <div className={styles.badge}>
            Your DSA journey, organized.
          </div>

          <h1>
            Solve. Track.
            <span> Revisit.</span>
          </h1>

          <p>
            Stop losing track of problems you've solved.
            TrackBack helps you organize your DSA journey,
            revise smarter, and understand your progress.
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>

            <button
              className={styles.secondaryButton}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </section>

        <section
          className={styles.features}
          id="features"
        >
          <div className={styles.sectionHeading}>
            <p>EVERYTHING IN ONE PLACE</p>
            <h2>Practice with purpose.</h2>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <div
                className={styles.featureCard}
                key={feature.title}
              >
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;