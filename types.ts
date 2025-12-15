export enum AppState {
  LANDING = 'LANDING',
  FORM = 'FORM',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}

// 导出改写模式类型，方便其他组件使用
export type { ParaphraseMode } from './services/geminiService';