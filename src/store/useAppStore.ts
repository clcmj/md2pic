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
  { name: '微博', width: 1080, height: 1080, description: '1080×1080' },
  { name: '朋友圈', width: 1080, height: 1260, description: '1080×1260' },
  { name: 'Instagram', width: 1080, height: 1080, description: '1080×1080' },
  { name: 'Twitter', width: 1200, height: 675, description: '1200×675' },
];

const defaultStyleSettings: StyleSettings = {
  theme: 'blue',
  globalFontSize: 24, // 增大默认字体
  lineHeight: 'normal',
  textAlign: 'center', // 默认居中对齐
  h1Color: '#2563eb',
  h2Color: '#059669',
  h3Color: '#ea580c',
  boldColor: '#7c3aed',
};

export const useAppStore = create<AppState>((set, get) => ({
  // Markdown content
  markdownContent: '# 欢迎使用 md2pic\n\n**Markdown 转图片工具**\n\n让文字变得更美\n\n## 核心功能\n\n实时预览与编辑\n\n拖拽式布局调整\n\n多种精美样式\n\n一键导出高清图片\n\n## 智能分页\n\nH1分割：章节级分页\n\nH2分割：小节级分页\n\n自动布局优化\n\n# 功能特点\n\n专业的排版效果\n\n## 编辑体验\n\n点击元素即可编辑\n\n右侧面板全功能控制\n\n支持字体、颜色、对齐\n\n拖拽移动和缩放\n\n## 导出功能\n\n支持PNG、JPEG、WebP格式\n\n批量导出多页内容\n\n高分辨率输出\n\n# 使用指南\n\n简单易用的界面\n\n## 快速开始\n\n1. 编辑左侧Markdown内容\n2. 在中间画布预览效果\n3. 使用右侧面板调整样式\n4. 点击导出下载图片\n\n## 高级功能\n\n支持表格、代码块\n\n自定义样式主题\n\n响应式布局设计',
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
export type { MarkdownElement, CanvasFormat, StyleSettings };