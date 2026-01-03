
import { Module } from './types';

export const APP_THEME = {
  bg: '#f8fafc',
  text: '#1e293b',
  primary: '#2563eb',
  accent: '#f59e0b', // Amber for XP
};

export const INITIAL_XP = 0;

export const MODULES: Module[] = [
  {
    id: 'math-1',
    title: 'Module 1: Basic Arithmetic',
    subtitle: 'Foundation of numbers',
    xpReward: 100,
    content: [
      "Arithmetic is the branch of mathematics that consists of the study of numbers, especially the properties of the traditional operations on them—addition, subtraction, multiplication, and division.",
      "Basic addition combines two or more numbers into a single sum. For example, if you have 2 apples and get 3 more, you have 5 apples total.",
      "Subtraction represents the operation of removing objects from a collection. If you have 5 apples and eat 2, you have 3 remaining.",
      "Multiplication can be thought of as repeated addition. 3 times 4 means adding 4 three times: 4 + 4 + 4 = 12.",
      "Division is the inverse of multiplication, splitting a large group into smaller, equal parts."
    ],
    questions: [
      {
        id: 'q1',
        text: 'What is 15 + 27?',
        options: ['32', '42', '45', '39'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        text: 'If you have 12 seeds and plant 4 in each pot, how many pots do you need?',
        options: ['2', '3', '4', '6'],
        correctAnswerIndex: 1
      },
      {
        id: 'q3',
        text: 'Calculate 7 multiplied by 8.',
        options: ['54', '56', '62', '48'],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    id: 'science-1',
    title: 'Module 2: Sustainable Farming',
    subtitle: 'Caring for our land',
    xpReward: 150,
    content: [
      "Sustainable farming focuses on producing food, fiber, or other plant or animal products using farming techniques that protect the environment, public health, human communities, and animal welfare.",
      "Crop rotation is a key practice where different types of crops are planted in the same area across sequential seasons. This helps manage soil fertility and reduce pests.",
      "Organic matter like compost and manure improves soil structure and water retention, reducing the need for chemical fertilizers.",
      "Water conservation in farming often involves drip irrigation, which delivers water directly to the plant's roots, minimizing evaporation and runoff.",
      "Healthy soil is the foundation of any sustainable farm. It contains billions of beneficial microbes that help plants grow strong."
    ],
    questions: [
      {
        id: 'q1',
        text: 'Which practice helps manage soil fertility naturally?',
        options: ['Chemical fertilizers', 'Crop rotation', 'Continuous monocropping', 'Deep plowing'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        text: 'What is the main benefit of drip irrigation?',
        options: ['Floods the field quickly', 'Cools the air', 'Minimizes water waste', 'Makes soil harder'],
        correctAnswerIndex: 2
      },
      {
        id: 'q3',
        text: 'What does compost add to the soil?',
        options: ['Pesticides', 'Sand', 'Organic matter', 'Plastic'],
        correctAnswerIndex: 2
      }
    ]
  }
];
