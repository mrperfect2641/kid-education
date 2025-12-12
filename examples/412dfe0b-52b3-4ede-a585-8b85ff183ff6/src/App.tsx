import React, { useState, useEffect } from 'react';
import { Trophy, Play, History, XCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

type Operation = '+' | '-' | '×' | '÷';
type GameState = 'start' | 'playing' | 'result' | 'history';
type Score = {
  score: number;
  date: string;
};

function generateQuestion() {
  const operations: Operation[] = ['+', '-', '×', '÷'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1: number, num2: number, answer: number;

  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 90) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      break;
    case '×':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
    case '÷':
      num2 = Math.floor(Math.random() * 9) + 1;
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer;
      break;
  }

  const options = [answer];
  while (options.length < 4) {
    const wrongAnswer = answer + (Math.floor(Math.random() * 10) - 5);
    if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
      options.push(wrongAnswer);
    }
  }

  return {
    num1,
    num2,
    operation,
    answer,
    options: options.sort(() => Math.random() - 0.5),
  };
}

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(generateQuestion());
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const savedScores = localStorage.getItem('mathGameScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  const saveScore = (newScore: number) => {
    const scoreEntry: Score = {
      score: newScore,
      date: new Date().toLocaleString('zh-CN'),
    };
    const updatedScores = [scoreEntry, ...scores].slice(0, 10);
    setScores(updatedScores);
    localStorage.setItem('mathGameScores', JSON.stringify(updatedScores));
  };

  const handleAnswer = (selectedAnswer: number) => {
    const correct = selectedAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setQuestionCount(questionCount + 1);
      if (questionCount >= 9) {
        saveScore(score + (correct ? 1 : 0));
        setGameState('result');
      } else {
        setCurrentQuestion(generateQuestion());
      }
    }, 1000);
  };

  const startNewGame = () => {
    setGameState('playing');
    setScore(0);
    setQuestionCount(0);
    setCurrentQuestion(generateQuestion());
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 9) return '🏆';
    if (score >= 7) return '🌟';
    if (score >= 5) return '👍';
    return '💪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-32 -left-32 blur-xl"></div>
        <div className="absolute w-96 h-96 rounded-full bg-white/10 -bottom-48 -right-48 blur-xl"></div>
        <div className="absolute w-48 h-48 rounded-full bg-white/10 top-1/2 left-1/4 blur-xl"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s linear infinite`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative">
        {gameState === 'start' && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">数学小达人</h1>
            <div className="space-y-4">
              <button
                onClick={() => startNewGame()}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-bold"
              >
                <Play size={24} /> 开始游戏
              </button>
              <button 
                onClick={() => setGameState('history')}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-bold"
              >
                <History size={24} /> 查看成绩
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 font-semibold">题目 {questionCount + 1}/10</span>
              <span className="text-blue-600 font-bold text-xl">得分: {score}</span>
            </div>
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-gray-800 mb-6 bg-white/50 py-4 px-6 rounded-xl shadow-inner">
                {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ?
              </div>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="py-6 px-8 bg-white rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 text-2xl font-semibold text-gray-700 shadow-md"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {showFeedback && (
              <div className={`text-center text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} animate-bounce`}>
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={28} /> 答对了！
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <XCircle size={28} /> 再试一次！
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {gameState === 'result' && (
          <div className="text-center">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">游戏结束！</h2>
            <p className="text-2xl text-gray-600 mb-6">
              你的得分: {score}/10 {getScoreEmoji(score)}
            </p>
            <div className="space-y-4">
              <button
                onClick={startNewGame}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-bold"
              >
                再玩一次
              </button>
              <button
                onClick={() => setGameState('history')}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-bold"
              >
                查看历史成绩
              </button>
            </div>
          </div>
        )}

        {gameState === 'history' && (
          <div>
            <div className="flex items-center mb-6">
              <button
                onClick={() => setGameState('start')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">历史成绩</h2>
            </div>
            <div className="space-y-4">
              {scores.length === 0 ? (
                <p className="text-center text-gray-600">还没有历史成绩记录</p>
              ) : (
                scores.map((score, index) => (
                  <div
                    key={index}
                    className="bg-white/80 p-4 rounded-lg shadow-md flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getScoreEmoji(score.score)}</span>
                      <span className="font-semibold text-lg">{score.score}/10</span>
                    </div>
                    <span className="text-gray-500 text-sm">{score.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;