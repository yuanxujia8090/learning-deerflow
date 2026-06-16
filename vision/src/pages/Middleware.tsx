import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InfoPanel from '../components/InfoPanel';
import type { InfoContent } from '../components/InfoPanel';
import { middlewareList } from '../data/middleware';
import type { MiddlewareFilter } from '../data/middleware';

const phaseLabels: Record<string, string> = {
  before: '前置', after: '后置', both: '前后',
};

const phaseTagColors: Record<string, string> = {
  before: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  after: 'border-green-500/50 bg-green-500/10 text-green-300',
  both: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
};

const cardBorders: Record<string, string> = {
  before: 'border-blue-500/40 hover:border-blue-400/60',
  after: 'border-green-500/40 hover:border-green-400/60',
  both: 'border-purple-500/40 hover:border-purple-400/60',
};

const filters: { key: MiddlewareFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'before', label: 'before' },
  { key: 'after', label: 'after' },
  { key: 'both', label: 'both' },
];

/* ── 管线汇总图组件 ── */

function PhaseBadge({ mw, isSelected, onClick }: {
  mw: typeof middlewareList[number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = phaseTagColors[mw.phase];
  return (
    <button
      onClick={onClick}
      className={`
        flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5
        text-[11px] font-medium transition-all duration-150 cursor-pointer
        ${isSelected
          ? `${colors} ring-1 ring-white/30 scale-105`
          : 'border-white/10 bg-white/[0.03] text-white/40 hover:bg-white/10 hover:text-white/70 hover:border-white/20'
        }
      `}
    >
      <span className="text-[10px] opacity-50">{mw.number}</span>
      <span className="whitespace-nowrap">{mw.name.replace('Middleware', '').replace('Queue', '')}</span>
    </button>
  );
}

function PipelineOverview({ onSelect, selectedNumber }: {
  onSelect: (mw: typeof middlewareList[number]) => void;
  selectedNumber: number | null;
}) {
  const beforeItems = middlewareList.filter(m => m.phase === 'before');
  const afterItems = middlewareList.filter(m => m.phase === 'after');
  const bothItems = middlewareList.filter(m => m.phase === 'both');

  return (
    <div className="rounded-xl border border-white/10 bg-[#161b22]/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-bold text-white/80">管线总览</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> 前置 {beforeItems.length}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> 前后 {bothItems.length}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> 后置 {afterItems.length}</span>
        </div>
      </div>

      {/* BEFORE 阶段 */}
      <div className="relative mb-1 rounded-lg bg-blue-500/[0.04] border border-blue-500/10 px-4 py-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-400/60">BEFORE · 前置处理 (8)</div>
        <div className="flex flex-wrap gap-2">
          {beforeItems.map(mw => (
            <PhaseBadge
              key={mw.number}
              mw={mw}
              isSelected={selectedNumber === mw.number}
              onClick={() => onSelect(mw)}
            />
          ))}
        </div>
      </div>

      {/* 连接箭头 → Agent Core */}
      <div className="flex flex-col items-center py-2">
        <svg width="16" height="20" className="text-white/20">
          <line x1="8" y1="0" x2="8" y2="14" stroke="currentColor" strokeWidth="2" />
          <polygon points="3,12 8,20 13,12" fill="currentColor" />
        </svg>
      </div>

      {/* Agent Core */}
      <div className="mx-auto mb-1 w-fit rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-8 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">💠</span>
          <div>
            <div className="text-sm font-bold text-amber-300/90">Agent Core</div>
            <div className="text-[10px] text-amber-400/40">LLM 推理 + ToolNode 工具执行</div>
          </div>
        </div>
      </div>

      {/* 连接箭头 到 AFTER */}
      <div className="flex flex-col items-center py-2">
        <svg width="16" height="20" className="text-white/20">
          <line x1="8" y1="0" x2="8" y2="14" stroke="currentColor" strokeWidth="2" />
          <polygon points="3,12 8,20 13,12" fill="currentColor" />
        </svg>
      </div>

      {/* AFTER 阶段 */}
      <div className="rounded-lg bg-green-500/[0.04] border border-green-500/10 px-4 py-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-green-400/60">AFTER · 后置处理 (5)</div>
        <div className="flex flex-wrap gap-2">
          {afterItems.map(mw => (
            <PhaseBadge
              key={mw.number}
              mw={mw}
              isSelected={selectedNumber === mw.number}
              onClick={() => onSelect(mw)}
            />
          ))}
        </div>
      </div>

      {/* BOTH 标注 */}
      {bothItems.length > 0 && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-purple-500/[0.03] border border-purple-500/10 px-4 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400/60">BOTH · 前后都执行 (1)</span>
          <div className="flex gap-2 ml-2">
            {bothItems.map(mw => (
              <PhaseBadge
                key={mw.number}
                mw={mw}
                isSelected={selectedNumber === mw.number}
                onClick={() => onSelect(mw)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 连接线 ── */

function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-6 bg-gradient-to-b from-white/10 to-white/20" />
      <svg width="10" height="6" viewBox="0 0 10 6" className="text-white/20">
        <polygon points="5,6 0,0 10,0" fill="currentColor" />
      </svg>
    </div>
  );
}

/* ── 主页面 ── */

export default function Middleware() {
  const [filter, setFilter] = useState<MiddlewareFilter>('all');
  const [selected, setSelected] = useState<InfoContent | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const filtered = filter === 'all'
    ? middlewareList
    : middlewareList.filter(m => m.phase === filter);

  const handleSelect = (mw: typeof middlewareList[number]) => {
    const sections: { title: string; items: string[] }[] = [];
    if (mw.configExample) {
      sections.push({ title: '配置示例', items: [mw.configExample] });
    }
    setSelectedNumber(mw.number);
    setSelected({
      title: mw.name,
      number: mw.number,
      subtitle: phaseLabels[mw.phase] || mw.phase,
      description: mw.description,
      details: [mw.purpose],
      sections: sections.length > 0 ? sections : undefined,
    });

    // 滚动到列表中的对应项
    setFilter('all');
    setTimeout(() => {
      const el = itemRefs.current[mw.number];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleListClick = (mw: typeof middlewareList[number]) => {
    setSelectedNumber(mw.number);
    const sections: { title: string; items: string[] }[] = [];
    if (mw.configExample) {
      sections.push({ title: '配置示例', items: [mw.configExample] });
    }
    setSelected({
      title: mw.name,
      number: mw.number,
      subtitle: phaseLabels[mw.phase] || mw.phase,
      description: mw.description,
      details: [mw.purpose],
      sections: sections.length > 0 ? sections : undefined,
    });
  };

  return (
    <div className="flex h-full w-full bg-[#0a0a0a]">
      {/* 左侧 */}
      <div className={`h-full transition-all duration-300 flex flex-col ${selected ? 'w-[56%]' : 'w-full'}`}>
        {/* 管线汇总图（固定高度） */}
        <div className="shrink-0 border-b border-white/5 px-6 pb-4 pt-5">
          <PipelineOverview
            onSelect={handleSelect}
            selectedNumber={selectedNumber}
          />
        </div>

        {/* 详细列表（可滚动） */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          <div className="px-6 pb-6">
            {/* 控制栏 */}
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-[#0a0a0a] pt-4 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-white/40">详细列表</h2>
                <span className="text-[10px] text-white/20">({filtered.length} / 14)</span>
              </div>
              <div className="flex gap-1.5 rounded-xl bg-white/5 p-1">
                {filters.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      filter === f.key
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 列表 */}
            <div className="relative pl-12">
              <div className="absolute left-[18px] top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-white/5 via-white/10 to-transparent" />
              {filtered.map((mw, i) => (
                <div key={mw.number}>
                  {i > 0 && <Connector />}
                  <div ref={(el) => { itemRefs.current[mw.number] = el; }}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      onClick={() => handleListClick(mw)}
                      className={`group relative cursor-pointer rounded-xl border bg-[#161b22] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-125 ${
                        selectedNumber === mw.number
                          ? `${cardBorders[mw.phase]} ring-1 ring-white/20`
                          : cardBorders[mw.phase]
                      }`}
                    >
                      <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#161b22] text-xs font-bold text-white/60 ring-1 ring-white/10">
                        {mw.number}
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white/90">{mw.name}</span>
                            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${phaseTagColors[mw.phase]}`}>
                              {mw.phase}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-white/50 line-clamp-2">{mw.description}</p>
                        </div>
                        <span className="mt-0.5 shrink-0 text-xs text-white/20 opacity-0 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧 InfoPanel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '44%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full overflow-hidden border-l border-white/10 shrink-0"
          >
            <InfoPanel content={selected} onClose={() => { setSelected(null); setSelectedNumber(null); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
