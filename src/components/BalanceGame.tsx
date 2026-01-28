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
    // 이미 같은 옵션에 투표한 경우 취소
    if (userVote === option) {
      voteBalanceGame(option); // 토글로 취소
      toast.success('투표 취소됨');
      return;
    }
    // 다른 옵션으로 변경하거나 새로 투표
    voteBalanceGame(option);
    toast.success(hasVoted ? '선택 변경! 🔄' : '투표 완료! 🗳️');
  };

  return (
    <div className="border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">⚔️</span>
        <h3 className="text-xl font-bold text-foreground">밸런스 게임</h3>
        {totalVotes > 0 && (
          <span className="text-caption text-muted-foreground ml-auto">
            {totalVotes}명 참여
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Option A */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVote('A')}
          className={cn(
            'p-5 rounded-xl border-2 transition-all relative overflow-hidden text-left cursor-pointer min-h-[120px]',
            userVote === 'A'
              ? 'border-foreground bg-foreground text-background'
              : 'border-border hover:border-foreground'
          )}
        >
          <p className="text-body font-semibold mb-2 leading-snug">{game.optionA}</p>
          {hasVoted && (
            <p className={cn(
              'text-3xl font-bold',
              userVote === 'A' ? 'text-background' : 'text-foreground'
            )}>
              {percentA}%
            </p>
          )}
          {!hasVoted && (
            <p className="text-caption text-muted-foreground">클릭하여 투표</p>
          )}
          {userVote === 'A' && (
            <span className="absolute top-3 right-3 text-lg">✓</span>
          )}
        </motion.button>

        {/* Option B */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleVote('B')}
          className={cn(
            'p-5 rounded-xl border-2 transition-all relative overflow-hidden text-left cursor-pointer min-h-[120px]',
            userVote === 'B'
              ? 'border-foreground bg-foreground text-background'
              : 'border-border hover:border-foreground'
          )}
        >
          <p className="text-body font-semibold mb-2 leading-snug">{game.optionB}</p>
          {hasVoted && (
            <p className={cn(
              'text-3xl font-bold',
              userVote === 'B' ? 'text-background' : 'text-foreground'
            )}>
              {percentB}%
            </p>
          )}
          {!hasVoted && (
            <p className="text-caption text-muted-foreground">클릭하여 투표</p>
          )}
          {userVote === 'B' && (
            <span className="absolute top-3 right-3 text-lg">✓</span>
          )}
        </motion.button>
      </div>

      {/* 변경 안내 */}
      {hasVoted && (
        <p className="text-center text-small text-muted-foreground mt-3">
          다시 클릭하면 선택을 바꿀 수 있어요
        </p>
      )}
    </div>
  );
}
