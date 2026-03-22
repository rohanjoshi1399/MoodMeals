"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";
import { useMood } from "../context/MoodContext";

const Hero = () => {
    const [showPreferences, setShowPreferences] = useState(false);
    const { setPreference } = useMood();

    const handleStart = () => {
        setShowPreferences(true);
    };

    const handleSelectPreference = (p: any) => {
        setPreference(p);
        document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
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
                                    <button
                                        onClick={() => handleSelectPreference("veg")}
                                        className={styles.btnPrimary}
                                        style={{ background: "var(--sage-light)", border: "none" }}
                                    >
                                        🥗 Veg
                                    </button>
                                    <button
                                        onClick={() => handleSelectPreference("non-veg")}
                                        className={styles.btnPrimary}
                                        style={{ background: "var(--coral-light)", border: "none" }}
                                    >
                                        🍗 Non-Veg
                                    </button>
                                    <button
                                        onClick={() => handleSelectPreference("vegan")}
                                        className={styles.btnPrimary}
                                        style={{ background: "var(--lavender)", border: "none" }}
                                    >
                                        🌱 Vegan
                                    </button>
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
