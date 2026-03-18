"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./MealLibrary.module.css";
import { MEALS } from "../data/meals";
import { MealPreference } from "../types";
import { useMood } from "../context/MoodContext";

const MealLibrary = () => {
    const { analysis, preference, setPreference } = useMood();
    const [localPreference, setLocalPreference] = useState<MealPreference>(preference);

    // Sync local state with context
    const handlePreference = (p: MealPreference) => {
        setLocalPreference(p);
        setPreference(p);
    };

    // First filter by dietary preference
    const byPreference = MEALS.filter((m) => m.preference === localPreference);

    // Then score by mood match if AI analysis exists
    const scoredMeals = byPreference.map((meal) => {
        if (!analysis) return { ...meal, score: 0, matched: false };
        const matchCount = meal.moodSync.filter((tag) =>
            analysis.recommendedMoods.includes(tag)
        ).length;
        return { ...meal, score: matchCount, matched: matchCount > 0 };
    });

    // Sort: matched meals first, then by score desc
    const sortedMeals = [...scoredMeals].sort((a, b) => b.score - a.score);

    return (
        <section id="recipes" className={styles.section}>
            <div className="container">
                {analysis ? (
                    <div className={styles.analysisResult}>
                        <span className={styles.emotion}>
                            {emotionEmoji(analysis.emotion)} {capitalize(analysis.emotion)}
                        </span>
                        <p className={styles.aiMessage}>{analysis.message}</p>
                    </div>
                ) : (
                    <h2 className={styles.title}>Explore by Choice</h2>
                )}

                <div className={styles.selector}>
                    {(["veg", "non-veg", "vegan"] as const).map((p) => (
                        <button
                            key={p}
                            className={`${styles.btn} ${localPreference === p ? styles.active : ""}`}
                            onClick={() => handlePreference(p)}
                        >
                            {p === "veg" ? "🥗 Vegetarian" : p === "non-veg" ? "🍗 Non-Veg" : "🌱 Vegan"}
                        </button>
                    ))}
                </div>

                {analysis && (
                    <p className={styles.filterNote}>
                        ✨ Meals are sorted by your mood match. Highlighted ones are recommended for you.
                    </p>
                )}

                <div className={styles.grid}>
                    {sortedMeals.map((meal) => (
                        <div
                            key={meal.id}
                            className={`${styles.card} ${meal.matched ? styles.recommended : ""}`}
                        >
                            {meal.matched && (
                                <div className={styles.recommendedBadge}>✨ Recommended for you</div>
                            )}
                            <div className={styles.imgWrap}>
                                <Image
                                    src={meal.image}
                                    alt={meal.name}
                                    fill
                                    className={styles.img}
                                />
                            </div>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{meal.name}</h3>
                                <p className={styles.cardDesc}>{meal.description}</p>
                                <div className={styles.cardFooter}>
                                    <div className={styles.moodTags}>
                                        {meal.moodSync.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className={`${styles.moodTag} ${analysis?.recommendedMoods.includes(tag) ? styles.moodTagActive : ""}`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <span className={styles.calories}>{meal.calories} kcal</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const emotionEmoji = (emotion: string): string => {
    const map: Record<string, string> = {
        stressed: "😤", tired: "😴", anxious: "😰", happy: "😊",
        focused: "🎯", calm: "😌", sad: "😢", energetic: "⚡",
    };
    return map[emotion] ?? "🧠";
};

export default MealLibrary;
