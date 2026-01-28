import { useApp } from '@/contexts/AppContext';

export default function RulesList() {
  const { data } = useApp();
  const visibleRules = data.rules.filter(r => r.visible);

  if (visibleRules.length === 0) return null;

  return (
    <div className="border-2 border-foreground rounded-xl p-5 bg-foreground/5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📜</span>
        <h3 className="text-xl font-bold text-foreground">우리의 룰</h3>
      </div>

      <ul className="space-y-3">
        {visibleRules
          .sort((a, b) => a.order - b.order)
          .map((rule, idx) => (
            <li
              key={rule.id}
              className="flex items-start gap-3 text-body text-foreground bg-background rounded-lg p-3 border border-border"
            >
              <span className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center text-small font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="font-medium pt-0.5">{rule.text}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
