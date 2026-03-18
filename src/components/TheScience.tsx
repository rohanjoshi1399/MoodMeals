import React from "react";
import styles from "./TheScience.module.css";

const TheScience = () => {
    return (
        <section id="science" className="container">
            <div className={styles.section}>
                <div className={styles.content}>
                    <span className={styles.label}>SCIENCE-BACKED</span>
                    <h2 className={styles.title}>The link <br />between mind <br />and plate.</h2>
                    <p className={styles.text}>
                        Our AI-Sync technology is based on emerging research in
                        nutritional psychiatry, mapping the correlation between
                        serotonin levels and carbohydrate intake, among other
                        crucial biological factors.
                    </p>

                    <ul className={styles.list}>
                        <li className={styles.item}>
                            <div className={styles.icon}>🌡️</div>
                            <div>
                                <h4 className={styles.itemTitle}>Stress Modulation</h4>
                                <p className={styles.itemDesc}>Using magnesium-rich profiles to lower cortisol levels during high-stress periods.</p>
                            </div>
                        </li>
                        <li className={styles.item}>
                            <div className={styles.icon}>⚡</div>
                            <div>
                                <h4 className={styles.itemTitle}>Cognitive Boost</h4>
                                <p className={styles.itemDesc}>Leveraging DHA and omega-3s for sustained mental focus and clarity.</p>
                            </div>
                        </li>
                        <li className={styles.item}>
                            <div className={styles.icon}>💤</div>
                            <div>
                                <h4 className={styles.itemTitle}>Mood Stabilization</h4>
                                <p className={styles.itemDesc}>Tryptophan-based recommendations for better serotonin synthesis and sleep.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className={styles.visual}>
                    {/* Decorative visual element */}
                    <div style={{ position: "absolute", inset: "-40px", overflow: "hidden", pointerEvents: "none" }}>
                        <div style={{ position: "absolute", top: "10%", left: "15%", width: "80px", height: "80px", background: "var(--sage-light)", borderRadius: "50%", opacity: 0.1, filter: "blur(20px)" }}></div>
                        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: "120px", height: "120px", background: "var(--coral-light)", borderRadius: "50%", opacity: 0.1, filter: "blur(30px)" }}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TheScience;
