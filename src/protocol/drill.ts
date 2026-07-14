export const DRILL_ACTION = {
  PUSH: 'drillPush',
  POP_TO: 'drillPopTo',
  RESET: 'drillReset',
} as const;

export const DRILL_STATE = {
  PATH: 'drillPath',
} as const;

export const DRILL_EVENT = {
  NAVIGATE_REQUEST: 'drill:navigateRequest',
  RESET_REQUEST: 'drill:resetRequest',
} as const;

export interface DrillFrame {
  level: string;
  key: string | number;
  label: string;
  record?: unknown;
}

export interface DrillNavigateRequest {
  index: number;
}

export interface DrillPushParams {
  frame: DrillFrame;
}

export interface DrillPopToParams {
  index: number;
}

export interface DrillRuntimeProps {
  drillPath?: readonly DrillFrame[];
  onDrillNavigateRequest?: (request: DrillNavigateRequest) => void;
  onDrillResetRequest?: () => void;
}
