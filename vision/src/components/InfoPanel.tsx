export interface InfoContent {
  title: string;
  icon?: string;
  number?: number;
  subtitle?: string;
  description: string;
  details?: string[];
  sections?: { title: string; items: string[] }[];
}

export default function InfoPanel({
  content,
  onClose,
}: {
  content: InfoContent;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-[#0d1117]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          {content.number != null && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/80 ring-1 ring-white/20">
              {content.number}
            </span>
          )}
          {content.icon && <span className="shrink-0 text-lg">{content.icon}</span>}
          <h2 className="truncate text-base font-bold text-white">{content.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {content.subtitle && (
          <p className="mb-3 text-xs text-white/40">{content.subtitle}</p>
        )}

        <p className="mb-6 text-sm leading-relaxed text-white/70">{content.description}</p>

        {content.details && content.details.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">要点</h3>
            {content.details.map((d, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
                <span className="mt-0.5 shrink-0 text-[10px] text-cyan-400">◆</span>
                <span className="text-xs text-white/60">{d}</span>
              </div>
            ))}
          </div>
        )}

        {content.sections && content.sections.map((section, i) => (
          <div key={i} className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">{section.title}</h3>
            <div className="space-y-1.5">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
                  <span className="mt-0.5 shrink-0 text-[10px] text-cyan-400">•</span>
                  <span className="text-xs text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

