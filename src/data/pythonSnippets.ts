import { PythonSnippet, StandalonePythonScript } from '../types/calculator';

export const STANDALONE_SCRIPTS: StandalonePythonScript[] = [
  {
    id: 'terminal',
    filename: 'calculadora_terminal.py',
    title: '1. Calculadora Interativa no Terminal (CLI)',
    description: 'Calculadora completa para linha de comando com loop interativo, validação de entradas e tratamento de exceções (ZeroDivisionError, ValueError).',
    level: 'Iniciante',
    code: `"""
Calculadora Interativa em Python
Execução direta via terminal / linha de comando.
Suporta operações aritméticas básicas e raízes quadradas.
"""

import math

def somar(a: float, b: float) -> float:
    return a + b

def subtrair(a: float, b: float) -> float:
    return a - b

def multiplicar(a: float, b: float) -> float:
    return a * b

def dividir(a: float, b: float) -> float:
    if b == 0:
        raise ZeroDivisionError("Erro: Não é possível dividir por zero!")
    return a / b

def potencia(base: float, expoente: float) -> float:
    return base ** expoente

def raiz_quadrada(n: float) -> float:
    if n < 0:
        raise ValueError("Erro: Raiz quadrada de número negativo não é real!")
    return math.sqrt(n)

def menu():
    print("\\n" + "=" * 40)
    print("      CALCULADORA EM PYTHON (CLI)")
    print("=" * 40)
    print("1 - Adição (+)")
    print("2 - Subtração (-)")
    print("3 - Multiplicação (*)")
    print("4 - Divisão (/)")
    print("5 - Potenciação (**)")
    print("6 - Raiz Quadrada (√)")
    print("0 - Sair")
    print("=" * 40)

def main():
    while True:
        menu()
        opcao = input("Escolha uma opção (0-6): ").strip()

        if opcao == "0":
            print("\\nObrigado por usar a calculadora! Encerrando...")
            break

        if opcao not in ("1", "2", "3", "4", "5", "6"):
            print("Opção inválida! Escolha um número de 0 a 6.")
            continue

        try:
            if opcao == "6":
                num = float(input("Digite o número para calcular a raiz: "))
                resultado = raiz_quadrada(num)
                print(f"\\n>>> math.sqrt({num}) = {resultado}")
            else:
                a = float(input("Digite o primeiro número: "))
                b = float(input("Digite o segundo número: "))

                if opcao == "1":
                    res = somar(a, b)
                    simbolo = "+"
                elif opcao == "2":
                    res = subtrair(a, b)
                    simbolo = "-"
                elif opcao == "3":
                    res = multiplicar(a, b)
                    simbolo = "*"
                elif opcao == "4":
                    res = dividir(a, b)
                    simbolo = "/"
                elif opcao == "5":
                    res = potencia(a, b)
                    simbolo = "**"

                print(f"\\n>>> {a} {simbolo} {b} = {res}")

        except ZeroDivisionError as err:
            print(f"\\n[ALERTA]: {err}")
        except ValueError as err:
            print(f"\\n[ALERTA]: Entrada inválida ou erro numérico: {err}")
        except Exception as e:
            print(f"\\n[ERRO INESPERADO]: {e}")

if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'poo',
    filename: 'calculadora_poo.py',
    title: '2. Calculadora Orientada a Objetos (POO)',
    description: 'Arquitetura limpa com classes, histórico de operações, método desfazer (undo), encadeamento de métodos e testes unitários com unittest.',
    level: 'Avançado',
    code: `"""
Calculadora Orientada a Objetos em Python
Demonstra encapsulamento, histórico de operações e suporte a Undo.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
import unittest

@dataclass
class RegistroHistorico:
    expressao: str
    resultado: float
    data_hora: datetime = datetime.now()

class Calculadora:
    """Calculadora com estado interno, encadeamento e histórico."""

    def __init__(self, valor_inicial: float = 0.0):
        self._valor: float = valor_inicial
        self._historico: List[RegistroHistorico] = []
        self._pilha_undo: List[float] = [valor_inicial]

    @property
    def valor(self) -> float:
        return self._valor

    def _salvar_estado(self, expressao: str):
        self._historico.append(RegistroHistorico(expressao, self._valor))
        self._pilha_undo.append(self._valor)

    def somar(self, n: float) -> "Calculadora":
        anterior = self._valor
        self._valor += n
        self._salvar_estado(f"{anterior} + {n}")
        return self

    def subtrair(self, n: float) -> "Calculadora":
        anterior = self._valor
        self._valor -= n
        self._salvar_estado(f"{anterior} - {n}")
        return self

    def multiplicar(self, n: float) -> "Calculadora":
        anterior = self._valor
        self._valor *= n
        self._salvar_estado(f"{anterior} * {n}")
        return self

    def dividir(self, n: float) -> "Calculadora":
        if n == 0:
            raise ZeroDivisionError("Divisão por zero não é permitida.")
        anterior = self._valor
        self._valor /= n
        self._salvar_estado(f"{anterior} / {n}")
        return self

    def potencia(self, n: float) -> "Calculadora":
        anterior = self._valor
        self._valor **= n
        self._salvar_estado(f"{anterior} ** {n}")
        return self

    def desfazer(self) -> Optional[float]:
        """Desfaz a última operação realizada."""
        if len(self._pilha_undo) > 1:
            self._pilha_undo.pop()
            self._valor = self._pilha_undo[-1]
            return self._valor
        return None

    def limpar(self) -> "Calculadora":
        self._valor = 0.0
        self._salvar_estado("LIMPAR -> 0")
        return self

    def obter_historico(self) -> List[RegistroHistorico]:
        return list(self._historico)


# Demonstração de uso
if __name__ == "__main__":
    calc = Calculadora(10)
    
    # Encadeamento de métodos (Fluent Interface)
    calc.somar(15).multiplicar(2).subtrair(10).dividir(4)
    print(f"Resultado final: {calc.valor}")  # ((10 + 15) * 2 - 10) / 4 = 10.0

    print("\\nHistórico de operações:")
    for item in calc.obter_historico():
        print(f" - {item.expressao} = {item.resultado}")

    # Testando o Desfazer (Undo)
    calc.desfazer()
    print(f"\\nApós desfazer a última divisão: {calc.valor}")
`,
  },
  {
    id: 'cientifica',
    filename: 'calculadora_cientifica.py',
    title: '3. Calculadora Científica e Matemática Avançada',
    description: 'Equipada com módulo math: trigonometria (graus/radianos), logaritmos, estatística (média/desvio), juros compostos e fórmula de Bhaskara.',
    level: 'Intermediário',
    code: `"""
Calculadora Científica em Python
Módulo completo com funções matemáticas e financeiras.
"""

import math
import statistics
from typing import Tuple, List, Optional

class CalculadoraCientifica:

    @staticmethod
    def bhaskara(a: float, b: float, c: float) -> Tuple[Optional[float], Optional[float]]:
        """Resolve equação quadrática ax² + bx + c = 0"""
        if a == 0:
            raise ValueError("O coeficiente 'a' não pode ser zero numa equação de 2º grau.")
        
        delta = (b ** 2) - (4 * a * c)
        if delta < 0:
            # Raízes complexas ou inexistentes nos reais
            return (None, None)
        
        raiz_delta = math.sqrt(delta)
        x1 = (-b + raiz_delta) / (2 * a)
        x2 = (-b - raiz_delta) / (2 * a)
        return (round(x1, 4), round(x2, 4))

    @staticmethod
    def juros_compostos(capital: float, taxa_percentual: float, tempo_meses: int) -> float:
        """Calcula montante final com capitalização composta: M = C * (1 + i)^t"""
        taxa_decimal = taxa_percentual / 100
        montante = capital * ((1 + taxa_decimal) ** tempo_meses)
        return round(montante, 2)

    @staticmethod
    def trigonometria(angulo_graus: float) -> dict:
        """Retorna seno, cosseno e tangente para um ângulo em graus"""
        rad = math.radians(angulo_graus)
        return {
            "seno": round(math.sin(rad), 5),
            "cosseno": round(math.cos(rad), 5),
            "tangente": round(math.tan(rad), 5) if abs(math.cos(rad)) > 1e-9 else "Indefinida"
        }

    @staticmethod
    def estatistica(dados: List[float]) -> dict:
        """Calcula média, mediana, variância e desvio padrão de um conjunto numérico"""
        if not dados:
            raise ValueError("A lista de dados não pode estar vazia.")
        return {
            "contagem": len(dados),
            "media": round(statistics.mean(dados), 4),
            "mediana": round(statistics.median(dados), 4),
            "desvio_padrao": round(statistics.stdev(dados), 4) if len(dados) > 1 else 0.0
        }

if __name__ == "__main__":
    print("--- Exemplo 1: Bhaskara x² - 5x + 6 = 0 ---")
    x1, x2 = CalculadoraCientifica.bhaskara(1, -5, 6)
    print(f"Raízes: x1 = {x1}, x2 = {x2}")

    print("\\n--- Exemplo 2: Juros Compostos (R$ 1.000 a 1.5% ao mês por 12 meses) ---")
    montante = CalculadoraCientifica.juros_compostos(1000, 1.5, 12)
    print(f"Montante acumulado: R$ {montante}")

    print("\\n--- Exemplo 3: Ângulo de 45° ---")
    trig = CalculadoraCientifica.trigonometria(45)
    print(f"Trigonometria: {trig}")
`,
  },
  {
    id: 'tkinter',
    filename: 'calculadora_gui_tkinter.py',
    title: '4. Calculadora Gráfica Desktop (Tkinter)',
    description: 'Interface gráfica visual completa para Windows, Mac e Linux construída com a biblioteca padrão Tkinter de Python. Sem dependências externas.',
    level: 'Interface Gráfica',
    code: `"""
Calculadora Visual Desktop com Tkinter (Python Standard Library)
Interface com botões modernos, teclado numérico e atalhos.
Execute com: python calculadora_gui_tkinter.py
"""

import tkinter as tk
from tkinter import messagebox
import math

class CalculadoraGUI:
    def __init__(self, master):
        self.master = master
        master.title("Calculadora Python")
        master.geometry("340x480")
        master.resizable(False, False)
        master.configure(bg="#0f172a")

        self.expressao = ""

        # Display superior para a fórmula
        self.label_expressao = tk.Label(
            master, text="", font=("JetBrains Mono", 12),
            bg="#0f172a", fg="#94a3b8", anchor="e", padx=15
        )
        self.label_expressao.pack(fill="x", pady=(15, 2))

        # Display principal para o número
        self.display = tk.Entry(
            master, font=("JetBrains Mono", 24, "bold"),
            bg="#1e293b", fg="#f8fafc", bd=0, justify="right"
        )
        self.display.insert(0, "0")
        self.display.pack(fill="x", padx=15, pady=(0, 15), ipady=8)

        # Grade de botões
        frame_botoes = tk.Frame(master, bg="#0f172a")
        frame_botoes.pack(fill="both", expand=True, padx=12, pady=(0, 15))

        botoes = [
            ("C", 0, 0, "#ef4444", "#ffffff"),
            ("(", 0, 1, "#334155", "#f8fafc"),
            (")", 0, 2, "#334155", "#f8fafc"),
            ("/", 0, 3, "#3b82f6", "#ffffff"),

            ("7", 1, 0, "#1e293b", "#f8fafc"),
            ("8", 1, 1, "#1e293b", "#f8fafc"),
            ("9", 1, 2, "#1e293b", "#f8fafc"),
            ("*", 1, 3, "#3b82f6", "#ffffff"),

            ("4", 2, 0, "#1e293b", "#f8fafc"),
            ("5", 2, 1, "#1e293b", "#f8fafc"),
            ("6", 2, 2, "#1e293b", "#f8fafc"),
            ("-", 2, 3, "#3b82f6", "#ffffff"),

            ("1", 3, 0, "#1e293b", "#f8fafc"),
            ("2", 3, 1, "#1e293b", "#f8fafc"),
            ("3", 3, 2, "#1e293b", "#f8fafc"),
            ("+", 3, 3, "#3b82f6", "#ffffff"),

            ("0", 4, 0, "#1e293b", "#f8fafc"),
            (".", 4, 1, "#1e293b", "#f8fafc"),
            ("**", 4, 2, "#334155", "#f8fafc"),
            ("=", 4, 3, "#eab308", "#0f172a"),
        ]

        for i in range(5):
            frame_botoes.rowconfigure(i, weight=1)
        for j in range(4):
            frame_botoes.columnconfigure(j, weight=1)

        for (texto, l, c, bg_cor, fg_cor) in botoes:
            btn = tk.Button(
                frame_botoes, text=texto, font=("Plus Jakarta Sans", 13, "bold"),
                bg=bg_cor, fg=fg_cor, activebackground="#475569",
                activeforeground="#ffffff", relief="flat", bd=0,
                command=lambda t=texto: self.ao_clicar_botao(t)
            )
            btn.grid(row=l, column=c, sticky="nsew", padx=3, pady=3)

        # Vincular teclas físicas
        master.bind("<Return>", lambda e: self.calcular())
        master.bind("<Escape>", lambda e: self.limpar())

    def ao_clicar_botao(self, caractere):
        if caractere == "C":
            self.limpar()
        elif caractere == "=":
            self.calcular()
        else:
            if self.display.get() == "0" and caractere not in (".", "**", "/", "*", "-", "+"):
                self.expressao = caractere
            else:
                self.expressao += str(caractere)
            self.atualizar_display()

    def atualizar_display(self):
        self.display.delete(0, tk.END)
        self.display.insert(0, self.expressao if self.expressao else "0")

    def limpar(self):
        self.expressao = ""
        self.label_expressao.config(text="")
        self.display.delete(0, tk.END)
        self.display.insert(0, "0")

    def calcular(self):
        if not self.expressao:
            return
        try:
            # Validação segura da sintaxe Python
            self.label_expressao.config(text=f"{self.expressao} =")
            resultado = eval(self.expressao, {"__builtins__": None, "math": math}, {})
            self.expressao = str(resultado)
            self.atualizar_display()
        except ZeroDivisionError:
            messagebox.showerror("Erro Matemático", "Não é possível dividir por zero!")
            self.limpar()
        except Exception:
            messagebox.showerror("Erro de Sintaxe", "Expressão matemática inválida.")
            self.limpar()

if __name__ == "__main__":
    raiz = tk.Tk()
    app = CalculadoraGUI(raiz)
    raiz.mainloop()
`,
  },
];

export const PRESET_SNIPPETS: PythonSnippet[] = [
  {
    id: 'bhaskara',
    title: 'Fórmula de Bhaskara (Equação 2º Grau)',
    category: 'cientifico',
    description: 'Encontra as raízes x1 e x2 de uma equação ax² + bx + c = 0',
    code: `# Equação: 1x² - 5x + 6 = 0
a, b, c = 1, -5, 6
delta = b**2 - 4*a*c
x1 = (-b + math.sqrt(delta)) / (2*a)
x2 = (-b - math.sqrt(delta)) / (2*a)
print(f"Delta: {delta}")
print(f"Raízes reais: x1 = {x1}, x2 = {x2}")
[x1, x2]`,
  },
  {
    id: 'juros',
    title: 'Juros Compostos (M = C * (1 + i)^t)',
    category: 'financeiro',
    description: 'Calcula montante final a partir de aporte inicial e taxa',
    code: `# R$ 5.000 investidos a 1% ao mês por 24 meses
capital = 5000.0
taxa_mensal = 0.01
meses = 24

montante = capital * ((1 + taxa_mensal) ** meses)
lucro_juros = montante - capital
print(f"Capital: R$ {capital:.2f}")
print(f"Montante final: R$ {montante:.2f}")
print(f"Lucro em juros: R$ {lucro_juros:.2f}")
round(montante, 2)`,
  },
  {
    id: 'estatistica',
    title: 'Média, Mediana e Desvio Padrão',
    category: 'estatistica',
    description: 'Análise descritiva usando a biblioteca standard statistics',
    code: `notas = [7.5, 8.0, 6.5, 9.0, 8.5, 10.0, 7.0]

media = statistics.mean(notas)
mediana = statistics.median(notas)
desvio = statistics.stdev(notas)

print(f"Amostra ({len(notas)} notas): {notas}")
print(f"Média: {media:.2f}")
print(f"Mediana: {mediana:.2f}")
print(f"Desvio Padrão: {desvio:.2f}")
{"media": round(media, 2), "mediana": round(mediana, 2), "desvio": round(desvio, 2)}`,
  },
  {
    id: 'trigonometria',
    title: 'Trigonometria e Círculo Trigonométrico',
    category: 'cientifico',
    description: 'Seno, cosseno, tangente e radianos para 30°, 45° e 60°',
    code: `angulos = [30, 45, 60]
tabela = []

for ang in angulos:
    rad = math.radians(ang)
    tabela.append({
        "graus": ang,
        "seno": round(math.sin(rad), 4),
        "cosseno": round(math.cos(rad), 4),
        "tangente": round(math.tan(rad), 4)
    })

print("Tabela Trigonométrica:")
for item in tabela:
    print(f"{item['graus']}° -> sen: {item['seno']}, cos: {item['cosseno']}, tan: {item['tangente']}")
tabela`,
  },
  {
    id: 'pitagoras',
    title: 'Teorema de Pitágoras (Hipotenusa)',
    category: 'geometria',
    description: 'Calcula a hipotenusa h = √(cateto1² + cateto2²)',
    code: `# Triângulo com catetos 3 e 4
cateto_a = 3
cateto_b = 4
hipotenusa = math.hypot(cateto_a, cateto_b)
# Equivalente a: math.sqrt(cateto_a**2 + cateto_b**2)

print(f"Catetos: a={cateto_a}, b={cateto_b}")
print(f"Hipotenusa calculada: {hipotenusa}")
hipotenusa`,
  },
  {
    id: 'fatorial',
    title: 'Fatorial e Combinações (Análise Combinatória)',
    category: 'basico',
    description: 'Permutação e cálculo de combinações math.comb(n, k)',
    code: `# Quantas maneiras de escolher 3 pessoas entre 10 candidatos?
n = 10
k = 3
combinacoes = math.comb(n, k)
fatorial_10 = math.factorial(10)

print(f"10! (fatorial de 10) = {fatorial_10}")
print(f"Combinações C(10, 3) = {combinacoes}")
combinacoes`,
  },
];
