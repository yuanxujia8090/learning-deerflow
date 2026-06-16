import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { deployModes, rbacRoles, dataIsolationLevels, auditEntries } from '../data/deployment';

const roleColors: Record<string, string> = {
  '管理员': 'bg-red-500/15 text-red-300 border-red-500/30 ring-red-500/20',
  '开发者': 'bg-blue-500/15 text-blue-300 border-blue-500/30 ring-blue-500/20',
  '操作员': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 ring-emerald-500/20',
  '审计员': 'bg-purple-500/15 text-purple-300 border-purple-500/30 ring-purple-500/20',
};

export default function Deployment() {
  const [expandedMode, setExpandedMode] = useState<string | null>(null);

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* ========== Section 1: 部署模式 ========== */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">部署模式</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {deployModes.map(mode => {
              const isExpanded = expandedMode === mode.id;
              return (
                <motion.div
                  key={mode.id}
                  layout
                  onClick={() => setExpandedMode(isExpanded ? null : mode.id)}
                  className={`cursor-pointer rounded-xl border transition-all duration-200 ${
                    isExpanded
                      ? 'border-white/20 bg-[#1c2333] shadow-lg shadow-white/5'
                      : 'border-white/5 bg-[#161b22] hover:border-white/15 hover:bg-[#1c2333]/80'
                  }`}
                >
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xl">{mode.icon}</span>
                      <h3 className="text-sm font-bold text-white">{mode.name}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-white/50">{mode.description}</p>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 px-4 py-3 space-y-3">
                          {/* 优点 */}
                          <div>
                            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60">优点</div>
                            <ul className="space-y-1">
                              {mode.pros.map((p, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/50">
                                  <span className="mt-0.5 text-emerald-400/40">+</span>
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* 缺点 */}
                          <div>
                            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400/60">缺点</div>
                            <ul className="space-y-1">
                              {mode.cons.map((c, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/50">
                                  <span className="mt-0.5 text-red-400/40">-</span>
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* 适用场景 */}
                          <div className="rounded-lg bg-white/5 px-3 py-2">
                            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">适用场景</div>
                            <div className="text-[11px] text-cyan-300/80">{mode.scenario}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ========== Section 2: RBAC 角色 ========== */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">权限角色</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {rbacRoles.map(role => {
              const colorClass = roleColors[role.name] || 'bg-white/5 text-white/30';
              return (
                <div
                  key={role.name}
                  className={`rounded-xl border border-white/5 bg-[#161b22] p-4 transition-all duration-200 hover:border-white/15`}
                >
                  <div className={`mb-3 inline-block rounded-lg border px-2.5 py-1 text-xs font-bold ring-1 ${colorClass}`}>
                    {role.name}
                  </div>
                  <p className="mb-3 text-[11px] leading-relaxed text-white/50">{role.description}</p>
                  <div className="space-y-1.5">
                    {role.permissions.map((perm, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/40">
                        <span className="mt-0.5 shrink-0 text-cyan-400/50">◆</span>
                        {perm}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========== Section 3: 数据隔离级别 ========== */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">数据隔离策略</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="overflow-hidden rounded-xl border border-white/5 bg-[#161b22]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">隔离级别</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">说明</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">安全性</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">复杂度</th>
                </tr>
              </thead>
              <tbody>
                {dataIsolationLevels.map((item, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-white/80">{item.level}</td>
                    <td className="px-4 py-3 text-white/50">{item.desc}</td>
                    <td className="px-4 py-3 text-xs tracking-wider text-white/80">{item.security}</td>
                    <td className="px-4 py-3 text-xs tracking-wider text-white/80">{item.complexity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== 审计日志示例 ========== */}
        <section className="pb-6">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">审计日志示例</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="overflow-hidden rounded-xl border border-white/5 bg-[#161b22]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold uppercase tracking-wider text-white/30">时间</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold uppercase tracking-wider text-white/30">用户</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold uppercase tracking-wider text-white/30">操作</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold uppercase tracking-wider text-white/30">资源</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold uppercase tracking-wider text-white/30">结果</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-semibold uppercase tracking-wider text-white/30">签名</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEntries.map((entry, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="whitespace-nowrap px-3 py-2 text-white/60 font-mono">{entry.time}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-white/70">{entry.user}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <code className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-cyan-300/80">{entry.action}</code>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-white/50">{entry.resource}</td>
                      <td className={`whitespace-nowrap px-3 py-2 ${entry.result.includes('失败') ? 'text-red-400' : 'text-emerald-400'}`}>
                        {entry.result}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-[10px] text-white/30">{entry.signature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
