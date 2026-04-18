import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const GAMES = [
  {
    title: "Eco Quiz Challenge",
    description: "Test your environmental knowledge with this interactive quiz!",
    challengeType: "quiz",
    difficulty: "easy",
    pointsReward: 50,
    instructions: "Answer all questions correctly to earn maximum points.",
    config: {
      questions: [
        {
          questionText: "What is the main cause of climate change?",
          options: ["Deforestation", "Greenhouse gases", "Volcanic activity", "Solar flares"],
          correctAnswer: "Greenhouse gases",
          explanation: "Human activities release greenhouse gases like CO2 that trap heat in the atmosphere."
        },
        {
          questionText: "Which of these is a renewable energy source?",
          options: ["Coal", "Natural gas", "Solar power", "Nuclear waste"],
          correctAnswer: "Solar power",
          explanation: "Solar power comes from the sun and is renewable unlike fossil fuels."
        },
        {
          questionText: "What should you do with plastic bottles?",
          options: ["Throw in trash", "Burn them", "Recycle", "Leave outside"],
          correctAnswer: "Recycle",
          explanation: "Plastic bottles can be recycled to make new products, reducing waste."
        },
        {
          questionText: "Which activity helps conserve water?",
          options: ["Long showers", "Fixing leaks", "Running taps", "Using more water"],
          correctAnswer: "Fixing leaks",
          explanation: "Fixing leaks prevents water waste and saves this precious resource."
        },
        {
          questionText: "What is biodiversity?",
          options: ["Weather patterns", "Variety of life", "Soil types", "Ocean currents"],
          correctAnswer: "Variety of life",
          explanation: "Biodiversity refers to the variety of living organisms in an ecosystem."
        }
      ]
    }
  },
  {
    title: "Waste Segregation Game",
    description: "Learn to sort waste correctly by dragging items to the right bins!",
    challengeType: "drag_drop",
    difficulty: "easy",
    pointsReward: 30,
    instructions: "Drag each item to either the Recycle bin or Organic waste bin.",
    config: {
      items: [
        { id: "plastic_bottle", name: "Plastic Bottle", type: "recycle" },
        { id: "banana_peel", name: "Banana Peel", type: "organic" },
        { id: "glass_jar", name: "Glass Jar", type: "recycle" },
        { id: "paper_bag", name: "Paper Bag", type: "recycle" },
        { id: "apple_core", name: "Apple Core", type: "organic" },
        { id: "tin_can", name: "Tin Can", type: "recycle" }
      ],
      bins: [
        { id: "recycle", name: "Recycle", accepts: ["recycle"] },
        { id: "organic", name: "Organic Waste", accepts: ["organic"] }
      ]
    }
  },
  {
    title: "Save the Water",
    description: "Make decisions to help conserve water in your community!",
    challengeType: "decision",
    difficulty: "medium",
    pointsReward: 40,
    instructions: "Choose the best actions to save water and earn points.",
    config: {
      scenarios: [
        {
          situation: "You notice a leaky faucet in the kitchen.",
          choices: [
            { text: "Ignore it, it's just a small drip", points: -10, feedback: "Small leaks waste a lot of water over time!" },
            { text: "Fix it immediately", points: 15, feedback: "Great! Fixing leaks saves water and money." },
            { text: "Tell your parents about it", points: 10, feedback: "Good communication helps solve the problem." }
          ]
        },
        {
          situation: "It's time for a shower.",
          choices: [
            { text: "Take a 20-minute shower", points: -15, feedback: "Long showers waste precious water resources." },
            { text: "Take a 5-minute shower", points: 20, feedback: "Quick showers save water and are just as refreshing!" },
            { text: "Take a bath instead", points: -10, feedback: "Baths use more water than efficient showers." }
          ]
        },
        {
          situation: "Washing dishes after dinner.",
          choices: [
            { text: "Run water continuously while washing", points: -10, feedback: "Running water wastes gallons unnecessarily." },
            { text: "Fill sink with water and wash", points: 15, feedback: "Using a basin saves water compared to running taps." },
            { text: "Use dishwasher", points: 10, feedback: "Modern dishwashers are water-efficient." }
          ]
        }
      ]
    }
  },
  {
    title: "Plant the Tree",
    description: "Help a virtual tree grow by making eco-friendly choices!",
    challengeType: "progress",
    difficulty: "easy",
    pointsReward: 35,
    instructions: "Complete actions to help your tree grow from seed to full tree.",
    config: {
      actions: [
        { text: "Water the seedling", points: 10, growth: 20, feedback: "Your tree is sprouting!" },
        { text: "Add compost", points: 15, growth: 25, feedback: "Nutrients help your tree grow strong." },
        { text: "Protect from pests naturally", points: 20, growth: 30, feedback: "Natural pest control keeps your tree healthy." },
        { text: "Mulch around the base", points: 25, growth: 25, feedback: "Mulch conserves water and suppresses weeds." }
      ],
      targetGrowth: 100
    }
  },
  {
    title: "Clean Air Mission",
    description: "Choose actions that improve air quality in your city!",
    challengeType: "action",
    difficulty: "medium",
    pointsReward: 45,
    instructions: "Select sustainable actions to clean the air and earn points.",
    config: {
      actions: [
        {
          text: "Walk or bike instead of driving",
          points: 20,
          impact: "reduces car emissions",
          feedback: "Great choice! Reducing vehicle emissions improves air quality."
        },
        {
          text: "Use public transportation",
          points: 15,
          impact: "fewer cars on road",
          feedback: "Public transport reduces the number of vehicles contributing to pollution."
        },
        {
          text: "Plant trees in your neighborhood",
          points: 25,
          impact: "natural air filtration",
          feedback: "Trees absorb CO2 and release oxygen, naturally cleaning the air."
        },
        {
          text: "Reduce energy use at home",
          points: 18,
          impact: "less power plant emissions",
          feedback: "Using less electricity reduces emissions from power plants."
        },
        {
          text: "Avoid burning trash",
          points: 22,
          impact: "eliminates toxic smoke",
          feedback: "Burning trash releases harmful toxins into the air."
        }
      ]
    }
  }
];

async function main() {
  // Clear existing games/challenges
  await prisma.challenge.deleteMany({});

  for (const game of GAMES) {
    await prisma.challenge.create({
      data: {
        title: game.title,
        description: game.description,
        challengeType: game.challengeType,
        difficulty: game.difficulty,
        pointsReward: game.pointsReward,
        instructions: game.instructions,
        config: game.config,
      },
    });
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