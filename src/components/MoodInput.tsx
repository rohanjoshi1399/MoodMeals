"use client";

import React, { useState } from "react";
import { useMood, MoodAnalysis } from "../context/MoodContext";
import styles from "./MoodInput.module.css";

const MoodInput = () => {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { setAnalysis, preference, setPreference } = useMood();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;

        setLoading(true);
        setError("");
        setAnalysis(null);

        try {
            const res = await fetch("/api/analyze-mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood: trimmed }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Analysis failed.");
            }

            const data: MoodAnalysis = await res.json();
            setAnalysis(data);

            // Scroll to the meal grid after a brief pause
            setTimeout(() => {
                document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
            }, 400);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="mood-log" className={styles.section}>
            <div className={`container ${styles.container}`}>
                <h2 className={styles.title}>How are you feeling today?</h2>
                <p className={styles.subtitle}>
                    Tell us what's on your mind and we'll find the perfect meal to match.
                </p>

                <div className={styles.inputWrapper}>
                    {loading && <div className={`${styles.status} ${styles.visible}`}>✨ Analyzing your mood...</div>}
                    {error && <div className={`${styles.status} ${styles.errorStatus} ${styles.visible}`}>⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <textarea
                            className={styles.textarea}
                            placeholder="e.g., 'I'm super stressed from work and need something warm and comforting' or 'I'm feeling great and full of energy today!'"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={loading}
                        />

                        <div className={styles.controls}>
                            <div className={styles.preferenceGroup}>
                                <span className={styles.prefLabel}>I eat:</span>
                                {(["veg", "non-veg", "vegan"] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`${styles.prefBtn} ${preference === p ? styles.prefActive : ""}`}
                                        onClick={() => setPreference(p)}
                                    >
                                        {p === "veg" ? "🥗 Veg" : p === "non-veg" ? "🍗 Non-Veg" : "🌱 Vegan"}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!text.trim() || loading}
                            >
                                {loading ? "Analyzing..." : "Analyze Mood →"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default MoodInput;
