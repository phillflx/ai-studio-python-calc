import React from 'react';
import { BookOpen, ArrowUpRight, HelpCircle } from 'lucide-react';

interface SyntaxGuideProps {
  onLoadExpression: (expr: string) => void;
}

export const SyntaxGuide: React.FC<SyntaxGuideProps> = ({ onLoadExpression }) => {
  const operators = [
    {
      symbol: '+',
      name: 'Adição',
      example: '15 + 27',
      result: '42',
      description: 'Soma dois números inteiros ou com ponto flutuante.',
    },
    {
      symbol: '-',
      name: 'Subtração',
      example: '100 - 45.5',
      result: '54.5',
      description: 'Subtrai o segundo valor do primeiro ou nega um número.',
    },
    {
      symbol: '*',
      name: 'Multiplicação',
      example: '12 * 8',
      result: '96',
      description: 'Produto entre dois operandos.',
    },
    {
      symbol: '/',
      name: 'Divisão Real (Float)',
      example: '7 / 2',
      result: '3.5',
      description: 'Retorna sempre um número decimal (<class \'float\'>) mesmo se a divisão for exata.',
    },
    {
      symbol: '//',
      name: 'Divisão Inteira (Floor Div)',
      example: '7 // 2',
      result: '3',
      description: 'Retorna a parte inteira do quociente, descartando o resto decimal.',
    },
    {
      symbol: '%',
      name: 'Módulo / Resto',
      example: '7 % 2',
      result: '1',
      description: 'Calcula o resto da divisão inteira. Útil para verificar paridade (n % 2 == 0).',
    },
    {
      symbol: '**',
      name: 'Exponenciação / Potência',
      example: '2 ** 8',
      result: '256',
      description: 'Eleva a base ao expoente (em Python, 2**8 substitui math.pow(2, 8)).',
    },
  ];

  const mathFunctions = [
    {
      code: 'math.sqrt(x)',
      name: 'Raiz Quadrada',
      example: 'math.sqrt(144)',
      result: '12.0',
      note: 'Gera ValueError se x for negativo nos reais.',
    },
    {
      code: 'math.pow(x, y)',
      name: 'Potência',
      example: 'math.pow(3, 4)',
      result: '81.0',
      note: 'Retorna float. Idêntico a x ** y.',
    },
    {
      code: 'math.factorial(n)',
      name: 'Fatorial de n',
      example: 'math.factorial(5)',
      result: '120',
      note: 'Calcula 5! = 5 * 4 * 3 * 2 * 1.',
    },
    {
      code: 'math.sin(rad), math.cos(rad)',
      name: 'Trigonometria',
      example: 'round(math.sin(math.pi / 2), 2)',
      result: '1.0',
      note: 'Os ângulos devem ser convertidos em radianos com math.radians(graus).',
    },
    {
      code: 'math.log(x, [base])',
      name: 'Logaritmo',
      example: 'round(math.log(100, 10), 2)',
      result: '2.0',
      note: 'Se a base for omitida, calcula o logaritmo natural na base de Euler (ln).',
    },
    {
      code: 'math.gcd(a, b)',
      name: 'MDC (Maior Divisor Comum)',
      example: 'math.gcd(48, 18)',
      result: '6',
      note: 'Calcula o máximo divisor comum entre dois inteiros.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 mb-1">
          Guia de Operações e Sintaxe da Calculadora Python
        </h2>
        <p className="text-sm text-slate-400">
          Entenda como o interpretador Python processa operadores matemáticos, precedência de cálculo e funções da biblioteca padrão.
        </p>
      </div>

      {/* Grid: Operadores Aritméticos */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-amber-400" />
          <span>Operadores Aritméticos Nativos do Python</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Operador</th>
                <th className="py-2.5 px-3">Nome</th>
                <th className="py-2.5 px-3">Exemplo em Python</th>
                <th className="py-2.5 px-3 text-right">Resultado</th>
                <th className="py-2.5 px-3">Descrição</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {operators.map((op) => (
                <tr key={op.symbol} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-amber-300 font-bold text-sm">{op.symbol}</td>
                  <td className="py-3 px-3 font-sans text-slate-300 font-medium">{op.name}</td>
                  <td className="py-3 px-3 text-sky-300">{op.example}</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold tabular-nums">
                    {op.result}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-400 max-w-xs">{op.description}</td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => onLoadExpression(op.example)}
                      className="text-amber-400 hover:text-amber-300 font-medium text-xs inline-flex items-center gap-0.5"
                    >
                      <span>Testar</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Módulo Math */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-sky-400" />
          <span>Funções do Módulo Standard `math`</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {mathFunctions.map((fn) => (
            <div
              key={fn.code}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-semibold text-sky-300">{fn.code}</span>
                  <span className="text-[11px] text-slate-400">{fn.name}</span>
                </div>
                <div className="text-xs text-slate-400 mb-2 leading-relaxed">{fn.note}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs font-mono">
                <span className="text-slate-400">{fn.example} = <strong className="text-emerald-400 tabular-nums">{fn.result}</strong></span>
                <button
                  onClick={() => onLoadExpression(fn.example)}
                  className="text-amber-400 hover:text-amber-300 font-sans text-xs flex items-center gap-0.5 font-medium"
                >
                  <span>Testar</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Precedência de Operadores (PEMDAS) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Ordem de Precedência de Operadores em Python (PEMDAS)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Assim como na matemática formal, o interpretador Python segue uma ordem rigorosa de execução:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-mono text-amber-300 font-bold mb-1">1. Parênteses ( )</div>
            <div className="text-slate-400 text-[11px]">Subexpressões dentro de parênteses têm prioridade máxima.</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-mono text-amber-300 font-bold mb-1">2. Expoentes **</div>
            <div className="text-slate-400 text-[11px]">Avaliados da direita para a esquerda (ex: 2**3**2 = 512).</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-mono text-amber-300 font-bold mb-1">3. * / // %</div>
            <div className="text-slate-400 text-[11px]">Multiplicação, divisões e resto da esquerda para a direita.</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="font-mono text-amber-300 font-bold mb-1">4. + -</div>
            <div className="text-slate-400 text-[11px]">Adição e subtração executadas por último.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
