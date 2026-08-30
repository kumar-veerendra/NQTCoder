import React from 'react';
import GeoSudoCanvas from './GeoSudoCanvas';
import DigitChallengeCanvas from './DigitChallengeCanvas';
import SwitchChallengeCanvas from './SwitchChallengeCanvas';
import InductiveCanvas from './InductiveCanvas';
import DoesntFitCanvas from './DoesntFitCanvas';
import MotionCanvas from './MotionCanvas';
import GridMemoryCanvas from './GridMemoryCanvas';
import ColourGridCanvas from './ColourGridCanvas';
import SameRuleCanvas from './SameRuleCanvas';
import OddoCanvas from './OddoCanvas';

const GameCanvasDispatcher = ({
  gameType = 'geo-sudo',
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  switch (gameType) {
    case 'geo-sudo':
      return (
        <GeoSudoCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'digit':
      return (
        <DigitChallengeCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'switch':
      return (
        <SwitchChallengeCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'inductive':
      return (
        <InductiveCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'grid-memory':
      return (
        <GridMemoryCanvas
          puzzle={puzzle}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'motion':
      return (
        <MotionCanvas
          puzzle={puzzle}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'colour-grid':
      return (
        <ColourGridCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'same-rule':
      return (
        <SameRuleCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'oddo':
      return (
        <OddoCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
    case 'doesnt-fit':
    default:
      if (puzzle?.grid) {
        return (
          <GeoSudoCanvas
            puzzle={puzzle}
            selectedAnswer={selectedAnswer}
            feedbackState={feedbackState}
            onSelectAnswer={onSelectAnswer}
          />
        );
      }
      return (
        <DoesntFitCanvas
          puzzle={puzzle}
          selectedAnswer={selectedAnswer}
          feedbackState={feedbackState}
          onSelectAnswer={onSelectAnswer}
        />
      );
  }
};

export default GameCanvasDispatcher;
