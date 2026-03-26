"use client";

import { useState } from "react";
import { usePantry, PantryItem } from "@/context/PantryContext";
import styles from "./page.module.css";

const QUICK_ADD: { name: string; category: PantryItem["category"] }[] = [
    { name: "Rice", category: "grain" },
    { name: "Chicken", category: "protein" },
    { name: "Eggs", category: "protein" },
    { name: "Spinach", category: "vegetable" },
    { name: "Tomatoes", category: "vegetable" },
    { name: "Onions", category: "vegetable" },
    { name: "Garlic", category: "spice" },
    { name: "Milk", category: "dairy" },
    { name: "Lentils", category: "protein" },
    { name: "Quinoa", category: "grain" },
    { name: "Chickpeas", category: "protein" },
    { name: "Olive Oil", category: "other" },
    { name: "Ginger", category: "spice" },
    { name: "Bell Peppers", category: "vegetable" },
    { name: "Broccoli", category: "vegetable" },
];

const CATEGORIES: { key: PantryItem["category"]; label: string; icon: string }[] = [
    { key: "protein", label: "Proteins", icon: "🥩" },
    { key: "grain", label: "Grains", icon: "🌾" },
    { key: "vegetable", label: "Vegetables", icon: "🥦" },
    { key: "dairy", label: "Dairy", icon: "🥛" },
    { key: "spice", label: "Spices & Herbs", icon: "🌿" },
    { key: "other", label: "Other", icon: "🫙" },
];

export default function PantryPage() {
    const { items, addItem, removeItem } = usePantry();
    const [query, setQuery] = useState("");
    const [selectedCat, setSelectedCat] = useState<PantryItem["category"]>("other");

    const handleAdd = () => {
        const name = query.trim();
        if (!name) return;
        addItem(name, selectedCat);
        setQuery("");
    };

    const availableQuick = QUICK_ADD.filter(
        q => !items.some(i => i.name.toLowerCase() === q.name.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Pantry</h1>
                <p className={styles.subtitle}>
                    Track what you have — we&apos;ll cross-check it against your grocery list.
                </p>
            </div>

            <div className={styles.container}>
                {/* Add section */}
                <div className={styles.addCard}>
                    <h2 className={styles.sectionTitle}>Add an ingredient</h2>
                    <div className={styles.addRow}>
                        <input
                            type="text"
                            className={styles.addInput}
                            placeholder="e.g. Salmon, Oats, Turmeric…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAdd()}
                        />
                        <select
                            className={styles.catSelect}
                            value={selectedCat}
                            onChange={e => setSelectedCat(e.target.value as PantryItem["category"])}
                            aria-label="Category"
                        >
                            {CATEGORIES.map(c => (
                                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                            ))}
                        </select>
                        <button
                            className={styles.addBtn}
                            onClick={handleAdd}
                            disabled={!query.trim()}
                        >
                            Add
                        </button>
                    </div>

                    {availableQuick.length > 0 && (
                        <div className={styles.quickSection}>
                            <p className={styles.quickLabel}>Quick add:</p>
                            <div className={styles.quickChips}>
                                {availableQuick.map(q => (
                                    <button
                                        key={q.name}
                                        className={styles.quickChip}
                                        onClick={() => addItem(q.name, q.category)}
                                    >
                                        + {q.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pantry items */}
                {items.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🥕</div>
                        <p className={styles.emptyTitle}>Your pantry is empty</p>
                        <p className={styles.emptyText}>Start adding ingredients above!</p>
                    </div>
                ) : (
                    <div className={styles.categories}>
                        {CATEGORIES.map(cat => {
                            const catItems = items.filter(i => i.category === cat.key);
                            if (catItems.length === 0) return null;
                            return (
                                <div key={cat.key} className={styles.catGroup}>
                                    <h3 className={styles.catTitle}>
                                        {cat.icon} {cat.label}
                                        <span className={styles.catCount}>{catItems.length}</span>
                                    </h3>
                                    <div className={styles.itemChips}>
                                        {catItems.map(item => (
                                            <div key={item.id} className={styles.itemChip}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => removeItem(item.id)}
                                                    aria-label={`Remove ${item.name}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
