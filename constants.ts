
import { WoodType, JointAngle, JointConfig, PinLogicStrategy, ToleranceMode, FitTolerance, JointPreset } from './types.ts';

export const DEFAULT_CONFIG: JointConfig = {
  boxWidth: 12.0,
  boxDepth: 8.0,
  boxHeight: 5.0,
  boardThickness: 0.75,
  woodType: WoodType.HARDWOOD,
  pinStrategy: PinLogicStrategy.TRADITIONAL,
  minToolSize: 0.125,
  numTails: 4,
  angle: JointAngle.ONE_TO_EIGHT,
  layout: [],
  step: 1,
  pinWidth: 0.25,
  tolerance: ToleranceMode.HAND_TOOL,
  fitTolerance: FitTolerance.SNUG,
  useDogbones: false,
  avoidBottomGroove: false,
  isGenerated: false
};

export const WOOD_PROFILES = {
  [WoodType.SOFTWOOD]: { color: '#F3E5AB', label: 'Softwood (1:6)', angle: JointAngle.ONE_TO_SIX, roughness: 0.8 },
  [WoodType.HARDWOOD]: { color: '#A0522D', label: 'Hardwood (1:8)', angle: JointAngle.ONE_TO_EIGHT, roughness: 0.6 },
  [WoodType.EXOTIC]: { color: '#4B2C20', label: 'Exotic (1:9)', angle: JointAngle.ONE_TO_NINE, roughness: 0.4 }
};

export const JOINT_PRESETS: JointPreset[] = [
  {
    id: 'classic-through',
    name: 'Classic Through Dovetail',
    description: 'The benchmark of traditional joinery.',
    boardWidth: 12,
    boardThickness: 0.75,
    pinWidth: 0.25,
    numTails: 4,
    angle: JointAngle.ONE_TO_EIGHT,
    woodType: WoodType.HARDWOOD,
    difficulty: 'Intermediate',
    recommendedWood: 'Walnut or Cherry',
    context: 'Case construction',
    history: 'Ancient standard',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800',
    technicalDetails: {}
  }
];
