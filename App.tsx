import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Perspectives, Synthesis, Weights, AnalysisResult, SavedScenario } from './types';
import { GeminiService } from './services/geminiService';
import { PerspectiveCard } from './components/PerspectiveCard';
import { SynthesisSection } from './components/SynthesisSection';
import { PERSPECTIVE_CONFIG, VISUAL_MOTIFS } from './constants';
import { RichTextEditor } from './components/RichTextEditor';
import { Spotlight } from './components/ui/spotlight';
import { SplineScene } from './components/ui/splite';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'parallel_thought_history';
const THEME_KEY = 'parallel_thought_theme';
const MOTIF_KEY = 'parallel_thought_motif';

type AnalysisStep = 'IDLE' | 'ANALYZING' | 'SYNTHESIZING' | 'COMPLETING';
type MotifKey = keyof typeof VISUAL_MOTIFS;

const App: React.FC = () => {
  const [problem, setProblem] = useState("<b>Should we migrate our e-commerce platform from monolith to microservices?</b>");
  const [context, setContext] = useState("Current Architecture:<ul><li>Monolithic Rails app (5 years old)</li><li>500k lines of code, 50 devs, 3 teams</li><li>10M requests/day</li></ul>Issues: 2h deployments, single failure point.");
  const [weights, setWeights] = useState<Weights>({
    security: 80,
    performance: 60,
    cost: 100,
    developer: 40,
    business: 70
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<AnalysisStep>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedScenario[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedMotif, setSelectedMotif] = useState<MotifKey>('NEURAL');
  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // URL State Hydration
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    const c = params.get('c');
    const w = params.get('w');

    if (p) setProblem(decodeURIComponent(p));
    if (c) setContext(decodeURIComponent(c));
    if (w) {
      try {
        const parsedWeights = JSON.parse(decodeURIComponent(w));
        setWeights(parsedWeights);
      } catch (e) { console.error("URL Weight Parse Fail"); }
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);

    const savedMotif = localStorage.getItem(MOTIF_KEY);
    if (savedMotif && Object.keys(VISUAL_MOTIFS).includes(savedMotif)) {
      setSelectedMotif(savedMotif as MotifKey);
    }
  }, []);

  const generateShareLink = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('p', problem);
    params.set('c', context);
    params.set('w', JSON.stringify(weights));
    
    const fullUrl = `${baseUrl}?${params.toString()}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  }, [problem, context, weights]);

  const sceneUrl = useMemo(() => {
    const motif = VISUAL_MOTIFS[selectedMotif];
    if (loading) return motif.scenes.ANALYZING;
    if (result) return motif.scenes.RESULT;
    return motif.scenes.IDLE;
  }, [loading, result, selectedMotif]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  const selectMotif = (motif: MotifKey) => {
    setSelectedMotif(motif);
    localStorage.setItem(MOTIF_KEY, motif);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const runAnalysis = async () => {
    const plainProblem = stripHtml(problem);
    if (!plainProblem.trim()) {
      setError("Please enter a problem statement.");
      return;
    }
    setLoading(true);
    setStep('ANALYZING');
    setError(null);
    try {
      const service = new GeminiService();
      const perspectives = await service.analyzePerspectives(plainProblem, stripHtml(context));
      setStep('SYNTHESIZING');
      const synthesis = await service.synthesize(plainProblem, perspectives, weights);
      setStep('COMPLETING');
      const newResult = { problem, context, perspectives, synthesis, weights };
      setResult(newResult);
      
      const newScenario: SavedScenario = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        problem,
        context,
        weights,
        result: newResult
      };
      const updatedHistory = [newScenario, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e: any) {
      setError(e.message || "Protocol Failure. The system encountered an anomaly during synthesis.");
    } finally {
      setLoading(false);
      setStep('IDLE');
    }
  };

  const handleWeightChange = (key: keyof Weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const loadFromHistory = (scenario: SavedScenario) => {
    setProblem(scenario.problem);
    setContext(scenario.context);
    setWeights(scenario.weights);
    setResult(scenario.result);
    setShowHistory(false);
  };

  if (!mounted) return null;

  const perspectiveKeys = ['security', 'performance', 'cost', 'developer', 'business'] as const;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 relative ${theme === 'dark' ? 'bg-[#030712] text-[#f9fafb]' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Spotlight 
          className="-top-40 left-0 md:left-60 md:-top-20" 
          fill={theme === 'dark' ? "rgba(99, 102, 241, 0.1)" : "rgba(0,0,0,0.05)"} 
        />
        <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-20' : 'opacity-10'}`}>
           <SplineScene scene={sceneUrl} />
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className={`p-6 flex justify-between items-center backdrop-blur-md border-b sticky top-0 z-50 transition-all ${theme === 'dark' ? 'border-white/5 bg-black/10' : 'border-slate-200 bg-white/40'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl">PT</div>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase">Parallel Thought</h1>
              <p className="text-[8px] mono text-gray-500 uppercase tracking-widest">Decision Synthesis Engine</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={generateShareLink}
              className={`px-4 py-2 text-[10px] mono font-black rounded-full border transition-all flex items-center gap-2 ${copySuccess ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white' : 'bg-slate-200/50 border-slate-300 text-slate-600 hover:text-slate-900'}`}
            >
              {copySuccess ? 'PROTOCOL_LINK_COPIED' : 'SHARE_SCENARIO'}
              {!copySuccess && <span className="text-xs">🔗</span>}
            </button>
            <div className="w-px h-6 bg-white/10 hidden md:block" />
            <button 
              onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white' : 'bg-slate-200/50 border-slate-300 text-slate-600 hover:text-slate-900'}`}
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 text-[10px] mono font-bold rounded-full border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white' : 'bg-slate-200/50 border-slate-300 text-slate-600 hover:text-slate-900'}`}
            >
              HISTORY[{history.length}]
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 space-y-12">
          {!result || loading ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className={`p-8 rounded-[2.5rem] border shadow-2xl backdrop-blur-xl transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}>
                  <RichTextEditor 
                    label="Analysis Target" 
                    value={problem} 
                    onChange={setProblem} 
                    minHeight="120px"
                  />
                  <div className="mt-8">
                    <RichTextEditor 
                      label="Environment & Context" 
                      value={context} 
                      onChange={setContext} 
                      minHeight="200px"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className={`p-8 rounded-[2.5rem] border shadow-2xl backdrop-blur-xl transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-[10px] mono font-black text-indigo-400 uppercase tracking-[0.3em] mb-8">Priority_Calibration</h3>
                  <div className="space-y-6">
                    {Object.entries(weights).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] mono font-bold uppercase text-gray-500">{key}</label>
                          <span className={`text-[9px] mono font-black ${theme === 'dark' ? 'text-gray-300' : 'text-slate-900'}`}>{value}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={value} 
                          onChange={(e) => handleWeightChange(key as keyof Weights, parseInt(e.target.value))}
                          className="w-full h-1 bg-indigo-500/20 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Motif Selector */}
                  <div className="mt-12 pt-8 border-t border-indigo-500/10">
                    <h3 className="text-[10px] mono font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Visual_Interface_Motif</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(VISUAL_MOTIFS) as Array<MotifKey>).map((motif) => (
                        <button
                          key={motif}
                          onClick={() => selectMotif(motif)}
                          className={`py-3 rounded-xl border text-[9px] mono font-black transition-all ${selectedMotif === motif 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                            : theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-500 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'}`}
                        >
                          {motif}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={runAnalysis}
                    disabled={loading}
                    className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-3 group"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>EXECUTING_{step}</span>
                      </>
                    ) : (
                      <>
                        <span>RUN_ANALYSIS_PROTOCOL</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-16">
              <button 
                onClick={() => setResult(null)}
                className="group flex items-center gap-2 text-[10px] mono font-black text-gray-500 hover:text-indigo-500 transition-colors"
              >
                <span>←</span> INITIALIZE_NEW_PROMPT
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {perspectiveKeys.map((type) => (
                  <PerspectiveCard key={type} type={type} data={result.perspectives[type]} />
                ))}
              </div>

              <SynthesisSection synthesis={result.synthesis} />
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {/* Error Modal */}
        {error && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setError(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[201] p-1 shadow-2xl overflow-hidden rounded-[2rem] ${theme === 'dark' ? 'bg-red-900/10' : 'bg-red-500/5'}`}
            >
              <div className={`glass p-8 rounded-[2rem] border-red-500/20 border flex flex-col items-center text-center ${theme === 'dark' ? 'bg-[#030712]' : 'bg-white'}`}>
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl mb-6 animate-pulse border border-red-500/20">
                  ⚠️
                </div>
                <h2 className="text-xl font-black text-red-500 uppercase tracking-[0.2em] mb-4">Protocol_Interrupt</h2>
                <div className={`w-full p-5 rounded-2xl mb-8 mono text-[11px] leading-relaxed text-left border ${theme === 'dark' ? 'bg-black/60 border-red-500/10 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  <div className="text-[9px] text-red-500/50 mb-2 font-black uppercase tracking-widest">[CRITICAL_LOG_ENTRY]</div>
                  {error}
                </div>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setError(null)}
                    className="flex-1 py-4 px-6 text-[10px] mono font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 rounded-2xl transition-all"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => { setError(null); runAnalysis(); }}
                    className="flex-1 py-4 px-6 text-[10px] mono font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded-2xl transition-all shadow-xl shadow-red-900/20"
                  >
                    Retry_Link
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* History Panel */}
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed right-0 top-0 h-full w-full max-w-md border-l z-[101] p-8 shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#030712] border-white/5' : 'bg-white border-slate-200'}`}
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-sm font-black uppercase tracking-widest">Protocol_Logs</h2>
                <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-indigo-500 text-xl">✕</button>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-150px)] pr-2 custom-scrollbar no-scrollbar">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all group ${theme === 'dark' ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-indigo-500/50'}`}
                  >
                    <div className="flex justify-between text-[8px] mono text-gray-500 mb-2">
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span>HASH: {item.id.slice(0, 8)}</span>
                    </div>
                    <h4 className={`text-xs font-bold line-clamp-2 transition-colors ${theme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-slate-700 group-hover:text-indigo-600'}`} dangerouslySetInnerHTML={{ __html: item.problem }}></h4>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-20 opacity-20">
                    <p className="text-[10px] mono uppercase tracking-widest">No cached thoughts</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;