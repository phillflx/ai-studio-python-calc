import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VisualCalculator } from './components/VisualCalculator';
import { PythonRepl } from './components/PythonRepl';
import { CodeLibrary } from './components/CodeLibrary';
import { SyntaxGuide } from './components/SyntaxGuide';
import { CalculationHistoryItem } from './types/calculator';

const STORAGE_KEY = 'python_calc_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'repl' | 'scripts' | 'guide'>('calculator');
  const [replCode, setReplCode] = useState<string>('');
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'seed-1',
        expression: 'math.sqrt(144) + 2**4',
        pythonCode: 'math.sqrt(144) + 2**4',
        result: '28.0',
        resultType: 'float',
        timestamp: new Date(),
        explanation: 'raiz quadrada de 144 mais 2 elevado a 4',
      },
      {
        id: 'seed-2',
        expression: 'round(math.pi * 5**2, 2)',
        pythonCode: 'round(math.pi * 5**2, 2)',
        result: '78.54',
        resultType: 'float',
        timestamp: new Date(),
        explanation: 'Área do círculo de raio 5 arredondada em 2 casas decimais',
      },
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage quota or private mode
    }
  }, [history]);

  const handleAddToHistory = (item: CalculationHistoryItem) => {
    setHistory((prev) => [item, ...prev.slice(0, 49)]); // keep up to 50 items
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleOpenInRepl = (code: string) => {
    setReplCode(code);
    setActiveTab('repl');
  };

  const handleLoadExpressionIntoCalc = (expr: string) => {
    setActiveTab('calculator');
    // Using custom event or direct state trigger
    const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputEl) {
      inputEl.value = expr;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.focus();
    }
  };

  const handleReset = () => {
    setActiveTab('calculator');
    const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputEl) {
      inputEl.value = '';
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Editorial Subheading & Context */}
        <div className="mb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
              Calculadora em Python
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Ambiente de computação matemática, console interativo e biblioteca de scripts para download.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Python 3.12</span>
            <span aria-hidden="true">·</span>
            <span>WebAssembly</span>
            <span aria-hidden="true">·</span>
            <span>Módulos math &amp; statistics</span>
          </div>
        </div>

        {/* View Switcher Content */}
        {activeTab === 'calculator' && (
          <VisualCalculator
            onAddToHistory={handleAddToHistory}
            onOpenInRepl={handleOpenInRepl}
            history={history}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'repl' && (
          <PythonRepl initialCode={replCode} />
        )}

        {activeTab === 'scripts' && (
          <CodeLibrary onRunScriptInRepl={handleOpenInRepl} />
        )}

        {activeTab === 'guide' && (
          <SyntaxGuide onLoadExpression={handleLoadExpressionIntoCalc} />
        )}
      </main>

      {/* Footer conforming to anti-slop rules */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">PythonCalc</span>
            <span aria-hidden="true">·</span>
            <span>Calculadora Científica e Programável em Python</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Operações PEMDAS</span>
            <span aria-hidden="true">·</span>
            <span>Biblioteca Padrão math</span>
            <span aria-hidden="true">·</span>
            <span>Código Aberto</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
