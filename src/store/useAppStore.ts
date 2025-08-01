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
  // 美化选项
  border: {
    enabled: boolean;
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
    radius: number;
  };
  shadow: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    color: string;
    opacity: number;
  };
  pattern: {
    enabled: boolean;
    type: 'dots' | 'grid' | 'diagonal' | 'none';
    color: string;
    opacity: number;
    size: number;
  };
  frame: {
    enabled: boolean;
    type: 'simple' | 'elegant' | 'modern' | 'vintage';
    color: string;
    width: number;
  };
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

// AI对话相关接口
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
}

interface AIState {
  // AI配置
  aiConfig: AIConfig;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  
  // 对话历史
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  
  // 对话状态
  isAILoading: boolean;
  setIsAILoading: (loading: boolean) => void;
  aiError: string | null;
  setAIError: (error: string | null) => void;
  
  // AI对话功能
  sendMessageToAI: (message: string) => Promise<void>;
  insertAIContentToMarkdown: (content: string, insertMode?: 'append' | 'replace') => void;
}

interface AppState extends AIState {
  // Markdown content
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
  
  // Parsed elements
  elements: MarkdownElement[];
  setElements: (elements: MarkdownElement[]) => void;
  updateElement: (id: string, updates: Partial<MarkdownElement>) => void;
  deleteElement: (id: string) => void;
  addElement: (element: Omit<MarkdownElement, 'id'>) => void;
  
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
  generateRandomBackground: () => void;
  
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

// 生成随机背景设置的函数
function generateRandomBackgroundSettings(): BackgroundSettings {
  const gradientPresets = [
    // 清新淡雅系列
    ['#f0f9ff', '#e0e7ff'], // 蓝色渐变
    ['#f0fdf4', '#dcfce7'], // 绿色渐变
    ['#fef7f0', '#fed7aa'], // 橙色渐变
    ['#fdf4ff', '#f3e8ff'], // 紫色渐变
    ['#f0fdfa', '#ccfbf1'], // 青色渐变
    ['#fffbeb', '#fef3c7'], // 黄色渐变
    ['#fdf2f8', '#fce7f3'], // 粉色渐变
    
    // 现代深色系列
    ['#1e293b', '#334155'], // 深蓝灰
    ['#1f2937', '#374151'], // 深灰
    ['#064e3b', '#065f46'], // 深绿
    ['#581c87', '#7c2d8e'], // 深紫
    
    // 渐变对比系列
    ['#667eea', '#764ba2'], // 蓝紫渐变
    ['#f093fb', '#f5576c'], // 粉红渐变
    ['#4facfe', '#00f2fe'], // 蓝青渐变
    ['#43e97b', '#38f9d7'], // 绿青渐变
    ['#fa709a', '#fee140'], // 粉黄渐变
  ];
  
  const directions = [
    'to bottom',
    'to top',
    'to right',
    'to left',
    'to bottom right',
    'to bottom left',
    'to top right',
    'to top left'
  ];
  
  const borderColors = [
    '#e2e8f0', '#cbd5e1', '#94a3b8',
    '#ddd6fe', '#c4b5fd', '#a78bfa',
    '#fde68a', '#fcd34d', '#f59e0b',
    '#fed7d7', '#fca5a5', '#f87171',
    '#bbf7d0', '#86efac', '#4ade80'
  ];
  
  const frameTypes: Array<'simple' | 'elegant' | 'modern' | 'vintage'> = ['simple', 'elegant', 'modern', 'vintage'];
  
  // 随机选择渐变色彩
  const selectedGradient = gradientPresets[Math.floor(Math.random() * gradientPresets.length)];
  const selectedDirection = directions[Math.floor(Math.random() * directions.length)];
  const selectedBorderColor = borderColors[Math.floor(Math.random() * borderColors.length)];
  const selectedFrameType = frameTypes[Math.floor(Math.random() * frameTypes.length)];
  
  // 80% 概率使用渐变，20% 概率使用纯色
  const useGradient = Math.random() > 0.2;
  
  return {
    type: useGradient ? 'gradient' : 'solid',
    solidColor: useGradient ? '#ffffff' : selectedGradient[0],
    gradientType: 'linear',
    gradientDirection: selectedDirection,
    gradientColors: selectedGradient,
    border: {
      enabled: Math.random() > 0.3, // 70% 概率启用边框
      width: Math.floor(Math.random() * 4) + 2, // 2-5px
      color: selectedBorderColor,
      style: Math.random() > 0.7 ? 'dashed' : 'solid',
      radius: Math.floor(Math.random() * 20) + 8 // 8-27px
    },
    shadow: {
      enabled: Math.random() > 0.4, // 60% 概率启用阴影
      x: Math.floor(Math.random() * 8) - 4, // -4 到 4
      y: Math.floor(Math.random() * 12) + 2, // 2 到 14
      blur: Math.floor(Math.random() * 20) + 8, // 8 到 28
      color: '#000000',
      opacity: Math.random() * 0.15 + 0.05 // 0.05 到 0.2
    },
    pattern: {
      enabled: Math.random() > 0.7, // 30% 概率启用图案
      type: ['dots', 'grid', 'diagonal'][Math.floor(Math.random() * 3)] as 'dots' | 'grid' | 'diagonal',
      color: '#ffffff',
      opacity: Math.random() * 0.1 + 0.05, // 0.05 到 0.15
      size: Math.floor(Math.random() * 30) + 15 // 15 到 45
    },
    frame: {
      enabled: Math.random() > 0.6, // 40% 概率启用装饰框
      type: selectedFrameType,
      color: selectedBorderColor,
      width: Math.floor(Math.random() * 8) + 4 // 4 到 12
    }
  };
}

// 固定的美观背景设置 - 浅色背景+深色字体
const defaultBackgroundSettings: BackgroundSettings = {
  type: 'gradient',
  solidColor: '#ffffff',
  gradientType: 'linear',
  gradientDirection: 'to bottom right',
  gradientColors: ['#f8fafc', '#f1f5f9'], // 温和的灰白渐变
  border: {
    enabled: true,
    width: 2,
    color: '#e2e8f0',
    style: 'solid',
    radius: 12
  },
  shadow: {
    enabled: true,
    x: 0,
    y: 4,
    blur: 16,
    color: '#000000',
    opacity: 0.08
  },
  pattern: {
    enabled: false,
    type: 'dots',
    color: '#f3f4f6',
    opacity: 0.3,
    size: 20
  },
  frame: {
    enabled: false,
    type: 'simple',
    color: '#374151',
    width: 8
  }
};

// 默认AI配置
const defaultAIConfig: AIConfig = {
  apiKey: '',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen3-coder-plus',
  enabled: false
};

export const useAppStore = create<AppState>((set, get) => ({
  // Markdown content
  markdownContent: '# ✨ 超实用工具分享\n\n**Markdown转图片神器**\n\n让你的文字瞬间变美！\n\n## 🔥 核心亮点\n\n**一键生成精美图片**\n\n完美适配小红书尺寸\n\n**拖拽式自由布局**\n\n想怎么排就怎么排\n\n## 💡 使用场景\n\n📚 **学习笔记**\n做出颜值超高的知识卡片\n\n💼 **工作汇报**\n让PPT告别单调文字\n\n🎨 **创意分享**\n把想法变成视觉作品\n\n## 📊 功能对比\n\n| 功能 | 传统方式 | md2pic |\n|------|----------|--------|\n| 制作图片 | 复杂设计软件 | 一键生成 |\n| 文字编辑 | 固定模板 | 自由布局 |\n| 导出质量 | 压缩失真 | 高清无损 |\n\n# 🎯 三步搞定\n\n## 第一步：输入内容\n在左侧编辑你的文字\n\n## 第二步：调整样式\n右侧面板一键美化\n\n## 第三步：导出分享\n高清图片立即下载\n\n**简单到爆！小白也能用！**',
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
  addElement: (elementData) => {
    const newElement: MarkdownElement = {
      ...elementData,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const state = get();
    
    // 如果是分页模式，添加到当前页面
    if (state.pages.length > 1) {
      const updatedPages = [...state.pages];
      const currentPageIndex = state.currentPage - 1;
      if (updatedPages[currentPageIndex]) {
        updatedPages[currentPageIndex] = [...updatedPages[currentPageIndex], newElement];
        set({ 
          pages: updatedPages, 
          selectedElementId: newElement.id 
        });
      }
    } else {
      // 非分页模式，添加到elements
      const elements = [...state.elements, newElement];
      set({ elements, selectedElementId: newElement.id });
    }
    
    get().saveToHistory();
  },
  
  // Selected element
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  
  // Canvas settings
  canvasFormat: defaultCanvasFormats[0],
  setCanvasFormat: (format) => set({ canvasFormat: format }),
  canvasScale: 0.5,
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
  generateRandomBackground: () => set({
    backgroundSettings: generateRandomBackgroundSettings()
  }),
  
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

  // AI 相关状态
  aiConfig: defaultAIConfig,
  updateAIConfig: (config) => set((state) => ({ 
    aiConfig: { ...state.aiConfig, ...config } 
  })),
  
  chatMessages: [],
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }]
  })),
  clearChatHistory: () => set({ chatMessages: [] }),
  
  isAILoading: false,
  setIsAILoading: (loading) => set({ isAILoading: loading }),
  aiError: null,
  setAIError: (error) => set({ aiError: error }),
  
  // AI对话功能
  sendMessageToAI: async (message: string) => {
    const { aiConfig, addChatMessage, setIsAILoading, setAIError } = get();
    
    if (!aiConfig.enabled || !aiConfig.apiKey) {
      setAIError('请先配置AI API Key');
      return;
    }
    
    try {
      setIsAILoading(true);
      setAIError(null);
      
      // 添加用户消息
      addChatMessage({ role: 'user', content: message });
      
      // 调用AI API
      const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates markdown content. Please respond in Chinese and format your response as valid markdown.' },
            { role: 'user', content: message }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;
      
      if (aiResponse) {
        // 添加AI回复消息
        addChatMessage({ role: 'assistant', content: aiResponse });
      } else {
        throw new Error('AI响应格式错误');
      }
      
    } catch (error) {
      console.error('AI API调用错误:', error);
      setAIError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsAILoading(false);
    }
  },
  
  insertAIContentToMarkdown: (content: string, insertMode: 'append' | 'replace' = 'append') => {
    const { markdownContent, setMarkdownContent } = get();
    
    if (insertMode === 'replace') {
      setMarkdownContent(content);
    } else {
      const newContent = markdownContent ? `${markdownContent}\n\n${content}` : content;
      setMarkdownContent(newContent);
    }
  },
}));

export { defaultCanvasFormats };
export type { MarkdownElement, CanvasFormat, StyleSettings, BackgroundSettings, ChatMessage, AIConfig };