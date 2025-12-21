
import { JointConfig, ToleranceMode } from '../types.ts';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateJointConfig = (config: JointConfig): ValidationResult => {
  const { 
    boxWidth: W, // Fixed: changed from boardWidth to boxWidth
    boardThickness: T, 
    numTails: n, 
    tolerance,
    minToolSize,
    layout
  } = config;

  if (W <= 0 || T <= 0 || n <= 0) {
    return { isValid: false, error: "Dimensional parameters must be greater than zero." };
  }

  // Find minimum pin or socket width in the actual layout
  const actualPinWidths = layout
    .filter(s => s.type === 'pin')
    .map(s => s.width);
  
  const minActualPin = actualPinWidths.length > 0 ? Math.min(...actualPinWidths) : W;

  // Tool Constraint Check (Prime Directive)
  if (minActualPin < minToolSize) {
    return {
      isValid: false,
      error: `Tool Constraint Violated: Smallest pin gap (${minActualPin.toFixed(3)}") is narrower than tool size (${minToolSize.toFixed(3)}").`
    };
  }

  // CNC Protocol Check
  if (tolerance === ToleranceMode.CNC) {
    const cncThreshold = 0.125;
    if (minActualPin < cncThreshold && minToolSize < cncThreshold) {
       // Allow if user explicitly set a tiny tool, but warn generally
    }
  }

  // Half-Pin Structural Integrity
  const startHP = layout[0];
  const endHP = layout[layout.length - 1];
  if (startHP.width < T * 0.4 || endHP.width < T * 0.4) {
    return {
      isValid: false,
      error: "Edge half-pins are structurally weak. Increase stock thickness or adjust layout."
    };
  }

  return { isValid: true };
};
