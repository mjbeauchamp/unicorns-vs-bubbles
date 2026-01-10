export type LevelConfig = {
  level: number;
  targetScore: number;
  backgroundColor: string;
};

export const LEVELS: LevelConfig[] = [
  { level: 1, targetScore: 2, backgroundColor: '#fdcd53' },
  { level: 2, targetScore: 10, backgroundColor: '#d5e3cc' },
  { level: 3, targetScore: 15, backgroundColor: '#f5c16c' },
  { level: 4, targetScore: 10, backgroundColor: '#bc6c25' },
];
