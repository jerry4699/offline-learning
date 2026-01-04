import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { 
  ChevronRight, ArrowLeft, Trophy, CheckCircle, Mic, BookOpen, 
  RefreshCw, Sparkles, ArrowRight, Award, Users, Shield, 
  Wifi, WifiOff, Zap, LayoutDashboard, Globe, MessageCircle, PlayCircle,
  BarChart, Settings, LogOut, Timer, Eye, BrainCircuit, FileText, Upload, Activity,
  Smartphone, UserCircle2, GraduationCap, Briefcase, Pencil, LogIn, UserPlus, Search, 
  AlertCircle, Medal, User, UserCheck, Download, FilePlus, Play, Video, Image as ImageIcon,
  MapPin, Send, StopCircle, Volume2, Wand2, SearchCode, Camera, Brain, Languages, Filter, Gamepad2, Key, PieChart, TrendingUp, SmartphoneNfc, Fingerprint, LayoutGrid, Lightbulb, ExternalLink, School, Building2, ClipboardList, CloudDownload, CloudOff, Star
} from 'lucide-react';
import { MODULES, TRANSLATIONS, XP_PER_LEVEL, GAMES } from './constants';
import { AppState, UserProgress, Module, QuizSession, Role, Language, Difficulty, GroundingSource, StudentStats } from './types';
import { GoogleGenAI } from "@google/genai";

// Utility for view wrapping
const ViewWrapper = ({ children, className = "", id }: { children?: ReactNode; className?: string; id?: string }) => (
  <div key={id} className={`view-enter flex flex-col flex-1 w-full h-full overflow-hidden ${className}`}>
    {children}
  </div>
);

const MOCK_STUDENTS: StudentStats[] = [
  { id: '1', name: 'Aarav Kumar', level: 4, xp: 1850, progress: 85, lastActive: '2h ago' },
  { id: '2', name: 'Ishani Devi', level: 2, xp: 800, progress: 40, lastActive: '1d ago' },
  { id: '3', name: 'Rahul Patil', level: 5, xp: 2400, progress: 95, lastActive: 'Just now' },
  { id: '4', name: 'Ananya Rao', level: 3, xp: 1200, progress: 60, lastActive: '5h ago' },
];

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('auth');
  const [authStep, setAuthStep] = useState<'entry' | 'signup' | 'login'>('entry');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<UserProgress | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [students, setStudents] = useState<StudentStats[]>(MOCK_STUDENTS);

  // Form States
  const [mobileInput, setMobileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [collegeInput, setCollegeInput] = useState('VESIT');
  const [deptInput, setDeptInput] = useState('Computer Engineering');
  const [classInput, setClassInput] = useState('D12A');
  
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  // AI & Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string, sources?: GroundingSource[], thinking?: string }[]>([]);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Notes Hub States
  const [notesTab, setNotesTab] = useState<'download' | 'upload' | 'practice'>('download');
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const t = (key: string) => TRANSLATIONS[selectedLanguage]?.[key] || TRANSLATIONS['english'][key] || key;

  // --- PERSISTENCE HELPERS ---
  const getUsers = (): any[] => {
    const users = localStorage.getItem('studybuddy_registered_users');
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (user: any) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('studybuddy_registered_users', JSON.stringify(users));
  };

  // --- AUTH HANDLERS ---
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileInput.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setAuthError('');
  };

  const handleJoinMission = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!mobileInput || !passwordInput || !otpInput || !collegeInput || !deptInput || !classInput) {
      setAuthError('Please fill all academic details');
      return;
    }

    if (otpInput !== '1234') {
      setAuthError('Invalid OTP code.');
      return;
    }

    const users = getUsers();
    if (users.find(u => u.mobile === mobileInput)) {
      setAuthError('This number is already registered. Please Login.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const newUserProfile: UserProgress = {
        username: `VESITian_${mobileInput.slice(-4)}`,
        role: 'student',
        xp: 0,
        level: 1,
        completedModules: [],
        downloadedModules: [],
        customQuizzes: [],
        language: selectedLanguage,
        badges: [],
        streak: 1,
        college: collegeInput,
        department: deptInput,
        classSection: classInput
      };

      saveUser({ mobile: mobileInput, password: passwordInput, profile: newUserProfile });
      login(newUserProfile);
      setIsVerifying(false);
    }, 1500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const users = getUsers();
    const user = users.find(u => u.mobile === mobileInput && u.password === passwordInput);

    if (user) {
      login(user.profile);
    } else {
      setAuthError('Access Denied. Check mobile number or secret key.');
    }
  };

  const login = (profile: UserProgress) => {
    setCurrentUser(profile);
    localStorage.setItem('studybuddy_session', JSON.stringify(profile));
    setView('dashboard');
    setMobileInput('');
    setPasswordInput('');
    setOtpInput('');
    setOtpSent(false);
  };

  const handleGuestEntry = () => {
    const newUser: UserProgress = {
      username: 'Guest Scholar',
      role: 'student',
      xp: 0,
      level: 1,
      completedModules: [],
      downloadedModules: [],
      customQuizzes: [],
      language: selectedLanguage,
      badges: [],
      streak: 0,
      college: 'General',
      department: 'General Studies',
      classSection: 'G1'
    };
    login(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('studybuddy_session');
    setCurrentUser(null);
    setView('auth');
    setAuthStep('entry');
  };

  const handleDownloadModule = (moduleId: string) => {
    if (!currentUser) return;
    const isAlreadyDownloaded = currentUser.downloadedModules.includes(moduleId);
    if (isAlreadyDownloaded) return;

    setCurrentUser(prev => prev ? {
      ...prev,
      downloadedModules: [...prev.downloadedModules, moduleId]
    } : null);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const session = localStorage.getItem('studybuddy_session');
    if (session) {
      const user = JSON.parse(session);
      setCurrentUser(user);
      setSelectedLanguage(user.language);
      setView('dashboard');
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('studybuddy_session', JSON.stringify(currentUser));
      const calculatedLevel = Math.floor(currentUser.xp / XP_PER_LEVEL) + 1;
      if (calculatedLevel > currentUser.level) {
        setTimeout(() => {
          setCurrentUser(prev => prev ? { ...prev, level: calculatedLevel } : null);
          setShowLevelUp(true);
        }, 300);
      }
    }
  }, [currentUser?.xp, currentUser?.downloadedModules]);

  const handleAnswer = async (index: number) => {
    if (!quizSession) return;
    const currentQuestion = quizSession.filteredQuestions[quizSession.currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswerIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setQuizSession({ ...quizSession, score: quizSession.score + 25 });

    if (isOnline) {
      setIsAiLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Explain why choosing "${currentQuestion.options[index]}" for the question "${currentQuestion.text}" is ${isCorrect ? 'correct' : 'incorrect'}. Use simple technical terms for an engineering student.`,
          config: { temperature: 0.7 }
        });
        setAiExplanation(response.text || null);
      } catch (e) {
        setAiExplanation(isCorrect ? "Correct! This matches VESIT library standard solutions." : "Not quite. Check the semester 3 textbook reference.");
      } finally {
        setIsAiLoading(false);
      }
    } else {
      setAiExplanation("AI explanation is unavailable offline. Review your textbook notes!");
    }
  };

  const handleNextQuestion = () => {
    if (!quizSession) return;
    if (quizSession.currentQuestionIndex + 1 < quizSession.filteredQuestions.length) {
      setQuizSession({ ...quizSession, currentQuestionIndex: quizSession.currentQuestionIndex + 1 });
      setFeedback(null); 
      setAiExplanation(null);
    } else {
      if (currentUser) {
        setCurrentUser(prev => prev ? {
          ...prev,
          xp: prev.xp + quizSession.score,
          completedModules: quizSession.moduleId.startsWith('custom') 
            ? prev.completedModules 
            : Array.from(new Set([...prev.completedModules, quizSession.moduleId]))
        } : null);
      }
      setView('results');
    }
  };

  const handleStartQuiz = (mode: Difficulty) => {
    if (!activeModule) return;
    
    const filtered = activeModule.questions.filter(q => q.difficulty === mode);
    const sessionQuestions = filtered.length > 0 ? filtered : activeModule.questions;
    
    setQuizSession({
      moduleId: activeModule.id,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      mode: mode,
      filteredQuestions: sessionQuestions
    });
    setFeedback(null);
    setAiExplanation(null);
    setView('quiz');
  };

  const handleSendChatMessage = async () => {
    if (!isOnline) return;
    if (!chatInput.trim() || isAiLoading) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      };
      if (isThinkingMode) config.thinkingConfig = { thinkingBudget: 32768 };

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: msg,
        config
      });

      const text = response.text || "I'm sorry, I couldn't process that.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(c => (c as any).web)
        .map(c => ({ title: (c as any).web.title, uri: (c as any).web.uri })) || [];

      setChatMessages(prev => [...prev, { role: 'model', text, sources }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Connectivity issue. Please check your internet." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- VIEWS ---

  const renderAuth = () => {
    if (authStep === 'entry') {
      return (
        <ViewWrapper className="p-10 justify-center items-center">
          <div className="w-24 h-24 bg-blue-600 rounded-[32px] border-4 border-black shadow-[8px_8px_0_0_#1e293b] flex items-center justify-center text-white font-black text-4xl mb-10 scale-up">SB</div>
          <h1 className="text-4xl font-black tracking-tighter italic mb-2">StudyBuddy</h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-12">VESIT Academic Companion</p>
          <div className="space-y-4 w-full">
            <button onClick={() => { setAuthStep('signup'); setOtpSent(false); setAuthError(''); }} className="w-full chunky-button-primary py-5 text-lg font-black uppercase italic group shadow-[6px_6px_0_0_#1e293b] active:translate-y-1 active:shadow-none transition-all">
              <UserPlus className="w-6 h-6 mr-3 group-hover:rotate-12 transition-all" /> JOIN MISSION
            </button>
            <button onClick={() => { setAuthStep('login'); setAuthError(''); }} className="w-full py-5 bg-white border-4 border-black rounded-[24px] font-black text-lg shadow-[6px_6px_0_0_#1e293b] active:translate-y-1 active:shadow-none transition-all">
              LOGIN
            </button>
            <button onClick={handleGuestEntry} className="w-full text-slate-400 font-black uppercase text-[8px] tracking-[0.2em] py-8 hover:text-blue-600 transition-colors">
              GUEST ENTRY
            </button>
          </div>
        </ViewWrapper>
      );
    }

    if (authStep === 'signup') {
      return (
        <ViewWrapper className="p-8 overflow-y-auto">
          <button onClick={() => setAuthStep('entry')} className="mb-8 p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_#1e293b] active:translate-y-1 active:shadow-none transition-all"><ArrowLeft /></button>
          <h2 className="text-3xl font-black italic mb-2">New Mission</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase mb-8">Set your academic course</p>
          
          <form onSubmit={otpSent ? handleJoinMission : handleSendOTP} className="space-y-6 pb-12">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Mobile Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  value={mobileInput}
                  onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210" 
                  disabled={otpSent}
                  className="w-full p-4 pl-12 border-4 border-black rounded-2xl font-black outline-none focus:bg-blue-50"
                />
                <SmartphoneNfc className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              </div>
            </div>

            {otpSent && (
              <div className="space-y-6 scale-up">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">4-Digit OTP</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-4 text-center text-2xl tracking-[1em] border-4 border-black rounded-2xl font-black outline-none focus:bg-blue-50"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1 flex items-center gap-1"><School className="w-3 h-3" /> College</label>
                    <select value={collegeInput} onChange={e => setCollegeInput(e.target.value)} className="w-full p-4 border-4 border-black rounded-2xl font-black bg-white">
                      <option value="VESIT">Vivekanand Education Society's IT (VESIT)</option>
                      <option value="TSEC">Thadomal Shahani (TSEC)</option>
                      <option value="KJSCE">K. J. Somaiya (KJSCE)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> Department</label>
                    <select value={deptInput} onChange={e => setDeptInput(e.target.value)} className="w-full p-4 border-4 border-black rounded-2xl font-black bg-white">
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="IT">Information Technology</option>
                      <option value="EXTC">Electronics & Telecomm</option>
                      <option value="AI_DS">AI & Data Science</option>
                      <option value="Automation_Robotics">Automation & Robotics</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Class / Section</label>
                    <input 
                      type="text" 
                      value={classInput}
                      onChange={e => setClassInput(e.target.value.toUpperCase())}
                      placeholder="D12A" 
                      className="w-full p-4 border-4 border-black rounded-2xl font-black outline-none focus:bg-blue-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Secret Key (Password)</label>
                  <input 
                    type="password" 
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••" 
                    className="w-full p-4 border-4 border-black rounded-2xl font-black outline-none focus:bg-blue-50"
                  />
                </div>
              </div>
            )}
            
            {authError && <p className="text-red-500 text-[10px] font-black uppercase px-2 italic">{authError}</p>}
            
            <button 
              type="submit" 
              disabled={isVerifying}
              className="w-full chunky-button-primary py-5 text-lg font-black uppercase italic"
            >
              {isVerifying ? <RefreshCw className="w-6 h-6 animate-spin" /> : (otpSent ? 'ACTIVATE PORTAL' : 'SEND OTP')}
            </button>
          </form>
        </ViewWrapper>
      );
    }

    if (authStep === 'login') {
      return (
        <ViewWrapper className="p-8">
          <button onClick={() => setAuthStep('entry')} className="mb-8 p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_#1e293b] active:translate-y-1 active:shadow-none transition-all"><ArrowLeft /></button>
          <h2 className="text-3xl font-black italic mb-2">Welcome Back</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase mb-8">Resume Academic Path</p>
          
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Mobile Number</label>
              <input 
                type="tel" 
                value={mobileInput}
                onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210" 
                className="w-full p-4 border-4 border-black rounded-2xl font-black outline-none focus:bg-blue-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Secret Key</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••" 
                className="w-full p-4 border-4 border-black rounded-2xl font-black outline-none focus:bg-blue-50"
              />
            </div>
            
            {authError && <p className="text-red-500 text-[10px] font-black uppercase px-2 italic">{authError}</p>}
            
            <button type="submit" className="w-full chunky-button-primary py-5 text-lg font-black uppercase italic shadow-[6px_6px_0_0_#1e293b]">RE-ENTER HUB</button>
          </form>
        </ViewWrapper>
      );
    }
  };

  const renderDashboard = () => {
    // Filter modules based on online status and department
    const filteredModules = MODULES.filter(m => {
      const isDeptMatch = m.subject.includes(currentUser?.department || '') || m.subject === 'Computer Engineering';
      if (!isOnline) {
        return isDeptMatch && (currentUser?.downloadedModules.includes(m.id));
      }
      return isDeptMatch;
    });

    const currentXP = currentUser?.xp || 0;
    const progressXP = currentXP % XP_PER_LEVEL;
    const levelProgressPercent = (progressXP / XP_PER_LEVEL) * 100;

    return (
      <ViewWrapper id="dashboard">
        <header className="p-6 bg-white border-b-4 border-black flex flex-col gap-4 sticky top-0 z-50">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl border-4 border-black flex items-center justify-center text-white font-black text-xl">
                {currentUser?.username[0]}
              </div>
              <div>
                <h1 className="text-lg font-black leading-none">{currentUser?.username}</h1>
                <p className="text-[9px] font-black text-blue-600 uppercase mt-1">Level {currentUser?.level} Scholar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               {!isOnline && (
                 <div className="bg-red-100 text-red-600 px-2 py-1.5 rounded-xl border-2 border-black flex items-center gap-1">
                   <CloudOff className="w-3 h-3" />
                   <span className="text-[8px] font-black uppercase">Offline</span>
                 </div>
               )}
               <div className="bg-amber-100 px-3 py-1.5 rounded-xl border-4 border-black flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span className="font-black text-sm">{currentUser?.xp}</span>
              </div>
            </div>
          </div>

          {/* New Level Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-black uppercase text-slate-400">Next Level Milestone</span>
              <span className="text-[8px] font-black uppercase text-blue-600">{progressXP} / {XP_PER_LEVEL} XP</span>
            </div>
            <div className="progress-bar-container w-full">
              <div className="progress-bar-fill" style={{ width: `${levelProgressPercent}%` }} />
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1 overflow-y-auto pb-24">
          {/* Department Specific Header */}
          <section className="bg-slate-900 p-6 rounded-[32px] border-4 border-black shadow-[8px_8px_0_0_#000] text-white relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <Building2 className="w-4 h-4 text-blue-400" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">{currentUser?.department} HUB</span>
                </div>
                <h3 className="text-xl font-black italic mb-2">Syllabus Portal</h3>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed mb-4">Content mapped to your university department.</p>
                <div className="flex gap-2">
                  <button 
                    disabled={!isOnline}
                    className={`bg-white text-black border-4 border-black px-4 py-2 rounded-xl font-black uppercase text-[8px] flex items-center gap-1 shadow-[4px_4px_0_0_#3b82f6] ${!isOnline ? 'opacity-50 grayscale' : ''}`}
                  >
                    <ExternalLink className="w-3 h-3" /> MU SYLLABUS
                  </button>
                  <button onClick={() => setView('notes-hub')} className="bg-blue-600 text-white border-4 border-black px-4 py-2 rounded-xl font-black uppercase text-[8px] flex items-center gap-1">
                    <FilePlus className="w-3 h-3" /> NOTES
                  </button>
                </div>
             </div>
             <School className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
          </section>

          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={!isOnline}
              onClick={() => setView('ai-chat')} 
              className={`p-4 bg-white border-4 border-black rounded-[24px] shadow-[6px_6px_0_0_#000] text-left hover:bg-slate-50 transition-all ${!isOnline ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-black text-xs uppercase italic">Branch Support</h4>
              <p className="text-[8px] font-bold text-slate-400 mt-1">Grounding & Thinking</p>
            </button>
            <button onClick={() => setView('arcade')} className="p-4 bg-white border-4 border-black rounded-[24px] shadow-[6px_6px_0_0_#000] text-left hover:bg-slate-50 transition-all">
              <Gamepad2 className="w-8 h-8 text-amber-500 mb-2" />
              <h4 className="font-black text-xs uppercase italic">Viva Arcade</h4>
              <p className="text-[8px] font-bold text-slate-400 mt-1">Oral Prep Games</p>
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-slate-400" />
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{!isOnline ? 'Downloaded Subjects' : 'Active Subjects'}</h3>
              </div>
              {!isOnline && filteredModules.length === 0 && (
                <div className="text-[8px] font-black uppercase text-red-500 italic">No content downloaded</div>
              )}
            </div>
            
            {filteredModules.map(m => (
              <div key={m.id} className="relative group">
                <button 
                  onClick={() => { setActiveModule(m); setView('study'); }} 
                  className="w-full text-left p-4 chunky-card rounded-[24px] flex items-center gap-4 group"
                >
                  <div className={`w-12 h-12 rounded-xl border-4 border-black flex items-center justify-center transition-all ${currentUser?.completedModules.includes(m.id) ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    {currentUser?.completedModules.includes(m.id) ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 text-sm">{m.title}</h4>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{m.subtitle}</p>
                  </div>
                  {isOnline && !currentUser?.downloadedModules.includes(m.id) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownloadModule(m.id); }}
                      className="p-2 bg-slate-50 border-2 border-black rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <CloudDownload className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  {currentUser?.downloadedModules.includes(m.id) && (
                    <div className="p-2 bg-green-50 rounded-lg">
                      <WifiOff className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-black transition-colors ml-1" />
                </button>
              </div>
            ))}
          </div>
        </main>

        {renderMainFooter()}
      </ViewWrapper>
    );
  };

  const renderAIChat = () => (
    <ViewWrapper id="ai-chat">
      <header className="p-6 bg-white border-b-4 border-black flex items-center sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="p-2 border-4 border-black rounded-xl"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-4 flex-1">
          <h2 className="font-black text-lg italic leading-none">{currentUser?.department} Scholar</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border-2 border-black ${isThinkingMode ? 'bg-amber-400' : 'bg-slate-100 text-slate-400'}`}>Deep Think</span>
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md border-2 border-black bg-blue-100 text-blue-600">Web Grounding</span>
          </div>
        </div>
        <button 
          onClick={() => setIsThinkingMode(!isThinkingMode)}
          className={`p-2 rounded-xl border-4 border-black transition-all ${isThinkingMode ? 'bg-amber-400 shadow-[2px_2px_0_0_#000]' : 'bg-white shadow-[4px_4px_0_0_#000]'}`}
        >
          <Brain className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
        {!isOnline && (
           <div className="bg-red-50 border-4 border-black p-6 rounded-[24px] text-center">
             <CloudOff className="w-12 h-12 text-red-600 mx-auto mb-2" />
             <p className="font-black uppercase text-xs italic">AI Scholar requires an internet connection.</p>
           </div>
        )}
        {isOnline && chatMessages.length === 0 && (
          <div className="text-center py-20 animate-pulse">
            <SearchCode className="w-16 h-16 text-blue-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm italic">Ask anything about your department curriculum,<br/>technical papers, or campus events.</p>
          </div>
        )}
        {isOnline && chatMessages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 border-4 border-black rounded-[24px] font-bold text-sm shadow-[4px_4px_0_0_#000] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'}`}>
              {m.text}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-2 border-t-2 border-black/10">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Reliable Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, j) => (
                      <a key={j} href={s.uri} target="_blank" className="text-[8px] bg-slate-50 px-2 py-1 rounded border-2 border-black/10 text-blue-600 underline truncate max-w-[120px]">
                        {s.title || 'Source'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isAiLoading && (
          <div className="flex justify-start">
            <div className="p-4 bg-slate-100 border-4 border-black rounded-[24px] flex gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </main>
      {isOnline && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-white border-t-4 border-black z-[60]">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search syllabus or ask questions..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
              className="flex-1 p-4 border-4 border-black rounded-[20px] font-bold text-sm outline-none focus:bg-slate-50"
            />
            <button onClick={handleSendChatMessage} className="w-14 h-14 bg-blue-600 text-white border-4 border-black rounded-[20px] flex items-center justify-center active:scale-95 transition-all">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </ViewWrapper>
  );

  const renderArcade = () => (
    <ViewWrapper id="arcade">
      <header className="p-6 bg-white border-b-4 border-black flex items-center sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="p-2 border-4 border-black rounded-xl"><ArrowLeft className="w-6 h-6" /></button>
        <div className="ml-4">
          <h2 className="font-black text-lg italic leading-none">Oral Arcade</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Practicing for Departmental Vivas</p>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        <div className="grid grid-cols-1 gap-4">
          {GAMES.map((game, i) => {
            const IconComponent = 
              game.icon === 'Zap' ? Zap : 
              game.icon === 'Grid' ? LayoutGrid : 
              game.icon === 'MessageCircle' ? MessageCircle : 
              Mic;

            return (
              <button key={game.id} className="chunky-card p-5 rounded-[32px] bg-white flex items-center gap-5 text-left stagger-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 bg-amber-50 rounded-2xl border-4 border-black flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg italic">{game.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mt-1">{game.desc}</p>
                </div>
                <PlayCircle className="w-8 h-8 text-slate-200" />
              </button>
            );
          })}
        </div>
      </main>
      {renderMainFooter()}
    </ViewWrapper>
  );

  const renderMainFooter = () => (
    <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-white border-t-4 border-black flex justify-around items-center z-50">
      <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
        <LayoutDashboard className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Home</span>
      </button>
      <button onClick={() => setView('notes-hub')} className={`flex flex-col items-center gap-1 ${view === 'notes-hub' ? 'text-blue-600' : 'text-slate-400'}`}>
        <FileText className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Hub</span>
      </button>
      <button onClick={() => setView('ai-chat')} className={`flex flex-col items-center gap-1 ${view === 'ai-chat' ? 'text-blue-600' : 'text-slate-400'}`}>
        <MessageCircle className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Chat</span>
      </button>
      <button onClick={() => setView('arcade')} className={`flex flex-col items-center gap-1 ${view === 'arcade' ? 'text-blue-600' : 'text-slate-400'}`}>
        <Gamepad2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Arcade</span>
      </button>
      <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-500">
        <LogOut className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Exit</span>
      </button>
    </footer>
  );

  const renderStudyView = () => (
    <ViewWrapper id="study" className="bg-white">
      <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_#000] active:translate-y-0.5 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-6 font-black text-xl italic truncate flex-1">{activeModule?.title}</h2>
        {!isOnline && (
           <div className="p-2 bg-green-100 border-2 border-black rounded-xl flex items-center gap-1">
             <WifiOff className="w-4 h-4 text-green-600" />
             <span className="text-[8px] font-black uppercase">Offline Access</span>
           </div>
        )}
      </header>
      <main className="p-6 space-y-6 overflow-y-auto pb-10">
        {/* Syllabus Relevance Card */}
        <section className="bg-blue-600 p-6 rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000] text-white">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-5 h-5" />
            <h3 className="font-black text-[10px] uppercase tracking-wider">MU {currentUser?.department} Syllabus</h3>
          </div>
          <p className="text-[12px] font-black leading-tight">This topic directly maps to Semester 3 Core Course (Module 2.1). Essential for Internal Assessment & End Sem Exam.</p>
        </section>

        {activeModule?.content.map((p, i) => (
          <div key={i} className="bg-slate-800 p-8 rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000] stagger-item" style={{ animationDelay: `${i * 0.1}s` }}>
            <p className="text-md font-bold text-white leading-relaxed">{p}</p>
          </div>
        ))}
        
        <section className="bg-amber-50 p-6 rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000] stagger-item" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-amber-400 rounded-xl border-4 border-black flex items-center justify-center"><Lightbulb className="w-6 h-6 text-black" /></div>
             <h3 className="font-black text-sm italic uppercase tracking-wider">Exam Prep Insights</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase leading-relaxed mb-4">
            VESIT Past Papers highlight this section for viva questions. Focus on practical implementation logic.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-white border-4 border-black py-2 rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-1">
              <FileText className="w-3 h-3" /> DEP PYQP
            </button>
            <button 
              disabled={!isOnline}
              className={`flex-1 bg-white border-4 border-black py-2 rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-1 ${!isOnline ? 'opacity-50 grayscale' : ''}`}
            >
              <ExternalLink className="w-3 h-3" /> COURSE DOC
            </button>
          </div>
        </section>

        <button 
          onClick={() => handleStartQuiz('standard')} 
          className="w-full chunky-button-primary py-6 text-2xl font-black uppercase italic shadow-[8px_8px_0_0_#000] mt-4 mb-10"
        >
          START {currentUser?.department} TEST <Zap className="w-8 h-8 ml-3" />
        </button>
      </main>
    </ViewWrapper>
  );

  const renderResultsView = () => (
    <ViewWrapper id="results" className="bg-white items-center justify-center p-10 text-center">
       <div className="w-32 h-32 bg-amber-100 rounded-[40px] border-8 border-black flex items-center justify-center mb-8 scale-up">
          <Award className="w-16 h-16 text-amber-500" />
       </div>
       <h2 className="text-4xl font-black italic mb-4">Exam Completed!</h2>
       <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10">Unit Assessment Final Analysis</p>
       
       <div className="grid grid-cols-2 gap-4 w-full mb-12">
          <div className="p-6 bg-blue-50 border-4 border-black rounded-[32px] shadow-[4px_4px_0_0_#000]">
             <Star className="w-8 h-8 text-blue-600 mx-auto mb-2 fill-blue-200" />
             <p className="text-3xl font-black">{quizSession?.score}</p>
             <p className="text-[8px] font-black uppercase text-blue-600">Points Earned</p>
          </div>
          <div className="p-6 bg-amber-50 border-4 border-black rounded-[32px] shadow-[4px_4px_0_0_#000]">
             <Zap className="w-8 h-8 text-amber-500 mx-auto mb-2 fill-amber-200" />
             <p className="text-3xl font-black">+{quizSession?.score}</p>
             <p className="text-[8px] font-black uppercase text-amber-500">XP Gained</p>
          </div>
       </div>

       <button onClick={() => setView('dashboard')} className="w-full chunky-button-primary py-5 text-xl font-black uppercase italic shadow-[8px_8px_0_0_#000]">
          RETURN TO HUB
       </button>
    </ViewWrapper>
  );

  return (
    <div id="root" className="min-h-screen flex flex-col relative overflow-hidden bg-white">
      {view === 'auth' ? renderAuth() : 
       view === 'dashboard' ? renderDashboard() : 
       view === 'ai-chat' ? renderAIChat() :
       view === 'arcade' ? renderArcade() :
       view === 'study' ? renderStudyView() :
       view === 'results' ? renderResultsView() :
       view === 'notes-hub' ? (
        <ViewWrapper id="notes-hub" className="bg-white">
          <header className="p-6 border-b-4 border-black flex items-center bg-white sticky top-0 z-50">
            <button onClick={() => setView('dashboard')} className="p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_#1e293b] active:translate-y-1 transition-all"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="ml-5 font-black text-2xl italic flex-1">{currentUser?.college} Library</h2>
            {!isOnline && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-xl border-2 border-black">
                <CloudOff className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">Offline</span>
              </div>
            )}
          </header>
          <div className="flex p-4 gap-2 bg-slate-50 border-b-4 border-black">
            {(['download', 'upload', 'practice'] as const).map(tab => (
              <button key={tab} onClick={() => setNotesTab(tab)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase border-4 transition-all ${notesTab === tab ? 'bg-blue-600 text-white border-black shadow-[4px_4px_0_0_#1e293b]' : 'bg-white border-transparent text-slate-400'}`}>{tab}</button>
            ))}
          </div>
          <main className="p-6 space-y-8 overflow-y-auto pb-24">
            {notesTab === 'download' && (
              <div className="space-y-8 scale-up">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">{currentUser?.department} Archive</h3>
                {MODULES.filter(m => {
                  const isDeptMatch = m.subject.includes(currentUser?.department || '');
                  if (!isOnline) return isDeptMatch && currentUser?.downloadedModules.includes(m.id);
                  return isDeptMatch;
                }).map((m, i) => (
                  <div key={m.id} className="p-5 chunky-card rounded-[32px] flex items-center justify-between bg-white stagger-item" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl border-4 border-black flex items-center justify-center ${currentUser?.downloadedModules.includes(m.id) ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                        {currentUser?.downloadedModules.includes(m.id) ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-md leading-none mb-1">MU PYQP: {m.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">SEM 3 • {currentUser?.classSection}</p>
                      </div>
                    </div>
                    {isOnline && !currentUser?.downloadedModules.includes(m.id) && (
                      <button 
                        onClick={() => handleDownloadModule(m.id)}
                        className="p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#1e293b] bg-white text-blue-600 active:translate-y-0.5 transition-all"
                      >
                        <Download className="w-6 h-6" />
                      </button>
                    )}
                    {currentUser?.downloadedModules.includes(m.id) && (
                      <div className="p-3 text-green-600">
                        <WifiOff className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {notesTab === 'upload' && (
              <div className="text-center py-20 scale-up">
                <Upload className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase text-[10px]">Upload {currentUser?.department} Notes</p>
                <p className="text-[8px] font-bold text-slate-300 mt-2">Requires internet connection to sync.</p>
              </div>
            )}
          </main>
          {renderMainFooter()}
        </ViewWrapper>
       ) : view === 'quiz' ? (
        <ViewWrapper id="quiz" className="bg-slate-50">
          <header className="p-6 bg-white border-b-4 border-black sticky top-0 z-50">
             <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-black uppercase text-slate-400">Question {quizSession!.currentQuestionIndex + 1} / {quizSession!.filteredQuestions.length}</span>
               {!isOnline && <span className="text-[8px] font-black text-green-600 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline Session</span>}
             </div>
             <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${((quizSession!.currentQuestionIndex + 1) / quizSession!.filteredQuestions.length) * 100}%` }} /></div>
          </header>
          <main className="p-8 flex-1 flex flex-col justify-center">
            <h5 className="text-2xl font-black italic text-slate-800 mb-8">{quizSession!.filteredQuestions[quizSession!.currentQuestionIndex].text}</h5>
            <div className="space-y-4">
              {quizSession!.filteredQuestions[quizSession!.currentQuestionIndex].options.map((opt, i) => (
                <button key={i} disabled={!!feedback} onClick={() => handleAnswer(i)} className={`w-full text-left p-6 font-black border-4 border-black rounded-[32px] ${feedback ? (i === quizSession!.filteredQuestions[quizSession!.currentQuestionIndex].correctAnswerIndex ? 'bg-green-500 text-white' : 'bg-red-50 opacity-40') : 'bg-white shadow-[6px_6px_0_0_#000]'}`}>{opt}</button>
              ))}
            </div>
            {aiExplanation && <div className="mt-8 p-6 bg-blue-50 border-4 border-blue-600 rounded-[32px] font-bold italic">"{aiExplanation}"</div>}
          </main>
          {feedback && !isAiLoading && <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-8 bg-white border-t-4 border-black"><button onClick={handleNextQuestion} className="w-full chunky-button-primary py-6 text-2xl font-black italic uppercase">CONTINUE</button></div>}
        </ViewWrapper>
      ) : (
        <div className="flex-1 flex items-center justify-center p-10 text-center">
           <p className="text-slate-400 font-black uppercase">Developing Module...</p>
           <button onClick={() => setView('dashboard')} className="mt-4 p-4 border-4 border-black rounded-xl">Go Home</button>
        </div>
      )}

      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white border-8 border-black p-10 rounded-[48px] shadow-[20px_20px_0_0_#000] text-center scale-up">
            <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black italic mb-2">LEVEL UP!</h2>
            <p className="text-lg font-black text-blue-600">Reached Level {currentUser?.level}</p>
            <button onClick={() => setShowLevelUp(false)} className="mt-8 w-full chunky-button-primary py-4 font-black uppercase">CLAIM</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;