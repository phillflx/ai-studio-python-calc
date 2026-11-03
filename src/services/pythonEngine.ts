/**
 * Python Engine Service
 * Provides real Python execution in the browser via Pyodide WebAssembly,
 * with a resilient zero-latency native fallback parser for instant math calculations.
 */

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL?: string }) => Promise<any>;
  }
}

export interface PythonExecutionResult {
  success: boolean;
  result?: string;
  output?: string;
  resultType?: 'int' | 'float' | 'complex' | 'bool' | 'str' | 'list' | 'error';
  variables?: Record<string, { value: string; type: string }>;
  error?: string;
  executionTimeMs: number;
}

class PythonEngine {
  private pyodide: any = null;
  private isPyodideLoading = false;
  private pyodideReady = false;
  private loadPromise: Promise<void> | null = null;
  private simulatedVariables: Record<string, any> = {
    pi: Math.PI,
    e: Math.E,
    ans: 0,
    x: 0,
    y: 0,
    z: 0,
  };

  constructor() {
    this.initPyodide();
  }

  public get isReady(): boolean {
    return this.pyodideReady;
  }

  public get isLoading(): boolean {
    return this.isPyodideLoading;
  }

  private async initPyodide(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.isPyodideLoading = true;
    this.loadPromise = new Promise(async (resolve) => {
      try {
        if (!window.loadPyodide) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.async = true;
          document.head.appendChild(script);

          await new Promise<void>((res, rej) => {
            script.onload = () => res();
            script.onerror = () => rej(new Error('Failed to load Pyodide script'));
          });
        }

        if (window.loadPyodide) {
          this.pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          });

          // Preload standard modules
          await this.pyodide.runPythonAsync(`
import math
import statistics
ans = 0
x = 0
y = 0
z = 0
`);
          this.pyodideReady = true;
        }
      } catch (err) {
        console.warn('Pyodide CDN initialization fallback engaged:', err);
        this.pyodideReady = false;
      } finally {
        this.isPyodideLoading = false;
        resolve();
      }
    });

    return this.loadPromise;
  }

  /**
   * Run code with Pyodide or fallback engine
   */
  public async execute(code: string): Promise<PythonExecutionResult> {
    const startTime = performance.now();
    const trimmed = code.trim();

    if (!trimmed) {
      return {
        success: true,
        result: '',
        output: '',
        resultType: 'str',
        executionTimeMs: 0,
      };
    }

    if (this.pyodideReady && this.pyodide) {
      try {
        // Setup stdout redirection
        await this.pyodide.runPythonAsync(`
import sys
import io
__sys_stdout_buf = io.StringIO()
sys.stdout = __sys_stdout_buf
`);

        let pyResult = await this.pyodide.runPythonAsync(trimmed);

        const stdout: string = await this.pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
__sys_stdout_buf.getvalue()
`);

        // Check if an expression returned a value
        let resStr = '';
        let resType: PythonExecutionResult['resultType'] = 'str';

        if (pyResult !== undefined && pyResult !== null) {
          resStr = String(pyResult);
          if (typeof pyResult === 'number') {
            resType = Number.isInteger(pyResult) ? 'int' : 'float';
          } else if (typeof pyResult === 'boolean') {
            resType = 'bool';
          } else if (Array.isArray(pyResult)) {
            resType = 'list';
          } else {
            resType = 'str';
          }

          // Update ans in pyodide
          try {
            await this.pyodide.runPythonAsync(`ans = ${resStr}`);
          } catch {
            // ignore if resStr isn't literal
          }
        } else if (stdout) {
          resStr = stdout.trim();
          resType = 'str';
        }

        // Fetch variables
        const varsJson: string = await this.pyodide.runPythonAsync(`
import json
__user_vars = {}
for k, v in list(globals().items()):
    if not k.startswith('_') and k not in ('math', 'statistics', 'sys', 'io', 'json'):
        try:
            val_repr = repr(v)
            if len(val_repr) > 100: val_repr = val_repr[:97] + '...'
            __user_vars[k] = {'value': val_repr, 'type': type(v).__name__}
        except:
            pass
json.dumps(__user_vars)
`);
        const parsedVars = JSON.parse(varsJson || '{}');

        const endTime = performance.now();
        return {
          success: true,
          result: resStr,
          output: stdout,
          resultType: resType,
          variables: parsedVars,
          executionTimeMs: Math.round(endTime - startTime),
        };
      } catch (err: any) {
        const endTime = performance.now();
        const errMessage = err?.message || String(err);
        return {
          success: false,
          error: this.cleanPythonTraceback(errMessage),
          resultType: 'error',
          executionTimeMs: Math.round(endTime - startTime),
        };
      }
    }

    // Fallback instant client-side evaluator
    return this.fallbackEvaluate(trimmed, startTime);
  }

  private cleanPythonTraceback(msg: string): string {
    const lines = msg.split('\n');
    const relevant = lines.filter((l) => !l.includes('pyodide') && !l.includes('File "<exec>"'));
    return relevant.length > 0 ? relevant.join('\n').trim() : msg;
  }

  /**
   * Resilient, high-accuracy client-side evaluator for Python math expressions
   */
  private fallbackEvaluate(code: string, startTime: number): PythonExecutionResult {
    try {
      // Check for assignments like "x = 42" or "raio = 5"
      const assignMatch = code.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      let exprToEval = code;
      let targetVar: string | null = null;

      if (assignMatch) {
        targetVar = assignMatch[1];
        exprToEval = assignMatch[2];
      }

      // Check for print statement: print(...)
      let isPrint = false;
      const printMatch = exprToEval.match(/^print\((.*)\)$/);
      if (printMatch) {
        isPrint = true;
        exprToEval = printMatch[1];
      }

      const evaluatedValue = this.evalPythonExpression(exprToEval);

      if (targetVar) {
        this.simulatedVariables[targetVar] = evaluatedValue;
      }
      this.simulatedVariables.ans = evaluatedValue;

      let resType: PythonExecutionResult['resultType'] = 'float';
      if (typeof evaluatedValue === 'number') {
        resType = Number.isInteger(evaluatedValue) ? 'int' : 'float';
      } else if (typeof evaluatedValue === 'boolean') {
        resType = 'bool';
      } else if (Array.isArray(evaluatedValue)) {
        resType = 'list';
      }

      const resStr = String(evaluatedValue);
      const output = isPrint ? resStr : '';

      const varList: Record<string, { value: string; type: string }> = {};
      for (const [k, v] of Object.entries(this.simulatedVariables)) {
        varList[k] = {
          value: String(v),
          type: typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float') : typeof v,
        };
      }

      const endTime = performance.now();
      return {
        success: true,
        result: resStr,
        output: output,
        resultType: resType,
        variables: varList,
        executionTimeMs: Math.round(endTime - startTime),
      };
    } catch (err: any) {
      const endTime = performance.now();
      return {
        success: false,
        error: err?.message || 'SyntaxError: sintaxe inválida no Python',
        resultType: 'error',
        executionTimeMs: Math.round(endTime - startTime),
      };
    }
  }

  private evalPythonExpression(rawExpr: string): any {
    let expr = rawExpr.trim();

    // Replace Python operators and functions with JS equivalents
    // 1. Math constants & functions
    const mathReplacements: [RegExp, string][] = [
      [/\bmath\.pi\b/g, 'Math.PI'],
      [/\bmath\.e\b/g, 'Math.E'],
      [/\bmath\.sqrt\b/g, 'Math.sqrt'],
      [/\bmath\.sin\b/g, 'Math.sin'],
      [/\bmath\.cos\b/g, 'Math.cos'],
      [/\bmath\.tan\b/g, 'Math.tan'],
      [/\bmath\.asin\b/g, 'Math.asin'],
      [/\bmath\.acos\b/g, 'Math.acos'],
      [/\bmath\.atan\b/g, 'Math.atan'],
      [/\bmath\.log10\b/g, 'Math.log10'],
      [/\bmath\.log2\b/g, 'Math.log2'],
      [/\bmath\.log\b/g, 'Math.log'],
      [/\bmath\.exp\b/g, 'Math.exp'],
      [/\bmath\.floor\b/g, 'Math.floor'],
      [/\bmath\.ceil\b/g, 'Math.ceil'],
      [/\bmath\.pow\b/g, 'Math.pow'],
      [/\bmath\.factorial\((\d+)\)/g, 'factorial($1)'],
      [/\bmath\.comb\((\d+),\s*(\d+)\)/g, 'comb($1, $2)'],
      [/\babs\b/g, 'Math.abs'],
      [/\bround\b/g, 'Math.round'],
      [/\bTrue\b/g, 'true'],
      [/\bFalse\b/g, 'false'],
    ];

    for (const [regex, replacement] of mathReplacements) {
      expr = expr.replace(regex, replacement);
    }

    // 2. Python integer division // -> Math.floor(a / b)
    // Replace a // b
    expr = expr.replace(/(\d+(?:\.\d+)?|\b\w+\b)\s*\/\/\s*(\d+(?:\.\d+)?|\b\w+\b)/g, 'Math.floor($1 / $2)');

    // 3. Python power ** -> ** (valid in ES2016+)
    // JS supports **

    // Scope helpers
    const factorial = (n: number): number => {
      if (n < 0) throw new Error('ValueError: factorial() não é definido para números negativos');
      if (n <= 1) return 1;
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    };

    const comb = (n: number, k: number): number => {
      if (k < 0 || k > n) return 0;
      return factorial(n) / (factorial(k) * factorial(n - k));
    };

    const context = {
      Math,
      factorial,
      comb,
      ...this.simulatedVariables,
    };

    // Safe Function evaluation
    const fn = new Function(...Object.keys(context), `"use strict"; return (${expr});`);
    const val = fn(...Object.values(context));

    if (val === Infinity || val === -Infinity) {
      throw new Error('ZeroDivisionError: divisão por zero');
    }
    if (Number.isNaN(val)) {
      throw new Error('ValueError: domínio matemático inválido (ex: math.sqrt de número negativo)');
    }

    return val;
  }

  public setVariable(name: string, value: any): void {
    this.simulatedVariables[name] = value;
    if (this.pyodideReady && this.pyodide) {
      this.pyodide.runPythonAsync(`${name} = ${value}`).catch(() => {});
    }
  }

  public getVariables(): Record<string, any> {
    return { ...this.simulatedVariables };
  }
}

export const pythonEngine = new PythonEngine();
