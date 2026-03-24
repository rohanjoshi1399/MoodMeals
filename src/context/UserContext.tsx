"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AllergyType } from "@/types";

export interface UserProfile {
    name: string;
    email: string;
    avatarColor: string;
    allergies: AllergyType[];
}

interface UserContextType {
    user: UserProfile | null;
    isLoggedIn: boolean;
    login: (name: string, email: string, allergies?: AllergyType[]) => void;
    logout: () => void;
    updateAllergies: (allergies: AllergyType[]) => void;
}

const PASTEL_COLORS = [
    "#7a9e87", "#b8a9d4", "#a5c8e4", "#e8836a", "#f4a892",
    "#a8c4b0", "#d4c5a9", "#c4b5d4", "#b5d4c4", "#9eb5d4",
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("moodmeals_user");
            if (stored) {
                const parsed = JSON.parse(stored);
                // Backward compatibility: default allergies to empty array
                if (!parsed.allergies) parsed.allergies = [];
                setUser(parsed);
            }
        } catch { /* ignore */ }
    }, []);

    const login = (name: string, email: string, allergies?: AllergyType[]) => {
        const avatarColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
        const profile: UserProfile = { name, email, avatarColor, allergies: allergies ?? [] };
        setUser(profile);
        try {
            localStorage.setItem("moodmeals_user", JSON.stringify(profile));
        } catch { /* ignore */ }
    };

    const updateAllergies = (allergies: AllergyType[]) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, allergies };
            try {
                localStorage.setItem("moodmeals_user", JSON.stringify(updated));
            } catch { /* ignore */ }
            return updated;
        });
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem("moodmeals_user");
        } catch { /* ignore */ }
    };

    return (
        <UserContext.Provider value={{ user, isLoggedIn: user !== null, login, logout, updateAllergies }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside UserProvider");
    return ctx;
};

export const useUserOptional = () => useContext(UserContext);
