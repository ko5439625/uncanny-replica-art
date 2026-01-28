import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BalanceGame() {
  const { data, voteBalanceGame } = useApp();
  const game = data.balanceGame.active;

  if (!game) {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">⚔️</span>
          <h3 className="text-h3 text-foreground">이번 주 밸런스 게임</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          아직 진행 중인 게임이 없어요 😴
        </p>
      </div>
    );
  }

  const totalVotes = game.votesA.length + game.votesB.length;
  const percentA = totalVotes > 0 ? Math.round((game.votesA.length / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? Math.round((game.votesB.length / totalVotes) * 100) : 50;

  const hasVoted = data.currentUser
    ? game.votesA.includes(data.currentUser.id) || game.votesB.includes(data.currentUser.id)
    : false;

  const userVote = data.currentUser
    ? game.votesA.includes(data.currentUser.id)
      ? 'A'
      : game.votesB.includes(data.currentUser.id)
        ? 'B'
        : null
    : null;

  const handleVote = (option: 'A' | 'B') => {
    if (hasVoted) {
      toast.error('이미 투표했어요! 😅');
      return;
    }
    voteBalanceGame(option);
    toast.success('투표 완료! 🗳️');
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚔️</span>
        <h3 className="text-h3 text-foreground">이번 주 밸런스 게임</h3>
      </div>

      <div className="flex gap-3">
        {/* Option A */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVote('A')}
          disabled={hasVoted}
          className={cn(
            'flex-1 p-4 rounded-xl border-2 transition-all relative overflow-hidden',
            userVote === 'A'
              ? 'border-primary bg-primary/10'
              : hasVoted
                ? 'border-border bg-muted/50'
                : 'border-border hover:border-primary/50'
          )}
        >
          {hasVoted && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentA}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute bottom-0 left-0 h-1 bg-primary"
            />
          )}
          <p className="text-body font-semibold mb-2">{game.optionA}</p>
          {hasVoted && (
            <p className="text-h2 text-primary">{percentA}%</p>
          )}
          {userVote === 'A' && (
            <span className="absolute top-2 right-2 text-xs">✓</span>
          )}
        </motion.button>

        {/* VS */}
        <div className="flex items-center">
          <span className="text-muted-foreground font-bold">VS</span>
        </div>

        {/* Option B */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVote('B')}
          disabled={hasVoted}
          className={cn(
            'flex-1 p-4 rounded-xl border-2 transition-all relative overflow-hidden',
            userVote === 'B'
              ? 'border-secondary bg-secondary/10'
              : hasVoted
                ? 'border-border bg-muted/50'
                : 'border-border hover:border-secondary/50'
          )}
        >
          {hasVoted && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentB}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute bottom-0 left-0 h-1 bg-secondary"
            />
          )}
          <p className="text-body font-semibold mb-2">{game.optionB}</p>
          {hasVoted && (
            <p className="text-h2 text-secondary">{percentB}%</p>
          )}
          {userVote === 'B' && (
            <span className="absolute top-2 right-2 text-xs">✓</span>
          )}
        </motion.button>
      </div>

      {totalVotes > 0 && (
        <p className="text-center text-caption text-muted-foreground mt-3">
          총 {totalVotes}명 투표 완료
        </p>
      )}
    </div>
  );
}
