'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence, motion } from 'motion/react';
import ArchNode from '../components/ArchNode';
import InfoPanel from '../components/InfoPanel';
import type { InfoContent } from '../components/InfoPanel';
import {
  createArchNodes, initialEdges, nodeInfo, legendItems,
} from '../data/architecture';
import type { ArchNodeType } from '../data/architecture';

export default function Architecture() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const initNodes = useMemo(() => createArchNodes(), []);
  const [nodes, , onNodesChange] = useNodesState<ArchNodeType>(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ 'arch-node': ArchNode }), []);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: ArchNodeType) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedContent: InfoContent | null = useMemo(() => {
    if (!selectedNodeId) return null;
    const info = nodeInfo[selectedNodeId];
    if (!info) return null;
    return {
      title: info.label,
      icon: info.icon,
      number: info.number,
      subtitle: info.subtitle,
      description: info.description,
      details: info.details,
    };
  }, [selectedNodeId]);

  return (
    <div className="flex h-full w-full">
      {/* React Flow 画布 */}
      <div className={`transition-all duration-300 ${selectedNodeId ? 'w-[56%]' : 'w-full'}`}>
        <div className="relative h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#ffffff08" gap={20} />
            <Controls />
            <MiniMap
              nodeStrokeColor="#ffffff20"
              nodeColor="#161b22"
              nodeBorderRadius={4}
              maskColor="#00000060"
              style={{ background: '#161b22', border: '1px solid #ffffff15', borderRadius: 8 }}
            />
          </ReactFlow>

          {/* 顶部标题栏 */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-gradient-to-b from-[#0a0a0a]/80 to-transparent px-6 py-4">
            <div className="pointer-events-auto flex items-center gap-3">
              <h1 className="text-lg font-bold text-white">系统架构图</h1>
              <span className="text-xs text-white/30">点击节点查看详情</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-4">
              {legendItems.map((item) => (
                <div key={item.layer} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-white/50">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <p className="text-xs text-white/20">拖拽平移 · 滚轮缩放 · 点击节点查看详情</p>
          </div>
        </div>
      </div>

      {/* 右侧信息面板 */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '44%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full overflow-hidden border-l border-white/10 shrink-0"
          >
            <InfoPanel content={selectedContent} onClose={() => setSelectedNodeId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
