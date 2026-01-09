export type LevelConfig = {
  level: number;
  targetScore: number;
};

export const LEVELS: LevelConfig[] = [
  { level: 1, targetScore: 25 },
  { level: 2, targetScore: 50 },
  { level: 3, targetScore: 75 },
];
