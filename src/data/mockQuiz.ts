export const mockQuizData = {
  title: "Kuis Sejarah Indonesia",
  totalQuestions: 5,
  questions: [
    {
      id: "q1",
      content: "Siapakah presiden pertama Republik Indonesia?",
      options: [
        { id: "a", text: "Soeharto" },
        { id: "b", text: "B.J. Habibie" },
        { id: "c", text: "Ir. Soekarno" },
        { id: "d", text: "Megawati Soekarnoputri" }
      ],
      correctAnswerId: "c"
    },
    {
      id: "q2",
      content: "Apa nama ibukota dari provinsi Jawa Timur?",
      options: [
        { id: "a", text: "Semarang" },
        { id: "b", text: "Surabaya" },
        { id: "c", text: "Malang" },
        { id: "d", text: "Bandung" }
      ],
      correctAnswerId: "b"
    }
  ],
  player: {
    nickname: "Budi",
    score: 1250,
    rank: 3
  },
  leaderboard: [
    { rank: 1, nickname: "Siti", score: 1500 },
    { rank: 2, nickname: "Andi", score: 1400 },
    { rank: 3, nickname: "Budi", score: 1250 },
    { rank: 4, nickname: "Dewi", score: 1100 },
    { rank: 5, nickname: "Rudi", score: 950 }
  ]
};
