"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGroceryOptional } from "@/context/GroceryContext";
import { useJournalOptional } from "@/context/JournalContext";
import styles from "./BottomNav.module.css";

const TABS = [
    { href: "/app", icon: "🏠", label: "Dashboard" },
    { href: "/app/pantry", icon: "🥕", label: "Pantry" },
    { href: "/app/grocery", icon: "🛒", label: "Grocery" },
    { href: "/app/journal", icon: "📓", label: "Journal" },
] as const;

export default function BottomNav() {
    const pathname = usePathname();
    const grocery = useGroceryOptional();
    const journal = useJournalOptional();

    const groceryCount = grocery?.selectedMeals.length ?? 0;
    const hasJournalEntries = (journal?.entries.length ?? 0) > 0;

    return (
        <nav className={styles.nav} aria-label="Mobile navigation">
            {TABS.map(({ href, icon, label }) => {
                const isActive = pathname === href;
                const isGrocery = href === "/app/grocery";
                const isJournal = href === "/app/journal";

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.tab} ${isActive ? styles.active : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <span className={styles.iconWrap} aria-hidden="true">
                            <span className={styles.icon}>{icon}</span>
                            {isGrocery && groceryCount > 0 && (
                                <span className={styles.badge} aria-label={`${groceryCount} meals`}>
                                    {groceryCount}
                                </span>
                            )}
                            {isJournal && hasJournalEntries && !isActive && (
                                <span className={styles.badgeDot} aria-hidden="true" />
                            )}
                        </span>
                        <span className={styles.label}>{label}</span>
                        {isActive && <span className={styles.dot} aria-hidden="true" />}
                    </Link>
                );
            })}
        </nav>
    );
}
