'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InfoPanel from '../components/InfoPanel';
import type { InfoContent } from '../components/InfoPanel';
import { flowSteps, flowEdges } from '../data/data-flow';

const SPEED_OPTIONS = [
  { label: '1x', value: 3000 },
  { label: '2x', value: 1500 },
  { label: '3x', value: 750 },
];

export default function DataFlow() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          const next = prev + 1;
          if (next > flowSteps.length) {
            setIsPlaying(false);
            return flowSteps.length;
          }
          return next;
        });
      }, speed);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (activeStep >= flowSteps.length) {
        setActiveStep(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, activeStep]);

  const resetPlay = useCallback(() => {
    setIsPlaying(false);
    setActiveStep(0);
  }, []);

  const handleStepClick = useCallback((num: number) => {
    setSelectedStep((prev) => (prev === num ? null : num));
  }, []);

  const selectedContent: InfoContent | null = selectedStep
    ? (() => {
        const step = flowSteps.find((s) => s.number === selectedStep);
        if (!step) return null;
        return {
          title: step.title,
          icon: step.icon,
          number: step.number,
          subtitle: step.component,
          description: step.description,
          details: [step.detail, `预计耗时: ${step.duration}`],
        };
      })()
    : null;

  const displayStep = Math.min(activeStep, flowSteps.length);
  const progress = flowSteps.length > 0 ? displayStep / flowSteps.length : 0;

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0a0a]">
      {/* 控制栏 */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">数据流向图</h1>
          <span className="text-xs text-white/30">点击步骤查看详情 · 自动演示</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            {isPlaying ? '⏸ 暂停' : '▶ 自动演示'}
          </button>

          <button
            onClick={resetPlay}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
          >
            ↺ 重置
          </button>

          <div className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                  speed === opt.value
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <span className="text-sm font-medium text-white">{displayStep}</span>
            <span className="text-xs text-white/30">/ {flowSteps.length}</span>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-0.5 w-full bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 主体 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧步骤列表 */}
        <div className={`overflow-y-auto transition-all duration-300 ${selectedStep ? 'w-[56%]' : 'w-full'}`}>
          <div className="mx-auto max-w-xl px-8 py-6">
            {flowSteps.map((step, index) => {
              const isActive = step.number <= activeStep;
              const isSelected = step.number === selectedStep;

              return (
                <div key={step.number}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => handleStepClick(step.number)}
                    className={`
                      relative cursor-pointer rounded-xl border-2 px-5 py-4 transition-all duration-200
                      ${isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                        : isActive
                          ? 'border-white/20 bg-white/5 hover:border-white/30'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                          flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                          text-sm font-bold ring-1 transition-all
                          ${isActive
                            ? 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/40'
                            : 'bg-white/5 text-white/40 ring-white/10'
                          }
                        `}
                      >
                        {step.number}
                      </div>
                      <span className="text-xl">{step.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : 'text-white/50'}`}>
                          {step.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-white/30">
                          {step.component}
                        </div>
                      </div>
                      <span
                        className={`
                          shrink-0 rounded-full px-2 py-0.5 text-[10px] transition-all
                          ${isActive
                            ? 'bg-white/10 text-white/50'
                            : 'bg-white/5 text-white/20'
                          }
                        `}
                      >
                        {step.duration}
                      </span>
                    </div>
                  </motion.div>

                  {index < flowSteps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <svg width="18" height="28" viewBox="0 0 18 28" className="overflow-visible">
                        <line
                          x1="9" y1="0" x2="9" y2="20"
                          stroke={step.number <= activeStep ? '#22d3ee' : '#ffffff15'}
                          strokeWidth="2"
                          strokeDasharray={step.number >= activeStep ? '4 3' : 'none'}
                        />
                        <polygon
                          points="3,18 9,25 15,18"
                          fill={step.number <= activeStep ? '#22d3ee' : '#ffffff15'}
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧详情面板 */}
        <AnimatePresence>
          {selectedContent && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '44%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full overflow-hidden border-l border-white/10 shrink-0"
            >
              <InfoPanel content={selectedContent} onClose={() => setSelectedStep(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
