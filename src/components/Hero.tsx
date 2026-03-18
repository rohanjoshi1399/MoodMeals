"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

const Hero = () => {
    const [showPreferences, setShowPreferences] = useState(false);

    const handleStart = () => {
        setShowPreferences(true);
        // Scroll to the recipes section or just show choices here
    };

    return (
        <section className={styles.hero}>
            <div className="container">
                <div className={styles.inner}>
                    <div className={styles.content}>
                        <div className={styles.badge}>
                            <span className={styles.dot}></span>
                            NEW: MOOD-SYNC™ 2.0 IS HERE
                        </div>
                        <h1 className={styles.headline}>
                            Eat for how <br />
                            you <em>feel.</em>
                        </h1>
                        <p className={styles.copy}>
                            MoodMeals is an emotion-aware meal planning app that maps
                            your state of mind to curated nutritional profiles.
                        </p>

                        {!showPreferences ? (
                            <div className={styles.actions}>
                                <button onClick={handleStart} className={styles.btnPrimary}>
                                    Get Started Free
                                </button>
                                <Link href="#how" className={styles.btnSecondary}>
                                    How it Works
                                </Link>
                            </div>
                        ) : (
                            <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                                <p style={{ fontWeight: 700, marginBottom: "16px", color: "var(--text-dark)" }}>Choose your dietary path:</p>
                                <div className={styles.actions}>
                                    <Link href="#recipes" className={styles.btnPrimary} style={{ background: "var(--sage-light)" }}>
                                        🥗 Veg
                                    </Link>
                                    <Link href="#recipes" className={styles.btnPrimary} style={{ background: "var(--coral-light)" }}>
                                        🍗 Non-Veg
                                    </Link>
                                    <Link href="#recipes" className={styles.btnPrimary} style={{ background: "var(--lavender)" }}>
                                        🌱 Vegan
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.visual}>
                        <div className={styles.imgWrap}>
                            <Image
                                src="/hero.png"
                                alt="Healthy Salmon Grain Bowl"
                                width={480}
                                height={600}
                                priority
                            />
                        </div>

                        <div className={`${styles.chip} ${styles.chipOne}`}>
                            <span>😌</span> Relaxed
                        </div>
                        <div className={`${styles.chip} ${styles.chipTwo}`}>
                            <span>🚀</span> Focused
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
