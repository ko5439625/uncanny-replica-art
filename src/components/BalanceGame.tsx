import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BalanceGame() {
  const { data, voteBalanceGame } = useApp();
  const game = data.balanceGame.active;

  if (!game) {
    return (
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">⚔️</span>
          <h3 className="text-lg font-bold text-foreground">밸런스 게임</h3>
        </div>
        <p className="text-center text-muted-foreground py-8">
          아직 진행 중인 게임이 없어요
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
    if (!data.currentUser) {
      toast.error('로그인이 필요해요');
      return;
    }
    if (hasVoted) {
      toast.error('이미 투표했어요!');
      return;
    }
    voteBalanceGame(option);
    toast.success('투표 완료! 🗳️');
  };

  return (
    <div className="border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚔️</span>
        <h3 className="text-lg font-bold text-foreground">밸런스 게임</h3>
        {totalVotes > 0 && (
          <span className="text-caption text-muted-foreground ml-auto">
            {totalVotes}명 참여
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Option A */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVote('A')}
          disabled={hasVoted}
          className={cn(
            'p-4 rounded-lg border-2 transition-all relative overflow-hidden text-left',
            userVote === 'A'
              ? 'border-foreground bg-foreground text-background'
              : hasVoted
                ? 'border-border bg-secondary'
                : 'border-border hover:border-foreground cursor-pointer'
          )}
        >
          <p className="text-body font-semibold mb-1">{game.optionA}</p>
          {hasVoted && (
            <p className={cn(
              'text-2xl font-bold',
              userVote === 'A' ? 'text-background' : 'text-foreground'
            )}>
              {percentA}%
            </p>
          )}
          {!hasVoted && (
            <p className="text-caption text-muted-foreground">클릭하여 투표</p>
          )}
          {userVote === 'A' && (
            <span className="absolute top-2 right-2 text-sm">✓</span>
          )}
        </motion.button>

        {/* Option B */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVote('B')}
          disabled={hasVoted}
          className={cn(
            'p-4 rounded-lg border-2 transition-all relative overflow-hidden text-left',
            userVote === 'B'
              ? 'border-foreground bg-foreground text-background'
              : hasVoted
                ? 'border-border bg-secondary'
                : 'border-border hover:border-foreground cursor-pointer'
          )}
        >
          <p className="text-body font-semibold mb-1">{game.optionB}</p>
          {hasVoted && (
            <p className={cn(
              'text-2xl font-bold',
              userVote === 'B' ? 'text-background' : 'text-foreground'
            )}>
              {percentB}%
            </p>
          )}
          {!hasVoted && (
            <p className="text-caption text-muted-foreground">클릭하여 투표</p>
          )}
          {userVote === 'B' && (
            <span className="absolute top-2 right-2 text-sm">✓</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
