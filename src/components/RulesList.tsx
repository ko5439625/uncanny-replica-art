import { useApp } from '@/contexts/AppContext';

export default function RulesList() {
  const { data } = useApp();
  const visibleRules = data.rules.filter(r => r.visible);

  if (visibleRules.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📜</span>
        <h3 className="text-h3 text-foreground">우리의 룰</h3>
      </div>

      <ul className="space-y-2">
        {visibleRules
          .sort((a, b) => a.order - b.order)
          .map((rule, idx) => (
            <li
              key={rule.id}
              className="flex items-start gap-2 text-body text-foreground"
            >
              <span className="text-muted-foreground">{idx + 1}.</span>
              <span>{rule.text}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
