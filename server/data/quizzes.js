// Sample built-in quizzes for QuizFlow
const sampleQuizzes = [
  {
    id: "quiz_general_001",
    title: "General Knowledge Blitz",
    description: "Test your general knowledge across various topics!",
    category: "General",
    difficulty: "Medium",
    questions: [
      {
        id: "q1",
        text: "What is the capital of Japan?",
        options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
        correct: 2,
        time: 20,
        points: 1000
      },
      {
        id: "q2",
        text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        time: 15,
        points: 1000
      },
      {
        id: "q3",
        text: "Who painted the Mona Lisa?",
        options: ["Michelangelo", "Van Gogh", "Picasso", "Leonardo da Vinci"],
        correct: 3,
        time: 20,
        points: 1000
      },
      {
        id: "q4",
        text: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3,
        time: 15,
        points: 1000
      },
      {
        id: "q5",
        text: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        correct: 1,
        time: 10,
        points: 1000
      }
    ]
  },
  {
    id: "quiz_tech_002",
    title: "Tech & Coding Quiz",
    description: "How well do you know technology and programming?",
    category: "Technology",
    difficulty: "Hard",
    questions: [
      {
        id: "q1",
        text: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "HighText Machine Language",
          "HyperText Machine Language",
          "HyperTool Markup Language"
        ],
        correct: 0,
        time: 20,
        points: 1000
      },
      {
        id: "q2",
        text: "Which language is used for styling web pages?",
        options: ["Python", "JavaScript", "CSS", "HTML"],
        correct: 2,
        time: 15,
        points: 1000
      },
      {
        id: "q3",
        text: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Central Program Unit",
          "Computer Personal Unit",
          "Central Processor Utility"
        ],
        correct: 0,
        time: 20,
        points: 1000
      },
      {
        id: "q4",
        text: "Which company created JavaScript?",
        options: ["Microsoft", "Apple", "Google", "Netscape"],
        correct: 3,
        time: 25,
        points: 1000
      },
      {
        id: "q5",
        text: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct: 1,
        time: 30,
        points: 1000
      }
    ]
  },
  {
    id: "quiz_science_003",
    title: "Science Spectacular",
    description: "Explore the wonders of science!",
    category: "Science",
    difficulty: "Medium",
    questions: [
      {
        id: "q1",
        text: "What is the chemical symbol for Gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
        time: 15,
        points: 1000
      },
      {
        id: "q2",
        text: "How many bones are in the human body?",
        options: ["186", "206", "226", "246"],
        correct: 1,
        time: 20,
        points: 1000
      },
      {
        id: "q3",
        text: "What is the speed of light approximately?",
        options: ["3×10⁶ m/s", "3×10⁷ m/s", "3×10⁸ m/s", "3×10⁹ m/s"],
        correct: 2,
        time: 25,
        points: 1000
      },
      {
        id: "q4",
        text: "Which gas do plants absorb during photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correct: 2,
        time: 15,
        points: 1000
      },
      {
        id: "q5",
        text: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"],
        correct: 2,
        time: 15,
        points: 1000
      }
    ]
  }
];

module.exports = sampleQuizzes;
