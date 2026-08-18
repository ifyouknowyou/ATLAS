'use client';
import { useEffect, useRef, useState } from 'react';
import type { GraphData } from '../types';
import { useGraphStore } from '../store';
import { createSimulationHost, type SimulationHost } from '../worker/host';
import { viewportForBounds } from '../renderer/viewport';
import { boundsOf } from '../engine/metrics';
import { GraphCanvas } from './GraphCanvas';
import { GraphToolbar } from './GraphToolbar';
import { GraphStatusBar } from './GraphStatusBar';

interface GraphViewportProps {
  data?: GraphData;
  height?: string;
  onSelectNode?: (id: string | null) => void;
}

/**
 * Composable graph root. Owns the simulation host lifecycle, wires the store
 * to the host, and composes canvas + toolbar + status bar.
 */
export function GraphViewport({ data, height, onSelectNode }: GraphViewportProps) {
  const storeData = useGraphStore((s) => s.data);
  const setData = useGraphStore((s) => s.setData);
  const setViewport = useGraphStore((s) => s.setViewport);
  const setSimRunning = useGraphStore((s) => s.setSimRunning);
  const hostRef = useRef<SimulationHost | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hostDataSignatureRef = useRef('');
  const [hostMode, setHostMode] = useState<'worker' | 'main'>('worker');

  // Seed the store when the prop dataset arrives (e.g. investigation tab).
  useEffect(() => {
    if (data) setData(data);
  }, [data, setData]);

  // Create the simulation host once (client only).
  useEffect(() => {
    const host = createSimulationHost({
      onPositions: (nodes) => {
        const nextData = useGraphStore.getState().data;
        if (nodes.length === 0) {
          fitTo(nextData);
          return;
        }
              const nodesNext = nextData.nodes.map((n) => {
          const p = nodes.find((x) => x.id === n.id);
          return p ? { ...n, x: p.x ?? n.x, y: p.y ?? n.y } : n;
        });
        useGraphStore.setState({ data: { nodes: nodesNext, edges: nextData.edges } });
        fitTo({ nodes: nodesNext, edges: nextData.edges });
      },
      onStatus: (status) => setSimRunning(status.running),
    });
    hostRef.current = host;
    setHostMode(typeof Worker !== 'undefined' ? 'worker' : 'main');
    return () => {
      hostRef.current?.dispose();
      hostRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fitTo = (graph: typeof storeData) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bounds = boundsOf(graph.nodes);
    setViewport(viewportForBounds(bounds, rect.width, rect.height));
  };

  // Push structural data changes to the host. Position updates from the host
  // itself must not restart the simulation on every frame.
  useEffect(() => {
    const signature = [
      ...storeData.nodes.map((node) => node.id),
      '|',
      ...storeData.edges.map((edge) => `${edge.id}:${edge.sourceId}:${edge.targetId}`),
    ].join(',');
    if (signature === hostDataSignatureRef.current) return;
    hostDataSignatureRef.current = signature;
    hostRef.current?.setData(storeData);
  }, [storeData]);

  const fit = () => fitTo(storeData);

  const toggleSim = () => {
    const running = useGraphStore.getState().simRunning;
    if (running) hostRef.current?.pause();
    else hostRef.current?.resume();
    setSimRunning(!running);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded border border-void-line bg-void-raised">
      <div className="border-b border-void-line p-2">
        <GraphToolbar onFit={fit} onToggleSim={toggleSim} />
      </div>
      <div ref={containerRef} className="relative">
        <GraphCanvas height={height} onSelectNode={onSelectNode} />
        <span className="pointer-events-none absolute right-2 top-14 rounded border border-void-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-tech">
          {hostMode === 'worker' ? 'WORKER' : 'MAIN-THREAD'}
        </span>
      </div>
      <GraphStatusBar />
    </div>
  );
}