
import { Module, Language, Poem } from './types';

export const APP_THEME = {
  bg: '#f8fafc',
  text: '#1e293b',
  primary: '#2563eb',
  accent: '#f59e0b',
};

export const INITIAL_XP = 0;
export const XP_PER_LEVEL = 500;

// Added missing marathi and hindi keys to satisfy the Record<Language, any> type requirement.
export const TRANSLATIONS: Record<Language, any> = {
  english: {
    home: "Home",
    rank: "Rank",
    arcade: "Arcade",
    exit: "Exit",
    continue: "Continue",
    start: "Start",
    next: "Next",
    back: "Back",
    quiz: "Quiz",
    study: "Study",
    results: "Results",
    score: "Score",
    level: "Level",
    completed: "Completed",
    welcome: "Hi",
    welcomeTitle: "Welcome to VESIT StudyBuddy",
    signupTitle: "Create Your Account",
    loginTitle: "Login to StudyBuddy",
    signup: "Sign Up",
    login: "Login",
    modules: "Active Modules",
    vocab: "Technical Skills",
    register: "Register",
    student: "Student",
    teacher: "Faculty",
    alumni: "Alumni",
    guest: "Guest",
    selectRole: "Select Your Role",
    continueGoogle: "Continue with Google",
    loginGoogle: "Login with Google",
    loginMobile: "Login with Mobile OTP",
    signupMobile: "Sign up with Mobile Number",
    guestEntry: "Continue as Guest",
    enterOTP: "Enter 4-Digit OTP",
    verify: "Verify OTP",
    selectLang: "Select Language",
    assessment: "Start PYQP Practice",
    masteryPath: "Academic Path",
    focusTitle: "Focus Challenge",
    matchTitle: "Syntax Match",
    recallTitle: "Logic Recall",
    tapColor: "Tap the color of the FONT:",
    pickMeaning: "Pick the correct definition:",
    memorizeSeq: "Memorize the Sequence!",
    tapOrder: "Tap the items in order:",
    practiceNotes: "PYQP Repository",
    uploadNotes: "Upload Study Material",
    extracting: "Parsing question patterns...",
    generating: "Generating Mock Test...",
    practiceNow: "Solve Paper",
    selfStudy: "Exam Prep Mode",
    fluency: "Viva Simulation",
    readAloud: "Speak Explanation",
    startReading: "Start Speaking",
    finishReading: "Analyze Voice",
    timeOut: "Time Up!",
    fluencyDesc: "Prepare for your oral exams",
    wellDone: "Prep Complete!",
    keepGoing: "Keep Studying!",
    speed: "Explanation Speed",
    accuracy: "Technical Accuracy",
    wpm: "WPM",
    analysisReady: "AI Feedback: Ready",
    offlineMode: "Offline Authorized",
    analysisResults: "Analysis Results",
    selectDifficulty: "Choose Exam Level",
    easy: "Unit Test",
    standard: "Semester Exam",
    expert: "Competitive Exam",
    easyDesc: "Basic theory coverage",
    standardDesc: "University paper pattern",
    expertDesc: "GATE/Technical interview level",
  },
  marathi: {},
  hindi: {}
};

export const MODULES: Module[] = [
  {
    id: 'vesit-comp-1',
    title: 'Python Programming',
    titleTranslated: {
      english: 'Python Programming (Computer Engg)',
      marathi: 'पायथन प्रोग्रामिंग',
      hindi: 'पायथन प्रोग्रामिंग'
    },
    subtitle: 'Data Structures & Algorithms',
    subject: 'Computer Engineering',
    xpReward: 150,
    content: [
      "Python is the primary language for AI/ML at VESIT. Understanding lists and dicts is crucial.",
      "Time complexity O(n) measures how runtime grows with input size.",
      "Recursive functions are common in Semester 3 DS exams."
    ],
    contentTranslated: {
      english: [
        "Python is the primary language for AI/ML at VESIT. Understanding lists and dicts is crucial.",
        "Time complexity O(n) measures how runtime grows with input size.",
        "Recursive functions are common in Semester 3 DS exams."
      ],
      marathi: [
        "पायथन ही प्राथमिक भाषा आहे. डेटा स्ट्रक्चर्स समजणे महत्त्वाचे आहे.",
        "टाइम कॉम्प्लेक्सिटी O(n) इनपुट आकारासह रनटाइम कसा वाढतो हे मोजते.",
        "सेमिस्टर ३ च्या परीक्षांमध्ये रिकर्सिव्ह फंक्शन्स सामान्य आहेत."
      ],
      hindi: [
        "पायथन प्राथमिक भाषा है। डेटा स्ट्रक्चर्स को समझना महत्वपूर्ण है।",
        "टाइम कॉम्प्लेक्सिटी O(n) मापता है कि इनपुट साइज के साथ रनटाइम कैसे बढ़ता है।",
        "सेमेस्टर 3 की परीक्षाओं में रिकर्सिव फंक्शन सामान्य हैं।"
      ]
    },
    basicContent: ["Coding is logic."],
    questions: [
      {
        id: 'q-py-1',
        text: 'What is the time complexity of searching in a sorted array using Binary Search?',
        options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
        correctAnswerIndex: 1,
        difficulty: 'standard'
      },
      {
        id: 'q-py-2',
        text: 'Which data structure follows the LIFO principle?',
        options: ['Queue', 'Linked List', 'Stack', 'Tree'],
        correctAnswerIndex: 2,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'vesit-extc-1',
    title: 'Digital Electronics',
    titleTranslated: {
      english: 'Digital Electronics (EXTC)',
      marathi: 'डिजिटल इलेक्ट्रॉनिक्स',
      hindi: 'डिजिटल इलेक्ट्रॉनिक्स'
    },
    subtitle: 'Boolean Algebra & Gates',
    subject: 'Electronics & Telecomm',
    xpReward: 200,
    content: [
      "Logic gates are the building blocks of digital circuits.",
      "K-Maps are used for simplification of Boolean expressions in semester papers.",
      "Multiplexers are combinational circuits used as data selectors."
    ],
    contentTranslated: {
      english: [
        "Logic gates are the building blocks of digital circuits.",
        "K-Maps are used for simplification of Boolean expressions in semester papers.",
        "Multiplexers are combinational circuits used as data selectors."
      ],
      marathi: [
        "लॉजिक गेट्स हे डिजिटल सर्किट्सचे बिल्डिंग ब्लॉक्स आहेत.",
        "K-Maps चा वापर सेमिस्टर पेपर्समध्ये एक्सप्रेसन्स सोपे करण्यासाठी केला जातो.",
        "मल्टिप्लेक्सर हे कॉम्बिनेशन सर्किट्स आहेत."
      ],
      hindi: [
        "लॉजिक गेट्स डिजिटल सर्किट के बिल्डिंग ब्लॉक्स हैं।",
        "K-Maps का उपयोग सेमेस्टर पेपर्स में समीकरणों को सरल बनाने के लिए किया जाता है।",
        "मल्टीप्लेक्सर कॉम्बिनेशन सर्किट हैं।"
      ]
    },
    basicContent: ["Gates are logic."],
    questions: [
      {
        id: 'q-extc-1',
        text: 'Which gate is known as the Universal Gate?',
        options: ['AND', 'OR', 'NAND', 'XOR'],
        correctAnswerIndex: 2,
        difficulty: 'standard'
      }
    ]
  }
];

export const GAMES = [
  { id: 'code-duel', title: 'Code Duel', icon: 'Zap', xp: 50, desc: 'Quick-fire logic tests' },
  { id: 'math-matrix', title: 'Calculus Matrix', icon: 'Grid', xp: 75, desc: 'Math for engineers' },
  { id: 'tech-vocab', title: 'Tech Vocabulary', icon: 'MessageCircle', xp: 100, desc: 'Master CS terms' },
  { id: 'viva-sim', title: 'Viva Simulation', icon: 'Mic', xp: 50, desc: 'Speak and clear orals' }
];

export const VOCAB_MATCH_DATA = [
  { word: 'Encapsulation', meaning: 'Wrapping data in a unit', options: ['Inheriting props', 'Wrapping data in a unit', 'Accessing global vars'] },
  { word: 'Polymorphism', meaning: 'Many forms of functions', options: ['Hiding details', 'Constant values', 'Many forms of functions'] },
  { word: 'Algorithm', meaning: 'Step-by-step logic', options: ['Step-by-step logic', 'A computer part', 'A type of wire'] },
  { word: 'Bitrate', meaning: 'Data transfer speed', options: ['Power consumed', 'Storage capacity', 'Data transfer speed'] },
];

export const VOCAB_RECALL_SEQUENCES = [
  ['Fetch', 'Decode', 'Execute', 'Store'],
  ['Input', 'Process', 'Output', 'Feedback'],
  ['Analysis', 'Design', 'Coding', 'Testing'],
];

export const STROOP_COLORS = [
  { name: 'RED', color: '#ef4444' },
  { name: 'BLUE', color: '#3b82f6' },
  { name: 'GREEN', color: '#22c55e' },
  { name: 'YELLOW', color: '#eab308' },
];
