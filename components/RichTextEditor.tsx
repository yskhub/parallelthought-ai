
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, minHeight = "100px" }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  return (
    <div className="flex flex-col group">
      <div className="flex justify-between items-end mb-3 px-1">
        <label className="block text-[9px] mono font-black text-gray-500 uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors">{label}</label>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5 backdrop-blur-md">
          <button 
            type="button"
            onClick={() => execCommand('bold')}
            className="w-7 h-7 flex items-center justify-center text-[10px] mono font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
            title="Bold"
          >B</button>
          <button 
            type="button"
            onClick={() => execCommand('italic')}
            className="w-7 h-7 flex items-center justify-center text-[10px] mono italic text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
            title="Italic"
          >I</button>
          <button 
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="w-7 h-7 flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
            title="Bullet List"
          >•</button>
        </div>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full text-sm font-medium text-gray-300 border border-white/5 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none focus:border-indigo-500/50 p-5 bg-white/[0.02] shadow-inner overflow-y-auto custom-scrollbar leading-relaxed"
        style={{ minHeight }}
      />
    </div>
  );
};
