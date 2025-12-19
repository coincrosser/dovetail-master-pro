export enum WoodType {
  SOFTWOOD = 'SOFTWOOD',
  HARDWOOD = 'HARDWOOD',
  EXOTIC = 'EXOTIC'
}

export enum JointAngle {
  ONE_TO_FIVE = 5,
  ONE_TO_SIX = 6,
  ONE_TO_EIGHT = 8
}

export interface JointConfig {
  boardWidth: number;
  boardThickness: number;
  boardLength: number;
  pinWidth: number;
  angle: number; // Changed to number to support custom slope values
  woodType: WoodType;
  numTails: number;
  tailWidthAtBase?: number;
  tailWidthAtTop?: number;
}

export interface LayoutData {
  dividerSetting: number;
  halfPinWidth: number;
  tailWidthAtBase: number;
  tailWidthAtTop: number;
  coordinates: {
    tails: Array<{
      topY: number;
      bottomY: number;
      points: string;
    }>;
  };
}

export interface AIAdvice {
  recommendation: string;
  reasoning: string;
  proTips: string[];
}