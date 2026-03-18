import React from "react";
import Link from "next/link";
import styles from "./ChooseYourChoice.module.css";

const ChooseYourChoice = () => {
    return (
        <section id="choice" className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>Your personalized path.</h2>
                <div className={styles.grid}>
                    <Link href="#recipes" className={styles.card}>
                        <div className={styles.icon}>🥗</div>
                        <h3 className={styles.cardTitle}>Vegetarian</h3>
                        <p className={styles.cardDesc}>
                            A focus on plant proteins, nutrient-dense vegetables, and dairy-based alternatives.
                        </p>
                    </Link>

                    <Link href="#recipes" className={styles.card}>
                        <div className={styles.icon}>🍗</div>
                        <h3 className={styles.cardTitle}>Non-Vegetarian</h3>
                        <p className={styles.cardDesc}>
                            High-quality proteins from lean meats and seafood, balanced with mood-boosting antioxidants.
                        </p>
                    </Link>

                    <Link href="#recipes" className={styles.card}>
                        <div className={styles.icon}>🌱</div>
                        <h3 className={styles.cardTitle}>Vegan</h3>
                        <p className={styles.cardDesc}>
                            A pure plant-based experience focusing on high-fiber legumes, nut bases, and superfood grains.
                        </p>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ChooseYourChoice;
