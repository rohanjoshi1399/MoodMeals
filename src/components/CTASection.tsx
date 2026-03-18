import React from "react";
import Link from "next/link";
import styles from "./CTASection.module.css";

const CTASection = () => {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>Ready to sync?</h2>
                <p className={styles.text}>
                    Join 50,000+ people who have transformed their mental
                    and physical energy with MoodMeals.
                </p>
                <Link href="#choice" className={styles.btn}>
                    Get Started for Free
                </Link>
            </div>
        </section>
    );
};

export default CTASection;
