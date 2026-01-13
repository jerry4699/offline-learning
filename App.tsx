import React, { useState, useEffect, ReactNode } from 'react';
import { 
  ChevronRight, ArrowLeft, Trophy, CheckCircle, Mic, BookOpen, 
  RefreshCw, Zap, LayoutDashboard, MessageCircle, 
  FileText, Upload, Smartphone, GraduationCap, UserPlus, 
  Download, Send, Gamepad2, Lightbulb, School, Building2, ClipboardList, 
  CloudDownload, CloudOff, Star, Award, Settings as SettingsIcon, Play,
  Volume2, Eye, Sun, Share2, Users, Plus, Trash2, Globe, LogOut, LogIn,
  BarChart3, Calendar, ListChecks, QrCode, DownloadCloud, Flame, TrendingUp,
  Activity, Search, Filter, MoreVertical, HelpCircle, FileCheck, Layers, Loader2,
  UploadCloud
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MODULES, TRANSLATIONS, XP_PER_LEVEL, GAMES } from './constants';
import { AppState, UserProgress, Module, QuizSession, Language, Difficulty, StudentStats, Grade, Role, Assignment, DailyQuest, UploadedDoc, CustomQuiz } from './types';
import { GoogleGenAI, Type } from "@google/genai";

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
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);
  
  // App States
  const [localStudents, setLocalStudents] = useState<StudentStats[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(MOCK_QUESTS);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [customQuizzes, setCustomQuizzes] = useState<CustomQuiz[]>([]);
  const [activeHubTab, setActiveHubTab] = useState<'download' | 'upload' | 'practice'>('download');
  
  // Form/UI States
  const [authName, setAuthName] = useState('');
  const [authGrade, setAuthGrade] = useState<Grade>('6');
  const [authRole, setAuthRole] = useState<Role>('student');
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignTopic, setNewAssignTopic] = useState('');
  const [rosterSearch, setRosterSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quiz & Learning States
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [activeCustomQuiz, setActiveCustomQuiz] = useState<CustomQuiz | null>(null);
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

    const savedDocs = localStorage.getItem('studybuddy_uploaded_docs');
    if (savedDocs) setUploadedDocs(JSON.parse(savedDocs));

    const savedQuizzes = localStorage.getItem('studybuddy_custom_quizzes');
    if (savedQuizzes) setCustomQuizzes(JSON.parse(savedQuizzes));

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

  useEffect(() => {
    localStorage.setItem('studybuddy_uploaded_docs', JSON.stringify(uploadedDocs));
  }, [uploadedDocs]);

  useEffect(() => {
    localStorage.setItem('studybuddy_custom_quizzes', JSON.stringify(customQuizzes));
  }, [customQuizzes]);

  // --- HANDLERS ---
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName) return;
    const newUser: UserProgress = {
      username: authName,
      role: authRole,
      grade: authGrade,
      xp: 150, 
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

  const handleDownloadModule = (moduleId: string) => {
    if (!currentUser) return;
    if (currentUser.downloadedModules.includes(moduleId)) return;
    setCurrentUser({
      ...currentUser,
      downloadedModules: [...currentUser.downloadedModules, moduleId]
    });
    handleSpeech("Downloaded for offline use!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isOnline) {
      alert("Internet required for AI note analysis.");
      return;
    }

    setIsAnalyzing(true);
    const docId = `doc-${Date.now()}`;
    const newDoc: UploadedDoc = {
      id: docId,
      title: file.name,
      type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.ppt') || file.name.endsWith('.pptx') ? 'PPT' : 'TXT',
      timestamp: Date.now(),
      isAnalyzed: false
    };

    setUploadedDocs(prev => [newDoc, ...prev]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I have a textbook/notes file named "${file.name}". Generate 5 multiple choice questions (MCQs) for a student in Grade ${currentUser?.grade}. 
        Focus on important concepts. Return as a JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                topic: { type: Type.STRING }
              },
              required: ["text", "options", "correctAnswerIndex", "topic"]
            }
          }
        }
      });

      const rawJson = response.text.trim();
      const generatedQuestions = JSON.parse(rawJson).map((q: any, idx: number) => ({
        ...q,
        id: `custom-q-${docId}-${idx}`,
        difficulty: 'standard'
      }));

      const newQuiz: CustomQuiz = {
        id: `quiz-${docId}`,
        title: `Practice: ${file.name}`,
        sourceDocId: docId,
        questions: generatedQuestions
      };

      setCustomQuizzes(prev => [newQuiz, ...prev]);
      setUploadedDocs(prev => prev.map(d => d.id === docId ? { ...d, isAnalyzed: true } : d));
      handleSpeech("AI analysis complete! Quiz generated.");
    } catch (err) {
      console.error(err);
      alert("Failed to analyze notes. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswer = async (index: number) => {
    if (!quizSession) return;
    const q = quizSession.filteredQuestions[quizSession.currentQuestionIndex];
    const isCorrect = index === q.correctAnswerIndex;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setQuizSession({ ...quizSession, score: quizSession.score + 25 });
      handleSpeech(selectedLanguage === 'english' ? "Correct!" : "Sahi Jawab!");
    } else {
      handleSpeech(selectedLanguage === 'english' ? "Try again." : "Phir se koshish karein.");
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
          completedModules: quizSession.isCustom ? prev.completedModules : Array.from(new Set([...prev.completedModules, quizSession.moduleId]))
        } : null);
      }
      setView('results');
    }
  };

  const handleCreateAssignment = () => {
    if (!newAssignTitle || !newAssignTopic) {
      alert("Please fill in all fields");
      return;
    }
    const newA: Assignment = {
      id: `a-${Date.now()}`,
      title: newAssignTitle,
      topic: newAssignTopic,
      dueDate: 'Upcoming',
      xpReward: 150,
      questions: MODULES[0].questions,
      submissions: 0
    };
    setAssignments(prev => [...prev, newA]);
    setNewAssignTitle('');
    setNewAssignTopic('');
    setView('teacher-dashboard');
    handleSpeech("Assignment Published to Class");
  };

  // --- RENDERS ---

  const renderAuth = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-600 text-white overflow-hidden">
      <div className="w-24 h-24 bg-white border-8 border-black rounded-[32px] flex items-center justify-center mb-8 rotate-12 shadow-[12px_12px_0_0_rgba(0,0,0,0.3)]">
        <School className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-white">SHIKSHA AI</h1>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-12 text-blue-200 text-center">Accessible Learning for Rural India</p>
      
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
          <button onClick={() => setView('notes-hub')} className="chunky-card p-4 text-left group bg-white">
            <Layers className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-xs uppercase italic">Hub</h4>
            <p className="text-[8px] font-bold text-slate-400 uppercase">Notes & Practice</p>
          </button>
          <button onClick={() => setView('ai-chat')} className="chunky-card p-4 text-left group bg-white">
            <MessageCircle className="w-8 h-8 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-xs uppercase italic">{t('chat')}</h4>
            <p className="text-[8px] font-bold text-slate-400 uppercase">Guru Help</p>
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

  const renderNotesHub = () => (
    <ViewWrapper id="notes-hub" className="bg-slate-50">
      <header className="p-6 bg-white border-b-4 border-black sticky top-0 z-50">
        <h2 className="font-black text-2xl italic uppercase mb-6 flex items-center gap-3">
          <Layers className="w-7 h-7 text-blue-600" /> 📂 Notes & Practice Hub
        </h2>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-black">
          {['download', 'upload', 'practice'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveHubTab(tab as any)}
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeHubTab === tab ? 'bg-white border-2 border-black shadow-[2px_2px_0_0_#000]' : 'text-slate-400'}`}
            >
              {tab === 'download' ? 'Download Notes' : tab === 'upload' ? 'Upload Notes' : 'Practice Quiz'}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6 overflow-y-auto flex-1 pb-32">
        {activeHubTab === 'download' && (
          <div className="space-y-6">
            <div className="p-6 bg-blue-600 rounded-[32px] border-4 border-black text-white relative overflow-hidden shadow-[8px_8px_0_0_#000]">
               <div className="relative z-10">
                 <h3 className="font-black text-xl italic mb-1 uppercase">Library</h3>
                 <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Download pre-installed content for offline learning.</p>
               </div>
               <CloudDownload className="absolute -bottom-2 -right-2 w-24 h-24 text-blue-500 opacity-30" />
            </div>

            <div className="space-y-4">
              {MODULES.map(m => (
                <div key={m.id} className="p-4 border-4 border-black rounded-2xl bg-white flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-slate-50 border-2 border-black rounded-xl flex items-center justify-center text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm">{m.title}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Grade {m.grade} • {m.subject}</p>
                  </div>
                  {currentUser?.downloadedModules.includes(m.id) ? (
                    <div className="flex items-center gap-1 text-green-600 font-black text-[8px] uppercase">
                       <FileCheck className="w-4 h-4" /> Available Offline
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleDownloadModule(m.id)}
                      disabled={!isOnline}
                      className={`p-2.5 border-2 border-black rounded-xl transition-colors ${isOnline ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-slate-300'}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeHubTab === 'upload' && (
          <div className="space-y-6">
            <div className="p-8 border-4 border-black border-dashed rounded-[40px] bg-white text-center space-y-4 hover:border-blue-600 transition-colors cursor-pointer relative">
               <input 
                 type="file" 
                 accept=".pdf,.ppt,.pptx,.txt"
                 onChange={handleFileUpload}
                 className="absolute inset-0 opacity-0 cursor-pointer"
               />
               <div className="w-20 h-20 bg-blue-50 border-4 border-black rounded-[28px] mx-auto flex items-center justify-center">
                  <UploadCloud className="w-10 h-10 text-blue-600" />
               </div>
               <div>
                  <h4 className="font-black text-lg uppercase italic">Upload Your Notes</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Internet required for analysis</p>
               </div>
               <div className="pt-2">
                 <button className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px]">Select File</button>
               </div>
            </div>

            {isAnalyzing && (
              <div className="p-6 bg-white border-4 border-black rounded-[32px] flex items-center gap-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <div className="flex-1">
                   <p className="font-black text-xs uppercase">AI Guru Analyzing...</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">Generating practice questions</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-[0.2em]">Recently Analyzed</h4>
              {uploadedDocs.length > 0 ? uploadedDocs.map(doc => (
                <div key={doc.id} className="p-4 border-4 border-black rounded-2xl bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 border-2 border-black rounded-xl flex items-center justify-center text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm">{doc.title}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{doc.type} • {new Date(doc.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {doc.isAnalyzed ? (
                    <div className="px-3 py-1 bg-green-50 border-2 border-green-200 rounded-full flex items-center gap-1.5 text-[8px] font-black text-green-600 uppercase">
                      <Zap className="w-3 h-3 fill-green-600" /> Quiz Ready
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-amber-50 border-2 border-amber-200 rounded-full flex items-center gap-1.5 text-[8px] font-black text-amber-600 uppercase">
                      Processing
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <UploadCloud className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase">No notes uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeHubTab === 'practice' && (
          <div className="space-y-6">
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-[0.2em]">Custom AI Practice</h4>
              {customQuizzes.length > 0 ? customQuizzes.map(quiz => (
                <button 
                  key={quiz.id} 
                  onClick={() => {
                    setActiveCustomQuiz(quiz);
                    setShowQuizPrompt(true);
                  }}
                  className="w-full text-left p-5 border-4 border-black rounded-[28px] bg-white flex items-center gap-4 group hover:border-blue-600 transition-all shadow-[6px_6px_0_0_#eee]"
                >
                  <div className="w-14 h-14 bg-amber-50 border-4 border-black rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                     <ListChecks className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-black text-sm">{quiz.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded-md">5 Qs</span>
                       <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-md">AI Generated</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              )) : (
                <div className="p-8 border-4 border-dashed border-slate-200 rounded-[32px] text-center bg-white opacity-50">
                  <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase">Analyze notes to see AI quizzes here</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
               <h4 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-[0.2em]">Curriculum Quizzes</h4>
               <div className="grid grid-cols-1 gap-3">
                 {MODULES.map(m => (
                   <button 
                     key={m.id}
                     onClick={() => {
                        setActiveModule(m);
                        setShowQuizPrompt(true);
                     }}
                     className="p-4 border-4 border-black rounded-2xl bg-white flex items-center gap-4 text-left group"
                    >
                      <div className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <p className="font-black text-xs">{m.title}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase">{m.subject}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                   </button>
                 ))}
               </div>
            </section>
          </div>
        )}
      </main>
      {renderFooter()}
    </ViewWrapper>
  );

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
            systemInstruction: `You are Guru, a friendly AI tutor for a student in rural India. Use simple language, local analogies, and encourage them. Language: ${selectedLanguage}.`,
          }
        });
        setChatMessages(prev => [...prev, { role: 'model', text: response.text || "Guru is thinking..." }]);
        handleSpeech(response.text || "");
      } catch (err) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Connection error. Guru needs internet!" }]);
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-40">
          {chatMessages.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center mb-4">
                 <Lightbulb className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ask Guru anything about your lessons!</p>
            </div>
          )}
          {chatMessages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 border-4 border-black rounded-[24px] font-bold text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-black rounded-bl-none shadow-[4px_4px_0_0_#000]'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isChatTyping && <div className="p-3 bg-white border-4 border-black rounded-xl w-14 flex items-center justify-center gap-1 shadow-[2px_2px_0_0_#000]">
             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-75" />
             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150" />
          </div>}
        </div>
        <div className="fixed bottom-[84px] left-0 right-0 max-w-[480px] mx-auto p-4 bg-white border-t-4 border-black">
          <div className="flex gap-2">
            <input 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..." 
              className="flex-1 p-5 border-4 border-black rounded-3xl font-black text-sm outline-none focus:bg-blue-50 focus:border-blue-600" 
            />
            <button onClick={handleSend} className="p-5 bg-blue-600 text-white border-4 border-black rounded-3xl active:translate-y-1 transition-all shadow-[4px_4px_0_0_#000] active:shadow-none"><Send className="w-6 h-6" /></button>
          </div>
        </div>
        {renderFooter()}
      </ViewWrapper>
    );
  };

  const renderQuiz = () => {
    const q = quizSession?.filteredQuestions[quizSession.currentQuestionIndex];
    
    const readQuestionAloud = () => {
      if (!q) return;
      handleSpeech(`${q.text}. Option 1: ${q.options[0]}. Option 2: ${q.options[1]}. Option 3: ${q.options[2]}. Option 4: ${q.options[3]}.`);
    };

    return (
      <ViewWrapper id="quiz" className="bg-slate-50">
        <header className="p-6 bg-white border-b-4 border-black sticky top-0 z-50">
          <div className="flex justify-between items-center text-[10px] font-black uppercase mb-3">
            <span className="flex items-center gap-1.5">Progress: {quizSession!.currentQuestionIndex + 1} / {quizSession!.filteredQuestions.length}</span>
            <span className="text-blue-600 bg-blue-50 px-3 py-1 border-2 border-black rounded-full">Score: {quizSession!.score}</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${((quizSession!.currentQuestionIndex + 1) / quizSession!.filteredQuestions.length) * 100}%` }} /></div>
        </header>
        
        <main className="p-8 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="mb-10 flex items-start gap-4">
             <div className="flex-1">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-[0.2em]">{q?.topic}</p>
                <h2 className="text-2xl font-black italic leading-tight text-slate-800">{q?.text}</h2>
             </div>
             <button 
                onClick={readQuestionAloud}
                className="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none hover:bg-blue-50"
             >
                <Volume2 className="w-7 h-7 text-blue-600" />
             </button>
          </div>
          
          <div className="space-y-4">
            {q?.options.map((opt, i) => (
              <button 
                key={i} 
                disabled={!!feedback}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-6 font-black border-4 border-black rounded-[28px] transition-all text-sm leading-snug flex justify-between items-center ${
                  feedback 
                    ? (i === q.correctAnswerIndex ? 'bg-green-500 text-white' : (feedback === 'incorrect' && i === quizSession.currentQuestionIndex ? 'bg-red-500 text-white' : 'bg-slate-50 opacity-40')) 
                    : 'bg-white shadow-[6px_6px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
              >
                <span>{opt}</span>
                {feedback && i === q.correctAnswerIndex && <CheckCircle className="w-5 h-5 shrink-0" />}
              </button>
            ))}
          </div>

          {aiExplanation && (
            <div className="mt-10 p-6 bg-blue-50 border-4 border-black rounded-[32px] font-bold italic flex items-start gap-4 scale-up shadow-[4px_4px_0_0_#f1f5f9]">
              <div className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center shrink-0">
                 <Lightbulb className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-xs leading-relaxed text-slate-700">{aiExplanation}</p>
            </div>
          )}
        </main>

        {feedback && (
          <div className="p-6 bg-white border-t-4 border-black flex gap-4">
            <button onClick={handleNextQuestion} className="w-full chunky-button-primary py-6 text-xl font-black italic uppercase rounded-[28px]">
              {quizSession!.currentQuestionIndex + 1 === quizSession!.filteredQuestions.length ? 'Finish' : 'Next Question'} <ChevronRight className="w-6 h-6 ml-1" />
            </button>
          </div>
        )}
      </ViewWrapper>
    );
  };

  const renderFooter = () => (
    <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-white border-t-4 border-black flex justify-around items-center z-50">
      <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
        <LayoutDashboard className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Home</span>
      </button>
      <button onClick={() => setView('notes-hub')} className={`flex flex-col items-center gap-1 ${view === 'notes-hub' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
        <Layers className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Hub</span>
      </button>
      <button onClick={() => setView('ai-chat')} className={`flex flex-col items-center gap-1 ${view === 'ai-chat' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
        <MessageCircle className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Guru</span>
      </button>
      <button onClick={() => setView('arcade')} className={`flex flex-col items-center gap-1 ${view === 'arcade' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
        <Gamepad2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Games</span>
      </button>
      <button onClick={() => setView('settings')} className={`flex flex-col items-center gap-1 ${['settings','teacher-dashboard'].includes(view) ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
        <SettingsIcon className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Tools</span>
      </button>
    </footer>
  );

  // Helper screens
  const renderResults = () => (
    <ViewWrapper className="items-center justify-center p-12 text-center bg-white">
      <div className="w-28 h-28 bg-amber-50 rounded-[40px] border-[10px] border-black flex items-center justify-center mb-10 scale-up">
        <Award className="w-14 h-14 text-amber-500" />
      </div>
      <h2 className="text-4xl font-black italic mb-3">DONE!</h2>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-12">Great effort securing knowledge.</p>
      
      <div className="grid grid-cols-2 gap-6 w-full mb-14">
        <div className="p-6 border-4 border-black rounded-[32px] bg-blue-50 shadow-[6px_6px_0_0_#000]">
          <p className="text-4xl font-black text-blue-600">+{quizSession?.score}</p>
          <p className="text-[10px] font-black uppercase text-slate-400 mt-2">XP Gained</p>
        </div>
        <div className="p-6 border-4 border-black rounded-[32px] bg-amber-50 shadow-[6px_6px_0_0_#000]">
          <p className="text-4xl font-black text-amber-500">Tier {currentUser?.level}</p>
          <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Current Mastery</p>
        </div>
      </div>
      
      <button onClick={() => setView('dashboard')} className="w-full chunky-button-primary py-7 text-2xl font-black italic uppercase rounded-[32px]">Continue</button>
    </ViewWrapper>
  );

  const renderStudy = () => (
    <ViewWrapper id="study" className="bg-white">
      <header className="p-6 border-b-4 border-black flex items-center sticky top-0 bg-white z-50">
        <button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div className="ml-4 flex-1 truncate">
           <h2 className="font-black text-lg italic uppercase truncate">{activeModule?.title}</h2>
           <p className="text-[8px] font-black text-slate-400 uppercase">{activeModule?.subject}</p>
        </div>
        <button onClick={() => handleSpeech(activeModule?.content.join(' ') || '')} className="p-2 border-2 border-black rounded-xl bg-blue-100 shadow-[2px_2px_0_0_#000]"><Volume2 className="w-5 h-5 text-blue-600" /></button>
      </header>
      <main className="p-6 space-y-6 overflow-y-auto pb-24">
        {activeModule?.content.map((text, i) => (
          <div key={i} className="p-6 border-4 border-black rounded-[32px] bg-slate-50 shadow-[6px_6px_0_0_#f1f5f9] relative">
            <div className="absolute top-0 left-6 -translate-y-1/2 px-3 py-1 bg-black text-white text-[8px] font-black rounded-full uppercase">Point {i+1}</div>
            <p className="font-bold leading-relaxed text-sm">{text}</p>
          </div>
        ))}
        <div className="pt-4">
           <button onClick={() => setShowQuizPrompt(true)} className="w-full chunky-button-primary py-7 text-2xl font-black italic uppercase rounded-[32px]">Challenge Knowledge</button>
        </div>
      </main>
    </ViewWrapper>
  );

  return (
    <div id="root" className={`min-h-screen flex flex-col relative overflow-hidden bg-white ${currentUser?.isHighContrast ? 'brightness-110 contrast-125' : ''}`}>
      {view === 'auth' ? renderAuth() : 
       view === 'dashboard' ? renderDashboard() : 
       view === 'notes-hub' ? renderNotesHub() :
       view === 'leaderboard' ? <ViewWrapper className="p-8"><header className="flex items-center mb-8"><button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="ml-4 font-black text-xl italic uppercase">Classroom Heroes</h2></header><div className="space-y-3">{[ {name: 'Arjun', xp: 2450, rank: 1}, {name: 'Sita', xp: 2100, rank: 2}, {name: currentUser?.username, xp: currentUser?.xp, rank: 3, me: true} ].map((h,i)=>(<div key={i} className={`p-4 border-4 border-black rounded-2xl flex items-center gap-4 ${h.me ? 'bg-blue-50 border-blue-600' : 'bg-white'}`}><div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black text-xs bg-amber-400">{i+1}</div><div className="flex-1"><p className="font-black text-sm">{h.name}</p></div><div className="text-right"><p className="font-black text-sm">{h.xp} XP</p></div></div>))}</div></ViewWrapper> :
       view === 'study' ? renderStudy() :
       view === 'quiz' ? renderQuiz() :
       view === 'results' ? renderResults() :
       view === 'settings' ? <ViewWrapper id="settings" className="p-8 overflow-y-auto"><header className="flex items-center mb-8"><button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="ml-4 font-black text-xl italic uppercase">Toolbox</h2></header><div className="space-y-6"><button onClick={() => setView('teacher-dashboard')} className="w-full p-5 border-4 border-black rounded-[28px] font-black uppercase flex items-center justify-center gap-3 bg-blue-50 text-blue-600 shadow-[4px_4px_0_0_#000]"><Users className="w-6 h-6" /> Teacher Console</button><button onClick={() => { setCurrentUser(null); setView('auth'); }} className="w-full p-5 border-4 border-black rounded-[28px] font-black uppercase flex items-center justify-center gap-3 bg-red-50 text-red-600 shadow-[4px_4px_0_0_#000]"><LogOut className="w-6 h-6" /> Logout</button></div></ViewWrapper> :
       view === 'teacher-dashboard' ? <ViewWrapper id="teacher-dashboard" className="bg-slate-50"><header className="p-6 bg-white border-b-4 border-black flex justify-between items-center sticky top-0 z-50"><div className="flex items-center"><button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="ml-4 font-black text-lg italic uppercase">Master Console</h2></div><button onClick={exportToCSV} className="p-2 border-2 border-black rounded-lg bg-green-50 text-green-600"><DownloadCloud className="w-5 h-5" /></button></header><main className="p-6 space-y-6 overflow-y-auto"><div className="grid grid-cols-2 gap-4"><div className="p-5 bg-white border-4 border-black rounded-[32px] shadow-[4px_4px_0_0_#000]"><p className="text-[9px] font-black uppercase text-slate-400">Total Kids</p><p className="text-3xl font-black">{localStudents.length + 1}</p></div><div className="p-5 bg-white border-4 border-black rounded-[32px] shadow-[4px_4px_0_0_#000]"><p className="text-[9px] font-black uppercase text-slate-400">Avg Progress</p><p className="text-3xl font-black">78%</p></div></div><button onClick={() => setView('teacher-assign')} className="w-full chunky-button-primary py-4 text-xs font-black uppercase gap-2"><Plus className="w-4 h-4" /> Publish Lesson</button></main></ViewWrapper> :
       view === 'teacher-assign' ? <ViewWrapper className="p-8"><header className="flex items-center mb-8"><button onClick={() => setView('teacher-dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="ml-4 font-black text-xl italic uppercase">New Lesson</h2></header><div className="space-y-4"><input value={newAssignTitle} onChange={e=>setNewAssignTitle(e.target.value)} placeholder="Title" className="w-full p-4 border-4 border-black rounded-2xl font-black"/><input value={newAssignTopic} onChange={e=>setNewAssignTopic(e.target.value)} placeholder="Topic" className="w-full p-4 border-4 border-black rounded-2xl font-black"/><button onClick={handleCreateAssignment} className="w-full chunky-button-primary py-6 text-xl font-black italic uppercase">Publish</button></div></ViewWrapper> :
       view === 'ai-chat' ? renderAiChat() :
       view === 'arcade' ? <ViewWrapper id="arcade" className="bg-amber-50"><header className="p-6 bg-white border-b-4 border-black flex items-center sticky top-0 z-50"><button onClick={() => setView('dashboard')} className="p-2 border-2 border-black rounded-lg"><ArrowLeft className="w-5 h-5" /></button><h2 className="ml-4 font-black text-xl italic uppercase">Play Zone</h2></header><main className="p-6 space-y-4">{GAMES.map(g=>(<button key={g.id} className="p-5 chunky-card flex items-center gap-6 bg-white text-left group rounded-[32px]"><div className="w-12 h-12 bg-amber-100 border-4 border-black rounded-2xl flex items-center justify-center text-amber-600"><Gamepad2 className="w-6 h-6" /></div><div className="flex-1"><h4 className="font-black text-lg">{g.title}</h4><p className="text-[8px] font-black text-slate-400 uppercase">{g.desc}</p></div></button>))}</main></ViewWrapper> :
       <div className="p-10 text-center flex-1 flex flex-col items-center justify-center"><CloudOff className="w-20 h-20 text-slate-200 mb-4" /><p className="font-black text-slate-400 uppercase">Under Maintenance</p><button onClick={() => setView('dashboard')} className="mt-4 p-4 border-4 border-black rounded-2xl font-black uppercase">Home</button></div>
      }

      {showQuizPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="bg-white border-8 border-black p-10 rounded-[48px] shadow-[20px_20px_0_0_#000] text-center scale-up max-w-sm w-full">
            <div className="w-24 h-24 bg-blue-100 rounded-[32px] border-4 border-black flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black italic mb-2">Ready to Start?</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Chapter Assessment</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowQuizPrompt(false);
                  if (activeCustomQuiz) {
                    setQuizSession({
                      moduleId: activeCustomQuiz.id,
                      currentQuestionIndex: 0,
                      score: 0,
                      mode: 'standard',
                      filteredQuestions: activeCustomQuiz.questions,
                      isCustom: true
                    });
                    setView('quiz');
                    setActiveCustomQuiz(null);
                  } else if (activeModule) {
                    setQuizSession({
                      moduleId: activeModule.id,
                      currentQuestionIndex: 0,
                      score: 0,
                      mode: 'standard',
                      filteredQuestions: activeModule.questions
                    });
                    setView('quiz');
                  }
                }}
                className="w-full chunky-button-primary py-5 text-xl font-black italic uppercase rounded-[28px]"
              >
                Yes, Start Quiz!
              </button>
              <button onClick={() => { setShowQuizPrompt(false); setActiveCustomQuiz(null); }} className="w-full p-5 border-4 border-black rounded-[28px] font-black text-sm uppercase bg-slate-100">
                No, Keep Studying
              </button>
            </div>
          </div>
        </div>
      )}

      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-md">
          <div className="bg-white border-8 border-black p-12 rounded-[56px] shadow-[24px_24px_0_0_#000] text-center scale-up">
            <Trophy className="w-28 h-28 text-amber-500 mx-auto mb-8 animate-bounce" />
            <h2 className="text-5xl font-black italic mb-2 tracking-tight">KAMAAL!</h2>
            <p className="text-xl font-black text-blue-600 mb-2 uppercase tracking-[0.1em]">Tier {currentUser?.level}</p>
            <button onClick={() => setShowLevelUp(false)} className="w-full chunky-button-primary py-6 font-black uppercase text-xl italic rounded-[32px]">Onward!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
