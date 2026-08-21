export type CategoryId =
  | "sci-fi"
  | "action"
  | "comedy"
  | "drama"
  | "horror"
  | "fantasy"
  | "animation"
  | "crime"
  | "romance"
  | "documentary";

export type Difficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}

export interface QuizAnswer {
  questionId: string;
  category: CategoryId;
  difficulty: Difficulty;
  correct: boolean;
}

export interface CategoryScore {
  category: CategoryId;
  points: number;
  correct: number;
  answered: number;
}

export interface StreamingProvider {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface Recommendation {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  year: string;
  overview: string;
  posterUrl?: string;
  backdropUrl?: string;
  rating: number;
  providers: StreamingProvider[];
  tmdbUrl: string;
  category: CategoryId;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  source: "tmdb" | "demo";
  generatedAt: string;
}
