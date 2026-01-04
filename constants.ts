
import { Module, Language } from './types';

export const XP_PER_LEVEL = 500;

export const MODULES: Module[] = [
  {
    id: 'ncert-6-math-1',
    grade: '6',
    subject: 'Math',
    title: 'Playing with Numbers',
    subtitle: 'Factors & Multiples',
    xpReward: 100,
    content: [
      "Factors are numbers we multiply to get another number. Like 2 and 3 are factors of 6.",
      "A Multiple is the result of multiplying a number by an integer. Like 6, 12, 18 are multiples of 6.",
      "Think of factors like pieces of a puzzle, and multiples like jumps of a grasshopper."
    ],
    questions: [
      {
        id: 'q-6-m-1',
        topic: 'Factors',
        text: 'Which of these is a factor of 15?',
        options: ['2', '4', '5', '8'],
        correctAnswerIndex: 2,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'ncert-8-sci-1',
    grade: '8',
    subject: 'Science',
    title: 'Microorganisms',
    subtitle: 'Friend and Foe',
    xpReward: 120,
    content: [
      "Microbes are tiny living things we cannot see with eyes. We need a microscope.",
      "Some help in making curd (Lactobacillus), others cause diseases like Malaria.",
      "Yeast is used in village bakeries to make bread soft."
    ],
    questions: [
      {
        id: 'q-8-s-1',
        topic: 'Microbes',
        text: 'Which microbe helps in turning milk to curd?',
        options: ['Amoeba', 'Lactobacillus', 'Virus', 'Fungi'],
        correctAnswerIndex: 1,
        difficulty: 'standard'
      }
    ]
  },
  {
    id: 'ncert-10-eng-1',
    grade: '10',
    subject: 'English',
    title: 'A Letter to God',
    subtitle: 'Faith & Resilience',
    xpReward: 150,
    content: [
      "Lencho was a farmer who had deep faith in God.",
      "When his crops were destroyed by hailstones, he wrote a letter to God asking for 100 pesos.",
      "This story teaches us about hope and the irony of human nature."
    ],
    questions: [
      {
        id: 'q-10-e-1',
        topic: 'Comprehension',
        text: 'What did Lencho hope for to save his crops?',
        options: ['A new tractor', 'Rain', 'Sunshine', 'Chemical fertilizer'],
        correctAnswerIndex: 1,
        difficulty: 'easy'
      }
    ]
  }
];

export const GAMES = [
  { id: 'math-mandi', title: 'Math Mandi', icon: 'Zap', xp: 50, desc: 'Quick bazaar calculations' },
  { id: 'farm-logic', title: 'Farm Logic', icon: 'Grid', xp: 75, desc: 'Strategy for crop cycles' },
  { id: 'viva-mentor', title: 'Viva Mentor', icon: 'Mic', xp: 50, desc: 'Speak clearly for oral exams' }
];

export const TRANSLATIONS: Record<Language, any> = {
  english: {
    dashboard: "My Learning",
    hub: "Library",
    chat: "AI Mentor",
    arcade: "Games",
    exit: "Logout",
    readAloud: "Read Aloud",
    liteMode: "Low Data Mode",
    highContrast: "Sunlight View",
    grade: "Class",
    export: "Export Data",
    import: "Import Data",
    teacherRoom: "Teacher Room"
  },
  hindi: {
    dashboard: "मेरी पढ़ाई",
    hub: "पुस्तकालय",
    chat: "एआई गुरु",
    arcade: "खेल",
    exit: "बाहर निकलें",
    readAloud: "सुनिए",
    liteMode: "कम डेटा मोड",
    highContrast: "तेज रोशनी मोड",
    grade: "कक्षा",
    export: "डेटा निकालें",
    import: "डेटा डालें",
    teacherRoom: "शिक्षक कक्ष"
  },
  marathi: {
    dashboard: "माझा अभ्यास",
    hub: "ग्रंथालय",
    chat: "एआय मार्गदर्शक",
    arcade: "खेळ",
    exit: "बाहेर पडा",
    readAloud: "वाचून दाखवा",
    liteMode: "कमी डेटा मोड",
    highContrast: "सूर्यप्रकाश मोड",
    grade: "इयत्ता",
    export: "डेटा एक्सपोर्ट",
    import: "डेटा इम्पोर्ट",
    teacherRoom: "शिक्षक कक्ष"
  }
};
