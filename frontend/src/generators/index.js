import { generateGeoSudoPuzzle } from './geoSudoGenerator';
import { generateDigitPuzzle } from './digitGenerator';
import { generateSwitchPuzzle } from './switchGenerator';
import { generateInductivePuzzle } from './inductiveGenerator';
import { generateDoesntFitPuzzle } from './doesntFitGenerator';
import { generateGridMemoryPuzzle } from './gridMemoryGenerator';
import { generateMotionPuzzle } from './motionGenerator';
import { generateColourGridPuzzle } from './colourGridGenerator';
import { generateSameRulePuzzle } from './sameRuleGenerator';
import { generateOddoPuzzle } from './oddoGenerator';

export {
  generateGeoSudoPuzzle,
  generateDigitPuzzle,
  generateSwitchPuzzle,
  generateInductivePuzzle,
  generateDoesntFitPuzzle,
  generateGridMemoryPuzzle,
  generateMotionPuzzle,
  generateColourGridPuzzle,
  generateSameRulePuzzle,
  generateOddoPuzzle,
};

export function generatePuzzleForGame(gameType, levelConfig = {}) {
  switch (gameType) {
    case 'geo-sudo':
      return { type: 'geo-sudo', ...generateGeoSudoPuzzle(levelConfig) };
    case 'digit':
      return { type: 'digit', ...generateDigitPuzzle(levelConfig) };
    case 'switch':
      return { type: 'switch', ...generateSwitchPuzzle(levelConfig) };
    case 'inductive':
      return { type: 'inductive', ...generateInductivePuzzle(levelConfig) };
    case 'grid-memory':
      return { type: 'grid-memory', ...generateGridMemoryPuzzle(levelConfig) };
    case 'motion':
      return { type: 'motion', ...generateMotionPuzzle(levelConfig) };
    case 'colour-grid':
      return { type: 'colour-grid', ...generateColourGridPuzzle(levelConfig) };
    case 'same-rule':
      return { type: 'same-rule', ...generateSameRulePuzzle(levelConfig) };
    case 'oddo':
      return { type: 'oddo', ...generateOddoPuzzle(levelConfig) };
    case 'doesnt-fit':
    default:
      if (gameType === 'doesnt-fit') {
        return { type: 'doesnt-fit', ...generateDoesntFitPuzzle(levelConfig) };
      }
      return { type: 'geo-sudo', ...generateGeoSudoPuzzle(levelConfig) };
  }
}
