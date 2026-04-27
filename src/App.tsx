import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BarChart3, BookOpen, HeartPulse, HelpCircle, Lightbulb, RotateCcw, X } from 'lucide-react';
import { terms, type MedicalTerm } from './data/terms';
import { evaluateGuess, type EvaluatedLetter, type LetterState } from './game/evaluateGuess';
import { normalizeWord } from './game/normalizeWord';
import { pickRandomTerm } from './game/pickTerm';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const rows = Array.from({ length: MAX_ATTEMPTS });
const emptyGuess = () => Array.from({ length: WORD_LENGTH }, () => '');
const keyboardRows = [
  { letters: 'qwertyuiop', enter: false, backspace: false },
  { letters: 'asdfghjkl', enter: true, backspace: false },
  { letters: 'zxcvbnm', enter: false, backspace: true },
];
const stateRank: Record<LetterState, number> = { absent: 1, present: 2, correct: 3 };

type Stats = {
  played: number;
  wins: number;
  streak: number;
  bestStreak: number;
  distribution: number[];
};

const emptyStats: Stats = {
  played: 0,
  wins: 0,
  streak: 0,
  bestStreak: 0,
  distribution: Array.from({ length: MAX_ATTEMPTS }, () => 0),
};

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem('termomed:stats');
    return raw ? { ...emptyStats, ...JSON.parse(raw) } : emptyStats;
  } catch {
    return emptyStats;
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem('termomed:stats', JSON.stringify(stats));
}

function App() {
  const [answer, setAnswer] = useState<MedicalTerm>(() => pickRandomTerm());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentLetters, setCurrentLetters] = useState<string[]>(() => emptyGuess());
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState('Treino guiado: descubra o termo medico.');
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);

  const evaluations = useMemo(
    () => guesses.map((guess) => evaluateGuess(guess, answer.word)),
    [answer.word, guesses],
  );

  const keyStates = useMemo(() => {
    const states: Partial<Record<string, LetterState>> = {};
    evaluations.flat().forEach(({ letter, state }) => {
      const previous = states[letter];
      if (!previous || stateRank[state] > stateRank[previous]) {
        states[letter] = state;
      }
    });
    return states;
  }, [evaluations]);

  const revealedHints = useMemo(
    () => guesses.filter((guess) => guess !== answer.word).slice(0, answer.hints.length),
    [answer.word, guesses],
  );

  function resetGame() {
    setAnswer((previous) => pickRandomTerm(previous.word));
    setGuesses([]);
    setCurrentLetters(emptyGuess());
    setActiveIndex(0);
    setFinished(false);
    setWon(false);
    setMessage('Novo termo sorteado.');
  }

  function recordResult(didWin: boolean, attemptCount: number) {
    setStats((previous) => {
      const next: Stats = {
        ...previous,
        played: previous.played + 1,
        wins: previous.wins + (didWin ? 1 : 0),
        streak: didWin ? previous.streak + 1 : 0,
        bestStreak: didWin ? Math.max(previous.bestStreak, previous.streak + 1) : previous.bestStreak,
        distribution: [...previous.distribution],
      };

      if (didWin) {
        next.distribution[attemptCount - 1] += 1;
      }

      saveStats(next);
      return next;
    });
  }

  function submitGuess() {
    const normalized = normalizeWord(currentLetters.join(''));

    if (finished) {
      return;
    }

    if (currentLetters.some((letter) => !letter) || normalized.length !== WORD_LENGTH) {
      setMessage('Preencha as 5 letras antes de enviar.');
      return;
    }

    if (!/^[a-z]{5}$/.test(normalized)) {
      setMessage('Use apenas letras, sem numeros ou simbolos.');
      return;
    }

    const nextGuesses = [...guesses, normalized];
    const didWin = normalized === answer.word;
    const didLose = nextGuesses.length === MAX_ATTEMPTS && !didWin;
    setGuesses(nextGuesses);
    setCurrentLetters(emptyGuess());
    setActiveIndex(0);

    if (didWin || didLose) {
      setFinished(true);
      setWon(didWin);
      recordResult(didWin, nextGuesses.length);
      setMessage(didWin ? 'Diagnostico fechado.' : `O termo era ${answer.word.toUpperCase()}.`);
      return;
    }

    const nextHintNumber = Math.min(nextGuesses.length, answer.hints.length);
    setMessage(`Dica ${nextHintNumber} liberada.`);
  }

  function handleInput(key: string) {
    if (key === 'Enter') {
      submitGuess();
      return;
    }

    if (key === 'Backspace') {
      setCurrentLetters((value) => {
        const next = [...value];
        if (next[activeIndex]) {
          next[activeIndex] = '';
          return next;
        }

        const previousIndex = Math.max(0, activeIndex - 1);
        next[previousIndex] = '';
        setActiveIndex(previousIndex);
        return next;
      });
      return;
    }

    const normalized = normalizeWord(key);
    if (/^[a-z]$/.test(normalized)) {
      setCurrentLetters((value) => {
        const next = [...value];
        next[activeIndex] = normalized;
        return next;
      });
      setActiveIndex((value) => Math.min(WORD_LENGTH - 1, value + 1));
    }
  }

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      handleInput(event.key);
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  });

  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => setShowHelp(true)} aria-label="Ajuda">
            <HelpCircle size={22} />
          </button>
        </div>
        <div className="brand" aria-label="TermoMed">
          <HeartPulse size={28} />
          <span>TermoMed</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => setShowStats(true)} aria-label="Estatisticas">
            <BarChart3 size={22} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => {
              resetGame();
            }}
            aria-label="Reiniciar treino"
          >
            <RotateCcw size={22} />
          </button>
        </div>
      </header>

      <p className="status-message sr-only" role="status">
        {message}
      </p>

      <div className="game-area">
        <section className="board" aria-label="Tabuleiro">
          {rows.map((_, rowIndex) => {
            const guess = guesses[rowIndex];
            const evaluation = evaluations[rowIndex];
            const isCurrentRow = rowIndex === guesses.length && !finished;
            const letters = guess ?? (isCurrentRow ? currentLetters.join('') : '');

            return (
              <div className="board-row" key={rowIndex}>
                {Array.from({ length: WORD_LENGTH }).map((__, cellIndex) => {
                  const evaluated = evaluation?.[cellIndex] as EvaluatedLetter | undefined;
                  const letter = isCurrentRow ? currentLetters[cellIndex] : (letters[cellIndex] ?? '');
                  const isActive = isCurrentRow && activeIndex === cellIndex;
                  return (
                    <button
                      className={`tile ${evaluated?.state ?? (letter ? 'filled' : '')} ${isActive ? 'active' : ''}`}
                      key={cellIndex}
                      type="button"
                      onClick={() => {
                        if (isCurrentRow) {
                          setActiveIndex(cellIndex);
                        }
                      }}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </section>

        <section className={`hints-panel ${revealedHints.length === 0 ? 'empty' : ''}`} aria-label="Dicas">
          <div className="hints-title">
            <Lightbulb size={18} />
            <span>Dicas</span>
          </div>
          {revealedHints.length === 0 ? (
            <p>Nenhuma dica liberada ainda.</p>
          ) : (
            <ol>
              {revealedHints.map((_, index) => (
                <li key={answer.hints[index]}>{answer.hints[index]}</li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {finished && (
        <section className={`result-panel ${won ? 'win' : 'loss'}`}>
          <div>
            <span>{won ? 'Acertou' : 'Resposta'}</span>
            <strong>{answer.word.toUpperCase()}</strong>
          </div>
          <p>{answer.definition}</p>
          <small>{answer.category}</small>
        </section>
      )}

      <section className="keyboard" aria-label="Teclado virtual">
        {keyboardRows.map((row) => (
          <div className="keyboard-row" key={row.letters}>
            {row.letters.split('').map((letter) => (
              <button
                className={`key ${keyStates[letter] ?? ''}`}
                type="button"
                key={letter}
                onClick={() => handleInput(letter)}
              >
                {letter}
              </button>
            ))}
            {row.enter && (
              <button className="key wide enter-key" type="button" onClick={() => submitGuess()}>
                Enter
              </button>
            )}
            {row.backspace && (
              <button className="key wide" type="button" onClick={() => handleInput('Backspace')} aria-label="Apagar">
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </section>

      {showHelp && (
        <Modal title="Como jogar" onClose={() => setShowHelp(false)}>
          <p>
            Descubra o termo medico em 6 tentativas. Toque em qualquer casa da linha ativa para escolher onde
            digitar. Qualquer palavra alfabetica de 5 letras e aceita como tentativa.
          </p>
          <div className="example-row">
            <span className="tile correct">s</span>
            <span className="tile">a</span>
            <span className="tile present">p</span>
            <span className="tile absent">o</span>
            <span className="tile">s</span>
          </div>
          <p>Verde indica posicao certa, amarelo indica letra em outra posicao, e escuro indica letra ausente.</p>
          <p>Quando voce erra, uma dica e liberada. O limite e de 5 dicas.</p>
        </Modal>
      )}

      {showStats && (
        <Modal title="Estatisticas" onClose={() => setShowStats(false)}>
          <div className="stats-grid">
            <Stat label="Jogos" value={stats.played} />
            <Stat label="Vitorias" value={`${winRate}%`} />
            <Stat label="Sequencia" value={stats.streak} />
            <Stat label="Melhor" value={stats.bestStreak} />
          </div>
          <div className="distribution">
            {stats.distribution.map((count, index) => (
              <div className="distribution-row" key={index}>
                <span>{index + 1}</span>
                <div>
                  <strong style={{ width: `${Math.max(8, count * 24)}px` }}>{count}</strong>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      <footer className="term-count">
        <BookOpen size={16} />
        Resposta-alvo: termo medico de 5 letras
        {' '}({terms.length} termos)
      </footer>
    </main>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-card">
        <header>
          <h2>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default App;
