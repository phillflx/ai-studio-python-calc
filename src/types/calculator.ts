export interface CalculationHistoryItem {
  id: string;
  expression: string;
  pythonCode: string;
  result: string;
  resultType: 'int' | 'float' | 'complex' | 'bool' | 'str' | 'list' | 'error';
  timestamp: Date;
  explanation?: string;
}

export interface PythonVariable {
  name: string;
  value: string;
  type: string;
}

export interface PythonSnippet {
  id: string;
  title: string;
  description: string;
  category: 'basico' | 'cientifico' | 'financeiro' | 'geometria' | 'estatistica';
  code: string;
}

export interface StandalonePythonScript {
  id: string;
  filename: string;
  title: string;
  description: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Interface Gráfica';
  code: string;
}
