
import React from 'react';
import { Synthesis } from '../types';

interface SynthesisSectionProps {
  synthesis: Synthesis;
}

export const SynthesisSection: React.FC<SynthesisSectionProps> = ({ synthesis }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Central Terminal Style Recommendation */}
      <div className="relative group overflow-hidden rounded-[2rem]">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative glass p-12 rounded-[2rem] text-center border border-white/10 shadow-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <span className="text-[10px] mono font-black text-indigo-400 uppercase tracking-[0.5em] mb-4 block drop-shadow-lg">Final Consensus Protocol</span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-tight max-w-3xl">
              {synthesis.final_recommendation}
            </h2>
            <div className="inline-flex items-center gap-3 bg-black/60 border border-white/10 px-8 py-3 rounded-full text-[10px] mono font-bold text-gray-300 uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl">
              <span>Confidence: {synthesis.confidence}/10</span>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logic Layer */}
        <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
           <div className="absolute top-4 right-6 text-[8px] mono text-white/20 uppercase">Module: LOGIC_REASON</div>
          <h3 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">💡</span>
            Reasoning Chain
          </h3>
          <div className="space-y-4">
            {synthesis.reasoning_chain.map((step, i) => (
              <div key={i} className="flex gap-5 p-5 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-colors">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] mono font-black text-indigo-400 shadow-lg shadow-indigo-500/5">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-sm text-gray-400 leading-relaxed font-medium group-hover:text-gray-200 transition-colors">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conflict Resolution */}
        <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-6 text-[8px] mono text-white/20 uppercase">Module: ARBITRATION</div>
          <h3 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">⚖️</span>
            Conflicts Resolved
          </h3>
          <div className="space-y-6">
            {synthesis.conflicts_resolved.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="flex items-center gap-2 mb-3">
                   <span className="text-[10px] mono font-black text-amber-500 uppercase tracking-widest">Conflict</span>
                   <div className="h-px flex-1 bg-amber-500/10"></div>
                </div>
                <p className="text-sm text-gray-200 mb-4 font-bold tracking-tight">{item.conflict}</p>
                
                <div className="space-y-3">
                  <div className="flex gap-4 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                    <span className="text-[8px] mono font-black text-emerald-500 uppercase mt-1">Resolution</span>
                    <p className="text-xs text-emerald-400/90 leading-relaxed italic">{item.resolution}</p>
                  </div>
                  {item.tradeoff && (
                    <div className="flex gap-4 items-start bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] mono font-black text-gray-500 uppercase mt-1">Tradeoff</span>
                      <p className="text-[11px] text-gray-500 italic">{item.tradeoff}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment Matrix */}
      <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-4 right-6 text-[8px] mono text-white/20 uppercase">Module: EXEC_MAP</div>
        <h3 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
          <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">📋</span>
          Implementation Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {synthesis.action_plan.map((action, i) => (
            <div key={i} className="flex items-center gap-5 p-5 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-all group border border-white/5">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors font-medium">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Delta */}
      <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-4 right-6 text-[8px] mono text-white/20 uppercase">Module: FORECAST</div>
        <h3 className="text-sm font-black text-white mb-10 flex items-center gap-3 uppercase tracking-widest">
          <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">📊</span>
          Predicted Outcomes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Object.entries(synthesis.outcomes).map(([key, val]) => (
             <div key={key} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col items-center text-center group hover:bg-indigo-500/5 transition-all">
                <span className="text-[9px] mono font-black uppercase text-indigo-500 mb-4 tracking-[0.2em]">{key}</span>
                <p className="text-xs font-bold text-gray-300 leading-tight group-hover:text-white">{val}</p>
                <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500/30 w-full animate-pulse"></div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
