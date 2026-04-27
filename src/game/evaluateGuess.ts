export type LetterState = 'correct' | 'present' | 'absent';

export type EvaluatedLetter = {
  letter: string;
  state: LetterState;
};

export function evaluateGuess(guess: string, answer: string): EvaluatedLetter[] {
  const result: EvaluatedLetter[] = guess.split('').map((letter) => ({
    letter,
    state: 'absent',
  }));
  const remaining = answer.split('');

  for (let index = 0; index < guess.length; index += 1) {
    if (guess[index] === answer[index]) {
      result[index].state = 'correct';
      remaining[index] = '';
    }
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (result[index].state === 'correct') {
      continue;
    }

    const foundIndex = remaining.indexOf(guess[index]);
    if (foundIndex >= 0) {
      result[index].state = 'present';
      remaining[foundIndex] = '';
    }
  }

  return result;
}
