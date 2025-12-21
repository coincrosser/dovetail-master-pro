
import { JointConfig, JointSegment, PinLogicStrategy } from '../types.ts';
import { WOOD_PROFILES } from '../constants.ts';

export const solveJointLayout = (config: Partial<JointConfig>): JointSegment[] => {
  const height = config.boxHeight || 5.0;
  const n = config.numTails || 4;
  const t = config.boardThickness || 0.75;
  const strategy = config.pinStrategy || PinLogicStrategy.TRADITIONAL;
  const minTool = config.minToolSize || 0.125;

  const segments: JointSegment[] = [];
  
  // Standard structural half-pin at each edge (0.5 * thickness)
  const halfPinW = t * 0.5;
  const available = height - (2 * halfPinW);
  
  let pW: number;
  let tW: number;

  switch (strategy) {
    case PinLogicStrategy.LONDON:
      // Pins fixed to the cutting tool's minimal capability
      pW = Math.max(minTool, 0.0625); 
      tW = (available - (n - 1) * pW) / n;
      break;
    case PinLogicStrategy.EQUIDISTANT:
      // Even distribution
      pW = available / (2 * n - 1);
      tW = pW;
      break;
    case PinLogicStrategy.TRADITIONAL:
    default:
      // Classic 1:3 ratio
      pW = available / (4 * n - 1);
      tW = 3 * pW;
      break;
  }

  // Safety floor
  if (tW < pW) tW = pW;

  segments.push({ id: 'hp-start', type: 'half-pin', width: halfPinW });
  for (let i = 0; i < n; i++) {
    segments.push({ id: `tail-${i}`, type: 'tail', width: tW });
    if (i < n - 1) {
      segments.push({ id: `pin-${i}`, type: 'pin', width: pW });
    }
  }
  segments.push({ id: 'hp-end', type: 'half-pin', width: halfPinW });
  
  return segments;
};
