import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// ── Clinical mapping tables ────────────────────────────────────────────────

type ClinicalMoodState =
    | "high-stress"
    | "cognitive-fatigue"
    | "depressive"
    | "poor-focus"
    | "burnout";

const clinicalNutrientMap: Record<ClinicalMoodState, string[]> = {
    "high-stress": ["magnesium", "zinc", "vitamin-B6", "L-theanine"],
    "cognitive-fatigue": ["iron", "vitamin-B12", "DHA", "coenzyme-Q10"],
    "depressive": ["tryptophan", "folate", "vitamin-D", "omega-3"],
    "poor-focus": ["choline", "iron", "vitamin-B6", "tyrosine"],
    "burnout": ["magnesium", "vitamin-C", "B-complex", "adaptogens"],
};

const emotionToClinical: Record<string, ClinicalMoodState> = {
    stressed: "high-stress",
    tired: "cognitive-fatigue",
    sad: "depressive",
    focused: "poor-focus",
    calm: "high-stress",
    happy: "burnout",
    energetic: "cognitive-fatigue",
};

// ── Local Heuristic Engine (enhanced) ──────────────────────────────────────

const localHeuristicEngine = (text: string) => {
    const moodText = text.toLowerCase();

    const emotionMap = [
        { label: "stressed", keywords: ["stress", "tense", "tensed", "anxious", "anxiety", "worried", "worry", "pressure", "deadline", "busy", "overwhelmed", "nervous", "frustrated", "frustrat", "upset", "angry", "irritat", "panic", "afraid", "scared", "freaking", "losing my mind", "can't cope", "too much", "on edge"] },
        { label: "tired", keywords: ["tired", "exhausted", "sleepy", "drain", "fatigue", "beat", "low energy", "worn out", "burnout", "burned out", "lethargic", "sluggish", "wiped", "no energy", "barely awake", "can't think"] },
        { label: "happy", keywords: ["happy", "good", "great", "awesome", "vibing", "excellent", "glad", "joy", "wonderful", "fantastic", "amazing", "grateful", "blessed", "content", "cheerful", "thrilled", "excited"] },
        { label: "focused", keywords: ["focus", "study", "studying", "work", "working", "concentration", "grind", "productive", "sharp", "determined", "locked in", "in the zone"] },
        { label: "sad", keywords: ["sad", "unhappy", "down", "gloomy", "blue", "heartbroken", "lonely", "depressed", "miserable", "hopeless", "crying", "lost", "empty", "numb", "grief"] },
        { label: "energetic", keywords: ["energetic", "hyper", "active", "pumped", "ready", "workout", "gym", "fired up", "motivated", "buzzing", "alive", "wired"] },
        { label: "calm", keywords: ["calm", "relax", "chill", "peace", "serene", "quiet", "mellow", "zen", "tranquil", "at ease"] },
    ];

    const isNegative = moodText.includes("not ") || moodText.includes("don't ") || moodText.includes("never ");

    let detectedEmotion = "calm";
    for (const group of emotionMap) {
        if (group.keywords.some((k) => moodText.includes(k))) {
            detectedEmotion = group.label;
            break;
        }
    }

    if (isNegative && detectedEmotion === "happy") detectedEmotion = "sad";
    if (isNegative && detectedEmotion === "calm") detectedEmotion = "stressed";

    const responseMap: Record<string, { moods: string[]; msg: string }> = {
        stressed: {
            moods: ["calm", "grounding", "comforting"],
            msg: "It sounds like you've had a lot on your plate. Magnesium and zinc-rich foods can help modulate your stress response and promote calm.",
        },
        tired: {
            moods: ["energetic", "comforting"],
            msg: "You've been working hard. Iron and B12-rich meals can boost oxygen transport and restore your energy levels.",
        },
        happy: {
            moods: ["light", "happy"],
            msg: "Love the energy! Antioxidant-rich foods with vitamin C and polyphenols can help sustain your positive mood.",
        },
        focused: {
            moods: ["focused", "light"],
            msg: "You seem targeted on your goals. Zinc and magnesium support dopamine signaling to keep your concentration sharp.",
        },
        sad: {
            moods: ["comforting", "happy"],
            msg: "I'm sorry you're feeling down. Tryptophan and folate-rich foods support serotonin production, which can gently lift your spirits.",
        },
        energetic: {
            moods: ["energetic", "light", "focused"],
            msg: "You're powered up! Vitamin C and E-rich foods help neutralize oxidative stress so you can sustain that momentum.",
        },
        calm: {
            moods: ["calm", "relaxed", "light"],
            msg: "Staying balanced is a skill. Magnesium-rich foods can help maintain your calm by supporting GABA activity.",
        },
    };

    const result = responseMap[detectedEmotion] || responseMap.calm;
    const clinicalState = emotionToClinical[detectedEmotion] ?? "high-stress";
    const targetedNutrients = clinicalNutrientMap[clinicalState] ?? [];

    // ─ Suggested filters (keyword-based) ─
    const suggestedFilters: {
        cuisinePreference?: string;
        mealType?: string;
        maxCookTime?: number;
        dietFocus?: string;
    } = {};

    if (/breakfast|morning/.test(moodText)) suggestedFilters.mealType = "breakfast";
    else if (/lunch|midday|noon/.test(moodText)) suggestedFilters.mealType = "lunch";
    else if (/dinner|evening|supper/.test(moodText)) suggestedFilters.mealType = "dinner";
    else if (/\b(light|snack)\b/.test(moodText)) suggestedFilters.mealType = "snack";

    if (/quick|fast|no time|lazy|too tired to cook|easy/.test(moodText)) suggestedFilters.maxCookTime = 15;

    if (/protein|gym|workout|muscle/.test(moodText)) suggestedFilters.dietFocus = "protein-heavy";
    else if (/comfort|cozy|warm|soul/.test(moodText)) suggestedFilters.dietFocus = "balanced";
    else if (/light|diet|lean/.test(moodText)) suggestedFilters.dietFocus = "low-calorie";

    // ─ Contextual insight ─
    const insightMap: Record<string, string> = {
        stressed: "Chronic stress activates the HPA axis, depleting magnesium and diverting tryptophan away from serotonin synthesis. Foods rich in magnesium and B6 can help restore balance.",
        tired: "Fatigue often signals low iron or B12 levels, which impair oxygen transport and mitochondrial energy production. Iron-rich and B12-fortified foods can help restore vitality.",
        sad: "Low mood is linked to reduced serotonin availability. Tryptophan-rich foods combined with complex carbohydrates boost serotonin production, while vitamin D supports mood regulation.",
        focused: "Sustained focus depends on adequate choline and tyrosine for neurotransmitter production. Brain-boosting foods with omega-3s and B vitamins support cognitive performance.",
        energetic: "Your high energy is great! Maintaining it requires steady glucose and adequate B-vitamins. Balanced meals prevent energy crashes later.",
        happy: "Positive mood is supported by a well-nourished brain. Keep the momentum with antioxidant-rich, whole foods that sustain dopamine and serotonin levels.",
        calm: "A calm baseline is ideal. L-theanine in green tea and magnesium-rich foods can help you maintain this serene state throughout the day.",
    };

    return {
        emotion: detectedEmotion,
        intensity: (moodText.length > 50 ? "high" : "medium") as "low" | "medium" | "high",
        recommendedMoods: result.moods,
        message: result.msg,
        clinicalState,
        targetedNutrients,
        suggestedFilters: Object.keys(suggestedFilters).length > 0 ? suggestedFilters : undefined,
        contextualInsight: insightMap[detectedEmotion] ?? insightMap.calm,
        userInputText: text,
        source: "local-heuristic",
    };
};

// ── Agentic Gemini prompt ──────────────────────────────────────────────────

const buildAgenticPrompt = (mood: string): string => `
You are an advanced nutritional-mood analysis agent. Analyze the user's mood through a 4-step pipeline and return structured JSON.

User input: "${mood}"

**Step 1 — Semantic Analysis**: Parse core emotion(s), time/cooking constraints, meal preferences, diet mentions.
**Step 2 — Clinical Mapping**: Map to clinical state + nutrients:
- stressed/anxious → "high-stress" → [magnesium, zinc, vitamin-B6]
- tired/exhausted → "cognitive-fatigue" → [iron, vitamin-B12, DHA]
- sad/down → "depressive" → [tryptophan, folate, vitamin-D]
- unfocused → "poor-focus" → [choline, iron, vitamin-B6, tyrosine]
- burned out → "burnout" → [magnesium, vitamin-C, B-complex]
**Step 3 — Filter Recommendation**: From contextual clues suggest filters (only include fields with clear evidence).
**Step 4 — Contextual Insight**: 1-2 sentences of neuroscience explaining why recommended nutrients help.

Respond ONLY with valid JSON (no markdown, no fences):
{
  "emotion": "<stressed | tired | happy | focused | sad | energetic | calm>",
  "intensity": "<low | medium | high>",
  "recommendedMoods": ["<1-3 from: calm, relaxed, focused, energetic, happy, comforting, light, grounding>"],
  "message": "<1 empathetic sentence about how food can help>",
  "clinicalState": "<high-stress | cognitive-fatigue | depressive | poor-focus | burnout>",
  "targetedNutrients": ["<3-5 specific nutrients>"],
  "suggestedFilters": {
    "mealType": "<breakfast|lunch|dinner|snack — only if detected>",
    "maxCookTime": "<number — only if time pressure detected>",
    "dietFocus": "<protein-heavy|fiber-rich|low-calorie|balanced — only if detected>"
  },
  "contextualInsight": "<1-2 sentence neuroscience explanation>"
}
If suggestedFilters would be empty, omit it entirely.
`;

// ── API Route Handler ──────────────────────────────────────────────────────

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey && apiKey !== "your_gemini_api_key_here" ? new GoogleGenerativeAI(apiKey) : null;

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
        const result = await model.generateContent(buildAgenticPrompt(mood));
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json?\n?/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleaned);

        if (!parsed.emotion || !parsed.intensity || !parsed.recommendedMoods) {
            throw new Error("Gemini response missing required fields");
        }

        return NextResponse.json({ ...parsed, userInputText: mood, source: "gemini-ai" });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn("[analyze-mood] Gemini AI failed, falling back to heuristic.", message);
        return NextResponse.json(localHeuristicEngine(mood));
    }
}
