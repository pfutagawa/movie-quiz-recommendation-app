"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  calculateScores,
  CATEGORY_CONFIG,
  createQuiz,
  DIFFICULTY_CONFIG,
  getProfile,
  recommendationQuery,
} from "@/lib/quiz";
import type {
  CategoryScore,
  QuizAnswer,
  QuizQuestion,
  Recommendation,
  RecommendationResponse,
} from "@/lib/types";

type Screen = "intro" | "quiz" | "result";

const SEEN_STORAGE_KEY = "cinequiz-seen-v1";

function recommendationKey(item: Pick<Recommendation, "id" | "mediaType">) {
  return `${item.mediaType}-${item.id}`;
}

function BrandMark() {
  return (
    <Image
      className="brand-mark"
      src="/favicon.svg"
      alt=""
      width={64}
      height={64}
      aria-hidden="true"
    />
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [scores, setScores] = useState<CategoryScore[]>([]);
  const [queue, setQueue] = useState<Recommendation[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [queuePage, setQueuePage] = useState(1);
  const [source, setSource] = useState<"tmdb" | "demo">("demo");
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [queueExhausted, setQueueExhausted] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(SEEN_STORAGE_KEY) ?? "[]") as string[];
      return new Set(saved);
    } catch {
      localStorage.removeItem(SEEN_STORAGE_KEY);
      return new Set();
    }
  });

  const current = questions[currentQuestion];
  const isCorrect = selectedAnswer === current?.correctAnswer;
  const correctCount = answers.filter((answer) => answer.correct).length;
  const activeRecommendation = queue[queueIndex];
  const profile = useMemo(() => getProfile(scores, correctCount), [scores, correctCount]);

  function startQuiz() {
    setQuestions(createQuiz());
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setScores([]);
    setQueue([]);
    setQueueIndex(0);
    setQueuePage(1);
    setQueueExhausted(false);
    setScreen("quiz");
  }

  function selectAnswer(answerIndex: number) {
    if (selectedAnswer !== null || !current) return;
    const correct = answerIndex === current.correctAnswer;
    setSelectedAnswer(answerIndex);
    setAnswers((previous) => [
      ...previous,
      {
        questionId: current.id,
        category: current.category,
        difficulty: current.difficulty,
        correct,
      },
    ]);
  }

  async function requestRecommendations(
    calculatedScores: CategoryScore[],
    page: number,
    append = false,
    seenItems = seen,
  ) {
    setLoadingRecommendations(true);
    setQueueExhausted(false);

    try {
      const categories = recommendationQuery(calculatedScores).join(",");
      const response = await fetch(
        `/api/recommendations?categories=${encodeURIComponent(categories)}&page=${page}`,
      );
      if (!response.ok) throw new Error("Não foi possível carregar as recomendações.");
      const data = (await response.json()) as RecommendationResponse;
      const available = data.recommendations.filter(
        (item) => !seenItems.has(recommendationKey(item)),
      );

      setSource(data.source);
      if (append) {
        setQueue((previous) => {
          const existing = new Set(previous.map(recommendationKey));
          const fresh = available.filter((item) => !existing.has(recommendationKey(item)));
          if (!fresh.length) setQueueExhausted(true);
          return [...previous, ...fresh];
        });
      } else {
        setQueue(available);
        setQueueIndex(0);
        if (!available.length) setQueueExhausted(true);
      }
    } catch {
      setQueueExhausted(true);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  async function advanceQuestion() {
    if (selectedAnswer === null) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((index) => index + 1);
      setSelectedAnswer(null);
      return;
    }

    const finalScores = calculateScores(answers);
    setScores(finalScores);
    setScreen("result");
    await requestRecommendations(finalScores, 1);
  }

  async function markAsWatched() {
    if (!activeRecommendation) return;
    const updatedSeen = new Set(seen).add(recommendationKey(activeRecommendation));
    setSeen(updatedSeen);
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...updatedSeen]));

    if (queueIndex < queue.length - 1) {
      setQueueIndex((index) => index + 1);
      return;
    }

    const nextPage = queuePage + 1;
    setQueuePage(nextPage);
    await requestRecommendations(scores, nextPage, true, updatedSeen);
    setQueueIndex((index) => Math.min(index + 1, queue.length));
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <button className="brand" onClick={() => setScreen("intro")} aria-label="Voltar ao início">
          <BrandMark />
          <span>CineQuiz</span>
          <small>BR</small>
        </button>
        <div className="header-note">
          <span className="live-dot" />
          Catálogos do Brasil
        </div>
      </header>

      {screen === "intro" && (
        <section className="intro-layout page-enter">
          <div className="intro-copy">
            <p className="eyebrow">Quiz de conhecimento + recomendação</p>
            <h1>
              Acerte.
              <br />
              Descubra.
              <br />
              <em>Dê play.</em>
            </h1>
            <p className="intro-description">
              Dez perguntas sobre cinema e televisão revelam onde o seu repertório brilha — e abrem uma fila de histórias para a próxima sessão.
            </p>
            <button className="primary-action" onClick={startQuiz}>
              Começar a sessão
              <span aria-hidden="true">→</span>
            </button>
            <div className="intro-stats" aria-label="Informações do quiz">
              <div><strong>100</strong><span>perguntas no banco</span></div>
              <div><strong>10</strong><span>por rodada</span></div>
              <div><strong>4</strong><span>streamings em foco</span></div>
            </div>
          </div>

          <aside className="ticket-preview" aria-label="Prévia de uma pergunta">
            <div className="ticket-top">
              <span>Rodada 01</span>
              <span className="ticket-code">CQ—BR</span>
            </div>
            <div className="preview-category">Ficção científica · Cinéfilo</div>
            <p className="preview-number">07</p>
            <h2>Qual detalhe da cena você reconheceria?</h2>
            <div className="preview-options" aria-hidden="true">
              <span>A</span><span>B</span><span className="active">C</span><span>D</span>
            </div>
            <div className="ticket-tear" />
            <div className="ticket-bottom">
              <span>Seu repertório vira a recomendação.</span>
              <BrandMark />
            </div>
          </aside>
        </section>
      )}

      {screen === "quiz" && current && (
        <section className="quiz-layout page-enter">
          <div className="quiz-toolbar">
            <div>
              <p className="eyebrow">Rodada em cartaz</p>
              <p className="question-counter">Pergunta {currentQuestion + 1} <span>/ {questions.length}</span></p>
            </div>
            <div className="score-chip"><strong>{correctCount}</strong> acertos</div>
          </div>

          <div className="progress-track" aria-label={`${currentQuestion + 1} de ${questions.length} perguntas`}>
            <span style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>

          <article className="question-card">
            <div className="question-meta">
              <span style={{ color: CATEGORY_CONFIG[current.category].accent }}>
                {CATEGORY_CONFIG[current.category].label}
              </span>
              <span>{DIFFICULTY_CONFIG[current.difficulty].label} · {DIFFICULTY_CONFIG[current.difficulty].points} pt</span>
            </div>

            <h1>{current.question}</h1>

            <div className="answer-grid">
              {current.options.map((option, index) => {
                const answered = selectedAnswer !== null;
                const correctOption = index === current.correctAnswer;
                const selected = index === selectedAnswer;
                const state = answered && correctOption ? "correct" : answered && selected ? "incorrect" : answered ? "muted" : "";

                return (
                  <button
                    key={option}
                    className={`answer-option ${state}`}
                    onClick={() => selectAnswer(index)}
                    disabled={answered}
                    aria-pressed={selected}
                  >
                    <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                    {answered && correctOption && <span className="answer-icon" aria-label="Resposta correta">✓</span>}
                    {answered && selected && !correctOption && <span className="answer-icon" aria-label="Resposta incorreta">×</span>}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className={`feedback ${isCorrect ? "success" : "error"}`} role="status">
                <div>
                  <strong>{isCorrect ? "Boa! Cena reconhecida." : "Quase. A resposta entrou em cena."}</strong>
                  <p>{current.explanation}</p>
                </div>
                <button onClick={advanceQuestion}>
                  {currentQuestion === questions.length - 1 ? "Ver meu resultado" : "Próxima pergunta"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </article>
        </section>
      )}

      {screen === "result" && (
        <section className="result-layout page-enter">
          <div className="result-summary">
            <p className="eyebrow">{profile.eyebrow}</p>
            <div className="score-display">
              <strong>{correctCount}</strong>
              <span>/ 10</span>
            </div>
            <h1>{profile.title}</h1>
            <p>{profile.description}</p>

            <div className="score-breakdown">
              {scores.slice(0, 3).map((score) => {
                const maximum = score.answered * 3;
                return (
                  <div className="score-row" key={score.category}>
                    <div><span>{CATEGORY_CONFIG[score.category].shortLabel}</span><strong>{score.points} pt</strong></div>
                    <div className="mini-track"><span style={{ width: `${(score.points / maximum) * 100}%`, background: CATEGORY_CONFIG[score.category].accent }} /></div>
                  </div>
                );
              })}
            </div>

            <button className="text-action" onClick={startQuiz}>↻ Jogar outra rodada</button>
          </div>

          <div className="recommendation-panel">
            <div className="recommendation-heading">
              <div>
                <p className="eyebrow">Sua próxima história</p>
                <h2>Recomendação em cartaz</h2>
              </div>
              {queue.length > 0 && <span className="queue-count">{Math.min(queueIndex + 1, queue.length)} de {queue.length}</span>}
            </div>

            {loadingRecommendations && !activeRecommendation && (
              <div className="recommendation-skeleton" aria-live="polite">
                <div />
                <span>Montando sua fila…</span>
              </div>
            )}

            {activeRecommendation && (
              <article className="recommendation-card" key={recommendationKey(activeRecommendation)}>
                <div className={`poster ${activeRecommendation.posterUrl ? "has-image" : ""}`}>
                  {activeRecommendation.posterUrl ? (
                    <Image
                      src={activeRecommendation.posterUrl}
                      alt={`Pôster de ${activeRecommendation.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 280px"
                      unoptimized
                    />
                  ) : (
                    <div className="poster-fallback">
                      <BrandMark />
                      <span>{CATEGORY_CONFIG[activeRecommendation.category].shortLabel}</span>
                      <strong>{activeRecommendation.title}</strong>
                    </div>
                  )}
                  <span className="media-badge">{activeRecommendation.mediaType === "movie" ? "Filme" : "Série"}</span>
                </div>

                <div className="recommendation-copy">
                  <div className="title-line">
                    <div>
                      <p>{activeRecommendation.year || "Ano não informado"} · ★ {activeRecommendation.rating || "—"}</p>
                      <h3>{activeRecommendation.title}</h3>
                    </div>
                  </div>
                  <p className="overview">{activeRecommendation.overview}</p>

                  <div className="providers-block">
                    <span>{source === "tmdb" ? "Disponível por assinatura no Brasil" : "Disponibilidade na versão conectada"}</span>
                    <div className="provider-list">
                      {activeRecommendation.providers.length ? activeRecommendation.providers.map((provider) => (
                        <span className="provider-chip" key={provider.id || provider.name}>
                          {provider.logoUrl && <Image src={provider.logoUrl} alt="" width={21} height={21} unoptimized />}
                          {provider.name}
                        </span>
                      )) : <span className="provider-chip">Consulte a disponibilidade</span>}
                    </div>
                  </div>

                  <div className="recommendation-actions">
                    <a href={activeRecommendation.tmdbUrl} target="_blank" rel="noreferrer" className="primary-action compact">
                      Ver detalhes <span aria-hidden="true">↗</span>
                    </a>
                    <button className="watched-action" onClick={markAsWatched} disabled={loadingRecommendations}>
                      <span aria-hidden="true">✓</span>
                      Já assisti
                    </button>
                  </div>
                </div>
              </article>
            )}

            {queueExhausted && (
              <div className="queue-message" role="status">
                Você chegou ao fim desta fila. Uma nova rodada abre outras categorias e recomendações.
              </div>
            )}

            <div className="recommendation-footnote">
              <span>{source === "tmdb" ? "Catálogo atualizado pela API do TMDB" : "Modo demonstrativo — conecte a API para disponibilidade atual"}</span>
              <span>{seen.size} título{seen.size === 1 ? "" : "s"} marcado{seen.size === 1 ? "" : "s"} como assistido{seen.size === 1 ? "" : "s"}</span>
            </div>
          </div>
        </section>
      )}

      <footer className="site-footer">
        <span>Feito para transformar repertório em descoberta.</span>
        <div className="data-credits">
          <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" aria-label="Acessar o TMDB">
            <Image src="/tmdb.svg" alt="TMDB" width={88} height={12} />
          </a>
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB. Availability by <a href="https://www.justwatch.com/br" target="_blank" rel="noreferrer">JustWatch</a>.</span>
        </div>
      </footer>
    </main>
  );
}
