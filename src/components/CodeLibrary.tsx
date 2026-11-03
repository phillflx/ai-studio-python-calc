import React, { useState } from 'react';
import { Download, Copy, Check, Play, FileCode, CheckCircle2 } from 'lucide-react';
import { STANDALONE_SCRIPTS } from '../data/pythonSnippets';
import { StandalonePythonScript } from '../types/calculator';

interface CodeLibraryProps {
  onRunScriptInRepl: (code: string) => void;
}

export const CodeLibrary: React.FC<CodeLibraryProps> = ({ onRunScriptInRepl }) => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>(STANDALONE_SCRIPTS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentScript = STANDALONE_SCRIPTS.find((s) => s.id === selectedScriptId) || STANDALONE_SCRIPTS[0];

  const handleCopy = (script: StandalonePythonScript) => {
    navigator.clipboard.writeText(script.code);
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownload = (script: StandalonePythonScript) => {
    const blob = new Blob([script.code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = script.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 mb-1">
          Código-Fonte Completo da Calculadora em Python
        </h2>
        <p className="text-sm text-slate-400">
          Arquivos Python prontos para rodar no seu computador (VS Code, PyCharm ou terminal) ou para trabalhos acadêmicos e projetos reais.
        </p>
      </div>

      {/* Script Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STANDALONE_SCRIPTS.map((script) => {
          const isSelected = script.id === currentScript.id;
          return (
            <button
              key={script.id}
              onClick={() => setSelectedScriptId(script.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-amber-300 font-semibold">{script.filename}</span>
                <span className="text-[10px] text-slate-400">{script.level}</span>
              </div>
              <h3 className="text-xs font-semibold text-slate-200 line-clamp-1">{script.title.replace(/^\d+\.\s*/, '')}</h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {script.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Script Code Viewer & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-100">{currentScript.filename}</span>
                <span className="text-xs text-slate-400">· {currentScript.level}</span>
              </div>
              <p className="text-xs text-slate-400">{currentScript.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {currentScript.id !== 'tkinter' && (
              <button
                onClick={() => onRunScriptInRepl(currentScript.code)}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                title="Executar este código no console web"
              >
                <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Testar no Console</span>
              </button>
            )}

            <button
              onClick={() => handleCopy(currentScript)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copiedId === currentScript.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload(currentScript)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Baixar arquivo .py para o seu computador"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .py</span>
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold">$</span>
            <span>Como executar localmente:</span>
            <code className="text-sky-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              python {currentScript.filename}
            </code>
          </div>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Compatível com Python 3.8+
          </span>
        </div>

        {/* Code Content */}
        <div className="p-5 bg-slate-950/80 overflow-x-auto max-h-[550px] overflow-y-auto">
          <pre className="font-mono text-xs md:text-sm text-slate-200 leading-relaxed">
            <code>{currentScript.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
