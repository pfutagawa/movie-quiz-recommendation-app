import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Film, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const quizData = [
  {
    category: 'sci-fi',
    question: "Quem é o principal vilão de Star Wars?",
    options: ['Darth Vader', 'Voldemort', 'Thanos'],
    correct: 0
  },
  {
    category: 'sci-fi',
    question: 'Em qual filme uma equipe viaja por um buraco de minhoca?',
    options: ['Gravidade', 'Interestelar', 'Perdido em Marte'],
    correct: 1
  },
  {
    category: 'action',
    question: 'Quem interpretou John Wick?',
    options: ['Keanu Reeves', 'Tom Cruise', 'Matt Damon'],
    correct: 0
  },
  {
    category: 'action',
    question: 'Qual franquia tem o personagem Dominic Toretto?',
    options: ['Missão Impossível', 'Velozes e Furiosos', 'James Bond'],
    correct: 1
  },
  {
    category: 'comedy',
    question: 'Quem dirigiu "O Grande Hotel Budapeste"?',
    options: ['Wes Anderson', 'Quentin Tarantino', 'Christopher Nolan'],
    correct: 0
  },
  {
    category: 'comedy',
    question: 'Qual filme apresenta o personagem "Ron Burgundy"?',
    options: ['Quase Irmãos', 'O Âncora', 'Ricky Bobby: A Toda Velocidade'],
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

// --- COMPONENTE ---
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
      <LinearGradient colors={['#3b0764', '#5a1d82', '#4c1d95']} style={styles.container}>
        <SafeAreaView style={styles.card}>
          <View style={styles.headerIconContainer}>
            <Film color="#8b5cf6" size={48} />
          </View>
          <Text style={styles.recommendationTitle}>Sua Recomendação</Text>
          
          <LinearGradient colors={['#f5f3ff', '#eef2ff']} style={styles.recommendationBox}>
            <Text style={styles.movieTitle}>{recommendation.title}</Text>
            <Text style={styles.movieDescription}>{recommendation.description}</Text>
            
            <View style={styles.divider}>
              <Text style={styles.theaterText}>📍 {recommendation.theater}</Text>
              <View style={styles.showtimesContainer}>
                {recommendation.showtimes.map((time, idx) => (
                  <View key={idx} style={styles.showtimeBadge}>
                    <Text style={styles.showtimeText}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>

          <TouchableOpacity onPress={resetQuiz}>
            <LinearGradient colors={['#8b5cf6', '#4f46e5']} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Fazer Novo Quiz</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const question = quizData[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.length) * 100;

  return (
    <LinearGradient colors={['#3b0764', '#5a1d82', '#4c1d95']} style={styles.container}>
      <SafeAreaView style={styles.card}>
        <View style={styles.quizHeader}> {}
          <View style={styles.progressBarWrapper}> {}
            <Text style={styles.progressText}>
              Pergunta {currentQuestion + 1} de {quizData.length}
            </Text>
            <View style={styles.progressTrack}>
              <LinearGradient 
                colors={['#8b5cf6', '#4f46e5']}
                style={[styles.progressBar, { width: `${progress}%` }]}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              />
            </View>
          </View>
          <Film color="#8b5cf6" size={24} style={styles.filmIcon} /> {}
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.optionsList}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            const showResult = showFeedback && isSelected;

            const getOptionStyle = () => {
              if (showResult && isCorrect) return styles.correctOption;
              if (showResult && !isCorrect) return styles.incorrectOption;
              if (showFeedback && !isSelected) return [styles.optionButton, styles.disabledOption];
              return styles.optionButton;
            };

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswer(index)}
                disabled={showFeedback}
                style={getOptionStyle()}
              >
                <Text style={styles.optionText}>{option}</Text>
                {showResult && isCorrect && <Check color="#16a34a" size={20} />}
                {showResult && !isCorrect && <X color="#dc2626" size={20} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  
  quizHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
  },
  
  progressBarWrapper: {
    flex: 1, 
    marginRight: 16, 
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 8, 
  },
  progressTrack: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 8,
  },
  filmIcon: { 
    alignSelf: 'flex-start', 
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsList: {
    
  },
  optionButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  correctOption: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
    borderColor: '#4ade80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  incorrectOption: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fef2f2',
    borderColor: '#f87171',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flexShrink: 1,
    marginRight: 8,
  },
  headerIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  recommendationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  recommendationBox: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  movieDescription: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 24,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 16,
  },
  theaterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5b21b6',
    marginBottom: 8,
  },
  showtimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  showtimeBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  showtimeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MovieQuiz;
