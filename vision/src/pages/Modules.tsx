import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InfoPanel from '../components/InfoPanel';
import type { InfoContent } from '../components/InfoPanel';
import { moduleList, categoryLabels } from '../data/modules';

type CategoryFilter = 'all' | 'core' | 'integrate' | 'extend';

const categoryTagColors: Record<string, string> = {
  core: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  integrate: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  extend: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
};

const filters: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'core', label: '核心模块' },
  { key: 'integrate', label: '集成模块' },
  { key: 'extend', label: '扩展模块' },
];

export default function Modules() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selected, setSelected] = useState<InfoContent | null>(null);

  const filtered = category === 'all'
    ? moduleList
    : moduleList.filter(m => m.category === category);

  const handleSelect = (mod: typeof moduleList[number]) => {
    setSelected({
      title: mod.title,
      icon: mod.icon,
      number: mod.number,
      subtitle: mod.subtitle,
      description: mod.description,
      sections: [
        { title: '核心概念', items: mod.keyConcepts },
        { title: '相关阅读', items: [mod.reading] },
      ],
    });
  };

  return (
    <div className="flex h-full w-full bg-[#0a0a0a]">
      {/* 左侧网格 */}
      <div className={`h-full overflow-y-auto transition-all duration-300 ${selected ? 'w-[56%]' : 'w-full'}`}>
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">核心模块总览</h1>
              <p className="mt-0.5 text-xs text-white/40">
                {filtered.length} / {moduleList.length} 个模块
              </p>
            </div>

            <div className="flex gap-1.5 rounded-xl bg-white/5 p-1">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setCategory(f.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    category === f.key
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filtered.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => handleSelect(mod)}
                className="group relative flex cursor-pointer flex-col rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[2%] p-5 transition-all duration-200 hover:border-cyan-500/30 hover:bg-white/[4%]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-3xl">{mod.icon}</span>
                  <span className="text-xs font-mono text-white/20">
                    #{String(mod.number).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white/90">{mod.title}</h3>
                <p className="mt-0.5 text-xs text-white/40">{mod.subtitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60 line-clamp-2">
                  {mod.description}
                </p>

                <div className="mt-auto flex items-end justify-between pt-4">
                  <div className="flex flex-wrap gap-2">
                    {mod.keyConcepts.slice(0, 3).map((concept, j) => (
                      <span key={j} className="flex items-center gap-1 text-[10px] text-white/40">
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        {concept.length > 12 ? concept.slice(0, 12) + '…' : concept}
                      </span>
                    ))}
                  </div>
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${categoryTagColors[mod.category]}`}>
                    {categoryLabels[mod.category]}
                  </span>
                </div>
              </motion.div>
            ))}
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
            <InfoPanel content={selected} onClose={() => setSelected(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
