import React, { useState } from 'react';
import { Film, Check, X } from 'lucide-react';

const quizData = [
  {
    category: 'sci-fi',
    question: "Who is Star Wars' main villain?",
    options: ['Darth Vader', 'Voldemort', 'Thanos'],
    correct: 0
  },
  {
    category: 'sci-fi',
    question: 'In which movie does a team travel through a wormhole?',
    options: ['Gravity', 'Interstellar', 'The Martian'],
    correct: 1
  },
  {
    category: 'action',
    question: 'Who played John Wick?',
    options: ['Keanu Reeves', 'Tom Cruise', 'Matt Damon'],
    correct: 0
  },
  {
    category: 'action',
    question: 'Which franchise features Dominic Toretto?',
    options: ['Mission Impossible', 'Fast & Furious', 'James Bond'],
    correct: 1
  },
  {
    category: 'comedy',
    question: 'Who directed "The Grand Budapest Hotel"?',
    options: ['Wes Anderson', 'Quentin Tarantino', 'Christopher Nolan'],
    correct: 0
  },
  {
    category: 'comedy',
    question: 'Which movie features the character "Ron Burgundy"?',
    options: ['Step Brothers', 'Anchorman', 'Talladega Nights'],
    correct: 1
  }
];

const movieRecommendations = {
  'sci-fi': {
    title: 'Duna: Parte Dois',
    description: 'Uma épica jornada de ficção científica através de planetas desérticos e profecias antigas.',
    theater: 'Cinemark Eldorado',
    showtimes: ['14:30', '18:00', '21:30']
  },
  'action': {
    title: 'Missão Impossível: Acerto de Contas',
    description: 'Ação explosiva com sequências de tirar o fôlego e perseguições impossíveis.',
    theater: 'Cinépolis JK Iguatemi',
    showtimes: ['15:00', '18:30', '22:00']
  },
  'comedy': {
    title: 'Barbie',
    description: 'Uma comédia vibrante e inteligente sobre autoconhecimento e amizade.',
    theater: 'UCI Anália Franco',
    showtimes: ['13:00', '16:15', '19:30']
  }
};

function MovieQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scores, setScores] = useState({ 'sci-fi': 0, 'action': 0, 'comedy': 0 });
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswer = (answerIndex) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const question = quizData[currentQuestion];
    if (answerIndex === question.correct) {
      setScores(prev => ({
        ...prev,
        [question.category]: prev[question.category] + 1
      }));
    }

    setTimeout(() => {
      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setQuizComplete(true);
      }
    }, 1500);
  };

  const getRecommendation = () => {
    const topCategory = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );
    return movieRecommendations[topCategory];
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScores({ 'sci-fi': 0, 'action': 0, 'comedy': 0 });
    setQuizComplete(false);
  };

  if (quizComplete) {
    const recommendation = getRecommendation();
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          <div className="flex items-center justify-center mb-6">
            <Film className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Sua Recomendação
          </h2>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {recommendation.title}
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {recommendation.description}
            </p>
            <div className="border-t border-purple-200 pt-4">
              <p className="text-sm font-semibold text-purple-800 mb-2">
                📍 {recommendation.theater}
              </p>
              <div className="flex gap-2 flex-wrap">
                {recommendation.showtimes.map((time, idx) => (
                  <span key={idx} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={resetQuiz}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Fazer Novo Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quizData[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-purple-600">
              Pergunta {currentQuestion + 1} de {quizData.length}
            </span>
            <Film className="w-6 h-6 text-purple-600" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-tight">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            const showResult = showFeedback && isSelected;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl font-medium transition-all text-left flex items-center justify-between
                  ${!showFeedback ? 'bg-gray-50 hover:bg-purple-50 hover:border-purple-300 border-2 border-gray-200' : ''}
                  ${showResult && isCorrect ? 'bg-green-50 border-2 border-green-500' : ''}
                  ${showResult && !isCorrect ? 'bg-red-50 border-2 border-red-500' : ''}
                  ${showFeedback && !isSelected ? 'opacity-50' : ''}
                `}
              >
                <span className="text-gray-800">{option}</span>
                {showResult && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                {showResult && !isCorrect && <X className="w-5 h-5 text-red-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MovieQuiz;
