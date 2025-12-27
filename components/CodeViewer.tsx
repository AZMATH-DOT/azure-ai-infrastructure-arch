
import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { CodeSnippet } from '../types';

interface Props {
  snippet: CodeSnippet;
}

export const CodeViewer: React.FC<Props> = ({ snippet }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden shadow-xl border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
            <Terminal size={14} />
          </div>
          <span className="text-xs font-medium text-slate-300 font-mono">{snippet.title}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 transition-colors"
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 flex-1 overflow-auto font-mono text-[13px] leading-relaxed custom-scrollbar">
        <pre className="text-slate-300">
          <code>
            {snippet.content.split('\n').map((line, i) => (
              <div key={i} className="flex gap-4">
                <span className="w-8 text-right text-slate-600 select-none">{i + 1}</span>
                <span>{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
