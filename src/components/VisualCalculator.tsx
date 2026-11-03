import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, ArrowRight, CornerDownLeft, RotateCcw, Delete, Terminal, Sparkles, BookOpen } from 'lucide-react';
import { CalculationHistoryItem } from '../types/calculator';
import { pythonEngine } from '../services/pythonEngine';

interface VisualCalculatorProps {
  onAddToHistory: (item: CalculationHistoryItem) => void;
  onOpenInRepl: (code: string) => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
}

export const VisualCalculator: React.FC<VisualCalculatorProps> = ({
  onAddToHistory,
  onOpenInRepl,
  history,
  onClearHistory,
}) => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [resultType, setResultType] = useState<CalculationHistoryItem['resultType']>('int');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [memory, setMemory] = useState<number>(0);
  const [copiedExpr, setCopiedExpr] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [isScientific, setIsScientific] = useState(true);
  const [explanation, setExplanation] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on an input element elsewhere, don't hijack
      if (document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression]);

  const handleAppend = (token: string) => {
    setErrorMsg(null);
    setExpression((prev) => {
      // If previous was empty and user clicked an operator, prefix with ans
      if (!prev && ['+', '-', '*', '/', '//', '%', '**'].includes(token)) {
        return `ans ${token} `;
      }
      return prev + token;
    });
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    setExpression((prev) => {
      if (!prev) return '';
      // If it ends with math.sqrt(, remove the whole call
      const functions = [
        'math.sqrt(',
        'math.sin(',
        'math.cos(',
        'math.tan(',
        'math.log10(',
        'math.log(',
        'math.factorial(',
        'math.pi',
        'math.e',
        'abs(',
        'round(',
        ' // ',
        ' ** ',
      ];
      for (const fn of functions) {
        if (prev.endsWith(fn)) {
          return prev.slice(0, -fn.length);
        }
      }
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setExpression('');
    setResult('0');
    setResultType('int');
    setErrorMsg(null);
    setExplanation('');
  };

  const generateExplanation = (expr: string): string => {
    let text = expr;
    text = text.replace(/math\.sqrt\(([^)]+)\)/g, 'raiz quadrada de $1');
    text = text.replace(/math\.sin\(([^)]+)\)/g, 'seno de $1');
    text = text.replace(/math\.cos\(([^)]+)\)/g, 'cosseno de $1');
    text = text.replace(/math\.tan\(([^)]+)\)/g, 'tangente de $1');
    text = text.replace(/math\.factorial\(([^)]+)\)/g, 'fatorial de $1');
    text = text.replace(/math\.pi/g, 'π (~3.1415)');
    text = text.replace(/math\.e/g, 'e (~2.7182)');
    text = text.replace(/\*\*/g, ' elevado a ');
    text = text.replace(/\/\//g, ' divisão inteira por ');
    text = text.replace(/%/g, ' resto da divisão por ');
    text = text.replace(/\*/g, ' multiplicado por ');
    text = text.replace(/\//g, ' dividido por ');
    text = text.replace(/\+/g, ' mais ');
    text = text.replace(/-/g, ' menos ');
    return text.trim();
  };

  const handleCalculate = async () => {
    const expr = expression.trim();
    if (!expr) return;

    setErrorMsg(null);
    const res = await pythonEngine.execute(expr);

    if (res.success && res.result !== undefined) {
      setResult(res.result);
      setResultType(res.resultType || 'float');

      const expl = generateExplanation(expr);
      setExplanation(expl);

      const historyItem: CalculationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression: expr,
        pythonCode: expr,
        result: res.result,
        resultType: res.resultType || 'float',
        timestamp: new Date(),
        explanation: expl,
      };
      onAddToHistory(historyItem);
    } else {
      setErrorMsg(res.error || 'SyntaxError: expressão inválida');
    }
  };

  // Memory operations
  const handleMemoryAdd = () => {
    const num = parseFloat(result);
    if (!isNaN(num)) setMemory((m) => m + num);
  };
  const handleMemorySub = () => {
    const num = parseFloat(result);
    if (!isNaN(num)) setMemory((m) => m - num);
  };
  const handleMemoryRecall = () => {
    handleAppend(String(memory));
  };
  const handleMemoryClear = () => {
    setMemory(0);
  };

  const handleCopyExpr = () => {
    if (!expression) return;
    navigator.clipboard.writeText(expression);
    setCopiedExpr(true);
    setTimeout(() => setCopiedExpr(false), 1500);
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Calculator Unit */}
      <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl backdrop-blur">
        {/* Display Screen */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 mb-5 relative overflow-hidden">
          {/* Top Bar inside display: Python code label + Memory Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-amber-400 font-semibold">&gt;&gt;&gt;</span>
              <span className="text-slate-400">Expressão Python</span>
              {memory !== 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-sky-400 font-mono">M: {memory}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {expression && (
                <button
                  onClick={handleCopyExpr}
                  className="hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                  title="Copiar código Python"
                >
                  {copiedExpr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExpr ? 'Copiado' : 'Copiar .py'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Editable Expression Input */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={expression}
              onChange={(e) => {
                setExpression(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="Digite ou clique nos botões (ex: math.sqrt(64) + 2**5)"
              className="w-full bg-transparent text-slate-200 font-mono text-base md:text-lg focus:outline-hidden placeholder:text-slate-600 tabular-nums"
            />
            {expression && (
              <button
                onClick={handleBackspace}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                title="Apagar caractere"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result Area */}
          <div className="mt-3 pt-3 border-t border-slate-900 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Tipo:</span>
              <span className="text-amber-300">&lt;class &apos;{resultType}&apos;&gt;</span>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <div
                className={`font-mono font-bold text-2xl md:text-3xl tabular-nums tracking-tight ${
                  errorMsg ? 'text-rose-400 text-base md:text-lg' : 'text-slate-100'
                }`}
              >
                {errorMsg ? errorMsg : result}
              </div>
              {!errorMsg && result !== '0' && (
                <button
                  onClick={handleCopyResult}
                  className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded transition-colors"
                  title="Copiar resultado"
                >
                  {copiedResult ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Natural explanation preview if available */}
          {explanation && !errorMsg && (
            <div className="mt-2 text-xs text-slate-400 italic">
              Operação: {explanation}
            </div>
          )}
        </div>

        {/* Action Controls & Memory Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleMemoryClear}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Memory Clear"
            >
              MC
            </button>
            <button
              onClick={handleMemoryRecall}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Memory Recall"
            >
              MR
            </button>
            <button
              onClick={handleMemoryAdd}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Memory Add"
            >
              M+
            </button>
            <button
              onClick={handleMemorySub}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Memory Subtract"
            >
              M-
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScientific(!isScientific)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                isScientific ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isScientific ? 'Modo Científico Ativo' : 'Ativar Científico'}
            </button>
            {expression && (
              <button
                onClick={() => onOpenInRepl(expression)}
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:text-amber-300 flex items-center gap-1 transition-colors"
                title="Abrir no editor REPL"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console</span>
              </button>
            )}
          </div>
        </div>

        {/* Scientific Functions Grid (Expandable) */}
        {isScientific && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <button
              onClick={() => handleAppend('math.sqrt(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Raiz Quadrada: math.sqrt(x)"
            >
              math.sqrt
            </button>
            <button
              onClick={() => handleAppend(' ** 2')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Elevar ao Quadrado: x**2"
            >
              x²
            </button>
            <button
              onClick={() => handleAppend(' ** ')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Potenciação: x ** y"
            >
              x**y
            </button>
            <button
              onClick={() => handleAppend('math.sin(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Seno (rad): math.sin(rad)"
            >
              sin(rad)
            </button>
            <button
              onClick={() => handleAppend('math.cos(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Cosseno (rad): math.cos(rad)"
            >
              cos(rad)
            </button>
            <button
              onClick={() => handleAppend('math.tan(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Tangente (rad): math.tan(rad)"
            >
              tan(rad)
            </button>
            <button
              onClick={() => handleAppend('math.log(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Logaritmo Natural: math.log(x)"
            >
              ln(x)
            </button>
            <button
              onClick={() => handleAppend('math.log10(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Logaritmo Base 10: math.log10(x)"
            >
              log10(x)
            </button>
            <button
              onClick={() => handleAppend('math.factorial(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Fatorial: math.factorial(n)"
            >
              n!
            </button>
            <button
              onClick={() => handleAppend('abs(')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-sky-300 transition-colors"
              title="Valor Absoluto: abs(x)"
            >
              abs(x)
            </button>
            <button
              onClick={() => handleAppend('math.pi')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-amber-300 transition-colors"
              title="Número Pi: math.pi (~3.1415)"
            >
              math.pi
            </button>
            <button
              onClick={() => handleAppend('math.e')}
              className="p-2 text-xs font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-amber-300 transition-colors"
              title="Constante de Euler: math.e (~2.7182)"
            >
              math.e
            </button>
          </div>
        )}

        {/* Standard Keypad */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="p-3 text-sm font-semibold rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors active:scale-95"
          >
            AC (Limpar)
          </button>
          <button
            onClick={() => handleAppend('(')}
            className="p-3 text-base font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors active:scale-95"
          >
            (
          </button>
          <button
            onClick={() => handleAppend(')')}
            className="p-3 text-base font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors active:scale-95"
          >
            )
          </button>
          <button
            onClick={() => handleAppend(' // ')}
            className="p-3 text-sm font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors active:scale-95"
            title="Divisão Inteira (ex: 7 // 2 = 3)"
          >
            // <span className="text-[10px] text-slate-400 block font-sans">div inteira</span>
          </button>
          <button
            onClick={() => handleAppend(' % ')}
            className="p-3 text-sm font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 transition-colors active:scale-95"
            title="Resto da Divisão / Módulo (ex: 7 % 2 = 1)"
          >
            % <span className="text-[10px] text-slate-400 block font-sans">módulo</span>
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleAppend('7')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            7
          </button>
          <button
            onClick={() => handleAppend('8')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            8
          </button>
          <button
            onClick={() => handleAppend('9')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            9
          </button>
          <button
            onClick={() => handleAppend(' / ')}
            className="p-3 text-lg font-mono rounded-lg bg-sky-600/30 hover:bg-sky-600/40 text-sky-200 transition-colors active:scale-95"
            title="Divisão Float (/)"
          >
            /
          </button>
          <button
            onClick={() => handleAppend('ans')}
            className="p-3 text-sm font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors active:scale-95"
            title="Último Resultado (ans)"
          >
            ans
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleAppend('4')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            4
          </button>
          <button
            onClick={() => handleAppend('5')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            5
          </button>
          <button
            onClick={() => handleAppend('6')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            6
          </button>
          <button
            onClick={() => handleAppend(' * ')}
            className="p-3 text-lg font-mono rounded-lg bg-sky-600/30 hover:bg-sky-600/40 text-sky-200 transition-colors active:scale-95"
            title="Multiplicação (*)"
          >
            *
          </button>
          <button
            onClick={() => handleAppend('round(')}
            className="p-3 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors active:scale-95"
            title="Arredondar: round(x, decimais)"
          >
            round()
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleAppend('1')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            1
          </button>
          <button
            onClick={() => handleAppend('2')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            2
          </button>
          <button
            onClick={() => handleAppend('3')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            3
          </button>
          <button
            onClick={() => handleAppend(' - ')}
            className="p-3 text-lg font-mono rounded-lg bg-sky-600/30 hover:bg-sky-600/40 text-sky-200 transition-colors active:scale-95"
            title="Subtração (-)"
          >
            -
          </button>
          <button
            onClick={handleBackspace}
            className="p-3 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors active:scale-95 flex items-center justify-center"
            title="Apagar (Backspace)"
          >
            ⌫ Del
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleAppend('0')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => handleAppend('.')}
            className="p-3 text-lg font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-100 transition-colors active:scale-95"
            title="Ponto decimal"
          >
            .
          </button>
          <button
            onClick={() => handleAppend(' ** ')}
            className="p-3 text-base font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors active:scale-95"
            title="Exponenciação: a ** b"
          >
            **
          </button>
          <button
            onClick={() => handleAppend(' + ')}
            className="p-3 text-lg font-mono rounded-lg bg-sky-600/30 hover:bg-sky-600/40 text-sky-200 transition-colors active:scale-95"
            title="Adição (+)"
          >
            +
          </button>
          <button
            onClick={handleCalculate}
            className="p-3 text-lg font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors active:scale-95 shadow-md flex items-center justify-center gap-1"
            title="Calcular em Python (Enter)"
          >
            =
          </button>
        </div>

        {/* Quick Tips */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Dica de atalho:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">Enter</kbd>
            <span>para calcular</span>
            <span aria-hidden="true">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">Esc</kbd>
            <span>para limpar</span>
          </div>
          <div className="text-slate-400">
            Sintaxe 100% compatível com Python 3.12
          </div>
        </div>
      </div>

      {/* History and Quick Python Examples Side Panel */}
      <div className="lg:col-span-4 space-y-5">
        {/* History Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200">Histórico de Cálculos</h2>
            </div>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Nenhum cálculo recente. Execute sua primeira operação para vê-la registrada aqui.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setExpression(item.expression);
                    setResult(item.result);
                    setResultType(item.resultType);
                  }}
                  className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono text-slate-400 truncate max-w-[170px]">
                      {item.expression}
                    </span>
                    <span className="font-mono text-amber-300/80 text-[10px]">
                      &lt;{item.resultType}&gt;
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-sm text-slate-100 tabular-nums">
                      = {item.result}
                    </span>
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Reutilizar ↵
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Python Formula Examples */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200">Exemplos Rápidos em Python</h2>
          </div>
          <div className="space-y-2 text-xs">
            <button
              onClick={() => {
                setExpression('math.sqrt(144) + 5**3');
              }}
              className="w-full text-left p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 transition-colors"
            >
              <div className="font-mono text-sky-300 text-[11px]">math.sqrt(144) + 5**3</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Raiz de 144 + 5 ao cubo (12 + 125 = 137)</div>
            </button>

            <button
              onClick={() => {
                setExpression('math.factorial(6) // 24');
              }}
              className="w-full text-left p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 transition-colors"
            >
              <div className="font-mono text-sky-300 text-[11px]">math.factorial(6) // 24</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Fatorial de 6 dividido inteiro por 24 (720 // 24 = 30)</div>
            </button>

            <button
              onClick={() => {
                setExpression('round(2 * math.pi * 7.5, 3)');
              }}
              className="w-full text-left p-2 rounded bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 transition-colors"
            >
              <div className="font-mono text-sky-300 text-[11px]">round(2 * math.pi * 7.5, 3)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Comprimento da circunferência de raio 7.5</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
