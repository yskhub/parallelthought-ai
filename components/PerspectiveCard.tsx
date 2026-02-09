
import React, { useState } from 'react';
import { PerspectiveData } from '../types';
import { PERSPECTIVE_CONFIG } from '../constants';

interface PerspectiveCardProps {
  type: keyof typeof PERSPECTIVE_CONFIG;
  data: PerspectiveData;
}

export const PerspectiveCard: React.FC<PerspectiveCardProps> = ({ type, data }) => {
  const config = PERSPECTIVE_CONFIG[type];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`flex flex-col border-t-2 ${config.color.replace('border-', 'border-opacity-40 border-')} bg-white/[0.03] rounded-2xl p-5 shadow-2xl transition-all duration-500 hover:bg-white/[0.06] border border-white/5 relative group overflow-hidden`}>
      {/* HUD Accent */}
      <div className={`absolute top-0 right-0 w-8 h-8 opacity-10 flex items-center justify-center font-black mono text-[8px] ${config.text}`}>HUD_0{type.length}</div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{config.icon}</span>
          <h4 className="text-[10px] mono font-black uppercase text-gray-500 tracking-widest">
            {type}
          </h4>
        </div>
        <div className="text-[9px] mono font-bold text-gray-600 border border-white/5 px-2 py-0.5 rounded-full bg-black/20">CONF: {data.confidence}</div>
      </div>
      
      <h3 className={`text-sm font-black mb-4 uppercase tracking-tighter ${config.text} leading-none line-clamp-2 min-h-[2rem] drop-shadow-sm`}>
        {data.recommendation}
      </h3>

      <div className="flex-1 mb-6">
        <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
          "{data.reasoning}"
        </p>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2.5 px-3 text-[9px] mono font-black uppercase tracking-[0.2em] rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-gray-400 hover:text-white flex items-center justify-center gap-2 group/btn`}
      >
        {isOpen ? 'SYS_CLOSE' : 'SYS_REVIEW'}
        <span className="text-[8px] opacity-40 group-hover/btn:animate-bounce">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h5 className="text-[8px] mono font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></span>
              Priority_Nodes
            </h5>
            <ul className="space-y-3">
              {data.key_points.map((pt, i) => (
                <li key={i} className="flex gap-3 text-[10px] text-gray-400 font-medium leading-tight hover:text-gray-200 transition-colors">
                  <span className={`flex-shrink-0 w-1 h-3 rounded-sm ${config.color.replace('border-', 'bg-')} opacity-40`}></span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          
          {data.metrics && data.metrics.length > 0 && (
            <div>
              <h5 className="text-[8px] mono font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></span>
                Telemetry_Data
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {data.metrics.map((metric, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all group/metric">
                    <span className="mono font-bold text-gray-500 uppercase tracking-tighter text-[8px] group-hover/metric:text-gray-400 transition-colors">{metric.label}</span>
                    <span className="mono font-black text-gray-200 text-[10px]">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
