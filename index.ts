import { Player, isSamePlayer } from './types/player';
import {
  FortyData,
  Point,
  PointsData,
  Score,
  advantage,
  deuce,
  fifteen,
  forty,
  game,
  points,
  thirty,
} from './types/score';
import { none, Option, some, match as matchOpt } from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';

// -------- Tooling functions --------- //

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'PLAYER_TWO';
    case 'PLAYER_TWO':
      return 'PLAYER_ONE';
  }
};
// Exercice 1 :
export const pointToString = (point: Point): string => {
  switch (point.kind) {
    case 'LOVE':
      return '0';
    case 'FIFTEEN':
      return '15';
    case 'THIRTY':
      return '30';
  }
};
export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'DEUCE':
      return 'Score is Deuce';
    case 'ADVANTAGE':
      return `Score is Advantage to ${playerToString(score.player)}`;
    case 'FORTY':
      return `Score is Forty for ${playerToString(
        score.fortyData.player
      )} and other player has ${pointToString(score.fortyData.otherPoint)}`;
    case 'GAME':
      return `${score.player} has won the game.`;
    case 'POINTS':
      return `Player 1 has ${pointToString(
        score.pointsData.PLAYER_ONE
      )} and player 2 has ${pointToString(score.pointsData.PLAYER_TWO)}`;
  }
};

const incrementPoint = (point: Point): Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return some(fifteen());
    case 'FIFTEEN':
      return some(thirty());
    case 'THIRTY':
      return none;
  }
};

export const scoreWhenDeuce = (winner: Player): Score => {
  return advantage(winner);
};

export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayed, winner)) return game(winner);
  return deuce();
};

export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);
  return pipe(
    incrementPoint(currentForty.otherPoint),
    matchOpt(
      () => deuce(),
      p => forty(currentForty.player, p) as Score
    )
  );
};

export const scoreWhenGame = (winner: Player): Score => {
  return game(winner);
};

export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  return isSamePlayer(winner, 'PLAYER_ONE')
    ? pipe(
        current.PLAYER_ONE,
        incrementPoint,
        matchOpt(
          () => forty('PLAYER_ONE', current.PLAYER_TWO),
          p => points(p, current.PLAYER_TWO) as Score
        )
      )
    : pipe(
        current.PLAYER_TWO,
        incrementPoint,
        matchOpt(
          () => forty('PLAYER_TWO', current.PLAYER_ONE),
          p => points(current.PLAYER_ONE, p) as Score
        )
      );
};

export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'GAME':
      return scoreWhenGame(winner);
  }
};
