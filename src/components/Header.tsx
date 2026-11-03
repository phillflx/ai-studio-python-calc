import React from 'react';
import { Terminal, Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'repl' | 'scripts' | 'guide';
  setActiveTab: (tab: 'calculator' | 'repl' | 'scripts' | 'guide') => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onReset }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-amber-400 p-[1.5px] flex items-center justify-center shadow-sm">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center text-amber-300 font-mono font-bold text-sm">
            py
          </div>
        </div>
        <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
          PythonCalc
        </span>
      </div>

      {/* Zone 2: 4 clean single-line nav tabs */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
              : 'hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Calculadora Gráfica
        </button>
        <button
          onClick={() => setActiveTab('repl')}
          className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'repl'
              ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
              : 'hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Console REPL
        </button>
        <button
          onClick={() => setActiveTab('scripts')}
          className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'scripts'
              ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
              : 'hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Projetos .py Prontos
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'guide'
              ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
              : 'hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Guia de Sintaxe
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onReset}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-md hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          title="Limpar calculadora e iniciar novo cálculo"
        >
          Novo Cálculo
        </button>
      </div>
    </header>
  );
};
