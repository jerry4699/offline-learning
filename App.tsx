
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ArrowLeft, Trophy, CheckCircle, Mic, BookOpen, 
  RefreshCw, Sparkles, ArrowRight, Award, Users, Shield, 
  Wifi, WifiOff, Zap, Star, LayoutDashboard, Globe, MessageCircle, PlayCircle, PlusCircle, Grid, RotateCcw,
  BarChart, MoreVertical, Settings, Heart, Zap as FlashIcon
} from 'lucide-react';
import { MODULES, INITIAL_XP, XP_PER_LEVEL, GAMES } from './constants';
import { AppState, UserProgress, Module, QuizSession, Role, Difficulty, Language } from './types';
import { getTutorExplanation } from './services/gemini';
import { QRCodeSVG } from 'qrcode.react';

const App: React.FC = () => {
  // Navigation & Identity
  const [view, setView] = useState<AppState>('dashboard');
  const [role, setRole] = useState<Role>('student');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  
  // User Data
  const [user, setUser] = useState<UserProgress & { badges: string[] }>({
    xp: INITIAL_XP,
    level: 1,
    completedModules: [],
    moduleScores: {},
    lastSync: null,
    difficultyPref: 'standard',
    language: 'english',
    pendingSyncCount: 0,
    badges: ['Early Bird']
  });

  // UI States
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('rural_learn_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load user progress", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rural_learn_v5', JSON.stringify(user));
  }, [user]);

  // Level Logic
  const currentLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;
  const xpInLevel = user.xp % XP_PER_LEVEL;

  useEffect(() => {
    if (currentLevel > user.level) {
      setShowLevelUp(true);
      setUser(prev => ({ ...prev, level: currentLevel, badges: [...prev.badges, `Level ${currentLevel} Master`] }));
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [user.xp]);

  const handleStartQuiz = () => {
    if (!activeModule) return;
    setQuizSession({
      moduleId: activeModule.id,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      mode: user.difficultyPref
    });
    setFeedback(null);
    setAiExplanation(null);
    setView('quiz');
  };

  const handleAnswer = async (index: number) => {
    if (!quizSession || !activeModule || feedback) return;
    const currentQuestion = activeModule.questions[quizSession.currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswerIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isOnline) {
      setIsAiLoading(true);
      const expl = await getTutorExplanation(activeModule.title, currentQuestion.text, currentQuestion.options[index], isCorrect);
      setAiExplanation(expl || null);
      setIsAiLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!quizSession || !activeModule || !feedback) return;
    const isCorrect = feedback === 'correct';
    const nextIndex = quizSession.currentQuestionIndex + 1;
    const newScore = isCorrect ? quizSession.score + 1 : quizSession.score;
    
    setFeedback(null);
    setAiExplanation(null);

    if (nextIndex < activeModule.questions.length) {
      setQuizSession({ ...quizSession, currentQuestionIndex: nextIndex, score: newScore });
    } else {
      const mastery = newScore / activeModule.questions.length;
      let nextDifficulty = user.difficultyPref;
      if (mastery < 0.4) nextDifficulty = 'easy';
      else if (mastery > 0.8) nextDifficulty = 'expert';

      setUser(prev => ({
        ...prev,
        xp: prev.completedModules.includes(activeModule.id) ? prev.xp : prev.xp + activeModule.xpReward,
        completedModules: prev.completedModules.includes(activeModule.id) ? prev.completedModules : [...prev.completedModules, activeModule.id],
        moduleScores: { ...prev.moduleScores, [activeModule.id]: Math.max(prev.moduleScores[activeModule.id] || 0, newScore) },
        difficultyPref: nextDifficulty
      }));
      setView('results');
    }
  };

  const StatusHeader = () => (
    <div className={`flex items-center justify-between px-6 py-2 ${isOnline ? 'bg-blue-600' : 'bg-slate-800'} text-white text-[10px] font-black uppercase tracking-widest z-[60] border-b-2 border-black`}>
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? 'Network: Online' : 'Offline Access Active'}
      </div>
      <button 
        onClick={() => setIsOnline(!isOnline)} 
        className="bg-white text-black px-2 py-0.5 rounded border border-black hover:bg-slate-100 transition-all active:scale-95"
      >
        {isOnline ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-md mx-auto min-h-screen pb-32 flex flex-col">
      <StatusHeader />
      <header className="p-6 glass-header sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center text-white font-black text-3xl">M</div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Hello, Musa!</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Level {user.level} Pupil</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setUser(p => ({...p, language: p.language === 'english' ? 'basic' : 'english'}))}
            className="w-12 h-12 bg-white rounded-2xl border-4 border-black flex items-center justify-center text-slate-800 shadow-[4px_4px_0_0_#000]"
          >
            <Globe className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="p-6 space-y-10 flex-1">
        {/* Stats Section */}
        <section className="bg-[#fef3c7] p-6 chunky-card rounded-[32px] relative overflow-hidden">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xs font-black text-amber-700 uppercase tracking-widest">Mastery Path</h2>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border-2 border-black">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-800 text-sm">{user.xp} XP</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} />
          </div>
          <p className="text-[10px] font-black text-amber-600 uppercase mt-3 tracking-widest">
            {XP_PER_LEVEL - xpInLevel} XP until level {user.level + 1}
          </p>
        </section>

        {/* Modules Grid */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Current Modules</h3>
            <span className="text-[10px] font-black text-blue-600 uppercase">View Path</span>
          </div>
          <div className="space-y-4">
            {MODULES.map((module) => {
              const isCompleted = user.completedModules.includes(module.id);
              return (
                <button
                  key={module.id}
                  onClick={() => { setActiveModule(module); setView('study'); }}
                  className={`w-full text-left p-6 rounded-[32px] chunky-card flex items-center gap-5 group`}
                >
                  <div className={`w-16 h-16 rounded-[24px] border-4 border-black flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-blue-100'} group-hover:rotate-6 transition-transform`}>
                    {isCompleted ? <CheckCircle className="w-8 h-8 text-green-600" /> : <BookOpen className="w-8 h-8 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 text-lg leading-tight">{module.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: isCompleted ? '100%' : '0%' }} />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase">{isCompleted ? '100%' : 'Start'}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-6">
           <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Your Badges</h3>
           <div className="grid grid-cols-4 gap-4">
              {['Star Pupil', 'Quiz King', 'Offline Pro', 'Early Bird', 'Level 2 Master', 'Math Whiz', 'Eco Warrior', 'Logic Guru'].map((badge, i) => (
                <div key={i} className={`flex flex-col items-center gap-2 ${user.badges.includes(badge) ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                   <div className={`w-14 h-14 rounded-full border-4 border-black flex items-center justify-center ${user.badges.includes(badge) ? 'bg-amber-100' : 'bg-slate-100'}`}>
                      <Award className={`w-7 h-7 ${user.badges.includes(badge) ? 'text-amber-600' : 'text-slate-400'}`} />
                   </div>
                   <span className="text-[8px] font-black uppercase text-center leading-none">{badge}</span>
                </div>
              ))}
           </div>
        </section>
      </main>

      {/* Navigation Dock */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white border-t-4 border-black flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 text-blue-600">
          <LayoutDashboard className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setView('game')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <PlayCircle className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase">Train</span>
        </button>
        <button onClick={() => setRole('teacher')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <Shield className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase">Admin</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <Settings className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase">Profile</span>
        </button>
      </footer>
    </div>
  );

  const renderTeacher = () => (
    <div className="max-w-md mx-auto min-h-screen bg-[#f1f5f9] animate-in slide-in-from-bottom duration-300">
      <StatusHeader />
      <header className="p-8 bg-white border-b-4 border-black flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic">Teacher Hub</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-3">Monitoring: Rural Sector 4</p>
        </div>
        <div className="w-16 h-16 bg-blue-100 rounded-2xl border-4 border-black flex items-center justify-center text-blue-600 shadow-[4px_4px_0_0_#000]">
           <Users className="w-8 h-8" />
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Class Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-5 rounded-[28px] border-4 border-black shadow-[4px_4px_0_0_#000]">
              <span className="text-[9px] font-black uppercase text-slate-400">Total Pupils</span>
              <p className="text-3xl font-black mt-1">24</p>
           </div>
           <div className="bg-white p-5 rounded-[28px] border-4 border-black shadow-[4px_4px_0_0_#000]">
              <span className="text-[9px] font-black uppercase text-slate-400">Avg Progress</span>
              <p className="text-3xl font-black mt-1 text-blue-600">68%</p>
           </div>
        </div>

        {/* Student List */}
        <section className="space-y-4">
           <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Student Performance</h3>
           <div className="bg-white rounded-[32px] border-4 border-black overflow-hidden shadow-[6px_6px_0_0_#000]">
              {[
                { name: 'Musa', progress: 85, active: '2m ago' },
                { name: 'Abebe', progress: 42, active: '1h ago' },
                { name: 'Lulu', progress: 95, active: 'Now' }
              ].map((student, i) => (
                <div key={i} className={`p-5 flex items-center justify-between ${i !== 2 ? 'border-b-4 border-slate-100' : ''}`}>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl border-2 border-black flex items-center justify-center font-black">{student.name[0]}</div>
                      <div>
                        <h4 className="font-black text-sm">{student.name}</h4>
                        <p className="text-[10px] font-bold text-green-500 uppercase">{student.active}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-blue-600">{student.progress}%</p>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 border border-black">
                         <div className="h-full bg-blue-500" style={{ width: `${student.progress}%` }} />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <button 
          onClick={() => { setRole('student'); setView('dashboard'); }} 
          className="w-full py-6 chunky-button-secondary font-black text-lg flex items-center justify-center gap-3"
        >
          <ArrowLeft className="w-6 h-6" /> EXIT ADMIN MODE
        </button>
      </main>
    </div>
  );

  const renderStudy = () => (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col animate-in slide-in-from-right duration-300">
      <StatusHeader />
      <header className="p-6 border-b-4 border-black flex items-center sticky top-0 bg-white z-20">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white border-4 border-black rounded-2xl shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="ml-4">
          <h2 className="font-black text-slate-800 text-xl truncate w-48">{activeModule?.title}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Studying...</p>
        </div>
      </header>

      <main className="p-8 flex-1 space-y-8 pb-40 relative">
        <div className="absolute top-8 right-8 opacity-10"><BookOpen className="w-32 h-32" /></div>
        <div className="w-24 h-3 bg-blue-600 rounded-full border-2 border-black" />
        <h3 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tighter">
          {user.language === 'english' ? 'Deep Knowledge' : 'Basic Story'}
        </h3>
        <div className="space-y-8 relative z-10">
           {(user.language === 'basic' ? activeModule?.basicContent : activeModule?.content)?.map((p, i) => (
             <p key={i} className="text-xl leading-relaxed text-slate-700 font-bold border-l-8 border-slate-100 pl-6">
               {p}
             </p>
           ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-8 bg-white/90 backdrop-blur-md border-t-4 border-black">
        <button 
          onClick={handleStartQuiz} 
          className="w-full py-6 chunky-button-primary text-2xl font-black flex items-center justify-center gap-4"
        >
          READY FOR QUIZ <FlashIcon className="w-8 h-8 fill-white" />
        </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!quizSession || !activeModule) return null;
    const currentQuestion = activeModule.questions[quizSession.currentQuestionIndex];
    const progress = ((quizSession.currentQuestionIndex + 1) / activeModule.questions.length) * 100;
    
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#f8fafc] flex flex-col">
        <StatusHeader />
        <div className="p-6 bg-white border-b-4 border-black sticky top-0 z-30 shadow-md">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessing Mastery</span>
              <div className="bg-amber-100 px-3 py-1 rounded-lg border-2 border-black text-amber-800 font-black text-xs">
                 REWARD: {activeModule.xpReward} XP
              </div>
           </div>
           <div className="progress-bar-container">
             <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
           </div>
        </div>

        <main className="p-6 flex-1 flex flex-col pb-48">
          <div className="bg-white p-10 rounded-[48px] border-4 border-black shadow-[8px_8px_0_0_#000] text-center mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="w-24 h-24" /></div>
            <button className="absolute top-4 left-4 p-3 bg-slate-50 rounded-2xl border-2 border-black">
              <Mic className="w-6 h-6" />
            </button>
            <h5 className="text-2xl font-black text-slate-800 leading-tight tracking-tight mt-6">
              {currentQuestion.text}
            </h5>
            
            {isAiLoading && (
              <div className="mt-8 flex justify-center items-center gap-3 text-blue-600 font-black text-xs">
                <RefreshCw className="w-5 h-5 animate-spin" /> THINKING...
              </div>
            )}
            
            {aiExplanation && (
              <div className="mt-10 p-6 bg-blue-50 rounded-[32px] text-left border-4 border-blue-600 italic text-blue-900 text-sm font-bold animate-in zoom-in duration-300">
                <Sparkles className="w-6 h-6 mb-3 text-blue-600" />
                "{aiExplanation}"
              </div>
            )}
          </div>

          <div className="space-y-5">
            {currentQuestion.options.map((option, idx) => {
              let btnStyle = "bg-white border-black text-slate-800 shadow-[6px_6px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1";
              if (feedback && idx === currentQuestion.correctAnswerIndex) btnStyle = "bg-green-500 text-white shadow-none translate-x-1 translate-y-1";
              else if (feedback && idx !== currentQuestion.correctAnswerIndex && feedback === 'incorrect') btnStyle = "bg-red-500 text-white shadow-none translate-x-1 translate-y-1";
              else if (feedback) btnStyle = "bg-white opacity-40 shadow-none grayscale pointer-events-none";

              return (
                <button
                  key={idx}
                  disabled={!!feedback}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-6 font-black text-xl rounded-[28px] border-4 transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full border-4 border-black flex items-center justify-center text-sm font-black">{String.fromCharCode(65 + idx)}</div>
                     {option}
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        {feedback && !isAiLoading && (
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-8 bg-white border-t-4 border-black z-40">
            <button 
              onClick={handleNextQuestion}
              className="w-full py-6 chunky-button-primary text-2xl font-black flex items-center justify-center gap-4"
            >
              {quizSession.currentQuestionIndex === activeModule.questions.length - 1 ? 'GET REWARDS' : 'NEXT CHALLENGE'}
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!quizSession || !activeModule) return null;
    const qrData = JSON.stringify({ m: activeModule.id, s: quizSession.score, xp: user.xp, date: new Date().toLocaleDateString() });
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center p-8 animate-in zoom-in duration-500">
        <StatusHeader />
        <div className="w-32 h-32 bg-amber-400 rounded-[48px] border-4 border-black flex items-center justify-center shadow-[8px_8px_0_0_#000] mt-12 animate-bounce">
          <Award className="w-16 h-16 text-black" />
        </div>
        <h2 className="text-6xl font-black text-slate-900 mt-12 tracking-tighter leading-none italic">BRAVO!</h2>
        <p className="text-slate-500 font-black uppercase text-xs tracking-[0.5em] mt-3">Mission Complete</p>
        
        <div className="mt-12 bg-[#f8fafc] p-10 rounded-[64px] border-4 border-black w-full flex flex-col items-center shadow-[12px_12px_0_0_#1e293b]">
          <div className="bg-white p-6 rounded-[48px] border-4 border-black shadow-lg">
            <QRCodeSVG value={qrData} size={180} />
          </div>
          <p className="text-[11px] font-black text-slate-800 uppercase mt-8 text-center leading-relaxed bg-amber-200 px-4 py-1 rounded-full border-2 border-black">
             Sync this with Teacher's Hub
          </p>
        </div>

        <div className="mt-12 w-full grid grid-cols-2 gap-6">
           <div className="bg-blue-600 p-6 rounded-[40px] border-4 border-black text-center shadow-[4px_4px_0_0_#000]">
             <span className="text-[10px] font-black text-white/80 uppercase">XP Gained</span>
             <p className="text-4xl font-black text-white mt-1">+{activeModule.xpReward}</p>
           </div>
           <div className="bg-green-500 p-6 rounded-[40px] border-4 border-black text-center shadow-[4px_4px_0_0_#000]">
             <span className="text-[10px] font-black text-white/80 uppercase">Accuracy</span>
             <p className="text-4xl font-black text-white mt-1">{Math.round((quizSession.score / activeModule.questions.length) * 100)}%</p>
           </div>
        </div>

        <button 
          onClick={() => setView('dashboard')} 
          className="mt-auto w-full py-6 chunky-button-primary text-2xl font-black"
        >
          GO HOME
        </button>
      </div>
    );
  };

  const renderGame = () => {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-white flex flex-col p-8">
        <header className="flex justify-between items-center mb-16">
           <button onClick={() => setView('dashboard')} className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center"><ArrowLeft /></button>
           <h2 className="text-xl font-black tracking-widest uppercase">Skill Training</h2>
           <div className="w-12 h-12" />
        </header>
        
        <div className="flex-1 flex flex-col justify-center space-y-10">
           <div className="text-center space-y-4">
              <Trophy className="w-20 h-20 text-amber-500 mx-auto animate-bounce-subtle" />
              <h3 className="text-4xl font-black tracking-tighter">Brain Power</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Improve your skills & earn XP</p>
           </div>

           <div className="space-y-4">
              {GAMES.map(game => (
                <button 
                  key={game.id} 
                  className="w-full bg-slate-800 p-6 rounded-[32px] border-4 border-slate-700 flex items-center gap-6 hover:bg-blue-600 hover:border-blue-400 transition-all active:scale-95 group"
                >
                   <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      {game.icon === 'Zap' ? <Zap className="w-8 h-8" /> : <Grid className="w-8 h-8" />}
                   </div>
                   <div className="text-left flex-1">
                      <h4 className="font-black text-lg">{game.title}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{game.desc}</p>
                   </div>
                   <div className="bg-amber-500 text-black px-3 py-1 rounded-full font-black text-[10px] uppercase">+{game.xp} XP</div>
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="antialiased min-h-screen">
      {role === 'teacher' ? renderTeacher() : (
        <>
          {view === 'dashboard' && renderDashboard()}
          {view === 'study' && renderStudy()}
          {view === 'quiz' && renderQuiz()}
          {view === 'results' && renderResults()}
          {view === 'game' && renderGame()}
        </>
      )}
      
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6 bg-blue-600/40 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white text-black p-16 rounded-[64px] shadow-[16px_16px_0_0_#000] flex flex-col items-center animate-in zoom-in-50 duration-500 border-8 border-black">
            <Trophy className="w-32 h-32 mb-8 text-amber-500 animate-bounce" />
            <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none italic">LEVEL {user.level}!</h2>
            <p className="text-3xl font-black opacity-90 mt-4 tracking-tight">You are growing fast!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
