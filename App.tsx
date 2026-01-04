
import React, { useState, useEffect, ReactNode } from 'react';
import { 
  ChevronRight, ArrowLeft, Trophy, CheckCircle, Mic, BookOpen, 
  RefreshCw, Zap, LayoutDashboard, MessageCircle, 
  FileText, Upload, Smartphone, GraduationCap, UserPlus, 
  Download, Send, Gamepad2, Lightbulb, School, Building2, ClipboardList, 
  CloudDownload, CloudOff, Star, Award, Settings as SettingsIcon, Play,
  Volume2, Eye, Sun, Share2, Users, Plus, Trash2, Globe, LogOut, LogIn,
  BarChart3, Calendar, ListChecks, QrCode, DownloadCloud, Flame
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MODULES, TRANSLATIONS, XP_PER_LEVEL, GAMES } from './constants';
import { AppState, UserProgress, Module, QuizSession, Language, Difficulty, GroundingSource, StudentStats, Grade, Role, Assignment, DailyQuest } from './types';
import { GoogleGenAI } from "@google/genai";

const ViewWrapper = ({ children, className = "", id, isLite }: { children?: ReactNode; className?: string; id?: string; isLite?: boolean }) => (
  <div key={id} className={`${isLite ? '' : 'view-enter'} flex flex-col flex-1 w-full h-full overflow-hidden ${className}`}>
    {children}
  </div>
);

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'Chapter 1 Quiz', topic: 'Math', dueDate: 'Tomorrow', xpReward: 200, questions: MODULES[0].questions, submissions: 12 },
  { id: 'a2', title: 'Weekly Review', topic: 'Science', dueDate: 'Friday', xpReward: 150, questions: MODULES[1].questions, submissions: 5 },
];

const MOCK_QUESTS: DailyQuest[] = [
  { id: 'q1', text: 'Complete 1 Math Module', target: 1, current: 0, reward: 50, completed: false },
  { id: 'q2', text: 'Earn 100 XP', target: 100, current: 40, reward: 30, completed: false },
];

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('auth');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<UserProgress | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // States
  const [localStudents, setLocalStudents] = useState<StudentStats[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(MOCK_QUESTS);
  
  // Form States
  const [authName, setAuthName] = useState('');
  const [authGrade, setAuthGrade] = useState<Grade>('6');
  const [authRole, setAuthRole] = useState<Role>('student');
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignTopic, setNewAssignTopic] = useState('');

  // AI & Feedback
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Chat States
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  const t = (key: string) => TRANSLATIONS[selectedLanguage]?.[key] || TRANSLATIONS['english'][key] || key;

  // --- PERSISTENCE ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const session = localStorage.getItem('studybuddy_rural_session');
    if (session) setCurrentUser(JSON.parse(session));
    
    const students = localStorage.getItem('studybuddy_teacher_room');
    if (students) setLocalStudents(JSON.parse(students));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('studybuddy_rural_session', JSON.stringify(currentUser));
      const calcLevel = Math.floor(currentUser.xp / XP_PER_LEVEL) + 1;
      if (calcLevel > currentUser.level) {
        setCurrentUser(prev => prev ? { ...prev, level: calcLevel } : null);
        setShowLevelUp(true);
      }
    }
  }, [currentUser?.xp]);

  // --- HANDLERS ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName) return;
    const newUser: UserProgress = {
      username: authName,
      role: authRole,
      grade: authGrade,
      xp: 150, // Starter XP
      level: 1,
      completedModules: [],
      downloadedModules: [],
      language: selectedLanguage,
      badges: [],
      streak: 1,
      isLiteMode: false,
      isHighContrast: false,
      isReadAloud: true
    };
    setCurrentUser(newUser);
    setView('dashboard');
  };

  const handleSpeech = (text: string) => {
    if (!currentUser?.isReadAloud) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'hindi' ? 'hi-IN' : selectedLanguage === 'marathi' ? 'mr-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const exportToCSV = () => {
    const headers = "ID,Name,Grade,XP,Completed\n";
    const rows = localStudents.map(s => `${s.id},${s.name},${s.grade},${s.xp},${s.completedModules.length}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Classroom_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const handleCreateAssignment = () => {
    if (!newAssignTitle || !newAssignTopic) return;
    const newA: Assignment = {
      id: `a-${Date.now()}`,
      title: newAssignTitle,
      topic: newAssignTopic,
      dueDate: '7 Days',
      xpReward: 250,
      questions: MODULES[0].questions, // Mocked to pick first module questions
      submissions: 0
    };
    setAssignments([newA, ...assignments]);
    setNewAssignTitle('');
    setNewAssignTopic('');
    setView('teacher-dashboard');
  };

  const handleAnswer = async (index: number) => {
    if (!quizSession) return;
    const q = quizSession.filteredQuestions[quizSession.currentQuestionIndex];
    const isCorrect = index === q.correctAnswerIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setQuizSession({ ...quizSession, score: quizSession.score + 25 });
      handleSpeech("Sahi Jawab!");
    } else {
      handleSpeech("Koshish karte rahiye.");
    }

    if (isOnline) {
      setIsAiLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Rural student context. ${isCorrect ? 'Explain why correct' : 'Explain why incorrect'}. Topic: ${q.topic}. Question: ${q.text}. Student chose: ${q.options[index]}. Answer simply in ${selectedLanguage}.`,
          config: { temperature: 0.7 }
        });
        setAiExplanation(response.text || "Next question?");
      } catch (e) {
        setAiExplanation("Good attempt! Check the next one.");
      } finally {
        setIsAiLoading(false);
      }
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
          completedModules: Array.from(new Set([...prev.completedModules, quizSession.moduleId]))
        } : null);
      }
      setView('results');
    }
  };

  // --- VIEWS ---

  // Fix: Added missing renderAuth view component
  const renderAuth = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-600 text-white overflow-hidden">
      <div className="w-24 h-24 bg-white border-8 border-black rounded-[32px] flex items-center justify-center mb-8 rotate-12">
        <School className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-white">SHIKSHA AI</h1>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-12 text-blue-200">The Rural Learning Companion</p>
      
      <form onSubmit={handleAuth} className="w-full space-y-4 max-w-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase ml-2 text-blue-100">Full Name</label>
          <input 
            type="text" 
            required
            value={authName}
            onChange={e => setAuthName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full p-5 border-4 border-black rounded-3xl font-black text-black shadow-[6px_6px_0_0_#000] focus:outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase ml-2 text-blue-100">Grade</label>
            <select 
              value={authGrade}
              onChange={e => setAuthGrade(e.target.value as Grade)}
              className="w-full p-4 border-4 border-black rounded-2xl font-black text-black bg-white appearance-none"
            >
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase ml-2 text-blue-100">Language</label>
            <select 
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value as Language)}
              className="w-full p-4 border-4 border-black rounded-2xl font-black text-black bg-white appearance-none"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="marathi">Marathi</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={() => setAuthRole('student')}
            className={`flex-1 py-4 border-4 border-black rounded-2xl font-black uppercase text-[10px] transition-all shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none ${authRole === 'student' ? 'bg-amber-400 text-black' : 'bg-blue-700 text-blue-300'}`}
          >
            Student
          </button>
          <button 
            type="button"
            onClick={() => setAuthRole('teacher')}
            className={`flex-1 py-4 border-4 border-black rounded-2xl font-black uppercase text-[10px] transition-all shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none ${authRole === 'teacher' ? 'bg-amber-400 text-black' : 'bg-blue-700 text-blue-300'}`}
          >
            Teacher
          </button>
        </div>

        <button type="submit" className="w-full bg-black text-white py-6 rounded-[32px] font-black italic text-2xl mt-8 flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-[6px_6px_0_0_#222]">
          LET'S LEARN <ArrowLeft className="w-8 h-8 rotate-180" />
        </button>
      </form>
    </div>
  );

  const renderDashboard = () => (
    <ViewWrapper id="dashboard" isLite={currentUser?.isLiteMode}>
      <header className="p-6 bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center text-white font-black text-xl">{currentUser?.username[0]}</div>
            <div>
              <p className="text-sm font-black leading-none">{currentUser?.username}</p>
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                <p className="text-[9px] font-black text-blue-600 uppercase">{currentUser?.streak} Day Streak</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('leaderboard')} className="p-2 border-2 border-black rounded-lg bg-amber-100"><Trophy className="w-5 h-5 text-amber-600" /></button>
            <button onClick={() => setView('settings')} className="p-2 border-2 border-black rounded-lg bg-slate-100"><SettingsIcon className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-black uppercase">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 fill-amber-400" /> Mastery {currentUser?.level}</span>
            <span>{currentUser?.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${((currentUser?.xp || 0) % XP_PER_LEVEL / XP_PER_LEVEL) * 100}%` }} /></div>
        </div>
      </header>

      <main className="p-6 space-y-6 overflow-y-auto pb-24">
        {/* Daily Quests */}
        <section className="bg-slate-900 p-5 rounded-[28px] border-4 border-black shadow-[6px_6px_0_0_#000] text-white">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-blue-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Daily Missions</h3>
          </div>
          <div className="space-y-3">
            {dailyQuests.map(q => (
              <div key={q.id} className="flex items-center gap-3">
                <div className={`w-4 h-4 border-2 rounded-md ${q.completed ? 'bg-blue-500 border-blue-400' : 'border-slate-600'}`}>
                  {q.completed && <CheckCircle className="w-full h-full text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold leading-none">{q.text}</p>
                  <div className="w-full h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(q.current / q.target) * 100}%` }} />
                  </div>
                </div>
                <span className="text-[8px] font-black text-amber-400">+{q.reward} XP</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setView('ai-chat')} className="chunky-card p-4 text-left group">
            <MessageCircle className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-xs uppercase italic">{t('chat')}</h4>
            <p className="text-[8px] font-bold text-slate-400">Guru Help</p>
          </button>
          <button onClick={() => setView('arcade')} className="chunky-card p-4 text-left group">
            <Gamepad2 className="w-8 h-8 text-amber-500 mb-2 group-hover:rotate-12 transition-transform" />
            <h4 className="font-black text-xs uppercase italic">{t('arcade')}</h4>
            <p className="text-[8px] font-bold text-slate-400">Oral Prep</p>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between px-2">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Chapters for You</h3>
            {!isOnline && <span className="text-[8px] font-black text-green-600 flex items-center gap-1"><CloudDownload className="w-3 h-3" /> Offline OK</span>}
          </div>
          {MODULES.filter(m => m.grade === currentUser?.grade).map(m => (
            <button key={m.id} onClick={() => { setActiveModule(m); setView('study'); handleSpeech(m.title); }} className="w-full text-left p-4 chunky-card flex items-center gap-4 bg-white rounded-2xl group">
              <div className={`w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center transition-all ${currentUser?.completedModules.includes(m.id) ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                {currentUser?.completedModules.includes(m.id) ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h5 className="font-black text-sm">{m.title}</h5>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{m.subject} • {m.subtitle}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black transition-colors" />
            </button>
          ))}
        </div>
      </main>
      {renderFooter()}
    </ViewWrapper>
  );

  const renderLeaderboard = () => (
    <ViewWrapper id="leaderboard" className="p-8">
      <header className="flex items-center mb-8">
        <button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="ml-4 font-black text-xl italic uppercase">Classroom Heroes</h2>
      </header>
      <div className="space-y-3">
        {[
          { name: 'Arjun P.', xp: 2450, rank: 1, grade: '8' },
          { name: 'Sita D.', xp: 2100, rank: 2, grade: '8' },
          { name: 'Rahul K.', xp: 1850, rank: 3, grade: '8' },
          { name: currentUser?.username, xp: currentUser?.xp, rank: 4, grade: currentUser?.grade, me: true },
          { name: 'Maya B.', xp: 1200, rank: 5, grade: '8' }
        ].map((hero, i) => (
          <div key={i} className={`p-4 border-4 border-black rounded-2xl flex items-center gap-4 ${hero.me ? 'bg-blue-50 border-blue-600' : 'bg-white'}`}>
            <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-300' : i === 2 ? 'bg-orange-300' : 'bg-slate-100'}`}>{hero.rank}</div>
            <div className="flex-1">
              <p className="font-black text-sm">{hero.name} {hero.me && '(You)'}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Grade {hero.grade}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-sm">{hero.xp}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">XP</p>
            </div>
          </div>
        ))}
      </div>
    </ViewWrapper>
  );

  const renderTeacherDashboard = () => (
    <ViewWrapper id="teacher-dashboard" className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="ml-4 font-black text-xl italic uppercase">Master Console</h2>
        </div>
        <button onClick={exportToCSV} className="p-2 border-2 border-black rounded-lg bg-green-50 text-green-600"><DownloadCloud className="w-5 h-5" /></button>
      </header>
      
      <div className="space-y-6 overflow-y-auto flex-1 pb-10">
        <section className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000]">
            <p className="text-2xl font-black">{localStudents.length}</p>
            <p className="text-[8px] font-black uppercase text-blue-200">Total Students</p>
          </div>
          <div className="p-4 bg-amber-400 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000]">
            <p className="text-2xl font-black">74%</p>
            <p className="text-[8px] font-black uppercase">Class Avg.</p>
          </div>
        </section>

        <div className="flex gap-2">
          <button onClick={() => setView('teacher-assign')} className="flex-1 chunky-button-primary py-3 text-[10px] font-black uppercase gap-2"><Plus className="w-4 h-4" /> New Quiz</button>
          <button onClick={() => setView('teacher-analytics')} className="flex-1 p-3 border-4 border-black rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 bg-white"><BarChart3 className="w-4 h-4" /> Reports</button>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Active Assignments</h4>
          {assignments.map(a => (
            <div key={a.id} className="p-4 border-4 border-black rounded-2xl bg-white flex items-center justify-between">
              <div>
                <p className="font-black text-sm">{a.title}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{a.topic} • {a.submissions} Submissions</p>
              </div>
              <button className="p-2 text-slate-300 hover:text-black transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Student Roster</h4>
          {localStudents.map(s => (
            <div key={s.id} className="p-4 border-4 border-black rounded-2xl flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black">{s.name[0]}</div>
                <div>
                  <p className="font-black text-sm">{s.name}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Grade {s.grade} • {s.xp} XP</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setCurrentUser({ ...currentUser!, username: s.name, grade: s.grade, xp: s.xp, completedModules: s.completedModules });
                  setView('dashboard');
                }} className="p-2 border-2 border-black rounded-lg bg-blue-50 text-blue-600"><LogIn className="w-4 h-4" /></button>
                <button className="p-2 border-2 border-black rounded-lg bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ViewWrapper>
  );

  const renderTeacherAssign = () => (
    <ViewWrapper id="teacher-assign" className="p-8">
      <header className="flex items-center mb-8">
        <button onClick={() => setView('teacher-dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="ml-4 font-black text-xl italic uppercase">Create Quiz</h2>
      </header>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quiz Title</label>
          <input 
            type="text" 
            value={newAssignTitle}
            onChange={e => setNewAssignTitle(e.target.value)}
            placeholder="e.g. Unit 1 Math Test"
            className="w-full p-4 border-4 border-black rounded-2xl font-black"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject</label>
          <input 
            type="text" 
            value={newAssignTopic}
            onChange={e => setNewAssignTopic(e.target.value)}
            placeholder="e.g. Science"
            className="w-full p-4 border-4 border-black rounded-2xl font-black"
          />
        </div>
        
        <div className="p-6 border-4 border-black border-dashed rounded-3xl bg-slate-50 text-center space-y-3">
          <Upload className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-[10px] font-black uppercase">Scan Textbook Page (AI Parse)</p>
          <button className="text-[8px] font-black text-blue-600 underline">Browse Files</button>
        </div>

        <div className="bg-amber-50 p-4 border-4 border-black rounded-2xl">
          <div className="flex gap-2 items-center mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h5 className="text-[10px] font-black uppercase">AI Hint</h5>
          </div>
          <p className="text-[9px] font-bold text-slate-600">Uploading a photo of a textbook page will automatically generate 10 MCQs based on the content.</p>
        </div>

        <button onClick={handleCreateAssignment} className="w-full chunky-button-primary py-5 text-xl font-black italic uppercase">Publish to Class</button>
      </div>
    </ViewWrapper>
  );

  // Fix: Added missing renderAiChat view component
  const renderAiChat = () => {
    const handleSend = async () => {
      if (!chatInput.trim()) return;
      const userMsg = chatInput;
      setChatInput('');
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsChatTyping(true);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: userMsg,
          config: {
            systemInstruction: `You are Guru, a friendly AI tutor for a student in rural India. Use simple language, local analogies, and encourage them. Current Language: ${selectedLanguage}.`,
          }
        });
        setChatMessages(prev => [...prev, { role: 'model', text: response.text || "I'm not sure how to answer that, try asking something else!" }]);
      } catch (err) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Connection error. Please check your internet." }]);
      } finally {
        setIsChatTyping(false);
      }
    };

    return (
      <ViewWrapper id="ai-chat" className="bg-slate-50">
        <header className="p-6 bg-white border-b-4 border-black flex items-center gap-4 sticky top-0 z-50">
          <button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div className="w-10 h-10 bg-blue-600 border-2 border-black rounded-full flex items-center justify-center text-white"><MessageCircle className="w-5 h-5" /></div>
          <div>
            <h2 className="font-black text-sm italic uppercase leading-none">AI Guru</h2>
            <p className="text-[8px] font-black text-green-600 uppercase">Online</p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
          {chatMessages.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <Lightbulb className="w-12 h-12 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase">Ask anything about your lessons!</p>
            </div>
          )}
          {chatMessages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 border-4 border-black rounded-2xl font-bold text-xs ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-black rounded-bl-none shadow-[4px_4px_0_0_#000]'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isChatTyping && <div className="p-3 bg-white border-4 border-black rounded-xl w-12 text-center font-black animate-pulse">...</div>}
        </div>
        <div className="fixed bottom-[88px] left-0 right-0 max-w-[480px] mx-auto p-4 bg-white border-t-4 border-black">
          <div className="flex gap-2">
            <input 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Guru..." 
              className="flex-1 p-4 border-4 border-black rounded-2xl font-bold text-xs outline-none focus:bg-blue-50" 
            />
            <button onClick={handleSend} className="p-4 bg-blue-600 text-white border-4 border-black rounded-2xl active:translate-y-1 transition-all"><Send className="w-6 h-6" /></button>
          </div>
        </div>
        {renderFooter()}
      </ViewWrapper>
    );
  };

  // Fix: Added missing renderArcade view component
  const renderArcade = () => (
    <ViewWrapper id="arcade" className="bg-amber-50">
      <header className="p-6 bg-white border-b-4 border-black flex items-center sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="ml-4 font-black text-xl italic uppercase">Play Zone</h2>
      </header>
      <main className="p-6 space-y-6 overflow-y-auto pb-24">
        <div className="p-6 bg-slate-900 text-white rounded-[32px] border-4 border-black shadow-[6px_6px_0_0_#000]">
          <h3 className="font-black italic text-xl mb-1 text-amber-400">Oral Practice</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Earn XP by speaking</p>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border-2 border-white/20">
            <Mic className="w-8 h-8 text-blue-400" />
            <p className="text-[10px] font-bold">Speak into the mic. We'll check your pronunciation!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {GAMES.map(g => (
            <button key={g.id} className="p-5 chunky-card flex items-center gap-5 bg-white text-left group">
              <div className="w-14 h-14 bg-amber-100 border-2 border-black rounded-2xl flex items-center justify-center text-amber-600 group-hover:rotate-12 transition-transform">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-base">{g.title}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase italic mb-1">{g.desc}</p>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[8px] font-black uppercase text-amber-600">+{g.xp} XP</span>
                </div>
              </div>
              <Play className="w-6 h-6 text-slate-300 group-hover:text-black transition-colors" />
            </button>
          ))}
        </div>
      </main>
      {renderFooter()}
    </ViewWrapper>
  );

  const renderSettings = () => (
    <ViewWrapper id="settings" className="p-8 overflow-y-auto">
      <header className="flex items-center mb-8">
        <button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="ml-4 font-black text-xl italic uppercase">Toolbox</h2>
      </header>
      
      <div className="space-y-8 pb-20">
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Accessibility</h4>
          {[
            { id: 'lite', icon: Smartphone, label: t('liteMode'), checked: currentUser?.isLiteMode, toggle: () => setCurrentUser(prev => prev ? { ...prev, isLiteMode: !prev.isLiteMode } : null) },
            { id: 'contrast', icon: Sun, label: t('highContrast'), checked: currentUser?.isHighContrast, toggle: () => setCurrentUser(prev => prev ? { ...prev, isHighContrast: !prev.isHighContrast } : null) },
            { id: 'speech', icon: Volume2, label: 'Voice Assistance', checked: currentUser?.isReadAloud, toggle: () => setCurrentUser(prev => prev ? { ...prev, isReadAloud: !prev.isReadAloud } : null) },
          ].map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-4 border-4 border-black rounded-2xl bg-white shadow-[4px_4px_0_0_#000]">
              <div className="flex items-center gap-3">
                <opt.icon className="w-6 h-6 text-blue-600" />
                <span className="font-black text-xs">{opt.label}</span>
              </div>
              <button 
                onClick={opt.toggle}
                className={`w-14 h-8 border-4 border-black rounded-full relative transition-colors ${opt.checked ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white border-2 border-black rounded-full absolute top-1 transition-all ${opt.checked ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Progress Sharing</h4>
          <div className="p-6 border-4 border-black rounded-[32px] bg-white text-center flex flex-col items-center gap-4">
            <p className="text-[10px] font-black uppercase text-slate-500">Scan to Sync Progress</p>
            <div className="p-2 border-4 border-black rounded-2xl">
              <QRCodeSVG value={btoa(JSON.stringify(currentUser || {}))} size={160} />
            </div>
            <button onClick={() => {
               const code = btoa(JSON.stringify(currentUser || {}));
               navigator.clipboard.writeText(code);
               alert("Code copied!");
            }} className="text-[8px] font-black text-blue-600 underline uppercase">Copy String Code</button>
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <button onClick={() => setView('teacher-dashboard')} className="w-full p-4 border-4 border-black rounded-2xl font-black uppercase flex items-center justify-center gap-3 bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" /> {t('teacherRoom')}
          </button>
          <button onClick={() => { setCurrentUser(null); setView('auth'); }} className="w-full p-4 border-4 border-black rounded-2xl font-black uppercase flex items-center justify-center gap-3 bg-red-50 text-red-600">
            <LogOut className="w-6 h-6" /> {t('exit')}
          </button>
        </section>
      </div>
    </ViewWrapper>
  );

  const renderFooter = () => (
    <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-white border-t-4 border-black flex justify-around items-center z-50">
      <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
        <LayoutDashboard className="w-6 h-6" /><span className="text-[8px] font-black uppercase">{t('dashboard')}</span>
      </button>
      <button onClick={() => setView('ai-chat')} className={`flex flex-col items-center gap-1 ${view === 'ai-chat' ? 'text-blue-600' : 'text-slate-400'}`}>
        <MessageCircle className="w-6 h-6" /><span className="text-[8px] font-black uppercase">{t('chat')}</span>
      </button>
      <button onClick={() => setView('arcade')} className={`flex flex-col items-center gap-1 ${view === 'arcade' ? 'text-blue-600' : 'text-slate-400'}`}>
        <Gamepad2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">{t('arcade')}</span>
      </button>
      <button onClick={() => setView('settings')} className={`flex flex-col items-center gap-1 ${['settings','teacher-dashboard','teacher-assign','teacher-analytics'].includes(view) ? 'text-blue-600' : 'text-slate-400'}`}>
        <SettingsIcon className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Tools</span>
      </button>
    </footer>
  );

  const renderResults = () => (
    <ViewWrapper className="items-center justify-center p-10 text-center">
      <div className="w-24 h-24 bg-amber-100 rounded-[32px] border-8 border-black flex items-center justify-center mb-8 scale-up">
        <Award className="w-12 h-12 text-amber-500" />
      </div>
      <h2 className="text-3xl font-black italic mb-2">Great Work!</h2>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-10">Unit Assessment Complete</p>
      
      <div className="grid grid-cols-2 gap-4 w-full mb-12">
        <div className="p-5 border-4 border-black rounded-[28px] bg-blue-50">
          <p className="text-3xl font-black">+{quizSession?.score}</p>
          <p className="text-[8px] font-black uppercase text-blue-600">Mastery XP</p>
        </div>
        <div className="p-5 border-4 border-black rounded-[28px] bg-amber-50">
          <p className="text-3xl font-black">{Math.floor((quizSession?.score || 0) / 25)}</p>
          <p className="text-[8px] font-black uppercase text-amber-500">Stars</p>
        </div>
      </div>
      
      <button onClick={() => setView('dashboard')} className="w-full chunky-button-primary py-5 text-xl font-black italic uppercase">Claim & Return</button>
    </ViewWrapper>
  );

  const renderStudy = () => (
    <ViewWrapper id="study" className="bg-white">
      <header className="p-6 border-b-4 border-black flex items-center sticky top-0 bg-white z-50">
        <button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="ml-4 font-black text-lg italic flex-1 truncate">{activeModule?.title}</h2>
        <button onClick={() => handleSpeech(activeModule?.content.join(' ') || '')} className="p-2 border-2 border-black rounded-lg bg-blue-100"><Volume2 className="w-5 h-5 text-blue-600" /></button>
      </header>
      <main className="p-6 space-y-6 overflow-y-auto pb-24">
        {activeModule?.content.map((text, i) => (
          <div key={i} className="p-6 border-4 border-black rounded-[24px] bg-slate-50 shadow-[4px_4px_0_0_#000]">
            <p className="font-bold leading-relaxed">{text}</p>
          </div>
        ))}
        <button onClick={() => {
          setQuizSession({
            moduleId: activeModule!.id,
            currentQuestionIndex: 0,
            score: 0,
            mode: 'standard',
            filteredQuestions: activeModule!.questions
          });
          setView('quiz');
        }} className="w-full chunky-button-primary py-6 text-2xl font-black italic uppercase">Challenge Time!</button>
      </main>
    </ViewWrapper>
  );

  const renderQuiz = () => {
    const q = quizSession?.filteredQuestions[quizSession.currentQuestionIndex];
    return (
      <ViewWrapper id="quiz" className="bg-slate-50">
        <header className="p-6 bg-white border-b-4 border-black sticky top-0 z-50">
          <div className="flex justify-between text-[10px] font-black uppercase mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Question {quizSession!.currentQuestionIndex + 1} / {quizSession!.filteredQuestions.length}</span>
            <span className="text-blue-600">XP: {quizSession!.score}</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${((quizSession!.currentQuestionIndex + 1) / quizSession!.filteredQuestions.length) * 100}%` }} /></div>
        </header>
        <main className="p-8 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-2xl font-black italic">{q?.text}</h2>
             <button onClick={() => handleSpeech(q?.text + ". " + q?.options.join(". "))} className="p-2 bg-white border-2 border-black rounded-lg"><Volume2 className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
            {q?.options.map((opt, i) => (
              <button 
                key={i} 
                disabled={!!feedback}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-6 font-black border-4 border-black rounded-[24px] transition-all ${feedback ? (i === q.correctAnswerIndex ? 'bg-green-500 text-white translate-x-1' : (feedback === 'incorrect' && i === quizSession.currentQuestionIndex ? 'bg-red-500 text-white' : 'bg-slate-50 opacity-40')) : 'bg-white shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none'}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {aiExplanation && (
            <div className="mt-8 p-6 bg-blue-50 border-4 border-black rounded-[24px] font-bold italic flex items-start gap-3 scale-up">
              <Lightbulb className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <p className="text-xs leading-relaxed">{aiExplanation}</p>
            </div>
          )}
        </main>
        {feedback && (
          <div className="p-6 bg-white border-t-4 border-black z-[60]">
            <button onClick={handleNextQuestion} className="w-full chunky-button-primary py-5 text-xl font-black italic uppercase group">
              Next Step <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </ViewWrapper>
    );
  };

  return (
    <div id="root" className={`min-h-screen flex flex-col relative overflow-hidden bg-white ${currentUser?.isHighContrast ? 'brightness-110 contrast-125' : ''}`}>
      {view === 'auth' ? renderAuth() : 
       view === 'dashboard' ? renderDashboard() : 
       view === 'leaderboard' ? renderLeaderboard() :
       view === 'study' ? renderStudy() :
       view === 'quiz' ? renderQuiz() :
       view === 'results' ? renderResults() :
       view === 'settings' ? renderSettings() :
       view === 'teacher-dashboard' ? renderTeacherDashboard() :
       view === 'teacher-assign' ? renderTeacherAssign() :
       view === 'ai-chat' ? renderAiChat() :
       view === 'arcade' ? renderArcade() :
       <div className="p-10 text-center flex-1 flex flex-col items-center justify-center">
         <CloudOff className="w-20 h-20 text-slate-200 mb-4" />
         <p className="font-black text-slate-400">Section Under Maintenance</p>
         <button onClick={() => setView('dashboard')} className="mt-4 p-4 border-4 border-black rounded-2xl font-black uppercase">Back to Safety</button>
       </div>
      }

      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="bg-white border-8 border-black p-10 rounded-[48px] shadow-[20px_20px_0_0_#000] text-center scale-up">
            <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black italic mb-2 tracking-tight">SHABAASH!</h2>
            <p className="text-lg font-black text-blue-600">Reached Mastery Tier {currentUser?.level}</p>
            <button onClick={() => setShowLevelUp(false)} className="mt-8 w-full chunky-button-primary py-4 font-black uppercase">Chalo Agey!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
