import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const QUIZZES = [
  {
    title: "Basics of Climate Change",
    description: "Test your understanding of climate change fundamentals.",
    pointsReward: 10,
    timeLimitMinutes: 5,
    questions: [
      {
        questionText: "What is the primary cause of global warming?",
        options: ["Solar radiation", "Greenhouse gas emissions", "Ocean currents", "Volcanic eruptions"],
        correctAnswer: "Greenhouse gas emissions",
        points: 1
      },
      {
        questionText: "Which gas contributes most to the greenhouse effect?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correctAnswer: "Carbon Dioxide",
        points: 1
      },
      {
        questionText: "What is the main source of CO2 emissions?",
        options: ["Forest fires", "Burning fossil fuels", "Ocean waves", "Soil erosion"],
        correctAnswer: "Burning fossil fuels",
        points: 1
      }
    ]
  },
  {
    title: "Recycling Awareness",
    description: "Learn how recycling helps the environment.",
    pointsReward: 8,
    timeLimitMinutes: 4,
    questions: [
      {
        questionText: "Which material can be recycled?",
        options: ["Plastic bottles", "Food waste", "Used tissues", "Dirty diapers"],
        correctAnswer: "Plastic bottles",
        points: 1
      },
      {
        questionText: "What color bin is usually used for recyclables?",
        options: ["Blue", "Red", "Black", "Yellow"],
        correctAnswer: "Blue",
        points: 1
      },
      {
        questionText: "Recycling helps to:",
        options: ["Increase pollution", "Save resources", "Waste energy", "Destroy forests"],
        correctAnswer: "Save resources",
        points: 1
      }
    ]
  },
  {
    title: "Water Conservation",
    description: "Understand how to save water effectively.",
    pointsReward: 6,
    timeLimitMinutes: 3,
    questions: [
      {
        questionText: "What is the best way to conserve water at home?",
        options: ["Leave taps running", "Fix leaks", "Wash cars daily", "Use more water"],
        correctAnswer: "Fix leaks",
        points: 1
      },
      {
        questionText: "Which uses the most water?",
        options: ["Brushing teeth with tap off", "Long showers", "Drinking water", "Watering plants lightly"],
        correctAnswer: "Long showers",
        points: 1
      }
    ]
  }
];

async function main() {
  // Clear existing quizzes and questions
  await prisma.quizQuestion.deleteMany({});
  await prisma.quiz.deleteMany({});

  for (const quizData of QUIZZES) {
    const { questions, ...quizFields } = quizData;

    const quiz = await prisma.quiz.create({
      data: quizFields,
    });

    for (const question of questions) {
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          ...question,
          options: JSON.stringify(question.options)
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });