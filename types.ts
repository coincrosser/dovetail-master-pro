
export enum WoodType {
  SOFTWOOD = 'SOFTWOOD',
  HARDWOOD = 'HARDWOOD',
  EXOTIC = 'EXOTIC'
}

export enum JointAngle {
  ONE_TO_SIX = 6,
  ONE_TO_EIGHT = 8,
  ONE_TO_NINE = 9
}

export enum PinLogicStrategy {
  TRADITIONAL = 'traditional',
  LONDON = 'london',
  EQUIDISTANT = 'equidistant'
}

export enum FitTolerance {
  SNUG = 'snug',
  GLUE_GAP = 'glue_gap'
}

export enum ToleranceMode {
  HAND_TOOL = 'hand_tool',
  CNC = 'cnc'
}

export interface JointSegment {
  id: string;
  type: 'pin' | 'tail' | 'half-pin';
  width: number;
}

export interface AIAdvice {
  recommendation: string;
  reasoning: string;
  proTips: string[];
  structuralScore: number;
}

export interface JointPreset {
  id: string;
  name: string;
  description: string;
  boardWidth: number;
  boardThickness: number;
  pinWidth: number;
  numTails: number;
  angle: JointAngle;
  woodType: WoodType;
  difficulty: 'Novice' | 'Intermediate' | 'Master';
  recommendedWood: string;
  context: string;
  history: string;
  imageUrl: string;
  technicalDetails: any;
}

export interface JointConfig {
  // Step 1: Studio Dimensions
  boxWidth: number;
  boxDepth: number;
  boxHeight: number;
  boardThickness: number;
  
  // Step 1: Studio Logic
  woodType: WoodType;
  pinStrategy: PinLogicStrategy;
  minToolSize: number;
  numTails: number;
  
  // Calculated Logic
  angle: JointAngle;
  layout: JointSegment[];
  
  // Workflow State
  step: 1 | 2 | 3 | 4;

  // New properties for fabrication and validation
  pinWidth: number;
  tolerance: ToleranceMode;
  fitTolerance: FitTolerance;
  useDogbones: boolean;
  avoidBottomGroove: boolean;
  isGenerated: boolean;
}
