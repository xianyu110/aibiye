export enum DegreeLevel {
  JUNIOR = '专科',
  UNDERGRADUATE = '本科',
  MASTER = '硕士',
  PHD = '博士',
  OTHER = '通用/其他'
}

export enum PaperType {
  THESIS = '毕业论文',
  TERM_PAPER = '课程论文',
  JOURNAL = '期刊论文',
  PROPOSAL = '开题报告',
  LITERATURE_REVIEW = '文献综述'
}

export interface PaperParams {
  topic: string;
  keywords: string;
  degree: DegreeLevel;
  type: PaperType;
  subjectArea: string; // e.g., Computer Science, Economics
  wordCountTarget?: number;
}

export interface GenerationResult {
  title: string;
  content: string; // Markdown formatted content
  generatedAt: Date;
}

export enum AppState {
  LANDING = 'LANDING',
  FORM = 'FORM',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}