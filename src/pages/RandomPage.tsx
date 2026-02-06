import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Mode = 'roulette' | 'ladder';

export default function RandomPage() {
  const { data } = useApp();
  const [mode, setMode] = useState<Mode>('roulette');
  const members = data.users.filter(u => !u.isAdmin);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">🎲 랜덤 뽑기</h1>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">BETA</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">누가 걸릴까? 운명의 선택! 🎯</p>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 mb-6 bg-secondary/70 rounded-xl">
          <button
            onClick={() => setMode('roulette')}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'roulette'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🎡 룰렛
          </button>
          <button
            onClick={() => setMode('ladder')}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'ladder'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🪜 사다리타기
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'roulette' ? (
            <motion.div key="roulette" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RouletteGame members={members} />
            </motion.div>
          ) : (
            <motion.div key="ladder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LadderGame members={members} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Roulette ───

interface Member {
  id: number;
  nickname: string;
  emoji: string;
}

const COLORS = [
  'hsl(0, 70%, 60%)', 'hsl(30, 70%, 55%)', 'hsl(50, 70%, 50%)',
  'hsl(120, 50%, 50%)', 'hsl(180, 50%, 50%)', 'hsl(210, 60%, 55%)',
  'hsl(250, 55%, 60%)', 'hsl(280, 50%, 55%)', 'hsl(320, 55%, 55%)',
  'hsl(350, 65%, 55%)',
];

function RouletteGame({ members }: { members: Member[] }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Member | null>(null);
  const currentRotation = useRef(0);

  const spin = useCallback(() => {
    if (spinning || members.length === 0) return;
    setSpinning(true);
    setWinner(null);

    const extraSpins = 5 + Math.random() * 5; // 5-10 full rotations
    const randomAngle = Math.random() * 360;
    const totalRotation = currentRotation.current + extraSpins * 360 + randomAngle;

    setRotation(totalRotation);
    currentRotation.current = totalRotation;

    setTimeout(() => {
      // Calculate which segment the pointer lands on
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const segmentAngle = 360 / members.length;
      const winnerIndex = Math.floor(normalizedAngle / segmentAngle);
      const selected = members[winnerIndex % members.length];
      setWinner(selected);
      setSpinning(false);
      toast.success(`${selected.emoji} ${selected.nickname} 당첨! 🎉`);
    }, 4000);
  }, [spinning, members]);

  const reset = () => {
    setWinner(null);
    setRotation(0);
    currentRotation.current = 0;
  };

  const segmentAngle = 360 / members.length;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-2xl">▼</div>

        {/* Wheel SVG */}
        <motion.svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-lg"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.3, 1] }}
        >
          {members.map((member, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);
            const largeArc = segmentAngle > 180 ? 1 : 0;

            const x1 = 150 + 140 * Math.cos(startRad);
            const y1 = 150 + 140 * Math.sin(startRad);
            const x2 = 150 + 140 * Math.cos(endRad);
            const y2 = 150 + 140 * Math.sin(endRad);

            const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
            const textX = 150 + 95 * Math.cos(midAngle);
            const textY = 150 + 95 * Math.sin(midAngle);
            const textRotation = (startAngle + endAngle) / 2;

            return (
              <g key={member.id}>
                <path
                  d={`M 150 150 L ${x1} ${y1} A 140 140 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={COLORS[i % COLORS.length]}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {member.emoji}{member.nickname}
                </text>
              </g>
            );
          })}
          {/* Center circle */}
          <circle cx="150" cy="150" r="20" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" />
        </motion.svg>
      </div>

      {/* Result */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center px-6 py-4 bg-secondary rounded-xl"
          >
            <p className="text-2xl font-bold">{winner.emoji} {winner.nickname}</p>
            <p className="text-sm text-muted-foreground mt-1">당첨! 🎉</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={spin}
          disabled={spinning || members.length === 0}
          size="lg"
          className="rounded-xl px-8"
        >
          {spinning ? '돌리는 중...' : '🎡 돌리기!'}
        </Button>
        <Button variant="outline" onClick={reset} size="lg" className="rounded-xl">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Ladder ───

interface LadderLine {
  fromIdx: number;
  toIdx: number;
  y: number;
}

function LadderGame({ members }: { members: Member[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [results, setResults] = useState<Member[]>([]);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [lines, setLines] = useState<LadderLine[]>([]);
  const [selectedRunner, setSelectedRunner] = useState<number | null>(null);
  const [tracePath, setTracePath] = useState<{x: number, y: number}[]>([]);
  const [animatedPathLen, setAnimatedPathLen] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [winnerCount, setWinnerCount] = useState(1);
  const [winnerSlots, setWinnerSlots] = useState<Set<number>>(new Set());

  const count = members.length;
  const canvasWidth = Math.max(count * 60, 320);
  const canvasHeight = 400;
  const topY = 60;
  const bottomY = canvasHeight - 60;
  const gap = canvasWidth / (count + 1);

  // Generate random ladder lines
  const generateLines = useCallback(() => {
    const newLines: LadderLine[] = [];
    const numRows = 8 + Math.floor(Math.random() * 5);

    for (let row = 0; row < numRows; row++) {
      const y = topY + ((bottomY - topY) / (numRows + 1)) * (row + 1);
      const usedCols = new Set<number>();

      for (let col = 0; col < count - 1; col++) {
        if (usedCols.has(col)) continue;
        if (Math.random() > 0.5) {
          newLines.push({ fromIdx: col, toIdx: col + 1, y });
          usedCols.add(col);
          usedCols.add(col + 1);
        }
      }
    }
    return newLines;
  }, [count, topY, bottomY]);

  // Trace path from a starting column
  const traceLadder = useCallback((startIdx: number, ladderLines: LadderLine[]) => {
    let currentCol = startIdx;
    const sortedLines = [...ladderLines].sort((a, b) => a.y - b.y);
    const path: {x: number, y: number}[] = [];

    path.push({ x: (currentCol + 1) * gap, y: topY });

    for (const line of sortedLines) {
      if (line.fromIdx === currentCol) {
        path.push({ x: (currentCol + 1) * gap, y: line.y });
        currentCol = line.toIdx;
        path.push({ x: (currentCol + 1) * gap, y: line.y });
      } else if (line.toIdx === currentCol) {
        path.push({ x: (currentCol + 1) * gap, y: line.y });
        currentCol = line.fromIdx;
        path.push({ x: (currentCol + 1) * gap, y: line.y });
      }
    }

    path.push({ x: (currentCol + 1) * gap, y: bottomY });

    return { endIdx: currentCol, path };
  }, [gap, topY, bottomY]);

  const startLadder = useCallback(() => {
    if (running) return;
    setRunning(true);
    setRevealed(false);
    setSelectedRunner(null);
    setTracePath([]);

    const newLines = generateLines();
    setLines(newLines);

    // Randomly pick which bottom slots are "당첨"
    const slots = new Set<number>();
    const available = Array.from({ length: count }, (_, i) => i);
    const actualWinners = Math.min(winnerCount, count - 1);
    for (let i = 0; i < actualWinners; i++) {
      const randIdx = Math.floor(Math.random() * available.length);
      slots.add(available[randIdx]);
      available.splice(randIdx, 1);
    }
    setWinnerSlots(slots);

    // Compute results for all
    const shuffledResults: Member[] = new Array(count);
    const endPositions = new Map<number, number>();

    for (let i = 0; i < count; i++) {
      const { endIdx } = traceLadder(i, newLines);
      endPositions.set(i, endIdx);
    }

    for (let i = 0; i < count; i++) {
      shuffledResults[endPositions.get(i)!] = members[i];
    }

    setResults(shuffledResults);

    setTimeout(() => {
      setRunning(false);
      setRevealed(true);
      const winners = Array.from(slots).map(slot => shuffledResults[slot]);
      const winnerNames = winners.map(w => `${w.emoji} ${w.nickname}`).join(', ');
      toast.success(`당첨: ${winnerNames} 🎉`);
    }, 800);
  }, [running, count, members, generateLines, traceLadder, winnerCount]);

  const handleSelectRunner = (idx: number) => {
    if (!revealed || isAnimating) return;
    setSelectedRunner(idx);
    const { path } = traceLadder(idx, lines);
    setTracePath(path);
    setAnimatedPathLen(0);
    setIsAnimating(true);
  };

  // Animate the path drawing progressively
  useEffect(() => {
    if (!isAnimating || tracePath.length === 0) return;

    if (animatedPathLen >= tracePath.length) {
      setIsAnimating(false);
      return;
    }

    const timer = setTimeout(() => {
      setAnimatedPathLen(prev => prev + 1);
    }, 60);

    return () => clearTimeout(timer);
  }, [isAnimating, animatedPathLen, tracePath.length]);

  // Draw ladder
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw vertical lines
    ctx.strokeStyle = 'hsl(0, 0%, 70%)';
    ctx.lineWidth = 2;
    for (let i = 0; i < count; i++) {
      const x = (i + 1) * gap;
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.stroke();
    }

    // Draw horizontal lines (rungs)
    ctx.strokeStyle = 'hsl(0, 0%, 55%)';
    ctx.lineWidth = 2;
    for (const line of lines) {
      const x1 = (line.fromIdx + 1) * gap;
      const x2 = (line.toIdx + 1) * gap;
      ctx.beginPath();
      ctx.moveTo(x1, line.y);
      ctx.lineTo(x2, line.y);
      ctx.stroke();
    }

    // Draw traced path (animated)
    if (tracePath.length > 1 && animatedPathLen > 0) {
      const drawLen = Math.min(animatedPathLen, tracePath.length);
      ctx.strokeStyle = COLORS[selectedRunner! % COLORS.length];
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(tracePath[0].x, tracePath[0].y);
      for (let i = 1; i < drawLen; i++) {
        ctx.lineTo(tracePath[i].x, tracePath[i].y);
      }
      ctx.stroke();

      // Draw a dot at the current position
      if (drawLen > 0 && drawLen < tracePath.length) {
        const pos = tracePath[drawLen - 1];
        ctx.fillStyle = COLORS[selectedRunner! % COLORS.length];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [lines, tracePath, animatedPathLen, selectedRunner, count, gap, topY, bottomY, canvasWidth, canvasHeight]);

  const reset = () => {
    setLines([]);
    setResults([]);
    setRevealed(false);
    setSelectedRunner(null);
    setTracePath([]);
    setAnimatedPathLen(0);
    setIsAnimating(false);
    setWinnerSlots(new Set());
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top names */}
      <div className="flex justify-center w-full overflow-x-auto">
        <div className="flex" style={{ width: canvasWidth }}>
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => handleSelectRunner(i)}
              style={{ width: gap, left: gap * 0.5 }}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 transition-all text-center',
                revealed ? 'cursor-pointer hover:opacity-70' : 'cursor-default',
                selectedRunner === i && 'scale-110'
              )}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className={cn(
                'text-[10px] font-medium truncate max-w-[50px]',
                selectedRunner === i ? 'text-foreground font-bold' : 'text-muted-foreground'
              )}>
                {m.nickname}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-x-auto w-full flex justify-center border border-border rounded-xl bg-secondary/20 p-2">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block"
        />
      </div>

      {/* Bottom labels: 당첨 / 통과 */}
      <div className="flex justify-center w-full overflow-x-auto">
        <div className="flex" style={{ width: canvasWidth }}>
          {Array.from({ length: count }).map((_, i) => {
            const isWinner = winnerSlots.has(i);
            return (
              <div key={i} style={{ width: gap }} className="flex flex-col items-center gap-0.5 text-center">
                {revealed ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className={cn(
                      'text-xs font-bold px-2 py-1 rounded-full',
                      isWinner
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    )}>
                      {isWinner ? '당첨!' : '통과'}
                    </span>
                    {results[i] && (
                      <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[50px]">
                        {results[i].emoji}{results[i].nickname}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-lg">❓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Winner Count Selector */}
      <div className="flex items-center gap-3 px-4 py-2 bg-secondary/50 rounded-xl">
        <span className="text-sm text-muted-foreground">당첨자 수</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))}
            disabled={winnerCount <= 1}
            className="w-7 h-7 rounded-lg border border-border text-sm font-bold hover:bg-secondary disabled:opacity-30"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-bold">{winnerCount}</span>
          <button
            onClick={() => setWinnerCount(Math.min(count - 1, winnerCount + 1))}
            disabled={winnerCount >= count - 1}
            className="w-7 h-7 rounded-lg border border-border text-sm font-bold hover:bg-secondary disabled:opacity-30"
          >
            +
          </button>
        </div>
        <span className="text-xs text-muted-foreground">/ {count}명</span>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-2">
        <Button
          onClick={startLadder}
          disabled={running || members.length < 2}
          size="lg"
          className="rounded-xl px-8"
        >
          {running ? '생성 중...' : '🪜 사다리 만들기!'}
        </Button>
        <Button variant="outline" onClick={reset} size="lg" className="rounded-xl">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
