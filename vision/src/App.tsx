import { useState } from 'react';
import Architecture from './pages/Architecture';
import DataFlow from './pages/DataFlow';
import Middleware from './pages/Middleware';
import Modules from './pages/Modules';
import Analogy from './pages/Analogy';
import Deployment from './pages/Deployment';

type Page = 'architecture' | 'dataflow' | 'middleware' | 'modules' | 'analogy' | 'deployment';

interface NavItem {
  id: Page;
  icon: string;
  label: string;
  subtitle: string;
}

const navItems: NavItem[] = [
  { id: 'architecture', icon: '🏗️', label: '系统架构', subtitle: '组件拓扑与数据流' },
  { id: 'dataflow', icon: '🔄', label: '数据流程', subtitle: '请求生命周期' },
  { id: 'middleware', icon: '⛓️', label: '中间件管线', subtitle: '14 个处理阶段' },
  { id: 'modules', icon: '🧩', label: '核心模块总览', subtitle: '10 大核心模块' },
  { id: 'analogy', icon: '🔌', label: '前端类比', subtitle: '概念对照图谱' },
  { id: 'deployment', icon: '🚀', label: '企业部署', subtitle: '四种部署模式' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('architecture');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'architecture': return <Architecture />;
      case 'dataflow': return <DataFlow />;
      case 'middleware': return <Middleware />;
      case 'modules': return <Modules />;
      case 'analogy': return <Analogy />;
      case 'deployment': return <Deployment />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      {/* 侧边栏 */}
      <aside className={`flex flex-col border-r border-white/5 bg-[#0d1117] transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
          <span className="text-xl">🦌</span>
          <div>
            <div className="text-sm font-bold text-white">DeerFlow</div>
            <div className="text-[10px] text-white/30">视觉学习指南</div>
          </div>
        </div>

        {/* 导航列表 */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                currentPage === item.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${currentPage === item.id ? 'text-white' : 'text-white/60'}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-white/30 truncate">{item.subtitle}</div>
              </div>
            </button>
          ))}
        </nav>

        {/* 底部 */}
        <div className="border-t border-white/5 px-5 py-3">
          <div className="text-[10px] text-white/20">基于 deerflow-learn 学习指南构建</div>
        </div>
      </aside>

      {/* 切换侧边栏按钮 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 z-30 -translate-y-1/2 flex h-12 w-5 items-center justify-center rounded-r-lg bg-white/5 text-xs text-white/30 hover:bg-white/10 hover:text-white/60 transition-all"
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* 主内容区 */}
      <main className="relative flex-1 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}
