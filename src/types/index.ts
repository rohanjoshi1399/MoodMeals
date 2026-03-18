export type MealPreference = 'veg' | 'non-veg' | 'vegan';

export interface Meal {
    id: string;
    name: string;
    description: string;
    preference: MealPreference;
    moodSync: string[]; // List of moods this meal is good for
    image: string;
    calories: number;
}
