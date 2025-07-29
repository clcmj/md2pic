import { create } from 'zustand';
import { parseMarkdownToPages } from '../lib/markdownParser';

interface MarkdownElement {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'code' | 'table';
  content: string;
  level?: number; // for headings
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
}

interface CanvasFormat {
  name: string;
  width: number;
  height: number;
  description: string;
  backgroundColor?: string;
  backgroundType?: 'solid' | 'gradient';
  gradientDirection?: string;
  gradientColors?: string[];
}

interface BackgroundSettings {
  type: 'solid' | 'gradient';
  solidColor: string;
  gradientType: 'linear' | 'radial';
  gradientDirection: string;
  gradientColors: string[];
}

interface StyleSettings {
  theme: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
  globalFontSize: number;
  lineHeight: 'tight' | 'normal' | 'loose';
  textAlign: 'left' | 'center' | 'right';
  h1Color: string;
  h2Color: string;
  h3Color: string;
  boldColor: string;
}

interface AppState {
  // Markdown content
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
  
  // Parsed elements
  elements: MarkdownElement[];
  setElements: (elements: MarkdownElement[]) => void;
  updateElement: (id: string, updates: Partial<MarkdownElement>) => void;
  deleteElement: (id: string) => void;
  
  // Selected element
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  
  // Canvas settings
  canvasFormat: CanvasFormat;
  setCanvasFormat: (format: CanvasFormat) => void;
  canvasScale: number;
  setCanvasScale: (scale: number) => void;
  
  // Style settings
  styleSettings: StyleSettings;
  updateStyleSettings: (updates: Partial<StyleSettings>) => void;
  
  // Background settings
  backgroundSettings: BackgroundSettings;
  updateBackgroundSettings: (updates: Partial<BackgroundSettings>) => void;
  
  // Pages
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  pages: MarkdownElement[][];
  setPages: (pages: MarkdownElement[][]) => void;
  
  // Page splitting
  splitLevel: number;
  setSplitLevel: (level: number) => void;
  autoSplit: boolean;
  setAutoSplit: (auto: boolean) => void;
  splitPages: () => void;
  
  // History for undo/redo
  history: MarkdownElement[][];
  historyIndex: number;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const defaultCanvasFormats: CanvasFormat[] = [
  { name: '小红书', width: 1080, height: 1440, description: '1080×1440' },
];

const defaultStyleSettings: StyleSettings = {
  theme: 'blue',
  globalFontSize: 32, // 大字体，适合视觉展示
  lineHeight: 'normal',
  textAlign: 'center', // 默认居中对齐
  h1Color: '#2563eb', // 蓝色系主色
  h2Color: '#93c5fd', // 蓝色系辅色
  h3Color: '#ea580c', // 保持橙色
  boldColor: '#7c3aed', // 保持紫色
};

const defaultBackgroundSettings: BackgroundSettings = {
  type: 'solid',
  solidColor: '#ffffff',
  gradientType: 'linear',
  gradientDirection: 'to bottom',
  gradientColors: ['#f8fafc', '#e2e8f0']
};

export const useAppStore = create<AppState>((set, get) => ({
  // Markdown content
  markdownContent: '# ✨ 超实用工具分享\n\n**Markdown转图片神器**\n\n让你的文字瞬间变美！\n\n## 🔥 核心亮点\n\n**一键生成精美图片**\n\n完美适配小红书尺寸\n\n**拖拽式自由布局**\n\n想怎么排就怎么排\n\n## 💡 使用场景\n\n📚 **学习笔记**\n做出颜值超高的知识卡片\n\n💼 **工作汇报**\n让PPT告别单调文字\n\n🎨 **创意分享**\n把想法变成视觉作品\n\n# 🎯 三步搞定\n\n## 第一步：输入内容\n在左侧编辑你的文字\n\n## 第二步：调整样式\n右侧面板一键美化\n\n## 第三步：导出分享\n高清图片立即下载\n\n**简单到爆！小白也能用！**',
  setMarkdownContent: (content) => set({ markdownContent: content }),
  
  // Parsed elements
  elements: [],
  setElements: (elements) => {
    set({ elements });
    get().saveToHistory();
  },
  updateElement: (id, updates) => {
    const elements = get().elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    set({ elements });
    // Don't save to history during frequent updates (like dragging)
    // History will be saved when drag ends
  },
  deleteElement: (id) => {
    const elements = get().elements.filter(el => el.id !== id);
    set({ elements, selectedElementId: null });
    get().saveToHistory();
  },
  
  // Selected element
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  
  // Canvas settings
  canvasFormat: defaultCanvasFormats[0],
  setCanvasFormat: (format) => set({ canvasFormat: format }),
  canvasScale: 1,
  setCanvasScale: (scale) => set({ canvasScale: scale }),
  
  // Style settings
  styleSettings: defaultStyleSettings,
  updateStyleSettings: (updates) => set(state => ({
    styleSettings: { ...state.styleSettings, ...updates }
  })),
  
  // Background settings
  backgroundSettings: defaultBackgroundSettings,
  updateBackgroundSettings: (updates) => set(state => ({
    backgroundSettings: { ...state.backgroundSettings, ...updates }
  })),
  
  // Pages
  currentPage: 1,
  totalPages: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  pages: [[]],
  setPages: (pages) => {
    set({ 
      pages, 
      totalPages: pages.length,
      currentPage: Math.min(get().currentPage, pages.length)
    });
  },
  
  // Page splitting
  splitLevel: 2,
  setSplitLevel: (level) => set({ splitLevel: level }),
  autoSplit: true,
  setAutoSplit: (auto) => set({ autoSplit: auto }),
  splitPages: () => {
     const { markdownContent, splitLevel } = get();
     if (markdownContent) {
       const pages = parseMarkdownToPages(markdownContent, splitLevel);
       get().setPages(pages);
     }
   },
  
  // History
  history: [[]],
  historyIndex: 0,
  saveToHistory: () => {
    const { elements, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      set({ historyIndex: historyIndex + 1 });
    }
    
    set({ history: newHistory });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ 
        elements: [...history[newIndex]], 
        historyIndex: newIndex,
        selectedElementId: null 
      });
    }
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ 
        elements: [...history[newIndex]], 
        historyIndex: newIndex,
        selectedElementId: null 
      });
    }
  },
}));

export { defaultCanvasFormats };
export type { MarkdownElement, CanvasFormat, StyleSettings, BackgroundSettings };