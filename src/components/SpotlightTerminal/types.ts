export interface OutputLine {
  id: string
  type: 'command' | 'result' | 'error' | 'system' | 'completion-hint' | 'welcome'
  content: string
  timestamp: number
  animate?: boolean
}

export interface CompletionResult {
  completions: string[]
  commonPrefix: string
  applied: boolean
}
