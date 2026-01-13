
import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState, Round, Team, AIAnalysis } from './types';
import { analyzeGame } from './services/geminiService';

// Sub-components
const Header: React.FC = () => (
  <header className="p-4 md:p-6 border-b border-cyan-500/30 flex justify-between items-center glass-card sticky top-0 z-50">
    <div className="flex items-center gap-2 md:gap-3">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-500 rounded-lg flex items-center justify-center neon-border animate-pulse-cyan">
        <span className="text-black font-black text-lg md:text-xl font-orbitron">D</span>
      </div>
      <h1 className="text-xl md:text-2xl font-orbitron font-bold tracking-tighter text-cyan-400 neon-text-cyan">
        QUANTUM DOMINO
      </h1>
    </div>
    <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest hidden sm:block">
      Orbital System Active // v2.3.0
    </div>
  </header>
);

const ScoreCard: React.FC<{ 
  name: string; 
  score: number; 
  team: Team; 
  isWinning: boolean;
  target: number;
  onAddClick: () => void;
}> = ({ name, score, team, isWinning, target, onAddClick }) => (
  <div className={`p-4 md:p-8 rounded-2xl md:rounded-3xl glass-card relative overflow-hidden transition-all duration-500 flex flex-col items-center ${isWinning ? 'neon-border scale-[1.02] md:scale-105 z-10' : 'opacity-90'}`}>
    {isWinning && (
      <div className="absolute top-0 right-0 p-1 md:p-2 bg-cyan-500 text-black text-[8px] md:text-[10px] font-bold font-orbitron rounded-bl-lg">
        LEADER
      </div>
    )}
    
    <button 
      onClick={onAddClick}
      className={`mb-4 md:mb-6 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border-2 ${
        team === 'A' 
          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
          : 'bg-pink-500/10 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-black shadow-[0_0_15px_rgba(236,72,153,0.4)]'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <h3 className={`text-[10px] font-orbitron mb-1 tracking-[0.1em] md:tracking-[0.2em] ${team === 'A' ? 'text-cyan-400' : 'text-pink-500'}`}>
      TEAM {team}
    </h3>
    <h2 className="text-sm md:text-xl font-bold mb-2 md:mb-4 uppercase truncate max-w-full font-orbitron">{name}</h2>
    
    <div className="flex items-baseline gap-1 md:gap-2">
      <span className="text-4xl md:text-7xl font-black font-orbitron tracking-tighter">{score}</span>
      <span className="text-[10px] md:text-xs text-slate-500 font-mono">/ {target}</span>
    </div>

    <div className="mt-4 md:mt-6 h-1 md:h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ease-out ${team === 'A' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]'}`} 
        style={{ width: `${Math.min((score / target) * 100, 100)}%` }}
      />
    </div>
  </div>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    teamAName: "Cyber Nexus",
    teamBName: "Void Runners",
    rounds: [],
    winningScore: 200,
  });

  const [activeInputTeam, setActiveInputTeam] = useState<Team | null>(null);
  const [pointsInput, setPointsInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [customScoreInput, setCustomScoreInput] = useState<string>('');

  const totalA = useMemo(() => gameState.rounds.reduce((acc, r) => acc + r.pointsA, 0), [gameState.rounds]);
  const totalB = useMemo(() => gameState.rounds.reduce((acc, r) => acc + r.pointsB, 0), [gameState.rounds]);

  const winner = useMemo(() => {
    if (totalA >= gameState.winningScore) return 'A';
    if (totalB >= gameState.winningScore) return 'B';
    return null;
  }, [totalA, totalB, gameState.winningScore]);

  // Enhanced confetti effect
  useEffect(() => {
    if (winner) {
      const duration = 15 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 1000, colors: winner === 'A' ? ['#06b6d4', '#ffffff', '#0891b2'] : ['#ec4899', '#ffffff', '#db2777'] };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 150 * (timeLeft / duration);
        // Cascading confetti from the top
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.9), y: -0.1 } });
      }, 350);

      // Initial big blast
      confetti({
        particleCount: 400,
        spread: 160,
        origin: { y: 0.6 },
        ...defaults
      });

      return () => clearInterval(interval);
    }
  }, [winner]);

  const handleAddPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(pointsInput) || 0;
    if (pts === 0 || !activeInputTeam) {
      setActiveInputTeam(null);
      return;
    }

    const newRound: Round = {
      id: Math.random().toString(36).substr(2, 9),
      pointsA: activeInputTeam === 'A' ? pts : 0,
      pointsB: activeInputTeam === 'B' ? pts : 0,
      timestamp: Date.now(),
    };

    setGameState(prev => ({
      ...prev,
      rounds: [newRound, ...prev.rounds]
    }));
    setPointsInput('');
    setActiveInputTeam(null);
  };

  const deleteRound = (id: string) => {
    setGameState(prev => ({
      ...prev,
      rounds: prev.rounds.filter(r => r.id !== id)
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({ ...prev, rounds: [] }));
    setAnalysis(null);
  };

  const getAnalysis = async () => {
    if (gameState.rounds.length < 1) return;
    setIsAnalyzing(true);
    const result = await analyzeGame(gameState);
    if (result) setAnalysis(result);
    setIsAnalyzing(false);
  };

  const updateWinningScore = (score: number) => {
    setGameState(prev => ({ ...prev, winningScore: score }));
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8 md:space-y-12">
        {/* Game Settings - Compact for mobile-tablet view */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border-white/5">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron text-center sm:text-left">Score Limit</span>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {[100, 150, 200, 500].map(score => (
                <button
                  key={score}
                  onClick={() => updateWinningScore(score)}
                  className={`px-3 py-1.5 rounded-lg font-orbitron text-[10px] md:text-xs transition-all ${
                    gameState.winningScore === score 
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {score}
                </button>
              ))}
              <div className="flex items-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                <input 
                  type="number"
                  placeholder="Custom"
                  value={customScoreInput}
                  onChange={(e) => setCustomScoreInput(e.target.value)}
                  className="w-16 md:w-20 bg-transparent px-2 py-1.5 text-[10px] md:text-xs font-orbitron focus:outline-none"
                />
                <button 
                  onClick={() => {
                    const val = parseInt(customScoreInput);
                    if (val > 0) updateWinningScore(val);
                  }}
                  className="px-2 py-1.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase hover:bg-cyan-500/40 transition-colors"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center sm:text-right w-full sm:w-auto">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron mb-1">Target</div>
             <div className="text-2xl md:text-3xl font-black font-orbitron text-cyan-400 neon-text-cyan">{gameState.winningScore} PTS</div>
          </div>
        </section>

        {/* Score Board - Forced 2-column layout to look like tablet on mobile */}
        <div className="grid grid-cols-2 gap-3 md:gap-8">
          <ScoreCard 
            name={gameState.teamAName} 
            score={totalA} 
            team="A" 
            isWinning={totalA > totalB}
            target={gameState.winningScore}
            onAddClick={() => setActiveInputTeam('A')}
          />
          <ScoreCard 
            name={gameState.teamBName} 
            score={totalB} 
            team="B" 
            isWinning={totalB > totalA}
            target={gameState.winningScore}
            onAddClick={() => setActiveInputTeam('B')}
          />
        </div>

        {/* Winner Overlay */}
        {winner && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-500">
            <div className={`p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] glass-card text-center border-4 relative overflow-hidden ${winner === 'A' ? 'border-cyan-500 shadow-[0_0_100px_rgba(6,182,212,0.6)]' : 'border-pink-500 shadow-[0_0_100px_rgba(236,72,153,0.6)]'}`}>
              {/* Background ambient light */}
              <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-20 ${winner === 'A' ? 'bg-cyan-500' : 'bg-pink-500'}`}></div>
              <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 ${winner === 'A' ? 'bg-cyan-500' : 'bg-pink-500'}`}></div>

              <div className="mb-6 md:mb-10 inline-block relative">
                <div className={`w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center border-4 mb-4 mx-auto animate-bounce ${winner === 'A' ? 'border-cyan-500 text-cyan-500' : 'border-pink-500 text-pink-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                  </svg>
                </div>
              </div>

              <h2 className={`text-3xl md:text-7xl font-black font-orbitron mb-6 tracking-tighter uppercase leading-tight ${winner === 'A' ? 'text-cyan-400 neon-text-cyan' : 'text-pink-400 neon-text-magenta'}`}>
                EL EQUIPO {winner === 'A' ? 'A' : 'B'} HA GANADO
              </h2>
              
              <div className="mb-8 md:mb-12">
                <p className="text-sm md:text-2xl font-orbitron text-slate-300 uppercase tracking-[0.2em] md:tracking-[0.5em] font-light">
                  {winner === 'A' ? gameState.teamAName : gameState.teamBName}
                </p>
                <p className="text-[10px] md:text-sm font-mono text-slate-500 mt-2 tracking-widest uppercase">DOMINACIÓN CUÁNTICA COMPLETA</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button 
                  onClick={resetGame}
                  className={`px-8 md:px-12 py-4 md:py-6 font-orbitron font-black text-sm md:text-lg text-black rounded-2xl md:rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl ${winner === 'A' ? 'bg-cyan-500 shadow-cyan-500/50' : 'bg-pink-500 shadow-pink-500/50'}`}
                >
                  INICIAR NUEVA LÍNEA TEMPORAL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Point Modal/Input */}
        {activeInputTeam && !winner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`glass-card p-6 md:p-8 rounded-3xl w-full max-w-sm border-2 ${activeInputTeam === 'A' ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]'}`}>
              <h3 className="font-orbitron text-center mb-4 md:mb-6 text-lg md:text-xl tracking-tighter uppercase">
                Add Points <span className={activeInputTeam === 'A' ? 'text-cyan-400' : 'text-pink-400'}>Team {activeInputTeam}</span>
              </h3>
              <form onSubmit={handleAddPoints} className="space-y-4 md:space-y-6">
                <input 
                  autoFocus
                  type="number" 
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 md:p-6 text-4xl md:text-5xl font-orbitron text-center focus:outline-none focus:border-white transition-all shadow-inner"
                />
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setActiveInputTeam(null)}
                    className="flex-1 py-3 md:py-4 font-orbitron text-[10px] md:text-xs text-slate-400 hover:text-white uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`flex-[2] py-3 md:py-4 font-orbitron font-bold text-xs md:text-sm rounded-xl shadow-lg transition-all active:scale-95 ${
                      activeInputTeam === 'A' ? 'bg-cyan-500 text-black shadow-cyan-500/20' : 'bg-pink-500 text-black shadow-pink-500/20'
                    }`}
                  >
                    CONFIRM DATA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detailed Records and AI - Tablet layout on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Round History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-orbitron text-sm md:text-lg flex items-center gap-2 tracking-widest uppercase">
                <span className="text-cyan-500">_</span> Quantum Record
              </h3>
              <button onClick={() => {if(confirm("Purge Chronology?")) resetGame()}} className="text-[8px] md:text-[10px] font-orbitron text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest">
                Purge Record
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {gameState.rounds.length === 0 ? (
                <div className="text-center py-12 md:py-20 glass-card rounded-2xl md:rounded-3xl border-dashed border-white/10 opacity-30 flex flex-col items-center justify-center">
                   <div className="w-10 h-10 md:w-12 md:h-12 mb-4 border border-white/20 rounded-lg rotate-45 flex items-center justify-center">
                      <div className="w-4 h-4 md:w-6 md:h-6 border border-white/40 rounded-sm"></div>
                   </div>
                  <p className="font-mono text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase px-4">Timeline data null // Awaiting input</p>
                </div>
              ) : (
                gameState.rounds.map((round, idx) => (
                  <div key={round.id} className="glass-card p-4 md:p-5 rounded-xl md:rounded-2xl flex justify-between items-center group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4 md:gap-6">
                      <span className="text-[8px] md:text-[10px] font-mono text-slate-600">ITER_{gameState.rounds.length - idx}</span>
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex flex-col items-center">
                          <span className={`text-xl md:text-2xl font-orbitron ${round.pointsA > 0 ? 'text-cyan-400 font-black' : 'text-slate-700'}`}>{round.pointsA}</span>
                        </div>
                        <div className="h-4 md:h-6 w-px bg-white/10"></div>
                        <div className="flex flex-col items-center">
                          <span className={`text-xl md:text-2xl font-orbitron ${round.pointsB > 0 ? 'text-pink-400 font-black' : 'text-slate-700'}`}>{round.pointsB}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteRound(round.id)}
                      className="p-1 md:p-2 text-slate-600 hover:text-red-500 transition-all opacity-40 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="space-y-4">
            <h3 className="font-orbitron text-sm md:text-lg flex items-center gap-2 tracking-widest uppercase">
              <span className="text-pink-500">_</span> Neural Strategy
            </h3>
            <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-8 border-pink-500/10 flex flex-col min-h-[300px] md:min-h-[350px]">
              {!analysis && !isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 md:space-y-6">
                  <div className="relative">
                     <div className="absolute inset-0 bg-pink-500 blur-2xl opacity-10 animate-pulse"></div>
                     <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-pink-500/40 flex items-center justify-center relative bg-black/40 rotate-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                     </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono tracking-[0.1em] md:tracking-[0.2em] leading-relaxed uppercase">Neural processor online</p>
                  <button 
                    onClick={getAnalysis}
                    disabled={gameState.rounds.length < 1 || !!winner}
                    className="w-full py-3 md:py-4 bg-pink-500 text-black font-orbitron text-[10px] md:text-xs font-bold rounded-xl hover:bg-pink-400 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-pink-500/20 active:scale-95"
                  >
                    START CALCULATION
                  </button>
                </div>
              ) : isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 md:space-y-6">
                  <div className="relative w-12 h-12 md:w-16 md:h-16">
                     <div className="absolute inset-0 border-2 border-pink-500/20 rounded-full"></div>
                     <div className="absolute inset-0 border-t-2 border-pink-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-[10px] font-mono text-pink-500 animate-pulse tracking-widest uppercase text-center">Parsing Temporal Rifts...</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl">
                    <h4 className="text-[10px] font-bold text-pink-500 mb-2 uppercase tracking-widest font-orbitron">Match Status</h4>
                    <p className="text-xs md:text-sm leading-relaxed text-slate-300">{analysis?.summary}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border-l-2 border-pink-500">
                    <h4 className="text-[10px] font-bold text-pink-500 mb-2 uppercase tracking-widest font-orbitron">Prediction</h4>
                    <p className="text-xs md:text-sm leading-relaxed italic text-white">{analysis?.prediction}</p>
                  </div>
                  <div className="hidden sm:block">
                    <h4 className="text-[10px] font-bold text-pink-500 mb-2 md:mb-3 uppercase tracking-widest font-orbitron ml-1">Tactical Protocols</h4>
                    <ul className="space-y-2 md:space-y-3">
                      {analysis?.tips.map((tip, i) => (
                        <li key={i} className="text-[10px] md:text-xs flex gap-2 md:gap-3 p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl border border-white/5">
                          <span className="text-pink-500 font-black font-orbitron">{i+1}</span>
                          <span className="text-slate-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={getAnalysis}
                    className="w-full py-2 md:py-3 border border-pink-500/30 text-[8px] md:text-[10px] font-orbitron text-pink-500 rounded-lg md:rounded-xl hover:bg-pink-500/10 transition-colors uppercase font-bold tracking-widest"
                  >
                    Refresh Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Optimized height */}
      <footer className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-black/80 backdrop-blur-xl border-t border-white/5 text-center z-[50]">
        <p className="text-[8px] md:text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] md:tracking-[0.5em]">
          End-to-End Encryption Enabled // Quantum-Safe Scoring
        </p>
      </footer>
    </div>
  );
};

export default App;
