import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'motion/react';
import { layerColors, type ArchData } from '../data/architecture';

export default function ArchNode({ data, selected }: NodeProps) {
  const d = data as unknown as ArchData;
  const colors = layerColors[d.layer];
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -2 }}
      className={`
        relative w-64 cursor-pointer rounded-xl border-2 px-4 py-3
        bg-gradient-to-br ${colors.bg} ${colors.border}
        shadow-lg ${selected ? `${colors.glow} shadow-xl ring-2 ring-white/20` : 'shadow-black/30'}
        backdrop-blur-sm transition-all duration-200
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/60 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/60 !w-2 !h-2 !border-0" />
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/80 ring-1 ring-white/20">
          {d.number}
        </div>
        <span className="mt-0.5 text-lg">{d.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight text-white">{d.label}</div>
          <div className="text-[10px] text-white/50">{d.subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}
