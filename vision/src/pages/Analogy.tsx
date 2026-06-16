import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InfoPanel from '../components/InfoPanel';
import type { InfoContent } from '../components/InfoPanel';
import { analogyList, categoryOrder } from '../data/analogy';

const categories = ['全部', ...categoryOrder];

const categoryColors: Record<string, string> = {
  '架构模式': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '状态管理': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  '数据隔离': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '执行环境': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '扩展机制': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  '持久化': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  '类型系统': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'API 设计': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  '基础设施': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  '流程编排': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  '生命周期': 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  '错误处理': 'bg-red-500/20 text-red-300 border-red-500/30',
  '性能优化': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

export default function Analogy() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = activeCategory === '全部'
    ? analogyList
    : analogyList.filter(a => a.category === activeCategory);

  const selectedItem = selected != null ? analogyList[selected] : null;

  const panelContent: InfoContent | null = selectedItem
    ? {
        title: `${selectedItem.frontend} → ${selectedItem.deerflow}`,
        description: selectedItem.explanation,
        sections: [
          {
            title: '分类',
            items: [selectedItem.category],
          },
          {
            title: '同分类类比推荐',
            items: analogyList
              .filter(a => a.category === selectedItem.category && a.frontend !== selectedItem.frontend)
              .map(a => `${a.frontend} → ${a.deerflow}`),
          },
        ],
      }
    : null;

  return (
    <div className="flex h-full w-full bg-[#0a0a0a]">
      {/* 左侧类比图谱 */}
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ${selected != null ? 'w-[56%]' : 'w-full'}`}>
        <div className="flex-shrink-0 border-b border-white/5 bg-[#0d1117]/80 px-8 py-6 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white">前端开发者的概念对照</h1>
          <p className="mt-1 text-sm text-white/40">
            用你熟悉的前端概念映射 DeerFlow 后端设计
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSelected(null); }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-white/15 text-white ring-1 ring-white/30'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <AnimatePresence>
              {filtered.map((item, i) => {
                const realIndex = analogyList.indexOf(item);
                return (
                  <motion.button
                    key={item.frontend}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    onClick={() => setSelected(realIndex === selected ? null : realIndex)}
                    className={`group relative overflow-hidden rounded-xl border text-left transition-colors duration-200 ${
                      selected === realIndex
                        ? 'border-white/30 bg-[#161b22] shadow-lg shadow-white/5'
                        : 'border-white/5 bg-[#161b22]/80 hover:border-white/20 hover:bg-[#1c2333]'
                    }`}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex-1 rounded-lg bg-gradient-to-r from-cyan-900/20 to-transparent px-3 py-2.5">
                        <div className="text-xs text-white/30">前端</div>
                        <div className="text-sm font-semibold text-cyan-300">{item.frontend}</div>
                      </div>

                      <div className="flex shrink-0 items-center justify-center">
                        <span className="text-xs text-white/30 transition-colors group-hover:text-white/50">→</span>
                      </div>

                      <div className="flex-1 rounded-lg bg-gradient-to-l from-amber-900/20 to-transparent px-3 py-2.5 text-right">
                        <div className="text-xs text-white/30">DeerFlow</div>
                        <div className="text-sm font-semibold text-amber-300">{item.deerflow}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 px-4 py-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${categoryColors[item.category] || 'bg-white/5 text-white/30'}`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] text-white/20 transition-colors group-hover:text-white/40">
                        {selected === realIndex ? '点击收起' : '点击查看详情'}
                      </span>
                    </div>

                    {selected === realIndex && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-amber-500" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="mt-20 text-center text-white/20">
              暂无该分类的类比数据
            </div>
          )}
        </div>
      </div>

      {/* 右侧 InfoPanel */}
      <AnimatePresence>
        {panelContent && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '44%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full overflow-hidden border-l border-white/10 shrink-0"
          >
            <InfoPanel content={panelContent} onClose={() => setSelected(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
