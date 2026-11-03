import React, { useState, useEffect } from 'react';
import { Play, Trash2, Copy, Check, Sparkles, Terminal, Code2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { pythonEngine, PythonExecutionResult } from '../services/pythonEngine';
import { PRESET_SNIPPETS } from '../data/pythonSnippets';
import { PythonSnippet } from '../types/calculator';

interface PythonReplProps {
  initialCode?: string;
}

export const PythonRepl: React.FC<PythonReplProps> = ({ initialCode = '' }) => {
  const [code, setCode] = useState<string>(
    initialCode ||
      `# Console Interativo Python
# Execute cálculos matemáticos, funções e algoritmos:

import math

raio = 7.5
area = math.pi * (raio ** 2)
perimetro = 2 * math.pi * raio

print(f"Círculo com raio = {raio}")
print(f"Área calculada: {area:.2f}")
print(f"Perímetro: {perimetro:.2f}")

round(area, 2)`
  );

  const [output, setOutput] = useState<string>('');
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [variables, setVariables] = useState<Record<string, { value: string; type: string }>>({});
  const [copied, setCopied] = useState<boolean>(false);

  // If initialCode changes, set it
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleRun = async () => {
    setIsRunning(true);
    setHasError(false);
    setOutput('');
    setLastResult(null);

    const res = await pythonEngine.execute(code);
    setIsRunning(false);
    setExecutionTime(res.executionTimeMs);

    if (res.success) {
      setOutput(res.output || '');
      setLastResult(res.result || '');
      setResultType(res.resultType || 'None');
      if (res.variables) {
        setVariables(res.variables);
      }
    } else {
      setHasError(true);
      setOutput(res.error || 'Erro na execução.');
    }
  };

  const handleClearOutput = () => {
    setOutput('');
    setLastResult(null);
    setResultType(null);
    setExecutionTime(null);
    setHasError(false);
  };

  const handleLoadPreset = (snippet: PythonSnippet) => {
    setCode(snippet.code);
    handleClearOutput();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Preset Snippets Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm backdrop-blur">
        <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Fórmulas e Algoritmos Prontos para Carregar:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => handleLoadPreset(snippet)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition-colors whitespace-nowrap"
            >
              {snippet.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Code Editor Column */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Editor Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-medium text-slate-200">main.py</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Editor Python 3</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="hover:text-slate-200 text-slate-400 transition-colors flex items-center gap-1"
                title="Copiar script Python"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button
                onClick={() => setCode('')}
                className="hover:text-rose-400 text-slate-400 transition-colors"
                title="Limpar editor"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Textarea Editor */}
          <div className="p-4 bg-slate-950/40">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="# Escreva seu código ou cálculo Python aqui..."
              rows={14}
              spellCheck={false}
              className="w-full bg-transparent font-mono text-xs md:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-hidden resize-y leading-relaxed"
            />
          </div>

          {/* Editor Action Footer */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Atalhos: Módulo</span>
              <code className="text-sky-300 font-mono">math</code>
              <code className="text-sky-300 font-mono">statistics</code>
            </div>
            <button
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executando...' : 'Executar Código (Run)'}</span>
            </button>
          </div>
        </div>

        {/* Output & Terminal Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Output Terminal */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-slate-200">Saída / Terminal (stdout)</span>
              </div>
              <div className="flex items-center gap-2">
                {executionTime !== null && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {executionTime}ms
                  </span>
                )}
                {(output || lastResult) && (
                  <button
                    onClick={handleClearOutput}
                    className="hover:text-rose-400 text-slate-400 transition-colors p-1"
                    title="Limpar saída"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950 min-h-[220px] max-h-[360px] overflow-y-auto font-mono text-xs">
              {output || lastResult ? (
                <div className="space-y-3">
                  {output && (
                    <div className={hasError ? 'text-rose-400 whitespace-pre-wrap' : 'text-slate-200 whitespace-pre-wrap'}>
                      {output}
                    </div>
                  )}

                  {lastResult !== null && lastResult !== '' && !hasError && (
                    <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between text-xs">
                      <span className="text-amber-400 font-semibold">&gt;&gt;&gt; Retorno:</span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {lastResult}
                        {resultType && (
                          <span className="text-slate-400 text-[10px] ml-2 font-normal">
                            ({resultType})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-400">
                  <Terminal className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs">Aguardando execução.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Clique em &ldquo;Executar Código&rdquo; para ver os prints e retornos.</p>
                </div>
              )}
            </div>
          </div>

          {/* Variables Inspector */}
          {Object.keys(variables).length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-200 mb-3 flex items-center justify-between">
                <span>Variáveis em Memória (globals)</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {Object.keys(variables).length} variáveis
                </span>
              </h3>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto font-mono text-xs">
                {Object.entries(variables).map(([key, info]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sky-300 font-semibold">{key}</span>
                      <span className="text-slate-400 text-[10px]">({info.type})</span>
                    </div>
                    <span className="text-amber-200 truncate max-w-[150px] text-right">
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
