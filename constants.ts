
import { Module } from './types';

export const APP_THEME = {
  bg: '#f8fafc',
  text: '#1e293b',
  primary: '#2563eb',
  accent: '#f59e0b',
};

export const INITIAL_XP = 0;
export const XP_PER_LEVEL = 500;

export const MODULES: Module[] = [
  {
    id: 'math-1',
    title: 'Module 1: Basic Math',
    subtitle: 'Ready to start',
    xpReward: 100,
    content: [
      "Arithmetic is the foundation of science. It helps us count our harvest, calculate our trade, and build our homes.",
      "Addition is the act of combining two or more amounts together to get a total sum.",
      "Subtraction helps us understand difference, such as how many seeds we have left after planting.",
      "Mastering these basics will unlock more complex modules in engineering and finance."
    ],
    basicContent: [
      "Arithmetic is using numbers every day.",
      "Addition is putting two groups together. Like 2 apples and 3 apples make 5 apples.",
      "Subtraction is taking things away. If you have 5 apples and eat 2, you have 3 left.",
      "Learning this helps you in the market and at home."
    ],
    questions: [
      {
        id: 'q1',
        text: 'Musa has 15 maize cobs and buys 27 more. How many does he have in total?',
        options: ['32', '42', '45', '39'],
        correctAnswerIndex: 1,
        difficulty: 'standard'
      },
      {
        id: 'q2',
        text: 'If you have 12 seeds and 4 pots, how many seeds go in each pot equally?',
        options: ['2', '3', '4', '6'],
        correctAnswerIndex: 1,
        difficulty: 'standard'
      }
    ]
  },
  {
    id: 'agri-1',
    title: 'Module 2: Healthy Soil',
    subtitle: 'The heart of the farm',
    xpReward: 150,
    content: [
      "Soil is a living ecosystem. Healthy soil produces stronger crops that can resist pests and droughts.",
      "Crop rotation is the practice of planting different crops in the same area across sequences of seasons.",
      "This prevents soil exhaustion and breaks the cycle of pests that target specific plants.",
      "Using compost adds nutrients naturally back into the ground without harsh chemicals."
    ],
    basicContent: [
      "Good soil makes big plants.",
      "Do not plant the same thing in the same spot every year.",
      "Switching crops keeps the dirt strong.",
      "Compost is food for your plants. It is natural and cheap."
    ],
    questions: [
      {
        id: 's1',
        text: 'Why should we rotate our crops every season?',
        options: ['To make it look nice', 'To keep the soil strong', 'To save water'],
        correctAnswerIndex: 1,
        difficulty: 'standard'
      },
      {
        id: 's2',
        text: 'What is a natural way to feed your plants?',
        options: ['Chemical spray', 'Compost', 'Sand'],
        correctAnswerIndex: 1,
        difficulty: 'standard'
      }
    ]
  }
];

export const GAMES = [
  { id: 'math-duel', title: 'Math Duel', icon: 'Zap', xp: 50, desc: 'Quick-fire numbers' },
  { id: 'logic-grid', title: 'Logic Grid', icon: 'Grid', xp: 75, desc: 'Pattern matching' }
];
