"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.inner}>
                    <Link href="/" className={styles.logo}>
                        <span>🥗</span> MoodMeals
                    </Link>

                    <div className={styles.links}>
                        <Link href="#how" className={styles.link}>How it Works</Link>
                        <Link href="#science" className={styles.link}>Science</Link>
                        <Link href="#recipes" className={styles.link}>Recipes</Link>
                    </div>

                    <button
                        className={styles.hamburger}
                        onClick={toggleMenu}
                        aria-label="Toggle navigation"
                    >
                        <span style={{ transform: isMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}></span>
                        <span style={{ opacity: isMenuOpen ? 0 : 1 }}></span>
                        <span style={{ transform: isMenuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }}></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.active : ""}`}>
                <Link href="#how" className={styles.link} onClick={toggleMenu}>How it Works</Link>
                <Link href="#science" className={styles.link} onClick={toggleMenu}>Science</Link>
                <Link href="#recipes" className={styles.link} onClick={toggleMenu}>Recipes</Link>
            </div>
        </>
    );
};

export default Navbar;
