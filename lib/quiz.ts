import questionData from "@/data/questions.json";
import type {
  CategoryId,
  CategoryScore,
  Difficulty,
  QuizAnswer,
  QuizQuestion,
} from "@/lib/types";

export const CATEGORY_CONFIG: Record<
  CategoryId,
  { label: string; shortLabel: string; genreId: number; accent: string }
> = {
  "sci-fi": { label: "Ficção científica", shortLabel: "Sci-fi", genreId: 878, accent: "#8ae8ff" },
  action: { label: "Ação", shortLabel: "Ação", genreId: 28, accent: "#ff805d" },
  comedy: { label: "Comédia", shortLabel: "Comédia", genreId: 35, accent: "#ffd166" },
  drama: { label: "Drama", shortLabel: "Drama", genreId: 18, accent: "#d7a9ff" },
  horror: { label: "Terror", shortLabel: "Terror", genreId: 27, accent: "#ff6685" },
  fantasy: { label: "Fantasia", shortLabel: "Fantasia", genreId: 14, accent: "#9ee493" },
  animation: { label: "Animação", shortLabel: "Animação", genreId: 16, accent: "#ffb3e6" },
  crime: { label: "Crime e suspense", shortLabel: "Crime", genreId: 80, accent: "#a8b4ff" },
  romance: { label: "Romance", shortLabel: "Romance", genreId: 10749, accent: "#ff9eb5" },
  documentary: { label: "Documentário", shortLabel: "Doc", genreId: 99, accent: "#8ee3c1" },
};

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; points: number }
> = {
  easy: { label: "Claquete", points: 1 },
  medium: { label: "Cinéfilo", points: 2 },
  hard: { label: "Diretor", points: 3 },
};

export const QUESTIONS = questionData as QuizQuestion[];

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createQuiz(): QuizQuestion[] {
  const categories = shuffled(Object.keys(CATEGORY_CONFIG) as CategoryId[]).slice(0, 5);

  const selected = categories.flatMap((category) => {
    const pool = QUESTIONS.filter((question) => question.category === category);
    const accessible = shuffled(pool.filter((question) => question.difficulty !== "hard"))[0];
    const challenge = shuffled(pool.filter((question) => question.id !== accessible.id))[0];
    return [accessible, challenge];
  });

  return shuffled(selected);
}

export function calculateScores(answers: QuizAnswer[]): CategoryScore[] {
  const scores = new Map<CategoryId, CategoryScore>();

  for (const answer of answers) {
    const current = scores.get(answer.category) ?? {
      category: answer.category,
      points: 0,
      correct: 0,
      answered: 0,
    };

    current.answered += 1;
    if (answer.correct) {
      current.correct += 1;
      current.points += DIFFICULTY_CONFIG[answer.difficulty].points;
    }
    scores.set(answer.category, current);
  }

  return [...scores.values()].sort(
    (left, right) => right.points - left.points || right.correct - left.correct,
  );
}

export function getProfile(scores: CategoryScore[], totalCorrect: number) {
  const leading = scores[0]?.category ?? "drama";
  const label = CATEGORY_CONFIG[leading].shortLabel;

  if (totalCorrect >= 9) {
    return { eyebrow: "Créditos finais", title: "Enciclopédia em cena", description: `Você domina detalhes e fez de ${label} o seu grande destaque.` };
  }
  if (totalCorrect >= 7) {
    return { eyebrow: "Sessão premiada", title: "Olhar de diretor", description: `Seu repertório é afiado — especialmente quando ${label} entra em cena.` };
  }
  if (totalCorrect >= 4) {
    return { eyebrow: "Boa sessão", title: "Cinéfilo explorador", description: `Você reconhece boas histórias e brilhou mais em ${label}.` };
  }
  return { eyebrow: "Próximo episódio", title: "Descobridor de histórias", description: `Toda maratona começa assim. ${label} foi a pista mais forte desta rodada.` };
}

export function recommendationQuery(scores: CategoryScore[]) {
  const ranked = scores.filter((score) => score.points > 0).slice(0, 2);
  const fallback = scores.slice(0, 2);
  return (ranked.length ? ranked : fallback).map((score) => score.category);
}
