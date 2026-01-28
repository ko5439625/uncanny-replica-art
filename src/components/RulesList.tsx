import { useApp } from '@/contexts/AppContext';

export default function RulesList() {
  const { data } = useApp();
  const visibleRules = data.rules.filter(r => r.visible);

  if (visibleRules.length === 0) return null;

  return (
    <div className="border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📜</span>
        <h3 className="text-lg font-bold text-foreground">우리의 룰</h3>
      </div>

      <ul className="space-y-2">
        {visibleRules
          .sort((a, b) => a.order - b.order)
          .map((rule, idx) => (
            <li
              key={rule.id}
              className="flex items-start gap-3 text-body text-foreground"
            >
              <span className="w-6 h-6 bg-secondary rounded flex items-center justify-center text-small font-medium text-muted-foreground shrink-0">
                {idx + 1}
              </span>
              <span>{rule.text}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
