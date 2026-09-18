export const MATCH_DURATION_SECONDS = 300
export const STARTING_CASH = 120
export const QUIZ_COOLDOWN_SECONDS = 6
export const QUIZ_FAST_LIMIT_MS = 5000

export const CROPS = [
  {
    id: 'carrot',
    name: 'แครอทเคมี',
    icon: '🥕',
    seedPrice: 8,
    growSeconds: 8,
    sellPrice: 18,
    accent: '#ff8b42',
    description: 'พืชเริ่มต้น หมุนเงินช่วงแรก',
  },
  {
    id: 'corn',
    name: 'ข้าวโพดไฮสปีด',
    icon: '🌽',
    seedPrice: 25,
    growSeconds: 15,
    sellPrice: 58,
    accent: '#f4c542',
    description: 'เหมาะกับปุ๋ยจากโจทย์ตาราง',
  },
  {
    id: 'tomato',
    name: 'มะเขือเทศพลังงาน',
    icon: '🍅',
    seedPrice: 60,
    growSeconds: 28,
    sellPrice: 150,
    accent: '#e85845',
    description: 'กำไรสูง คุ้มค่ากับปุ๋ยกราฟ',
  },
  {
    id: 'pumpkin',
    name: 'ฟักทองโมลาร์ยักษ์',
    icon: '🎃',
    seedPrice: 150,
    growSeconds: 50,
    sellPrice: 420,
    accent: '#e68128',
    description: 'กำไรก้อนใหญ่สำหรับช่วงท้ายเกม',
  },
]

export const TREES = [
  {
    id: 'apple',
    name: 'ต้นแอปเปิลธรรมดา',
    icon: '🍎',
    price: 0,
    cycleSeconds: 15,
    sellPrice: 12,
  },
  {
    id: 'orange',
    name: 'ต้นส้ม Ep',
    icon: '🍊',
    price: 90,
    cycleSeconds: 24,
    sellPrice: 32,
  },
  {
    id: 'durian',
    name: 'ต้นทุเรียนโอเวอร์คล็อก',
    icon: '🌳',
    price: 240,
    cycleSeconds: 38,
    sellPrice: 95,
  },
]

export const PLOT_PRICES = [0, 35, 80, 150, 250, 380, 540]

export const FERTILIZER = {
  S: { cropCut: 0.7, treeCut: 0.4, label: 'ปุ๋ยเกรด S' },
  A: { cropCut: 0.4, treeCut: 0.2, label: 'ปุ๋ยเกรด A' },
}

export const DEMO_QUESTIONS = [
  {
    id: 'demo-rate-1',
    type: 'rate_table',
    question_data: {
      tableData: [
        { expId: 1, A: 0.1, B: 0.1, rate: 2 },
        { expId: 2, A: 0.2, B: 0.1, rate: 8 },
        { expId: 3, A: 0.1, B: 0.2, rate: 4 },
      ],
    },
    answer: { m: 2, n: 1 },
  },
  {
    id: 'demo-energy-1',
    type: 'energy_graph',
    question_data: { reactantEnergy: 20, peakEnergy: 110, productEnergy: 50 },
    answer: { EaForward: 90, EaReverse: 60 },
  },
  {
    id: 'demo-rate-2',
    type: 'rate_table',
    question_data: {
      tableData: [
        { expId: 1, A: 0.2, B: 0.1, rate: 3 },
        { expId: 2, A: 0.4, B: 0.1, rate: 6 },
        { expId: 3, A: 0.2, B: 0.2, rate: 12 },
      ],
    },
    answer: { m: 1, n: 2 },
  },
  {
    id: 'demo-energy-2',
    type: 'energy_graph',
    question_data: { reactantEnergy: 35, peakEnergy: 125, productEnergy: 15 },
    answer: { EaForward: 90, EaReverse: 110 },
  },
]
