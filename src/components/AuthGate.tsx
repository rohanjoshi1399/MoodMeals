"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { AllergyType } from "@/types";
import styles from "./AuthGate.module.css";

const ALLERGY_OPTIONS: { value: AllergyType; label: string }[] = [
    { value: "gluten", label: "Gluten" },
    { value: "dairy", label: "Dairy" },
    { value: "nuts", label: "Nuts" },
    { value: "shellfish", label: "Shellfish" },
    { value: "soy", label: "Soy" },
    { value: "fish", label: "Fish" },
    { value: "eggs", label: "Eggs" },
    { value: "sesame", label: "Sesame" },
];

export default function AuthGate() {
    const { login } = useUser();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedAllergies, setSelectedAllergies] = useState<AllergyType[]>([]);

    const toggleAllergy = (allergy: AllergyType) => {
        setSelectedAllergies((prev) =>
            prev.includes(allergy)
                ? prev.filter((a) => a !== allergy)
                : [...prev, allergy]
        );
    };

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        login(trimmed, email.trim(), selectedAllergies);
    };

    return (
        <div className={styles.backdrop}>
            <div className={styles.card}>
                {/* Branding */}
                <div className={styles.brand}>
                    <span className={styles.brandEmoji}>🥗</span>
                    <span className={styles.brandName}>MoodMeals</span>
                </div>

                {/* Copy */}
                <h1 className={styles.heading}>Sign in to get started</h1>
                <p className={styles.valueProp}>
                    Track your moods, get personalized meal recommendations,
                    and build grocery lists tailored to how you feel.
                </p>

                {/* Form */}
                <div className={styles.form}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        autoFocus
                    />
                    <input
                        className={styles.input}
                        type="email"
                        placeholder="Email address (optional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />

                    {/* Allergy selector */}
                    <div className={styles.allergySection}>
                        <span className={styles.allergySectionLabel}>
                            Allergies / Intolerances
                        </span>
                        <div className={styles.allergyChips}>
                            {ALLERGY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`${styles.allergyChip} ${
                                        selectedAllergies.includes(opt.value)
                                            ? styles.allergyChipActive
                                            : ""
                                    }`}
                                    onClick={() => toggleAllergy(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                    >
                        Get Started
                    </button>
                </div>

                {/* Footer link */}
                <div className={styles.footer}>
                    <Link href="/" className={styles.learnMore}>
                        Learn more about MoodMeals &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
