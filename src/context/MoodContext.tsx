"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { MealPreference, MoodAnalysis } from "../types";

export type { MoodAnalysis };

export type SustainMode = "sustain" | "winddown" | null;

interface MoodContextType {
    analysis: MoodAnalysis | null;
    setAnalysis: (a: MoodAnalysis | null) => void;
    preference: MealPreference;
    setPreference: (p: MealPreference) => void;
    sustainMode: SustainMode;
    setSustainMode: (m: SustainMode) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider = ({ children }: { children: ReactNode }) => {
    const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
    const [preference, setPreference] = useState<MealPreference>("veg");
    const [sustainMode, setSustainMode] = useState<SustainMode>(null);

    return (
        <MoodContext.Provider value={{ analysis, setAnalysis, preference, setPreference, sustainMode, setSustainMode }}>
            {children}
        </MoodContext.Provider>
    );
};

export const useMood = () => {
    const ctx = useContext(MoodContext);
    if (!ctx) throw new Error("useMood must be used inside MoodProvider");
    return ctx;
};
