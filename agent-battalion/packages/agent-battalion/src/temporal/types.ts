export type MissionSpec = {
  appName: string;
  spec: string;
};

export type MissionProgress = {
  stage: string;
  message: string;
  percent: number;
};

export type MissionResult = {
  files: Array<{ path: string; contents: string }>;
};
