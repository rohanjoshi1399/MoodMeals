import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// --- Clinical nutrient mappings (single source of truth) ---
const clinicalNutrientMap: Record<string, { clinicalState: string; targetedNutrients: string[] }> = {
    stressed: { clinicalState: "high-stress", targetedNutrients: ["magnesium", "zinc", "vitamin-B6"] },
    tired: { clinicalState: "cognitive-fatigue", targetedNutrients: ["iron", "vitamin-B12", "DHA"] },
    sad: { clinicalState: "depressive", targetedNutrients: ["tryptophan", "folate", "vitamin-D"] },
    focused: { clinicalState: "poor-focus", targetedNutrients: ["zinc", "magnesium", "iron"] },
    happy: { clinicalState: "burnout", targetedNutrients: ["vitamin-C", "vitamin-E", "polyphenols"] },
    energetic: { clinicalState: "burnout", targetedNutrients: ["vitamin-C", "vitamin-E", "polyphenols"] },
    calm: { clinicalState: "high-stress", targetedNutrients: ["magnesium", "zinc", "vitamin-B6"] },
};

// Derive unique clinical states for prompt generation
const clinicalStatesForPrompt = Object.values(
    Object.entries(clinicalNutrientMap).reduce<Record<string, { state: string; nutrients: string[] }>>((acc, [, v]) => {
        if (!acc[v.clinicalState]) acc[v.clinicalState] = { state: v.clinicalState, nutrients: v.targetedNutrients };
        return acc;
    }, {})
);

// Hoist Gemini client to module scope for reuse across requests
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey && apiKey !== "your_gemini_api_key_here" ? new GoogleGenerativeAI(apiKey) : null;

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
            msg: "It sounds like you've had a lot on your plate. Magnesium and zinc-rich foods can help modulate your stress response and promote calm."
        },
        tired: {
            moods: ["energetic", "comforting"],
            msg: "You've been working hard. Iron and B12-rich meals can boost oxygen transport and restore your energy levels."
        },
        happy: {
            moods: ["light", "happy"],
            msg: "Love the energy! Antioxidant-rich foods with vitamin C and polyphenols can help sustain your positive mood."
        },
        focused: {
            moods: ["focused", "light"],
            msg: "You seem targeted on your goals. Zinc and magnesium support dopamine signaling to keep your concentration sharp."
        },
        sad: {
            moods: ["comforting", "happy"],
            msg: "I'm sorry you're feeling down. Tryptophan and folate-rich foods support serotonin production, which can gently lift your spirits."
        },
        energetic: {
            moods: ["energetic", "light", "focused"],
            msg: "You're powered up! Vitamin C and E-rich foods help neutralize oxidative stress so you can sustain that momentum."
        },
        calm: {
            moods: ["calm", "relaxed", "light"],
            msg: "Staying balanced is a skill. Magnesium-rich foods can help maintain your calm by supporting GABA activity."
        }
    };

    const result = responseMap[detectedEmotion] || responseMap.calm;
    const clinical = clinicalNutrientMap[detectedEmotion] || clinicalNutrientMap.calm;

    return {
        emotion: detectedEmotion,
        intensity: moodText.length > 50 ? "high" : "medium",
        recommendedMoods: result.moods,
        message: result.msg,
        clinicalState: clinical.clinicalState,
        targetedNutrients: clinical.targetedNutrients,
        source: "local-heuristic"
    };
};


// --- API Route Handler ---

// Generate clinical state descriptions from the map (keeps prompt in sync)
const clinicalStatePromptLines = clinicalStatesForPrompt
    .map(s => `   - "${s.state}" → (${s.nutrients.join(", ")})`)
    .join("\n");

export async function POST(req: NextRequest) {
    const { mood } = await req.json();

    if (!mood || typeof mood !== "string") {
        return NextResponse.json({ error: "Mood text is required." }, { status: 400 });
    }

    if (!genAI) {
        return NextResponse.json(localHeuristicEngine(mood));
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are a clinical nutritional mood expert. Analyze the user's emotional state and recommend targeted nutrients.

User's mood: "${mood}"

Follow this 4-step pipeline:
1. SEMANTIC ANALYSIS: Parse the core emotional state from the text.
2. CLINICAL STATE MAPPING: Map to one of these 5 clinical states:
${clinicalStatePromptLines}
3. NUTRIENT PROFILING: Select 2-4 key micronutrients from the mapping above.
4. MEAL MOOD TAGS: Choose 1-3 mood tags for meal matching.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "emotion": "<stressed | tired | happy | focused | sad | energetic | calm>",
  "intensity": "<low | medium | high>",
  "clinicalState": "<${clinicalStatesForPrompt.map(s => s.state).join(" | ")}>",
  "targetedNutrients": ["<2-4 key micronutrients>"],
  "recommendedMoods": ["<1-3 tags from: calm, relaxed, focused, energetic, happy, comforting, light, grounding>"],
  "message": "<1-2 empathetic sentences explaining how specific nutrients in food can help>"
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json?\n?/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json({ ...parsed, source: "gemini-ai" });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn("[analyze-mood] Gemini AI failed, falling back to heuristic.", message);
        return NextResponse.json(localHeuristicEngine(mood));
    }
}
