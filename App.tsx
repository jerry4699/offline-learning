
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Trophy, 
  CheckCircle, 
  Mic, 
  BookOpen, 
  BarChart, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { MODULES, INITIAL_XP } from './constants';
import { AppState, UserProgress, Module, QuizSession } from './types';
import { getTutorExplanation } from './services/gemini';
import { QRCodeSVG } from 'qrcode.react';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('dashboard');
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [user, setUser] = useState<UserProgress>({
    xp: INITIAL_XP,
    completedModules: [],
    moduleScores: {}
  });
  
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('rural_learn_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('rural_learn_user', JSON.stringify(user));
  }, [user]);

  const handleStartStudy = (module: Module) => {
    setActiveModule(module);
    setView('study');
  };

  const handleStartQuiz = () => {
    if (!activeModule) return;
    setQuizSession({
      moduleId: activeModule.id,
      currentQuestionIndex: 0,
      score: 0,
      answers: []
    });
    setView('quiz');
  };

  const handleAnswer = async (index: number) => {
    if (!quizSession || !activeModule || feedback) return;

    const currentQuestion = activeModule.questions[quizSession.currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswerIndex;

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // Optional AI Explanation if online
    if (navigator.onLine) {
      setIsAiLoading(true);
      const expl = await getTutorExplanation(
        activeModule.title, 
        currentQuestion.text, 
        currentQuestion.options[index], 
        isCorrect
      );
      setAiExplanation(expl || null);
      setIsAiLoading(false);
    }

    // Delay and move to next or results
    setTimeout(() => {
      setFeedback(null);
      setAiExplanation(null);
      
      const nextIndex = quizSession.currentQuestionIndex + 1;
      const newScore = isCorrect ? quizSession.score + 1 : quizSession.score;
      
      if (nextIndex < activeModule.questions.length) {
        setQuizSession({
          ...quizSession,
          currentQuestionIndex: nextIndex,
          score: newScore,
          answers: [...quizSession.answers, index]
        });
      } else {
        // Complete Quiz
        const finalScore = newScore;
        const totalQuestions = activeModule.questions.length;
        
        // Update user state if finished
        setUser(prev => {
          const isCompleted = prev.completedModules.includes(activeModule.id);
          const newXp = isCompleted ? prev.xp : prev.xp + activeModule.xpReward;
          const newCompleted = isCompleted ? prev.completedModules : [...prev.completedModules, activeModule.id];
          
          return {
            ...prev,
            xp: newXp,
            completedModules: newCompleted,
            moduleScores: {
              ...prev.moduleScores,
              [activeModule.id]: Math.max(prev.moduleScores[activeModule.id] || 0, finalScore)
            }
          };
        });
        
        setQuizSession({
          ...quizSession,
          score: finalScore
        });
        setView('results');
      }
    }, feedback ? 1000 : 1500); // Wait 1.5s if there is AI feedback
  };

  const handleReturnToDashboard = () => {
    setView('dashboard');
    setActiveModule(null);
    setQuizSession(null);
  };

  // --- RENDERS ---

  const renderDashboard = () => (
    <div className="max-w-md mx-auto min-h-screen pb-10 flex flex-col">
      <header className="p-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">My Learning Path</h1>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <Trophy className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-700">{user.xp} XP</span>
        </div>
      </header>

      <main className="p-6 space-y-4 flex-1">
        <div className="bg-slate-100 rounded-xl p-4 mb-2">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Your Progress</p>
          <div className="mt-2 h-3 bg-white rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${(user.completedModules.length / MODULES.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-600 font-medium">
            {user.completedModules.length} of {MODULES.length} modules mastered
          </p>
        </div>

        {MODULES.map((module) => {
          const isCompleted = user.completedModules.includes(module.id);
          const score = user.moduleScores[module.id];
          return (
            <button
              key={module.id}
              onClick={() => handleStartStudy(module)}
              className="w-full text-left bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 hover:border-blue-400 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {isCompleted ? <CheckCircle className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">{module.title}</h3>
                <p className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-slate-500'}`}>
                  {isCompleted ? `Mastered (Best Score: ${score}/${module.questions.length})` : module.subtitle}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500" />
            </button>
          );
        })}
      </main>
    </div>
  );

  const renderStudy = () => (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white">
      <header className="p-4 border-b border-slate-100 flex items-center sticky top-0 bg-white z-10">
        <button 
          onClick={() => setView('dashboard')}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h2 className="ml-2 font-bold text-lg text-slate-800 line-clamp-1">{activeModule?.title}</h2>
      </header>

      <main className="p-8 flex-1 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Learn about {activeModule?.title.split(': ')[1]}
        </h1>
        
        <div className="space-y-6">
          {activeModule?.content.map((para, i) => (
            <p key={i} className="text-lg leading-relaxed text-slate-700">
              {para}
            </p>
          ))}
        </div>

        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-800">Study Tip</h4>
            <p className="text-sm text-blue-700 mt-1">Read the text carefully! The quiz will test your understanding of these core concepts.</p>
          </div>
        </div>
        
        <div className="h-24" /> {/* Spacer for sticky button */}
      </main>

      <div className="sticky-bottom bg-white p-4 border-t border-slate-100 shadow-lg">
        <button 
          onClick={handleStartQuiz}
          className="w-full bg-blue-600 text-white font-bold text-xl py-5 rounded-2xl shadow-blue-200 shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          START QUIZ
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!quizSession || !activeModule) return null;
    const currentQuestion = activeModule.questions[quizSession.currentQuestionIndex];
    const progress = ((quizSession.currentQuestionIndex + 1) / activeModule.questions.length) * 100;

    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-500 uppercase">
              Question {quizSession.currentQuestionIndex + 1} of {activeModule.questions.length}
            </span>
            <span className="text-sm font-bold text-blue-600">
              Score: {quizSession.score}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <main className="p-6 flex-1 flex flex-col">
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-md flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <button className="absolute top-4 right-4 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Mic className="w-6 h-6" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              {currentQuestion.text}
            </h2>
            
            {isAiLoading && (
              <div className="mt-8 flex items-center gap-2 text-blue-600 font-medium">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Thinking...
              </div>
            )}

            {aiExplanation && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Tutor Feedback</span>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed italic">
                  "{aiExplanation}"
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = "bg-white border-slate-200 text-slate-800";
              if (feedback && idx === currentQuestion.correctAnswerIndex) {
                btnClass = "bg-green-500 border-green-600 text-white shadow-green-100";
              } else if (feedback && idx !== currentQuestion.correctAnswerIndex) {
                // Dim other options during feedback
                btnClass = "bg-white opacity-50 border-slate-200 text-slate-400";
              }

              return (
                <button
                  key={idx}
                  disabled={!!feedback}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-5 text-lg font-bold rounded-2xl border-b-4 border-2 transition-all active:scale-[0.97] ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  };

  const renderResults = () => {
    if (!quizSession || !activeModule) return null;
    const percentage = (quizSession.score / activeModule.questions.length) * 100;
    
    // QR data for teacher sync
    const qrData = JSON.stringify({
      m: activeModule.title,
      s: `${quizSession.score}/${activeModule.questions.length}`,
      t: new Date().toISOString(),
      u: "student_offline_001"
    });

    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center p-8">
        <div className="mt-8 mb-4">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-200">
            <Trophy className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">SCORE: {quizSession.score}/{activeModule.questions.length}</h1>
        <p className="text-slate-500 font-medium mb-10">Module Completed Successfully!</p>

        <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 flex flex-col items-center w-full shadow-inner">
          <div className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200">
             <QRCodeSVG value={qrData} size={200} />
          </div>
          <p className="mt-6 text-sm font-bold text-slate-800 uppercase tracking-widest">Scan to Submit to Teacher</p>
          <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-bold">Result saved to device</span>
          </div>
        </div>

        <div className="mt-8 w-full p-6 bg-blue-50 rounded-2xl border border-blue-100">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-blue-900">Total Progress</h3>
              <span className="font-bold text-blue-600">+{activeModule.xpReward} XP</span>
           </div>
           <div className="flex gap-2">
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-blue-200">
                <div className="h-full bg-blue-600" style={{ width: '85%' }} />
              </div>
           </div>
           <p className="text-xs text-blue-700 mt-2 font-medium">Keep going! You are almost at Level 5.</p>
        </div>

        <div className="mt-auto pt-10 w-full">
          <button 
            onClick={handleReturnToDashboard}
            className="w-full bg-slate-800 text-white font-bold text-xl py-5 rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="antialiased min-h-screen flex flex-col">
      {view === 'dashboard' && renderDashboard()}
      {view === 'study' && renderStudy()}
      {view === 'quiz' && renderQuiz()}
      {view === 'results' && renderResults()}
    </div>
  );
};

export default App;
