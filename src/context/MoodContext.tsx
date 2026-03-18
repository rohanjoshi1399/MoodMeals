"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { MealPreference } from "../types";

export interface MoodAnalysis {
    emotion: string;
    intensity: "low" | "medium" | "high";
    recommendedMoods: string[];
    message: string;
}

interface MoodContextType {
    analysis: MoodAnalysis | null;
    setAnalysis: (a: MoodAnalysis | null) => void;
    preference: MealPreference;
    setPreference: (p: MealPreference) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider = ({ children }: { children: ReactNode }) => {
    const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
    const [preference, setPreference] = useState<MealPreference>("veg");

    return (
        <MoodContext.Provider value={{ analysis, setAnalysis, preference, setPreference }}>
            {children}
        </MoodContext.Provider>
    );
};

export const useMood = () => {
    const ctx = useContext(MoodContext);
    if (!ctx) throw new Error("useMood must be used inside MoodProvider");
    return ctx;
};
