export type LevelConfig = {
  level: number;
  targetScore: number;
  backgroundColor: string;
};

// export const LEVELS: LevelConfig[] = [
//   { level: 1, targetScore: 3, backgroundColor: '#028af8' },
//   { level: 2, targetScore: 10, backgroundColor: '#d5e3cc' },
//   { level: 3, targetScore: 15, backgroundColor: '#f5c16c' },
//   { level: 4, targetScore: 10, backgroundColor: '#bc6c25' },
//   { level: 5, targetScore: 10, backgroundColor: '#fdcd53' },
// ];

export const LEVELS: LevelConfig[] = [
  { level: 1, targetScore: 2, backgroundColor: '#028af8' },
  { level: 2, targetScore: 3, backgroundColor: '#d5e3cc' },
  // { level: 3, targetScore: 3, backgroundColor: '#f5c16c' },
];
