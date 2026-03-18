import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// --- Local Heuristic Engine ---
// This handles the logic when Gemini is unavailable or key is missing.
const localHeuristicEngine = (text: string) => {
    const moodText = text.toLowerCase();

    // Define keyword maps
    const emotionMap = [
        { label: "stressed", keywords: ["stress", "anxious", "worried", "pressure", "deadline", "busy", "overwhelmed"] },
        { label: "tired", keywords: ["tired", "exhausted", "sleepy", "drain", "fatigue", "beat", "low energy", "worn out"] },
        { label: "happy", keywords: ["happy", "good", "great", "awesome", "vibing", "excellent", "glad", "joy"] },
        { label: "focused", keywords: ["focus", "study", "work", "concentration", "grind", "productive", "sharp"] },
        { label: "sad", keywords: ["sad", "unhappy", "down", "gloomy", "blue", "heartbroken", "lonely"] },
        { label: "energetic", keywords: ["energetic", "hyper", "active", "pumped", "ready", "workout", "gym"] },
        { label: "calm", keywords: ["calm", "relax", "chill", "peace", "serene", "quiet"] }
    ];

    // Simple negation check (e.g., "not happy")
    const isNegative = moodText.includes("not ") || moodText.includes("don't ") || moodText.includes("never ");

    // Find best match
    let detectedEmotion = "calm"; // Default
    for (const group of emotionMap) {
        if (group.keywords.some(k => moodText.includes(k))) {
            detectedEmotion = group.label;
            break;
        }
    }

    // Handle negation logic (extremely basic flip)
    if (isNegative && detectedEmotion === "happy") detectedEmotion = "sad";
    if (isNegative && detectedEmotion === "calm") detectedEmotion = "stressed";

    // Map emotions to recommendation tags and messages
    const responseMap: Record<string, { moods: string[], msg: string }> = {
        stressed: {
            moods: ["calm", "grounding", "comforting"],
            msg: "It sounds like you've had a lot on your plate. A grounding, warm meal might help you find some calm."
        },
        tired: {
            moods: ["energetic", "comforting"],
            msg: "You've been working hard. Let's get some energy back into your system with a revitalizing meal."
        },
        happy: {
            moods: ["light", "happy"],
            msg: "Love the energy! Let's keep that vibrant mood going with something light and fresh."
        },
        focused: {
            moods: ["focused", "light"],
            msg: "You seem targeted on your goals. Let's fuel that concentration with something light and brain-boosting."
        },
        sad: {
            moods: ["comforting", "happy"],
            msg: "I'm sorry you're feeling down. Sometimes a warm, comforting meal is the first step toward feeling a bit better."
        },
        energetic: {
            moods: ["energetic", "light", "focused"],
            msg: "You're powered up! Let's sustain that fire with a high-performance, vibrant meal."
        },
        calm: {
            moods: ["calm", "relaxed", "light"],
            msg: "Staying balanced is a skill. Here are some light and relaxed choices to match your vibe."
        }
    };

    const result = responseMap[detectedEmotion] || responseMap.calm;

    return {
        emotion: detectedEmotion,
        intensity: moodText.length > 50 ? "high" : "medium",
        recommendedMoods: result.moods,
        message: result.msg,
        source: "local-heuristic"
    };
};


// --- API Route Handler ---

export async function POST(req: NextRequest) {
    const { mood } = await req.json();

    if (!mood || typeof mood !== "string") {
        return NextResponse.json({ error: "Mood text is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMockKey = !apiKey || apiKey === "your_gemini_api_key_here";

    // If key is missing or is placeholder, use local engine immediately
    if (isMockKey) {
        console.log("[analyze-mood] No API key found. Using Local Heuristic Engine.");
        return NextResponse.json(localHeuristicEngine(mood));
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are a nutritional mood expert. User's mood: "${mood}"
Respond ONLY with valid JSON (no markdown):
{
  "emotion": "<stressed | tired | happy | focused | sad | energetic | calm>",
  "intensity": "<low | medium | high>",
  "recommendedMoods": ["<1-3 tags from: calm, relaxed, focused, energetic, happy, comforting, light, grounding>"],
  "message": "<1 empathetic sentence about how food can help their mood>"
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json?\n?/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json({ ...parsed, source: "gemini-ai" });

    } catch (err: any) {
        // If Gemini fails (429, 404, etc.), silently fallback to Local Engine
        console.warn("[analyze-mood] Gemini AI failed. Falling back to Local Heuristic Engine.", err.message);
        return NextResponse.json(localHeuristicEngine(mood));
    }
}
