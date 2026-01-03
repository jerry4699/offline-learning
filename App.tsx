import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { 
  ChevronRight, ArrowLeft, Trophy, CheckCircle, Mic, BookOpen, 
  RefreshCw, Sparkles, ArrowRight, Award, Users, Shield, 
  Wifi, WifiOff, Zap, Star, LayoutDashboard, Globe, MessageCircle, PlayCircle, PlusCircle, Grid, RotateCcw,
  BarChart, Settings, Heart, LogOut, Flame, TrendingUp, Loader2, Timer, Eye, BrainCircuit, Lightbulb, ChevronDown, FileText, Upload, Trash2, Activity,
  Smartphone, UserCircle2, GraduationCap, Briefcase, Pencil, Brain, LogIn, UserPlus, Search, AlertCircle, Medal
} from 'lucide-react';
import { MODULES, INITIAL_XP, XP_PER_LEVEL, GAMES, VOCAB_MATCH_DATA, VOCAB_RECALL_SEQUENCES, STROOP_COLORS, TRANSLATIONS, POEMS } from './constants';
import { AppState, UserProgress, Module, QuizSession, Role, Language, Question, Poem, AuthMethod, Difficulty } from './types';
import { getTutorExplanation } from './services/gemini';

// Animation wrapper for consistent view transitions
const ViewWrapper = ({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) => (
  <div key={id} className={`view-enter flex flex-col flex-1 w-full h-full ${className}`}>
    {children}
  </div>
);

// Floating background elements
const FloatingDoodles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    <Zap className="absolute top-[10%] left-[10%] w-12 h-12 text-blue-600 animate-float" />
    <BookOpen className="absolute top-[20%] right-[15%] w-16 h-16 text-amber-500 animate-float-slow" />
    <Pencil className="absolute bottom-[25%] left-[5%] w-10 h-10 text-purple-600 animate-float" />
    <GraduationCap className="absolute bottom-[15%] right-[10%] w-14 h-14 text-green-600 animate-float-slow" />
    <Brain className="absolute top-[45%] right-[5%] w-12 h-12 text-pink-600 animate-float" />
    <Star className="absolute top-[60%] left-[15%] w-8 h-8 text-yellow-500 animate-float-slow" />
    <MessageCircle className="absolute bottom-[40%] right-[20%] w-10 h-10 text-cyan-600 animate-float" />
  </div>
);

const App: React.FC = () => {
  // Navigation & Identity
  const [view, setView] = useState<AppState>('auth');
  const [authStep, setAuthStep] = useState<'entry' | 'signup' | 'login'>('entry');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProgress | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  
  // Dropdown States
  const [showAuthLangMenu, setShowAuthLangMenu] = useState(false);
  const [showHeaderLangMenu, setShowHeaderLangMenu] = useState(false);

  // Auth States
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState('');

  // UI States
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);

  // Practice from Notes States
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentNoteQuiz, setCurrentNoteQuiz] = useState<{
    index: number;
    score: number;
    feedback: 'correct' | 'incorrect' | null;
  } | null>(null);

  // Fluency States
  const [activePoem, setActivePoem] = useState<Poem | null>(null);
  const [fluencyTimer, setFluencyTimer] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [currentPoemLine, setCurrentPoemLine] = useState(0);
  const [fluencyResults, setFluencyResults] = useState<{
    wpm: number;
    accuracy: number;
    wordsRead: string[];
  } | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const transcriptRef = useRef<string>("");

  // Arcade Game States
  const [mathGame, setMathGame] = useState<{ q: string, a: number, options: number[] } | null>(null);
  const [mathScore, setMathScore] = useState(0);
  const [mathTime, setMathTime] = useState(30);
  
  const [matrixGrid, setMatrixGrid] = useState<{ color: string, id: number }[]>([]);
  const [targetId, setTargetId] = useState(-1);
  const [matrixScore, setMatrixScore] = useState(0);

  // Vocab Game States
  const [vocabGameScore, setVocabGameScore] = useState(0);
  const [vocabFocusData, setVocabFocusData] = useState({ word: '', color: '' });
  const [vocabMatchIndex, setVocabMatchIndex] = useState(0);
  const [vocabRecallState, setVocabRecallState] = useState<{
    sequence: string[];
    shuffled: string[];
    userSelection: string[];
    isMemorizing: boolean;
    stage: number;
  }>({ sequence: [], shuffled: [], userSelection: [], isMemorizing: true, stage: 0 });

  // Derivations
  const currentLevelVal = currentUser ? Math.floor(currentUser.xp / XP_PER_LEVEL) + 1 : 1;
  const xpInLevelVal = currentUser ? currentUser.xp % XP_PER_LEVEL : 0;

  const t = (key: string) => {
    return TRANSLATIONS[selectedLanguage]?.[key] || TRANSLATIONS['english'][key] || key;
  };

  const langNames: Record<Language, string> = {
    english: 'English',
    marathi: 'Marathi',
    hindi: 'Hindi'
  };

  // Effects
  useEffect(() => {
    const session = localStorage.getItem('studybuddy_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        setCurrentUser(user);
        setSelectedLanguage(user.language || 'english');
        checkStreak(user);
        routeByRole(user.role);
      } catch (e) {
        localStorage.removeItem('studybuddy_session');
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('studybuddy_session', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.level < currentLevelVal) {
      setCurrentUser(prev => prev ? ({ ...prev, level: currentLevelVal }) : null);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [currentLevelVal, currentUser?.level]);

  // Fluency Logic
  useEffect(() => {
    let interval: any;
    if (isReading && fluencyTimer > 0) {
      interval = setInterval(() => {
        setFluencyTimer(prev => prev - 1);
      }, 1000);
    } else if (isReading && fluencyTimer === 0) {
      finishReading();
    }
    return () => clearInterval(interval);
  }, [isReading, fluencyTimer]);

  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'marathi' ? 'mr-IN' : (selectedLanguage === 'hindi' ? 'hi-IN' : 'en-US');
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcriptRef.current += event.results[i][0].transcript + " ";
          }
        }
      };

      recognition.onerror = () => {
        setIsOnline(false); 
      };

      recognitionRef.current = recognition;
    }
  };

  const startPoemPractice = (poem: Poem) => {
    setActivePoem(poem);
    setFluencyTimer(poem.duration);
    setIsReading(false);
    setCurrentPoemLine(0);
    setFluencyResults(null);
    transcriptRef.current = "";
    initSpeechRecognition();
    setView('fluency-practice');
  };

  const toggleReading = () => {
    if (!isReading) {
      startTimeRef.current = Date.now();
      setIsReading(true);
      if (recognitionRef.current && isOnline) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    } else {
      finishReading();
    }
  };

  const finishReading = () => {
    const durationSeconds = Math.max(1, (Date.now() - startTimeRef.current) / 1000);
    setIsReading(false);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }

    if (activePoem) {
      const originalText = (activePoem.linesTranslated[selectedLanguage] || activePoem.lines).join(" ");
      const originalWords = originalText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/).filter(w => w.length > 0);
      const wpm = Math.round((originalWords.length / durationSeconds) * 60);

      let accuracy = 85; // Baseline for local demo
      if (transcriptRef.current && isOnline) {
        const spokenWords = transcriptRef.current.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/).filter(w => w.length > 0);
        let matches = 0;
        const spokenSet = new Set(spokenWords);
        originalWords.forEach(word => { if (spokenSet.has(word)) matches++; });
        accuracy = Math.round((matches / originalWords.length) * 100);
      }

      setFluencyResults({ wpm: Math.min(wpm, 250), accuracy: Math.min(accuracy, 100), wordsRead: [] });
      const xpGain = 50 + (accuracy > 80 ? 25 : 0);
      setCurrentUser(p => p ? ({ ...p, xp: p.xp + xpGain }) : null);
      setEncouragement(t('wellDone'));
      setTimeout(() => setEncouragement(null), 3000);
    }
  };

  const checkStreak = (user: UserProgress) => {
    const today = new Date().toDateString();
    if (user.lastActiveDate !== today) {
      const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let newStreak = user.streak;
      if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      setCurrentUser({ ...user, streak: newStreak, lastActiveDate: today });
    }
  };

  const routeByRole = (role: Role) => {
    if (role === 'teacher') setView('teacher');
    else if (role === 'alumni') setView('alumni');
    else if (role === 'guest') setView('dashboard'); 
    else setView('dashboard');
  };

  const handleGoogleLogin = () => {
    if (!isOnline) {
      setAuthError("Internet required for Google Login. Please connect and try again.");
      return;
    }
    setAuthMethod('google');
    setAuthError("");
    setView('role-selection');
  };

  const handleMobileLogin = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setAuthError("Enter a valid mobile number to receive OTP.");
      return;
    }
    if (!isOnline) {
      setAuthError("Internet required to send OTP. Please connect to the internet.");
      return;
    }
    setAuthError("");
    setView('otp-verify');
  };

  const handleOtpVerify = () => {
    if (otp === '1234' || otp.length === 4) {
      setAuthMethod('mobile');
      setAuthError("");
      setView('role-selection');
    } else {
      setAuthError("Invalid OTP. Please enter 1234 to proceed.");
    }
  };

  const handleGuestEntry = () => {
    const guestUser: UserProgress = {
      username: 'Guest Learner', 
      role: 'student', 
      xp: 0, 
      level: 1, 
      completedModules: [], 
      moduleScores: {},
      vocabScores: { focus: 0, match: 0, recall: 0 }, 
      vocabCompletion: { focus: false, match: false, recall: false },
      lastSync: null, 
      difficultyPref: 'standard', 
      language: selectedLanguage, 
      pendingSyncCount: 0,
      badges: ['Explorer'], 
      streak: 1, 
      lastActiveDate: new Date().toDateString(), 
      authMethod: 'guest'
    };
    setCurrentUser(guestUser);
    setAuthError("");
    setView('dashboard');
  };

  const handleRoleSelect = (role: Role) => {
    const newUser: UserProgress = {
      username: authMethod === 'google' ? 'Student User' : mobileNumber || 'New Pupil',
      role: role, 
      xp: 0, 
      level: 1, 
      completedModules: [], 
      moduleScores: {},
      vocabScores: { focus: 0, match: 0, recall: 0 }, 
      vocabCompletion: { focus: false, match: false, recall: false },
      lastSync: isOnline ? new Date().toISOString() : null, 
      difficultyPref: 'standard', 
      language: selectedLanguage, 
      pendingSyncCount: 0,
      badges: ['Early Adopter'], 
      streak: 1, 
      lastActiveDate: new Date().toDateString(), 
      authMethod: authMethod || 'google'
    };
    setCurrentUser(newUser);
    routeByRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('studybuddy_session');
    setCurrentUser(null);
    setView('auth');
    setAuthStep('entry');
    setAuthMethod(null);
    setMobileNumber('');
    setOtp('');
    setAuthError('');
  };

  const changeLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    if (currentUser) setCurrentUser({ ...currentUser, language: lang });
    setShowAuthLangMenu(false);
  };

  // Math Logic
  const generateMathQ = () => {
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    const ans = n1 + n2;
    const opts = [ans, ans + 2, ans - 3, ans + 5].sort(() => Math.random() - 0.5);
    setMathGame({ q: `${n1} + ${n2} = ?`, a: ans, options: opts });
  };
  const startMathDuel = () => { setMathScore(0); setMathTime(30); generateMathQ(); setView('math-duel'); };
  const handleMathAns = (val: number) => {
    if (val === mathGame?.a) { setMathScore(s => s + 10); generateMathQ(); }
    else { setMathScore(s => Math.max(0, s - 5)); }
  };
  useEffect(() => {
    let t_int: any;
    if (view === 'math-duel' && mathTime > 0) { t_int = setInterval(() => setMathTime(prev => prev - 1), 1000); }
    else if (view === 'math-duel' && mathTime === 0) {
      const xp = Math.floor(mathScore / 2);
      setCurrentUser(p => p ? ({ ...p, xp: p.xp + xp }) : null);
      setView('game');
    }
    return () => clearInterval(t_int);
  }, [view, mathTime, mathScore]);

  // Logic Matrix Logic
  const generateMatrix = () => {
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7'];
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    const targetIdx = Math.floor(Math.random() * 9);
    const newGrid = Array(9).fill(null).map((_, i) => ({ color: i === targetIdx ? baseColor + 'CC' : baseColor, id: i }));
    setMatrixGrid(newGrid);
    setTargetId(targetIdx);
  };
  const startLogicMatrix = () => { setMatrixScore(0); generateMatrix(); setView('logic-grid'); };
  const handleMatrixClick = (id: number) => {
    if (id === targetId) { setMatrixScore(s => s + 15); generateMatrix(); }
    else { setMatrixScore(s => Math.max(0, s - 10)); }
  };

  const handleStartQuiz = (difficulty: Difficulty) => {
    if (activeModule) {
      const filtered = activeModule.questions.filter(q => q.difficulty === difficulty);
      const finalQuestions = filtered.length > 0 ? filtered : activeModule.questions;
      
      setQuizSession({ 
        moduleId: activeModule.id, 
        currentQuestionIndex: 0, 
        score: 0, 
        answers: [], 
        mode: difficulty,
        filteredQuestions: finalQuestions
      });

      if (currentUser) {
        setCurrentUser({ ...currentUser, difficultyPref: difficulty });
      }

      setFeedback(null); 
      setAiExplanation(null); 
      setView('quiz');
    }
  };

  const handleAnswer = async (index: number) => {
    if (!quizSession || !activeModule) return;
    const currentQuestion = quizSession.filteredQuestions[quizSession.currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswerIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) setQuizSession({ ...quizSession, score: quizSession.score + 10 });

    if (isOnline) {
      setIsAiLoading(true);
      const explanation = await getTutorExplanation(activeModule.title, currentQuestion.text, currentQuestion.options[index], isCorrect);
      setAiExplanation(explanation);
      setIsAiLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!quizSession || !activeModule) return;
    const nextIndex = quizSession.currentQuestionIndex + 1;
    if (nextIndex < quizSession.filteredQuestions.length) {
      setQuizSession({ ...quizSession, currentQuestionIndex: nextIndex });
      setFeedback(null); setAiExplanation(null);
    } else {
      if (currentUser) {
        const xpGain = activeModule.xpReward + quizSession.score;
        const maxPossibleScore = quizSession.filteredQuestions.length * 10;
        const isPerfect = quizSession.score === maxPossibleScore;
        
        let newBadges = [...currentUser.badges];
        if (isPerfect && !newBadges.includes('Quiz Master')) {
          newBadges.push('Quiz Master');
          setEncouragement("Achievement Unlocked: Quiz Master! 🏆");
        }

        setCurrentUser({
          ...currentUser, 
          xp: currentUser.xp + xpGain,
          completedModules: [...new Set([...currentUser.completedModules, activeModule.id])],
          moduleScores: { ...currentUser.moduleScores, [activeModule.id]: quizSession.score },
          badges: newBadges
        });
      }
      setView('results');
    }
  };

  const generateVocabFocus = () => {
    const word = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    const color = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    setVocabFocusData({ word: word.name, color: color.color });
  };

  const handleVocabFocus = (selectedColor: string) => {
    if (selectedColor === vocabFocusData.color) {
      setVocabGameScore(s => s + 10);
      generateVocabFocus();
    } else {
      setVocabGameScore(s => Math.max(0, s - 5));
    }
  };

  const handleVocabMatch = (index: number) => {
    const current = VOCAB_MATCH_DATA[vocabMatchIndex];
    if (current.options[index] === current.meaning) {
      const newScore = vocabGameScore + 10;
      setVocabGameScore(newScore);
      if (vocabMatchIndex < VOCAB_MATCH_DATA.length - 1) {
        setVocabMatchIndex(v => v + 1);
      } else {
        const xpGain = Math.floor(newScore / 2);
        setCurrentUser(p => p ? ({ ...p, xp: p.xp + xpGain }) : null);
        setEncouragement("Vocab Master!");
        setTimeout(() => {
          setEncouragement(null);
          setView('game');
        }, 2000);
      }
    } else {
      setVocabGameScore(s => Math.max(0, s - 5));
    }
  };

  const startVocabRecall = () => {
    const sequence = VOCAB_RECALL_SEQUENCES[Math.floor(Math.random() * VOCAB_RECALL_SEQUENCES.length)];
    const shuffled = [...sequence].sort(() => Math.random() - 0.5);
    setVocabRecallState({
      sequence,
      shuffled,
      userSelection: [],
      isMemorizing: true,
      stage: 0
    });
    setView('vocab-recall');
    setTimeout(() => {
      setVocabRecallState(prev => ({ ...prev, isMemorizing: false }));
    }, 3000);
  };

  const handleVocabRecall = (word: string) => {
    const { sequence, userSelection } = vocabRecallState;
    const nextIndex = userSelection.length;
    
    if (sequence[nextIndex] === word) {
      const newSelection = [...userSelection, word];
      setVocabRecallState(prev => ({ ...prev, userSelection: newSelection }));
      
      if (newSelection.length === sequence.length) {
        setCurrentUser(p => p ? ({ ...p, xp: p.xp + 50 }) : null);
        setEncouragement("Excellent Memory!");
        setTimeout(() => {
          setEncouragement(null);
          setView('game');
        }, 1500);
      }
    } else {
      setEncouragement("Try again!");
      setTimeout(() => {
        setEncouragement(null);
        setVocabRecallState(prev => ({ ...prev, userSelection: [] }));
      }, 1000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsExtracting(true);
      setTimeout(() => {
        setIsExtracting(false);
      }, 1500);
    }
  };

  const startPracticeQuiz = () => {
    if (!isOnline) {
      setEncouragement("Internet required to analyze notes!");
      setTimeout(() => setEncouragement(null), 3000);
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const mockQuestions: Question[] = [
        { id: 'note-q1', text: 'What is the primary topic of these notes?', options: ['History', 'Science', 'Math', 'Language'], correctAnswerIndex: 0, difficulty: 'standard' },
        { id: 'note-q2', text: 'Which key term was highlighted the most?', options: ['Evolution', 'Revolution', 'Structure', 'Process'], correctAnswerIndex: 1, difficulty: 'standard' }
      ];
      setPracticeQuestions(mockQuestions);
      setCurrentNoteQuiz({ index: 0, score: 0, feedback: null });
      setIsGenerating(false);
      setView('notes-quiz');
    }, 2000);
  };

  const handleNoteAnswer = (index: number) => {
    if (!currentNoteQuiz) return;
    const q = practiceQuestions[currentNoteQuiz.index];
    const isCorrect = index === q.correctAnswerIndex;
    setCurrentNoteQuiz({ ...currentNoteQuiz, feedback: isCorrect ? 'correct' : 'incorrect', score: isCorrect ? currentNoteQuiz.score + 10 : currentNoteQuiz.score });
  };

  const nextNoteQ = () => {
    if (!currentNoteQuiz) return;
    const nextIdx = currentNoteQuiz.index + 1;
    if (nextIdx < practiceQuestions.length) {
      setCurrentNoteQuiz({ ...currentNoteQuiz, index: nextIdx, feedback: null });
    } else {
      const finalScore = currentNoteQuiz.score;
      setCurrentUser(p => p ? ({ ...p, xp: p.xp + finalScore }) : null);
      setEncouragement("Notes Mastered!");
      setTimeout(() => { setEncouragement(null); setView('dashboard'); }, 1500);
    }
  };

  const StatusHeader = () => (
    <div className={`flex items-center justify-between px-6 py-2 ${isOnline ? 'bg-blue-600' : 'bg-slate-800'} text-white text-[10px] font-black uppercase tracking-widest z-[60] border-b-2 border-black`}>
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? 'Network: Online' : 'Offline Mode'}
      </div>
      <div className="flex items-center gap-4 relative">
        <button onClick={() => setShowHeaderLangMenu(!showHeaderLangMenu)} className="flex items-center gap-1 hover:text-blue-300">
          <Globe className="w-3 h-3" /> <span>{langNames[selectedLanguage]}</span> <ChevronDown className={`w-3 h-3 ${showHeaderLangMenu ? 'rotate-180' : ''}`} />
        </button>
        {showHeaderLangMenu && (
          <div className="absolute top-8 right-0 bg-white border-4 border-black p-2 z-[100] shadow-[4px_4px_0_0_#000] space-y-1 min-w-[140px]">
            {(Object.entries(langNames) as [Language, string][]).map(([code, name]) => (
              <button key={code} onClick={() => { changeLanguage(code); setShowHeaderLangMenu(false); }} className={`w-full text-black p-2 text-[10px] font-black uppercase text-left hover:bg-blue-50 border-2 border-transparent hover:border-black ${selectedLanguage === code ? 'bg-blue-50 border-black' : ''}`}> {name} </button>
            ))}
          </div>
        )}
        <button onClick={() => setIsOnline(!isOnline)} className="bg-white text-black px-2 py-0.5 rounded border border-black font-black text-[9px]"> {isOnline ? 'Go Offline' : 'Go Online'} </button>
      </div>
    </div>
  );

  const renderAuth = () => {
    return (
      <ViewWrapper id="auth" className="p-8 justify-center h-screen bg-[#fdfdfd] relative overflow-hidden">
        <FloatingDoodles />
        
        <div className="relative z-10 w-full max-w-xs mx-auto">
          {authStep === 'entry' && (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-blue-600 rounded-[32px] border-4 border-black shadow-[8px_8px_0_0_#000] flex items-center justify-center text-white font-black text-5xl mx-auto mb-6">SB</div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-2">{t('welcomeTitle')}</h1>
              <p className="text-slate-500 font-bold mb-10 uppercase tracking-widest text-[10px]">Empowering Your Path</p>
              
              <div className="space-y-4">
                <button onClick={() => setAuthStep('signup')} className="w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-xl font-black uppercase flex items-center justify-center gap-3">
                  <UserPlus className="w-6 h-6" /> {t('signup')}
                </button>
                <button onClick={() => setAuthStep('login')} className="w-full py-5 bg-white border-4 border-black rounded-[20px] font-black text-xl uppercase shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3">
                  <LogIn className="w-6 h-6" /> {t('login')}
                </button>
                <button onClick={handleGuestEntry} className="w-full py-4 bg-amber-100 border-4 border-black rounded-[20px] font-black text-sm uppercase shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3">
                  <UserCircle2 className="w-5 h-5 text-amber-600" /> {t('guestEntry')}
                </button>
              </div>

              <div className="mt-10 relative inline-block text-left w-full">
                <button 
                  onClick={() => setShowAuthLangMenu(!showAuthLangMenu)}
                  className="w-full flex items-center justify-center gap-2 font-black text-slate-400 uppercase text-xs hover:text-blue-600 transition-colors"
                >
                  <Globe className="w-4 h-4" /> {langNames[selectedLanguage]} <ChevronDown className={`w-4 h-4 transition-transform ${showAuthLangMenu ? 'rotate-180' : ''}`} />
                </button>
                {showAuthLangMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-4 border-black rounded-2xl p-2 shadow-[8px_8px_0_0_#000] z-50">
                    {Object.entries(langNames).map(([code, name]) => (
                      <button key={code} onClick={() => changeLanguage(code as Language)} className={`w-full text-left p-3 rounded-xl font-black text-sm ${selectedLanguage === code ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-800'}`}>{name}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {authStep === 'signup' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <button onClick={() => setAuthStep('entry')} className="flex items-center gap-2 font-black text-slate-400 uppercase text-[10px] mb-6"><ArrowLeft className="w-4 h-4" /> {t('back')}</button>
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-8 italic">{t('signupTitle')}</h2>
              
              <div className="space-y-4">
                <button onClick={handleGoogleLogin} className="w-full flex items-center gap-4 bg-white border-4 border-black p-5 rounded-2xl font-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all">
                  <Globe className="w-6 h-6 text-blue-500" />
                  <span className="flex-1 text-left">{t('continueGoogle')}</span>
                </button>

                <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0_0_#000] space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="Mobile Number" className="flex-1 outline-none font-bold text-lg bg-transparent" />
                  </div>
                  <button onClick={handleMobileLogin} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">
                    {t('signupMobile')}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="mt-6 p-4 bg-red-50 border-4 border-red-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-700 font-bold text-xs leading-snug">{authError}</p>
                </div>
              )}
            </div>
          )}

          {authStep === 'login' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <button onClick={() => setAuthStep('entry')} className="flex items-center gap-2 font-black text-slate-400 uppercase text-[10px] mb-6"><ArrowLeft className="w-4 h-4" /> {t('back')}</button>
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-8 italic">{t('loginTitle')}</h2>
              
              <div className="space-y-4">
                <button onClick={handleGoogleLogin} className="w-full flex items-center gap-4 bg-white border-4 border-black p-5 rounded-2xl font-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all">
                  <Globe className="w-6 h-6 text-blue-500" />
                  <span className="flex-1 text-left">{t('loginGoogle')}</span>
                </button>

                <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0_0_#000] space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="Mobile Number" className="flex-1 outline-none font-bold text-lg bg-transparent" />
                  </div>
                  <button onClick={handleMobileLogin} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">
                    {t('loginMobile')}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="mt-6 p-4 bg-red-50 border-4 border-red-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-700 font-bold text-xs leading-snug">{authError}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ViewWrapper>
    );
  };

  const renderOtpVerify = () => (
    <ViewWrapper id="otp-verify" className="p-8 justify-center h-screen bg-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2">{t('enterOTP')}</h2>
        <p className="text-slate-400 text-sm">Sent to +91 {mobileNumber}</p>
      </div>
      <div className="max-w-xs mx-auto space-y-6">
        <input type="text" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} placeholder="0 0 0 0" className="w-full text-center text-5xl font-black tracking-[1rem] p-6 border-4 border-black rounded-3xl outline-none bg-transparent" />
        {authError && <p className="text-red-500 font-bold text-center text-xs">{authError}</p>}
        <button onClick={handleOtpVerify} className="w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-xl font-black uppercase">{t('verify')}</button>
        <button onClick={() => setView('auth')} className="w-full font-black text-slate-400 uppercase text-xs">Resend Code</button>
      </div>
    </ViewWrapper>
  );

  const renderRoleSelection = () => (
    <ViewWrapper id="role-selection" className="p-8 bg-blue-50 h-screen justify-center">
      <h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter leading-none italic">{t('selectRole')}</h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'student', label: t('student'), icon: GraduationCap, color: 'bg-blue-100 text-blue-600', desc: 'Personal learning path' },
          { id: 'teacher', label: t('teacher'), icon: Briefcase, color: 'bg-green-100 text-green-600', desc: 'Classroom management' },
          { id: 'alumni', label: t('alumni'), icon: Award, color: 'bg-purple-100 text-purple-600', desc: 'Mentorship & Network' }
        ].map((r, i) => (
          <button key={r.id} style={{ animationDelay: `${i * 0.05}s` }} onClick={() => handleRoleSelect(r.id as Role)} className="stagger-item w-full bg-white border-4 border-black p-6 rounded-[32px] shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center ${r.color}`}>
              <r.icon className="w-8 h-8" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black">{r.label}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.desc}</span>
            </div>
            <ChevronRight className="ml-auto text-slate-300" />
          </button>
        ))}
      </div>
    </ViewWrapper>
  );

  const renderDifficultySelection = () => (
    <ViewWrapper id="difficulty" className="bg-white">
      <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
        <button onClick={() => setView('study')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000]"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-5"><h2 className="font-black text-slate-900 text-lg">{t('selectDifficulty')}</h2></div>
      </header>
      <main className="p-8 flex-1 space-y-6 flex flex-col justify-center">
        {[
          { id: 'easy', label: t('easy'), desc: t('easyDesc'), color: 'bg-green-50 text-green-600', border: 'border-green-600' },
          { id: 'standard', label: t('standard'), desc: t('standardDesc'), color: 'bg-blue-50 text-blue-600', border: 'border-blue-600' },
          { id: 'expert', label: t('expert'), desc: t('expertDesc'), color: 'bg-red-50 text-red-600', border: 'border-red-600' }
        ].map((d, i) => (
          <button 
            key={d.id} 
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => handleStartQuiz(d.id as Difficulty)}
            className={`stagger-item w-full text-left p-6 rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center gap-6 transition-all ${currentUser?.difficultyPref === d.id ? d.color : 'bg-white'}`}
          >
            <div className={`w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center ${d.color}`}>
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-2xl">{d.label}</h4>
              <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{d.desc}</p>
            </div>
            {currentUser?.difficultyPref === d.id && <CheckCircle className="w-6 h-6" />}
          </button>
        ))}
      </main>
    </ViewWrapper>
  );

  const renderAlumni = () => (
    <ViewWrapper id="alumni" className="bg-slate-50">
      <StatusHeader />
      <header className="p-8 bg-white border-b-4 border-black flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('dashboard')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
          <div><h2 className="text-3xl font-black italic">Alumni Portal</h2><p className="text-[10px] text-slate-500 font-black uppercase mt-1">StudyBuddy Network</p></div>
        </div>
        <button onClick={handleLogout} className="p-3 bg-red-50 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000]"><LogOut className="w-6 h-6 text-red-600" /></button>
      </header>
      <main className="p-6 space-y-6">
        <section className="bg-white p-6 rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000]">
          <h3 className="font-black text-xl mb-4 flex items-center gap-2"><Sparkles className="w-6 h-6 text-amber-500" /> Mentorship Card</h3>
          <p className="text-slate-600 font-bold text-sm leading-relaxed mb-6">Connect with current students and share your journey through modular advice blocks.</p>
          <div className="p-5 bg-blue-50 border-2 border-dashed border-blue-400 rounded-2xl text-center font-black text-blue-900 opacity-60">Mentorship Features Coming Soon</div>
        </section>
        <section className="bg-white p-6 rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000]">
          <h3 className="font-black text-xl mb-4">Content Explorer</h3>
          <div className="space-y-3">
             {MODULES.map(m => (
               <div key={m.id} className="p-4 bg-slate-50 rounded-xl border-2 border-black flex items-center justify-between">
                 <span className="font-black text-slate-800">{m.title}</span>
                 <button className="text-xs font-black text-blue-600 uppercase">View</button>
               </div>
             ))}
          </div>
        </section>
      </main>
    </ViewWrapper>
  );

  const renderDashboard = () => {
    const isGuest = currentUser?.authMethod === 'guest';
    return (
      <ViewWrapper id="dashboard" className="pb-24">
        <StatusHeader />
        <header className="p-6 glass-header flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center text-white font-black text-2xl">{currentUser?.username[0].toUpperCase()}</div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">{t('welcome')}, {currentUser?.username}</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{isGuest ? 'Guest Access' : `${t('level')} ${currentUser?.level} Pupil`}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isGuest && <div className="bg-orange-100 px-3 py-1.5 rounded-xl border-2 border-black flex items-center gap-1 shadow-[2px_2px_0_0_#000]"><Flame className="w-4 h-4 text-orange-600 fill-orange-500" /><span className="font-black text-orange-900 text-xs">{currentUser?.streak}</span></div>}
            <div className="bg-amber-100 px-3 py-1.5 rounded-xl border-2 border-black flex items-center gap-1 shadow-[2px_2px_0_0_#000]"><Zap className="w-4 h-4 text-amber-600 fill-amber-500" /><span className="font-black text-amber-900 text-xs">{currentUser?.xp}</span></div>
          </div>
        </header>
        <main className="p-6 space-y-8 flex-1 overflow-y-auto">
          {encouragement && <div className="bg-green-600 text-white p-4 rounded-[20px] border-4 border-black text-center font-black animate-bounce shadow-[4px_4px_0_0_#000]"> {encouragement} </div>}
          
          {/* Badge Display */}
          {currentUser && currentUser.badges.length > 0 && (
            <section className="bg-white p-5 chunky-card rounded-[28px]">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Earned Badges</h3>
              <div className="flex flex-wrap gap-3">
                {currentUser.badges.map(badge => (
                  <div key={badge} className={`px-3 py-1.5 ${badge === 'Quiz Master' ? 'bg-amber-100 border-amber-600' : 'bg-blue-50 border-black'} border-2 rounded-xl flex items-center gap-2 shadow-[2px_2px_0_0_#1e293b]`}>
                    <Medal className={`w-4 h-4 ${badge === 'Quiz Master' ? 'text-amber-600' : 'text-blue-600'}`} />
                    <span className={`text-[10px] font-black uppercase ${badge === 'Quiz Master' ? 'text-amber-900' : 'text-blue-900'}`}>{badge}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isGuest && (
            <section className="bg-white p-5 chunky-card rounded-[28px]">
              <div className="flex items-center justify-between mb-3"><h2 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('masteryPath')}</h2><span className="text-[9px] font-black text-blue-600 uppercase">{t('level')} {currentLevelVal} PROGRESS</span></div>
              <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${(xpInLevelVal / XP_PER_LEVEL) * 100}%` }} /></div>
            </section>
          )}
          
          {isGuest && (
            <div className="bg-amber-100 border-4 border-black p-6 rounded-[28px] shadow-[4px_4px_0_0_#000] flex items-center gap-4">
              <Star className="w-10 h-10 text-amber-600 fill-amber-300" />
              <div className="flex-1"><h4 className="font-black text-amber-900">Unlock Full Access</h4><p className="text-xs font-bold text-amber-800/60 leading-tight">Create an account to track progress and earn rewards!</p></div>
              <button onClick={() => setView('auth')} className="bg-black text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase">Join</button>
            </div>
          )}

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t('modules')}</h3>
            <div className="space-y-4">
              {MODULES.map((module, i) => {
                const isCompleted = currentUser?.completedModules.includes(module.id);
                return (
                  <button 
                    key={module.id} 
                    style={{ animationDelay: `${i * 0.08}s` }}
                    onClick={() => { setActiveModule(module); setView('study'); }} 
                    className={`stagger-item w-full text-left p-5 rounded-[28px] chunky-card flex items-center gap-4 group transition-all ${isCompleted ? 'bg-green-50 border-green-600/50' : ''}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>{isCompleted ? <CheckCircle className="w-7 h-7 text-green-600" /> : <BookOpen className="w-7 h-7 text-blue-600" />}</div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-black text-slate-800 text-base leading-tight">
                          {module.titleTranslated[selectedLanguage] || module.title}
                        </h4>
                        {isCompleted && (
                          <span className="ml-3 px-2 py-0.5 bg-green-500 text-white text-[7px] font-black rounded-full uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                            <Trophy className="w-2 h-2" /> Mastered
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                        {isCompleted ? t('completed') : module.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>
                );
              })}
              {!isGuest && (
                <button style={{ animationDelay: `${MODULES.length * 0.08}s` }} onClick={() => setView('practice-notes')} className="stagger-item w-full text-left p-5 rounded-[28px] chunky-card flex items-center gap-4 group bg-blue-50 border-blue-200">
                  <div className="w-14 h-14 rounded-2xl border-4 border-black bg-blue-100 flex items-center justify-center"><FileText className="w-7 h-7 text-blue-600" /></div>
                  <div className="flex-1"><h4 className="font-black text-slate-800 text-base leading-tight">{t('practiceNotes')}</h4><p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{t('selfStudy')}</p></div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              )}
            </div>
          </section>
        </main>
        <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-5 bg-white border-t-4 border-black flex justify-around items-center z-50">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><LayoutDashboard className="w-6 h-6" /><span className="text-[9px] font-black uppercase">{t('home')}</span></button>
          {!isGuest && <button onClick={() => setView('leaderboard')} className={`flex flex-col items-center gap-1 ${view === 'leaderboard' ? 'text-blue-600' : 'text-slate-400'}`}><TrendingUp className="w-6 h-6" /><span className="text-[9px] font-black uppercase">{t('rank')}</span></button>}
          <button onClick={() => setView('game')} className={`flex flex-col items-center gap-1 ${view === 'game' ? 'text-blue-600' : 'text-slate-400'}`}><PlayCircle className="w-6 h-6" /><span className="text-[9px] font-black uppercase">{t('arcade')}</span></button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400"><LogOut className="w-6 h-6" /><span className="text-[9px] font-black uppercase">{t('exit')}</span></button>
        </footer>
      </ViewWrapper>
    );
  };

  const renderArcade = () => (
    <ViewWrapper id="arcade" className="pb-24 bg-slate-50">
      <StatusHeader />
      <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-5"><h2 className="font-black text-slate-900 text-lg leading-tight italic tracking-tighter">{t('arcade')}</h2><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brain Training Lab</p></div>
      </header>
      <main className="p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {GAMES.map((game, i) => (
            <button key={game.id} style={{ animationDelay: `${i * 0.08}s` }} onClick={() => { 
                if(game.id === 'math-duel') startMathDuel(); 
                else if(game.id === 'logic-grid') startLogicMatrix(); 
                else if(game.id === 'vocab-skills') setView('vocabulary-hub'); 
                else if(game.id === 'fluency') setView('fluency-hub');
            }} className="stagger-item w-full text-left p-6 bg-white chunky-card rounded-[32px] flex items-center gap-5 group border-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl border-4 border-black flex items-center justify-center">
                {game.icon === 'Zap' ? <Zap className="w-7 h-7 text-amber-600" /> : game.icon === 'Grid' ? <Grid className="w-7 h-7 text-blue-600" /> : game.icon === 'Mic' ? <Mic className="w-7 h-7 text-green-600" /> : <MessageCircle className="w-7 h-7 text-purple-600" />}
              </div>
              <div className="flex-1 text-left"><h4 className="font-black text-lg text-slate-800 leading-none">{game.title}</h4><p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{game.desc}</p></div>
              <div className="bg-amber-500 text-white p-2 rounded-xl border-2 border-black group-hover:scale-110 transition-transform"><PlayCircle className="w-6 h-6" /></div>
            </button>
          ))}
        </div>
      </main>
    </ViewWrapper>
  );

  const renderFluencyHub = () => (
    <ViewWrapper id="fluency-hub" className="pb-24 bg-white">
      <StatusHeader />
      <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-5"><h2 className="font-black text-slate-900 text-lg leading-tight italic tracking-tighter">{t('fluency')}</h2><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('readAloud')}</p></div>
      </header>
      <main className="p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {POEMS.map((poem, i) => (
            <button key={poem.id} style={{ animationDelay: `${i * 0.08}s` }} onClick={() => startPoemPractice(poem)} className="stagger-item w-full text-left p-6 bg-white chunky-card rounded-[32px] flex items-center gap-5 group border-4 border-green-200">
              <div className="w-14 h-14 bg-green-50 rounded-2xl border-4 border-black flex items-center justify-center"><BookOpen className="w-7 h-7 text-green-600" /></div>
              <div className="flex-1 text-left">
                <h4 className="font-black text-lg text-slate-800 leading-none">{poem.titleTranslated[selectedLanguage] || poem.title}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{poem.lines.length} Lines • {poem.duration}s</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300" />
            </button>
          ))}
        </div>
      </main>
    </ViewWrapper>
  );

  const renderFluencyPractice = () => {
    if (!activePoem) return null;
    const lines = activePoem.linesTranslated[selectedLanguage] || activePoem.lines;

    if (fluencyResults) {
      return (
        <ViewWrapper id="fluency-results" className="items-center h-full bg-slate-50">
          <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50 w-full">
            <button onClick={() => setView('dashboard')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
            <div className="ml-5"><h2 className="font-black text-slate-900 text-lg">{t('results')}</h2></div>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center p-10 w-full">
            <div className="w-24 h-24 bg-green-500 rounded-[32px] border-4 border-black flex items-center justify-center shadow-[6px_6px_0_0_#000] mb-8 animate-bounce">
              <Activity className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter mb-10">{t('analysisResults')}</h2>
            
            <div className="bg-white p-8 rounded-[40px] border-4 border-black w-full space-y-6 shadow-[8px_8px_0_0_#1e293b] mb-10 text-center">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('speed')}</p>
                  <h4 className="text-3xl font-black text-blue-600">{fluencyResults.wpm} <span className="text-xs text-slate-400 uppercase">{t('wpm')}</span></h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('accuracy')}</p>
                  <h4 className="text-3xl font-black text-green-600">{fluencyResults.accuracy}%</h4>
                </div>
              </div>
              <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${fluencyResults.accuracy}%` }} /></div>
            </div>
            <button onClick={() => setView('fluency-hub')} className="w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-xl font-black uppercase">{t('continue')}</button>
          </main>
        </ViewWrapper>
      );
    }

    return (
      <ViewWrapper id="fluency-speaking" className="bg-[#fdfcf5] h-full">
        <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
          <button onClick={() => setView('fluency-hub')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000]"><ArrowLeft className="w-6 h-6" /></button>
          <div className="ml-5 flex justify-between w-full pr-6 items-center">
            <div className={`font-black text-xl flex items-center gap-2 ${fluencyTimer < 10 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>
              <Timer className="w-5 h-5" /> {fluencyTimer}s
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col p-8 overflow-y-auto pb-48">
          <div className="mb-10 text-center">
             <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter mb-2">{activePoem.titleTranslated[selectedLanguage] || activePoem.title}</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fluencyDesc')}</p>
          </div>
          <div className="space-y-4">
            {lines.map((line, idx) => (
              <div key={idx} onClick={() => isReading && setCurrentPoemLine(idx)} className={`p-6 rounded-[24px] border-3 transition-all duration-300 ${currentPoemLine === idx && isReading ? 'bg-blue-50 border-blue-600 scale-105 shadow-[4px_4px_0_0_#2563eb]' : 'bg-white/50 border-slate-200 opacity-60'}`}>
                <p className={`text-xl font-bold leading-tight ${currentPoemLine === idx && isReading ? 'text-blue-900' : 'text-slate-700'}`}>{line}</p>
              </div>
            ))}
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-8 bg-white/95 backdrop-blur-md border-t-4 border-black z-40">
          <button onClick={toggleReading} className={`w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-2xl font-black flex items-center justify-center gap-3 uppercase ${isReading ? 'bg-red-500' : 'bg-green-600'}`}>
            {isReading ? t('finishReading') : t('startReading')} {isReading ? <Activity className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>
      </ViewWrapper>
    );
  };

  const renderStudy = () => {
    const title = activeModule?.titleTranslated[selectedLanguage] || activeModule?.title || "";
    return (
      <ViewWrapper id="study" className="bg-white">
        <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
          <button onClick={() => setView('dashboard')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000]"><ArrowLeft className="w-6 h-6" /></button>
          <div className="ml-5"><h2 className="font-black text-slate-900 text-lg truncate w-56">{title}</h2><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('study')}</p></div>
        </header>
        <main className="p-8 flex-1 space-y-8 pb-40 overflow-y-auto">
          <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter italic">Overview</h3>
          <div className="space-y-6">
            {(activeModule?.contentTranslated[selectedLanguage] || activeModule?.content || []).map((p, i) => (
              <p key={i} style={{ animationDelay: `${i * 0.1}s` }} className="stagger-item text-xl leading-relaxed text-slate-700 font-bold border-l-6 border-slate-100 pl-6">{p}</p>
            ))}
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-8 bg-white/95 backdrop-blur-md border-t-4 border-black">
          <button onClick={() => setView('difficulty-selection')} className="w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-xl font-black uppercase">
            {t('assessment')} <Zap className="w-6 h-6 fill-white" />
          </button>
        </div>
      </ViewWrapper>
    );
  };

  const renderNotesQuiz = () => {
    if (!currentNoteQuiz || practiceQuestions.length === 0) return null;
    const q = practiceQuestions[currentNoteQuiz.index];
    return (
      <ViewWrapper id={`notes-quiz-${currentNoteQuiz.index}`} className="bg-[#f8fafc]">
        <header className="p-6 bg-white border-b-4 border-black flex justify-between items-center sticky top-0 z-30">
          <button onClick={() => setView('practice-notes')} className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-4 h-4" /></button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Practice Q {currentNoteQuiz.index + 1}</span>
          <p className="font-black text-blue-600">Score: {currentNoteQuiz.score}</p>
        </header>
        <main className="p-8 flex-1 flex flex-col justify-center">
           <div className="bg-white p-10 rounded-[40px] border-4 border-black shadow-[8px_8px_0_0_#000] text-center mb-10">
              <h5 className="text-2xl font-black text-slate-800 leading-tight">{q.text}</h5>
           </div>
           <div className="space-y-4">
             {q.options.map((opt, i) => {
               let style = "bg-white border-black shadow-[4px_4px_0_0_#000]";
               if (currentNoteQuiz.feedback && i === q.correctAnswerIndex) style = "bg-green-500 text-white shadow-none";
               else if (currentNoteQuiz.feedback && i !== q.correctAnswerIndex && currentNoteQuiz.feedback === 'incorrect') style = "bg-red-500 text-white shadow-none";
               return <button key={i} disabled={!!currentNoteQuiz.feedback} onClick={() => handleNoteAnswer(i)} className={`w-full text-left p-5 font-black text-lg rounded-[24px] border-4 transition-all ${style}`}>{opt}</button>
             })}
           </div>
        </main>
        {currentNoteQuiz.feedback && (
          <div className="p-8 bg-white border-t-4 border-black">
            <button onClick={nextNoteQ} className="w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-xl font-black uppercase">
              {currentNoteQuiz.index === practiceQuestions.length - 1 ? 'Finish' : t('next')}
            </button>
          </div>
        )}
      </ViewWrapper>
    );
  };

  const renderQuiz = () => {
    if (!quizSession || !activeModule) return null;
    const currentQuestion = quizSession.filteredQuestions[quizSession.currentQuestionIndex];
    const progress = ((quizSession.currentQuestionIndex + 1) / quizSession.filteredQuestions.length) * 100;
    return (
      <ViewWrapper id={`quiz-${quizSession.currentQuestionIndex}`} className="bg-[#f8fafc]">
        <div className="p-6 bg-white border-b-4 border-black sticky top-0 z-30 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setView('difficulty-selection')} className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-4 h-4" /></button>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Q {quizSession.currentQuestionIndex + 1} / {quizSession.filteredQuestions.length} • {quizSession.mode.toUpperCase()}</span>
            <div className="bg-amber-100 px-3 py-1 rounded-lg border-2 border-black text-amber-800 font-black text-[10px] shadow-[2px_2px_0_0_#000]">XP: {activeModule.xpReward}</div>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>
        <main className="p-6 flex-1 flex flex-col justify-center pb-48 overflow-y-auto">
          <div className="bg-white py-12 px-8 rounded-[40px] border-4 border-black shadow-[10px_10px_0_0_#1e293b] text-center mb-12 relative overflow-hidden flex flex-col justify-center min-h-[220px]">
            <h5 className="text-3xl font-black text-slate-800 leading-tight tracking-tight">
              {currentQuestion.textTranslated?.[selectedLanguage] || currentQuestion.text}
            </h5>
            {isAiLoading && <div className="mt-8 flex justify-center items-center gap-3 text-blue-600 font-black text-[10px] animate-pulse"><RefreshCw className="w-4 h-4 animate-spin" /> THINKING...</div>}
            {aiExplanation && <div className="mt-8 p-6 bg-blue-50 rounded-[28px] text-left border-3 border-blue-600 italic text-blue-900 text-sm font-bold">"{aiExplanation}"</div>}
          </div>
          <div className="space-y-4">{(currentQuestion.optionsTranslated?.[selectedLanguage] || currentQuestion.options).map((option, idx) => {
              let btnStyle = "bg-white border-black text-slate-800 shadow-[4px_4px_0_0_#000]";
              if (feedback && idx === currentQuestion.correctAnswerIndex) btnStyle = "bg-green-500 text-white shadow-none translate-x-1 translate-y-1 border-black";
              else if (feedback && idx !== currentQuestion.correctAnswerIndex && feedback === 'incorrect') btnStyle = "bg-red-500 text-white shadow-none translate-x-1 translate-y-1 border-black";
              else if (feedback) btnStyle = "bg-white opacity-40 shadow-none grayscale pointer-events-none";
              return (<button key={idx} disabled={!!feedback} style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => handleAnswer(idx)} className={`stagger-item w-full text-left p-6 font-black text-xl rounded-[28px] border-4 transition-all ${btnStyle}`}>{option}</button>);
            })}</div>
        </main>
        {feedback && !isAiLoading && (<div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-8 bg-white border-t-4 border-black z-40"><button onClick={handleNextQuestion} className="w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-2xl font-black flex items-center justify-center gap-3 uppercase">{quizSession.currentQuestionIndex === quizSession.filteredQuestions.length - 1 ? t('results') : t('next')} <ArrowRight className="w-6 h-6" /></button></div>)}
      </ViewWrapper>
    );
  };

  const renderResults = () => {
    if (!quizSession) return null;
    const maxPossibleScore = quizSession.filteredQuestions.length * 10;
    const isPerfect = quizSession.score === maxPossibleScore;

    return (
      <ViewWrapper id="results" className="items-center h-full bg-slate-50">
        <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50 w-full">
          <button onClick={() => setView('dashboard')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
          <div className="ml-5"><h2 className="font-black text-slate-900 text-lg">{t('results')}</h2></div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-10 w-full">
          <div className="w-24 h-24 bg-blue-600 rounded-[32px] border-4 border-black flex items-center justify-center shadow-[6px_6px_0_0_#000] mb-8 animate-bounce">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter mb-4">{t('results')}</h2>
          
          {isPerfect && (
            <div className="mb-6 px-6 py-3 bg-amber-100 border-4 border-amber-600 rounded-[24px] font-black text-xs uppercase text-amber-900 flex items-center gap-3 animate-in zoom-in duration-500 shadow-[4px_4px_0_0_#d97706]">
              <Medal className="w-6 h-6 text-amber-600" />
              <div className="flex flex-col">
                <span>Achievement Unlocked</span>
                <span className="text-lg leading-none">Quiz Master 🏆</span>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[40px] border-4 border-black w-full space-y-6 shadow-[8px_8px_0_0_#1e293b] mb-10 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('score')}</p>
            <h4 className="text-6xl font-black text-blue-600">{quizSession.score}</h4>
            <div className="pt-6 border-t-2 border-slate-100 flex justify-center gap-8">
               <div><p className="text-[10px] font-black text-slate-400 uppercase">XP Gained</p><p className="font-black text-xl text-amber-600">+{activeModule?.xpReward || 0 + quizSession.score}</p></div>
            </div>
          </div>
          <button onClick={() => setView('dashboard')} className="w-full py-5 bg-blue-600 text-white rounded-[20px] border-4 border-black shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all text-xl font-black uppercase">{t('continue')}</button>
        </main>
      </ViewWrapper>
    );
  };

  const renderVocabHub = () => (
    <ViewWrapper id="vocab-hub" className="bg-white">
      <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
        <button onClick={() => setView('game')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-5"><h2 className="font-black text-slate-900 text-lg">{t('vocab')}</h2><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Skill Builders</p></div>
      </header>
      <main className="p-8 space-y-6">
        {[
          { id: 'vocab-focus', title: t('focusTitle'), icon: Eye, color: 'bg-pink-100 text-pink-600' },
          { id: 'vocab-match', title: t('matchTitle'), icon: Search, color: 'bg-cyan-100 text-cyan-600' },
          { id: 'vocab-recall', title: t('recallTitle'), icon: BrainCircuit, color: 'bg-purple-100 text-purple-600' }
        ].map((v, i) => (
          <button key={v.id} onClick={() => { if(v.id === 'vocab-focus') { generateVocabFocus(); setView('vocab-focus'); } else if(v.id === 'vocab-match') { setVocabMatchIndex(0); setView('vocab-match'); } else { startVocabRecall(); } }} className="w-full text-left p-6 bg-white border-4 border-black rounded-[32px] shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl border-4 border-black flex items-center justify-center ${v.color}`}><v.icon className="w-8 h-8" /></div>
            <span className="text-2xl font-black">{v.title}</span>
          </button>
        ))}
      </main>
    </ViewWrapper>
  );

  const renderVocabFocus = () => (
    <ViewWrapper id="vocab-focus" className="bg-[#f8fafc]">
      <header className="p-6 border-b-4 border-black flex items-center justify-between bg-white w-full">
        <button onClick={() => setView('vocabulary-hub')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="font-black text-xl text-slate-900">{t('score')}: {vocabGameScore}</div>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="mb-10 text-center"><h2 className="text-3xl font-black mb-2">{t('focusTitle')}</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('tapColor')}</p></div>
        <div className="bg-white p-16 rounded-[48px] border-4 border-black shadow-[10px_10px_0_0_#101010] mb-12 w-full max-w-sm text-center">
          <h3 className="text-6xl font-black italic tracking-tighter" style={{ color: vocabFocusData.color }}>{vocabFocusData.word}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {STROOP_COLORS.map(c => (
            <button key={c.name} onClick={() => handleVocabFocus(c.color)} className="h-20 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all" style={{ backgroundColor: c.color }} />
          ))}
        </div>
      </main>
    </ViewWrapper>
  );

  const renderVocabMatch = () => {
    const current = VOCAB_MATCH_DATA[vocabMatchIndex];
    return (
      <ViewWrapper id="vocab-match" className="bg-[#f0f9ff]">
        <header className="p-6 border-b-4 border-black flex items-center justify-between bg-white w-full">
          <button onClick={() => setView('vocabulary-hub')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
          <div className="font-black text-xl text-slate-900">Q {vocabMatchIndex + 1}/{VOCAB_MATCH_DATA.length}</div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="mb-10 text-center"><h2 className="text-3xl font-black mb-2">{t('matchTitle')}</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('pickMeaning')}</p></div>
          <div className="bg-white p-12 rounded-[48px] border-4 border-black shadow-[10px_10px_0_0_#101010] mb-10 w-full text-center">
            <h3 className="text-5xl font-black text-blue-600">{current.word}</h3>
          </div>
          <div className="space-y-4 w-full">
            {current.options.map((opt, i) => (
              <button key={i} onClick={() => handleVocabMatch(i)} className="w-full p-5 bg-white border-4 border-black rounded-3xl font-black text-lg text-left shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all">{opt}</button>
            ))}
          </div>
        </main>
      </ViewWrapper>
    );
  };

  const renderVocabRecall = () => (
    <ViewWrapper id="vocab-recall" className="bg-purple-50">
      <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50 w-full">
        <button onClick={() => setView('vocabulary-hub')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-5"><h2 className="font-black text-slate-900 text-lg">{t('recallTitle')}</h2></div>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2">{t('recallTitle')}</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{vocabRecallState.isMemorizing ? t('memorizeSeq') : t('tapOrder')}</p>
        </div>
        {vocabRecallState.isMemorizing ? (
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {vocabRecallState.sequence.map((word, i) => (
              <div key={i} style={{ animationDelay: `${i * 0.1}s` }} className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000] text-center font-black text-2xl animate-in slide-in-from-bottom-4">{word}</div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {vocabRecallState.shuffled.map((word, i) => {
               const isSelected = vocabRecallState.userSelection.includes(word);
               return (
                 <button key={i} disabled={isSelected} onClick={() => handleVocabRecall(word)} className={`p-6 rounded-3xl border-4 border-black font-black text-lg shadow-[4px_4px_0_0_#000] transition-all ${isSelected ? 'bg-slate-200 opacity-40 shadow-none' : 'bg-white active:translate-y-1 active:shadow-none'}`}>{word}</button>
               );
            })}
          </div>
        )}
      </main>
    </ViewWrapper>
  );

  const renderLeaderboard = () => (
    <ViewWrapper id="leaderboard" className="bg-white pb-24">
      <StatusHeader />
      <header className="p-6 border-b-4 border-black bg-white sticky top-0 z-50 flex items-center">
        <button onClick={() => setView('dashboard')} className="mr-4 p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="text-3xl font-black italic">{t('rank')}s</h2>
      </header>
      <main className="p-6 space-y-4">
        {[
          { name: 'Arjun K.', xp: 2450, rank: 1, avatar: 'A' },
          { name: 'Priya S.', xp: 2100, rank: 2, avatar: 'P' },
          { name: 'Rohan M.', xp: 1950, rank: 3, avatar: 'R' },
          { name: currentUser?.username || 'You', xp: currentUser?.xp || 0, rank: 4, avatar: 'U', isMe: true },
          { name: 'Sita L.', xp: 1200, rank: 5, avatar: 'S' }
        ].map((user, i) => (
          <div key={i} className={`p-4 rounded-3xl border-4 border-black flex items-center gap-4 ${user.isMe ? 'bg-blue-50 border-blue-600 shadow-[6px_6px_0_0_#2563eb]' : 'bg-white shadow-[4px_4px_0_0_#000]'}`}>
            <div className="w-10 h-10 rounded-full border-2 border-black bg-slate-200 flex items-center justify-center font-black">{user.avatar}</div>
            <div className="flex-1"><p className="font-black">{user.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{user.xp} XP</p></div>
            <div className="font-black text-xl">#{user.rank}</div>
          </div>
        ))}
      </main>
    </ViewWrapper>
  );

  const renderPracticeNotes = () => (
    <ViewWrapper id="practice-notes" className="bg-[#fdfcf5]">
      <header className="p-6 border-b-4 border-black flex items-center bg-white">
        <button onClick={() => setView('dashboard')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-5"><h2 className="font-black text-slate-900 text-lg">{t('practiceNotes')}</h2></div>
      </header>
      <main className="p-8 flex flex-col items-center justify-center flex-1 text-center">
        <div className="w-32 h-32 bg-blue-100 rounded-[40px] border-4 border-black flex items-center justify-center mb-8 shadow-[8px_8px_0_0_#000]">
          <Upload className="w-16 h-16 text-blue-600" />
        </div>
        <h3 className="text-3xl font-black mb-4">{t('uploadNotes')}</h3>
        <p className="text-slate-500 font-bold mb-10 max-w-xs">Upload your school notes and we'll generate a personalized practice session.</p>
        
        <label className="w-full max-w-xs py-5 bg-white border-4 border-black rounded-[24px] shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer font-black text-xl uppercase mb-6 flex items-center justify-center gap-3">
          <PlusCircle className="w-6 h-6" /> Select File
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
        
        {isExtracting && <div className="flex items-center gap-3 font-black text-blue-600 animate-pulse"><RefreshCw className="w-5 h-5 animate-spin" /> {t('extracting')}</div>}
        {!isExtracting && !isGenerating && practiceQuestions.length === 0 && (
          <button onClick={startPracticeQuiz} className="w-full max-w-xs py-5 bg-blue-600 text-white rounded-[24px] border-4 border-black shadow-[6px_6px_0_0_#000] font-black text-xl uppercase flex items-center justify-center gap-3">
            <Zap className="w-6 h-6" /> {t('practiceNow')}
          </button>
        )}
        {isGenerating && <div className="flex items-center gap-3 font-black text-amber-600 animate-pulse"><Sparkles className="w-5 h-5 animate-spin" /> {t('generating')}</div>}
        {encouragement && <p className="mt-4 text-amber-600 font-black text-sm uppercase">{encouragement}</p>}
      </main>
    </ViewWrapper>
  );

  const renderMathDuel = () => (
    <ViewWrapper id="math-duel" className="bg-amber-50">
      <header className="p-6 border-b-4 border-black flex items-center justify-between bg-white w-full">
        <button onClick={() => setView('game')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="font-black text-xl flex items-center gap-2 text-red-500"><Timer className="w-5 h-5" /> {mathTime}s</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full flex justify-end items-center mb-4">
          <div className="bg-white px-5 py-2 rounded-2xl border-4 border-black font-black text-2xl shadow-[4px_4px_0_0_#000]">{t('score')}: {mathScore}</div>
        </div>
        <div className="bg-white p-12 rounded-[56px] border-4 border-black shadow-[10px_10px_0_0_#101010] mb-12 w-full text-center">
          <h3 className="text-6xl font-black text-slate-800 tracking-tighter italic">{mathGame?.q}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {mathGame?.options.map((opt, i) => (
            <button key={i} onClick={() => handleMathAns(opt)} className="py-8 bg-white border-4 border-black rounded-[32px] font-black text-3xl shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-none transition-all">{opt}</button>
          ))}
        </div>
      </main>
    </ViewWrapper>
  );

  const renderLogicMatrix = () => (
    <ViewWrapper id="logic-matrix" className="bg-blue-50">
      <header className="p-6 border-b-4 border-black flex items-center justify-between bg-white w-full">
        <button onClick={() => setView('game')} className="p-2.5 bg-white border-4 border-black rounded-xl shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none"><ArrowLeft className="w-6 h-6" /></button>
        <div className="font-black text-xl text-slate-900">{t('score')}: {matrixScore}</div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-10 text-center"><h2 className="text-3xl font-black mb-2">Pattern Find</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tap the odd one out!</p></div>
        <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-[40px] border-4 border-black shadow-[10px_10px_0_0_#101010]">
          {matrixGrid.map(cell => (
            <button key={cell.id} onClick={() => handleMatrixClick(cell.id)} className="w-20 h-20 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all" style={{ backgroundColor: cell.color }} />
          ))}
        </div>
      </main>
    </ViewWrapper>
  );

  const renderTeacher = () => (
    <ViewWrapper id="teacher" className="bg-slate-50 pb-24">
      <StatusHeader />
      <header className="p-8 bg-white border-b-4 border-black flex justify-between items-center">
        <div><h2 className="text-3xl font-black italic">Teacher Portal</h2><p className="text-[10px] text-slate-500 font-black uppercase mt-1">Classroom Insights</p></div>
        <button onClick={handleLogout} className="p-3 bg-red-50 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000]"><LogOut className="w-6 h-6 text-red-600" /></button>
      </header>
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white p-6 rounded-[32px] border-4 border-black shadow-[4px_4px_0_0_#000]"><h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Active Students</h4><p className="text-3xl font-black">42</p></div>
           <div className="bg-white p-6 rounded-[32px] border-4 border-black shadow-[4px_4px_0_0_#000]"><h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Avg. Mastery</h4><p className="text-3xl font-black text-green-600">84%</p></div>
        </div>
        <section className="bg-white p-6 rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000]">
          <h3 className="font-black text-xl mb-4">Module Performance</h3>
          <div className="space-y-4">
            {MODULES.map(m => (
              <div key={m.id} className="space-y-2">
                <div className="flex justify-between text-xs font-black"><span>{m.title}</span><span>76%</span></div>
                <div className="progress-bar-container"><div className="progress-bar-fill bg-blue-500" style={{ width: '76%' }} /></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </ViewWrapper>
  );

  const handleCurrentViewSelection = () => {
    switch (view) {
      case 'otp-verify': return renderOtpVerify();
      case 'role-selection': return renderRoleSelection();
      case 'dashboard': return renderDashboard();
      case 'study': return renderStudy();
      case 'difficulty-selection': return renderDifficultySelection();
      case 'quiz': return renderQuiz();
      case 'results': return renderResults();
      case 'vocabulary-hub': return renderVocabHub();
      case 'vocab-focus': return renderVocabFocus();
      case 'vocab-match': return renderVocabMatch();
      case 'vocab-recall': return renderVocabRecall();
      case 'leaderboard': return renderLeaderboard();
      case 'game': return renderArcade();
      case 'practice-notes': return renderPracticeNotes();
      case 'notes-quiz': return renderNotesQuiz();
      case 'math-duel': return renderMathDuel();
      case 'logic-grid': return renderLogicMatrix();
      case 'fluency-hub': return renderFluencyHub();
      case 'fluency-practice': return renderFluencyPractice();
      case 'teacher': return renderTeacher();
      case 'alumni': return renderAlumni();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {view === 'auth' ? renderAuth() : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
             {handleCurrentViewSelection()}
        </div>
      )}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-10 bg-blue-600/60 backdrop-blur-lg fade-in">
          <div className="bg-white text-black p-12 rounded-[56px] shadow-[16px_16px_0_0_#000] flex flex-col items-center border-8 border-black text-center animate-in zoom-in-50 duration-500"><Trophy className="w-32 h-32 mb-8 text-amber-500 animate-bounce" /><h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">{t('level')} UP!</h2></div>
        </div>
      )}
    </div>
  );
};

export default App;