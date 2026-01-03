import { Module, Language, Poem } from './types';

export const APP_THEME = {
  bg: '#f8fafc',
  text: '#1e293b',
  primary: '#2563eb',
  accent: '#f59e0b',
};

export const INITIAL_XP = 0;
export const XP_PER_LEVEL = 500;

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
    welcomeTitle: "Welcome to StudyBuddy",
    signupTitle: "Create Your Account",
    loginTitle: "Login to StudyBuddy",
    signup: "Sign Up",
    login: "Login",
    modules: "Active Modules",
    vocab: "Vocabulary Skills",
    register: "Register",
    student: "Student",
    teacher: "Teacher",
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
    assessment: "Start Assessment",
    masteryPath: "Mastery Path",
    focusTitle: "Focus Challenge",
    matchTitle: "Definition Match",
    recallTitle: "Sequence Recall",
    tapColor: "Tap the color of the FONT:",
    pickMeaning: "Pick the correct definition:",
    memorizeSeq: "Memorize the Sequence!",
    tapOrder: "Tap the words in order:",
    practiceNotes: "Practice from Notes",
    uploadNotes: "Upload or Select Notes",
    extracting: "Extracting key points...",
    generating: "Generating Practice Quiz...",
    practiceNow: "Start Practice",
    selfStudy: "Self-Study Mode",
    fluency: "Fluency Analysis",
    readAloud: "Read Aloud",
    startReading: "Start Speaking",
    finishReading: "Stop & Analyze",
    timeOut: "Time Up!",
    fluencyDesc: "Measure your speed and accuracy",
    wellDone: "Session Complete!",
    keepGoing: "Great Rhythm!",
    speed: "Reading Speed",
    accuracy: "Accuracy",
    wpm: "WPM",
    analysisReady: "Speech Analysis: Online",
    offlineMode: "Practice Mode: Offline",
    analysisResults: "Analysis Results",
    selectDifficulty: "Choose Challenge Level",
    easy: "Easy",
    standard: "Standard",
    expert: "Expert",
    easyDesc: "Focus on basics",
    standardDesc: "Regular school level",
    expertDesc: "Advanced mastery",
  },
  marathi: {
    home: "मुख्य",
    rank: "रँक",
    arcade: "खेळ",
    exit: "बाहेर",
    continue: "सुरू ठेवा",
    start: "सुरू करा",
    next: "पुढील",
    back: "मागे",
    quiz: "चाचणी",
    study: "अभ्यास",
    results: "निकाल",
    score: "गुण",
    level: "स्तर",
    completed: "पूर्ण झाले",
    welcome: "नमस्कार",
    welcomeTitle: "StudyBuddy मध्ये स्वागत आहे",
    signupTitle: "तुमचे खाते तयार करा",
    loginTitle: "StudyBuddy मध्ये लॉगिन करा",
    signup: "साइन अप करा",
    login: "लॉगिन",
    modules: "सक्रिय कोर्सेस",
    vocab: "शब्दसंग्रह कौशल्ये",
    register: "नोंदणी",
    student: "विद्यार्थी",
    teacher: "शिक्षक",
    alumni: "माजी विद्यार्थी",
    guest: "पाहुणे",
    selectRole: "तुमची भूमिका निवडा",
    continueGoogle: "Google सह सुरू ठेवा",
    loginGoogle: "Google सह लॉगिन करा",
    loginMobile: "मोबाईल OTP सह लॉगिन करा",
    signupMobile: "मोबाईल नंबरसह साइन अप करा",
    guestEntry: "पाहुणे म्हणून सुरू ठेवा",
    enterOTP: "४-अंकी OTP टाका",
    verify: "OTP तपासा",
    selectLang: "भाषा निवडा",
    assessment: "चाचणी सुरू करा",
    masteryPath: "प्रगती पथ",
    focusTitle: "एकाग्रता आव्हान",
    matchTitle: "अर्थ जोडा",
    recallTitle: "क्रम आठवा",
    tapColor: "फॉन्टचा रंग निवडा:",
    pickMeaning: "योग्य अर्थ निवडा:",
    memorizeSeq: "क्रम लक्षात ठेवा!",
    tapOrder: "शब्दांवर क्रमाने टॅप करा:",
    practiceNotes: "टिपांमधून सराव करा",
    uploadNotes: "टिपा अपलोड करा",
    extracting: "मुद्दे काढत आहे...",
    generating: "चाचणी तयार करत आहे...",
    practiceNow: "सराव सुरू करा",
    selfStudy: "स्वयं-अभ्यास",
    fluency: "वाचन विश्लेषण",
    readAloud: "मोठ्याने वाचा",
    startReading: "बोलण्यास सुरुवात करा",
    finishReading: "थांबा आणि विश्लेषण करा",
    timeOut: "वेळ संपली!",
    fluencyDesc: "तुमचा वेग आणि अचूकता मोजा",
    wellDone: "सत्र पूर्ण झाले!",
    keepGoing: "छान ओघ!",
    speed: "वाचन वेग",
    accuracy: "अचूकता",
    wpm: "शब्ध/मि",
    analysisReady: "भाषण विश्लेषण: सक्रिय",
    offlineMode: "सराव मोड: ऑफलाइन",
    analysisResults: "विश्लेषण निकाल",
    selectDifficulty: "काठिण्य पातळी निवडा",
    easy: "सोपे",
    standard: "सामान्य",
    expert: "कठीण",
    easyDesc: "मूलभूत गोष्टींवर लक्ष द्या",
    standardDesc: "शालेय स्तर",
    expertDesc: "प्रगत कौशल्य",
  },
  hindi: {
    home: "मुख्य",
    rank: "रैंक",
    arcade: "खेल",
    exit: "बाहर",
    continue: "जारी रखें",
    start: "शुरू करें",
    next: "अगला",
    back: "पीछे",
    quiz: "परीक्षा",
    study: "पढ़ाई",
    results: "परिणाम",
    score: "अंक",
    level: "स्तर",
    completed: "पूरा हुआ",
    welcome: "नमस्ते",
    welcomeTitle: "StudyBuddy में आपका स्वागत है",
    signupTitle: "अपना खाता बनाएं",
    loginTitle: "StudyBuddy में लॉगिन करें",
    signup: "साइन अप करें",
    login: "लॉगिन",
    modules: "सक्रिय मॉड्यूल",
    vocab: "शब्दावली कौशल",
    register: "पंजीकरण",
    student: "छात्र",
    teacher: "शिक्षक",
    alumni: "पूर्व छात्र",
    guest: "अतिथि",
    selectRole: "अपनी भूमिका चुनें",
    continueGoogle: "Google के साथ जारी रखें",
    loginGoogle: "Google के साथ लॉगिन करें",
    loginMobile: "मोबाइल OTP से लॉगिन करें",
    signupMobile: "मोबाइल नंबर से साइन अप करें",
    guestEntry: "अतिथि के रूप में जारी रखें",
    enterOTP: "4-अंकीय OTP दर्ज करें",
    verify: "OTP सत्यापित करें",
    selectLang: "भाषा चुनें",
    assessment: "परीक्षा शुरू करें",
    masteryPath: "प्रगति पथ",
    focusTitle: "एकाग्रता चुनौती",
    matchTitle: "अर्थ मिलान",
    recallTitle: "क्रम याद रखें",
    tapColor: "फॉन्ट का रंग चुनें:",
    pickMeaning: "सही अर्थ चुनें:",
    memorizeSeq: "क्रम याद रखें!",
    tapOrder: "शब्दों पर क्रम से टैप करें:",
    practiceNotes: "नोट्स से अभ्यास करें",
    uploadNotes: "नोट्स अपलोड करें",
    extracting: "मुख्य बिंदु निकाल रहे हैं...",
    generating: "प्रैक्टिस क्विज बना रहे हैं...",
    practiceNow: "अभ्यास शुरू करें",
    selfStudy: "स्व-अध्ययन",
    fluency: "पठन विश्लेषण",
    readAloud: "जोर से पढ़ें",
    startReading: "बोलना शुरू करें",
    finishReading: "रुकें और विश्लेषण करें",
    timeOut: "समय समाप्त!",
    fluencyDesc: "अपनी गति और सटीकता मापें",
    wellDone: "सत्र पूरा हुआ!",
    keepGoing: "बहुत बढ़िया लय!",
    speed: "पठन गति",
    accuracy: "सटीकता",
    wpm: "शब्द/मि",
    analysisReady: "वाक् विश्लेषण: सक्रिय",
    offlineMode: "अभ्यास मोड: ऑफलाइन",
    analysisResults: "विश्लेषण परिणाम",
    selectDifficulty: "कठिनाई स्तर चुनें",
    easy: "आसान",
    standard: "सामान्य",
    expert: "विशेषज्ञ",
    easyDesc: "बुनियादी बातें",
    standardDesc: "नियमित स्तर",
    expertDesc: "उन्नत स्तर",
  }
};

export const POEMS: Poem[] = [
  {
    id: 'key-kingdom',
    title: 'This is the Key',
    titleTranslated: { english: 'This is the Key', marathi: 'ही आहे गुरुकिल्ली', hindi: 'यह कुंजी है' },
    lines: [
      "This is the Key of the Kingdom:",
      "In that Kingdom is a city;",
      "In that city is a town;",
      "In that town there is a street;",
      "In that street there winds a lane;",
      "In that lane there is a yard;",
      "In that yard there is a house;",
      "In that house there waits a room;",
      "In that room an empty bed;",
      "And on that bed a basket —",
      "A Basket of Sweet Flowers."
    ],
    linesTranslated: {
      english: [
        "This is the Key of the Kingdom:",
        "In that Kingdom is a city;",
        "In that city is a town;",
        "In that town there is a street;",
        "In that street there winds a lane;",
        "In that lane there is a yard;",
        "In that yard there is a house;",
        "In that house there waits a room;",
        "In that room an empty bed;",
        "And on that bed a basket —",
        "A Basket of Sweet Flowers."
      ],
      marathi: [
        "ही साम्राज्याची गुरुकिल्ली आहे:",
        "त्या साम्राज्यात एक शहर आहे;",
        "त्या शहरात एक नगर आहे;",
        "त्या नगरात एक रस्ता आहे;",
        "त्या रस्त्यावरून एक गल्ली जाते;",
        "त्या गल्लीत एक अंगण आहे;",
        "त्या अंगणात एक घर आहे;",
        "त्या घरात एक खोली वाट पाहतेय;",
        "त्या खोलीत एक रिकामी खाट आहे;",
        "आणि त्या खाटेवर एक टोपली आहे —",
        "गोड फुलांची एक टोपली."
      ],
      hindi: [
        "यह राज्य की कुंजी है:",
        "उस राज्य में एक शहर है;",
        "उस शहर में एक नगर है;",
        "उस नगर में एक सड़क है;",
        "उस सड़क में एक गली है;",
        "उस गली में एक आँगन है;",
        "उस आँगन में एक घर है;",
        "उस घर में एक कमरा है;",
        "उस कमरे में एक खाली बिस्तर है;",
        "और उस बिस्तर पर एक टोकरी है —",
        "मीठे फूलों की एक टोकरी।"
      ]
    },
    duration: 60
  },
  {
    id: 'rain-clouds',
    title: 'Rain Clouds',
    titleTranslated: { english: 'Rain Clouds', marathi: 'पावसाचे ढग', hindi: 'बारिश के बादल' },
    lines: [
      "Dark clouds gather in the sky,",
      "Hear the thunder rolling by.",
      "Gentle drops begin to fall,",
      "Cooling down the world for all.",
      "Green leaves dance and flowers bloom,",
      "Washing out the heat and gloom."
    ],
    linesTranslated: {
      english: [
        "Dark clouds gather in the sky,",
        "Hear the thunder rolling by.",
        "Gentle drops begin to fall,",
        "Cooling down the world for all.",
        "Green leaves dance and flowers bloom,",
        "Washing out the heat and gloom."
      ],
      marathi: [
        "काळे ढग आकाशात जमतात,",
        "गडगडाट ऐका दुरून येणारा.",
        "पाण्याचे थेंब पडू लागतात,",
        "सगळीकडे गारवा पसरू लागतो.",
        "हिरवी पाने डोलतात, फुले फुलतात,",
        "उन्हाळा आणि दुःख वाहून नेतात."
      ],
      hindi: [
        "काले बादल आकाश में उमड़ते हैं,",
        "गरजते बादलों की आवाज़ सुनो।",
        "नन्ही बूंदें गिरने लगी हैं,",
        "दुनिया में ठंडक भरने लगी हैं।",
        "हरे पत्ते नाचते और फूल खिलते हैं,",
        "गरमी और उदासी को धो देते हैं।"
      ]
    },
    duration: 45
  }
];

export const MODULES: Module[] = [
  {
    id: 'math-1',
    title: 'Module 1: Basic Math',
    titleTranslated: {
      english: 'Module 1: Basic Math',
      marathi: 'विभाग १: मूलभूत गणित',
      hindi: 'मॉड्यूल 1: बुनियादी गणित'
    },
    subtitle: 'Addition & Subtraction',
    xpReward: 100,
    content: [
      "Arithmetic is the foundation of science. It helps us count harvest and trade.",
      "Addition is combining amounts together to get a total sum.",
      "Subtraction helps us understand difference, like seeds left after planting."
    ],
    contentTranslated: {
      english: [
        "Arithmetic is the foundation of science. It helps us count harvest and trade.",
        "Addition is combining amounts together to get a total sum.",
        "Subtraction helps us understand difference, like seeds left after planting."
      ],
      marathi: [
        "गणित हे विज्ञानाचा पाया आहे. हे आपल्याला पीक मोजण्यास आणि व्यापारात मदत करते.",
        "बेरीज म्हणजे एकूण बेरीज मिळवण्यासाठी दोन रकमा एकत्र करणे.",
        "वजाबाकी आपल्याला फरक समजण्यास मदत करते, जसे की पेरणीनंतर उरलेले बियाणे."
      ],
      hindi: [
        "अंकगणित विज्ञान की नींव है। यह हमें फसल और व्यापार गिनने में मदद करता है।",
        "जोड़ कुल योग प्राप्त करने के लिए राशियों को एक साथ मिलाना है।",
        "घटाव हमें अंतर समझने में मदद करता है, जैसे बुवाई के बाद बचे हुए बीज।"
      ]
    },
    basicContent: ["Math helps in daily life."],
    questions: [
      {
        id: 'q1',
        text: 'Musa has 15 maize cobs and buys 27 more. How many in total?',
        textTranslated: {
          english: 'Musa has 15 maize cobs and buys 27 more. How many in total?',
          marathi: 'मुसाकडे १५ कणसे आहेत आणि त्याने अजून २७ विकत घेतली. एकूण किती झाली?',
          hindi: 'मूसा के पास 15 मक्के हैं और वह 27 और खरीदता है। कुल कितने हैं?'
        },
        options: ['32', '42', '45', '39'],
        correctAnswerIndex: 1,
        difficulty: 'standard'
      },
      {
        id: 'q1-easy',
        text: 'What is 1 + 1?',
        options: ['1', '2', '3'],
        correctAnswerIndex: 1,
        difficulty: 'easy'
      },
      {
        id: 'q1-expert',
        text: 'If x + 27 = 42, what is x?',
        options: ['15', '25', '12'],
        correctAnswerIndex: 0,
        difficulty: 'expert'
      }
    ]
  },
  {
    id: 'agri-1',
    title: 'Module 2: Healthy Soil',
    titleTranslated: {
      english: 'Module 2: Healthy Soil',
      marathi: 'विभाग २: सुपीक जमीन',
      hindi: 'मॉड्यूल 2: स्वस्थ मिट्टी'
    },
    subtitle: 'Sustainable Farming',
    xpReward: 150,
    content: [
      "Healthy soil produces stronger crops.",
      "Crop rotation prevents soil exhaustion.",
      "Compost adds natural nutrients back."
    ],
    contentTranslated: {
      english: [
        "Healthy soil produces stronger crops.",
        "Crop rotation prevents soil exhaustion.",
        "Compost adds natural nutrients back."
      ],
      marathi: [
        "सुपीक जमीन चांगली पिके देते.",
        "पिकांची फेरपालट जमिनीचा कस टिकवून ठेवते.",
        "खत नैसर्गिकरित्या जमिनीत पोषक तत्वे वाढवते."
      ],
      hindi: [
        "स्वस्थ मिट्टी से मजबूत फसलें पैदा होती हैं।",
        "फसल चक्र मिट्टी की थकान को रोकता है।",
        "खाद प्राकृतिक पोषक तत्वों को वापस जोड़ती है।"
      ]
    },
    basicContent: ["Good soil = Good crops."],
    questions: [
      {
        id: 's1',
        text: 'Why should we rotate our crops?',
        textTranslated: {
          english: 'Why should we rotate our crops?',
          marathi: 'आपण पिकांची फेरपालट का करावी?',
          hindi: 'हमें अपनी फसलों को क्यों घुमाना चाहिए?'
        },
        options: ['Look nice', 'Soil strength', 'Save water'],
        optionsTranslated: {
          english: ['Look nice', 'Soil strength', 'Save water'],
          marathi: ['चांगले दिसण्यासाठी', 'जमिनीच्या ताकदीसाठी', 'पाणी वाचवण्यासाठी'],
          hindi: ['सुंदर दिखने के लिए', 'मिट्टी की मजबूती के लिए', 'पानी बचाने के लिए']
        },
        correctAnswerIndex: 1,
        difficulty: 'standard'
      }
    ]
  }
];

export const GAMES = [
  { id: 'math-duel', title: 'Math Duel', icon: 'Zap', xp: 50, desc: 'Quick-fire arithmetic' },
  { id: 'logic-grid', title: 'Logic Matrix', icon: 'Grid', xp: 75, desc: 'Pattern recognition' },
  { id: 'vocab-skills', title: 'Vocabulary Skills', icon: 'MessageCircle', xp: 100, desc: 'Master new words' },
  { id: 'fluency', title: 'Fluency Analysis', icon: 'Mic', xp: 50, desc: 'Track speed & rhythm' }
];

export const VOCAB_MATCH_DATA = [
  { word: 'Harvest', meaning: 'Gathering of crops', options: ['Cooking food', 'Gathering of crops', 'Planting seeds'] },
  { word: 'Ecosystem', meaning: 'Living community', options: ['A large building', 'A type of rock', 'Living community'] },
  { word: 'Compost', meaning: 'Natural fertilizer', options: ['Natural fertilizer', 'A type of tool', 'A clean river'] },
  { word: 'Foundation', meaning: 'Basis or base', options: ['The roof of a house', 'Basis or base', 'A fast runner'] },
];

export const VOCAB_RECALL_SEQUENCES = [
  ['Sun', 'Water', 'Seed', 'Plant'],
  ['Morning', 'Noon', 'Evening', 'Night'],
  ['Plough', 'Sow', 'Grow', 'Harvest'],
];

export const STROOP_COLORS = [
  { name: 'RED', color: '#ef4444' },
  { name: 'BLUE', color: '#3b82f6' },
  { name: 'GREEN', color: '#22c55e' },
  { name: 'YELLOW', color: '#eab308' },
];
