import { marked } from 'marked';
import type { MarkdownElement } from '../store/useAppStore';

interface ParsedToken {
  type: string;
  text?: string;
  depth?: number;
  items?: ParsedToken[];
  header?: string[];
  rows?: string[][];
  lang?: string;
  raw: string;
}

// 布局配置
interface LayoutConfig {
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  lineSpacing: number;
}

export function parseMarkdownToElements(markdown: string, layoutConfig?: LayoutConfig): MarkdownElement[] {
  const config = layoutConfig || {
    canvasWidth: 1080,
    canvasHeight: 1440,
    padding: 60, // 适当减少边距，为大字体留出更多空间
    lineSpacing: 50 // 增加行间距，适配大字体
  };
  
  const tokens = marked.lexer(markdown) as ParsedToken[];
  const elements: MarkdownElement[] = [];
  
  // 计算内容区域
  const contentWidth = config.canvasWidth - (config.padding * 2);
  let yOffset = config.padding;
  
  tokens.forEach((token, index) => {
    const element = createElementFromToken(token, index, yOffset, config, contentWidth);
    if (element) {
      elements.push(element);
      yOffset += element.height + config.lineSpacing;
    }
  });
  
  // 如果内容总高度小于画布高度，垂直居中
  const totalHeight = yOffset - config.lineSpacing + config.padding;
  if (totalHeight < config.canvasHeight) {
    const verticalOffset = (config.canvasHeight - totalHeight) / 2;
    elements.forEach(element => {
      element.y += verticalOffset;
    });
  }
  
  return elements;
}

function createElementFromToken(
  token: ParsedToken, 
  index: number, 
  yOffset: number, 
  config: LayoutConfig,
  contentWidth: number
): MarkdownElement | null {
  const id = `element-${index}-${Date.now()}`;
  const baseElement = {
    id,
    x: config.padding, // 左对齐到内容区域
    y: yOffset,
    width: contentWidth, // 使用完整内容宽度
    fontSize: 32, // 大幅增大默认字体，适合小红书展示
    color: '#1f2937',
    textAlign: 'center' as const, // 文字居中
  };
  
  switch (token.type) {
    case 'heading':
      const headingLevel = token.depth || 1;
      // 大幅增大标题字体大小，适合小红书视觉冲击
      const headingFontSize = headingLevel === 1 ? 72 : headingLevel === 2 ? 56 : 44;
      const headingColor = getHeadingColor(headingLevel);
      
      return {
        ...baseElement,
        type: 'heading',
        content: token.text || '',
        level: headingLevel,
        height: calculateTextHeight(token.text || '', headingFontSize),
        fontSize: headingFontSize,
        color: headingColor,
      };
      
    case 'paragraph':
      const content = token.text || '';
      const isBold = content.includes('**') || content.includes('__');
      
      return {
        ...baseElement,
        type: 'paragraph',
        content: cleanMarkdownText(content),
        height: calculateTextHeight(content, baseElement.fontSize),
        fontSize: baseElement.fontSize, // 使用更大的字体
        color: isBold ? '#ec4899' : '#1f2937', // 用粉色突出加粗文字，更适合小红书
      };
      
    case 'list':
      const listContent = token.items?.map(item => 
        `• ${cleanMarkdownText(item.text || '')}`
      ).join('\n') || '';
      
      return {
        ...baseElement,
        type: 'list',
        content: listContent,
        height: calculateTextHeight(listContent, 28), // 增大列表字体
        fontSize: 28,
        textAlign: 'left' as const, // 列表保持左对齐
      };
      
    case 'blockquote':
      return {
        ...baseElement,
        type: 'blockquote',
        content: cleanMarkdownText(token.text || ''),
        height: calculateTextHeight(token.text || '', 26),
        fontSize: 26,
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        textAlign: 'left' as const, // 引用保持左对齐
      };
      
    case 'code':
      return {
        ...baseElement,
        type: 'code',
        content: token.text || '',
        height: calculateTextHeight(token.text || '', 24),
        fontSize: 24,
        backgroundColor: '#1f2937',
        color: '#f9fafb',
        textAlign: 'left' as const, // 代码保持左对齐
      };
      
    case 'table':
      const tableContent = formatTableContent(token);
      return {
        ...baseElement,
        type: 'table',
        content: tableContent,
        height: calculateTableHeight(token),
        fontSize: 24,
        textAlign: 'center' as const,
      };
      
    default:
      return null;
  }
}

function getHeadingColor(level: number): string {
  switch (level) {
    case 1: return '#dc2626'; // 醒目的红色，适合小红书
    case 2: return '#7c3aed'; // 紫色，时尚感
    case 3: return '#ea580c'; // 橙色，温暖感
    default: return '#1f2937';
  }
}

function cleanMarkdownText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic markers
    .replace(/__(.*?)__/g, '$1')    // Remove bold markers
    .replace(/_(.*?)_/g, '$1')      // Remove italic markers
    .replace(/`(.*?)`/g, '$1')      // Remove inline code markers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link markers
    .trim();
}

function calculateTextHeight(text: string, fontSize: number): number {
  const lines = text.split('\n').length;
  const lineHeight = fontSize * 1.8; // 进一步增加行高，适合大字体
  return Math.max(lines * lineHeight + 50, 80); // 增加最小高度，确保大字体有足够空间
}

function calculateTableHeight(token: ParsedToken): number {
  const headerHeight = 70; // 增加表头高度
  const rowHeight = 60; // 增加行高
  const rowCount = token.rows?.length || 0;
  return headerHeight + (rowCount * rowHeight) + 60; // 增加总体边距
}

function formatTableContent(token: ParsedToken): string {
  const headers = token.header || [];
  const rows = token.rows || [];
  
  let content = headers.join(' | ') + '\n';
  content += headers.map(() => '---').join(' | ') + '\n';
  
  rows.forEach(row => {
    content += row.join(' | ') + '\n';
  });
  
  return content.trim();
}

export function splitContentByHeadings(elements: MarkdownElement[], splitLevel: number = 1): MarkdownElement[][] {
  if (elements.length === 0) return [[]];
  
  const pages: MarkdownElement[][] = [];
  let currentPage: MarkdownElement[] = [];
  
  if (splitLevel === 1) {
    // H1分割：不分页，所有内容在一页
    elements.forEach(element => {
      currentPage.push(element);
    });
  } else if (splitLevel === 2) {
    // H2分割：遇到H1或H2时分页
    elements.forEach(element => {
      if (element.type === 'heading' && (element.level === 1 || element.level === 2)) {
        // 遇到H1或H2时，先保存之前的页面（如果有内容）
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
        }
        // 开始新页面，H1或H2作为第一个元素
        currentPage = [element];
      } else {
        // H3及其他所有内容都加入当前页面
        currentPage.push(element);
      }
    });
  } else {
    // 其他级别，使用通用逻辑：遇到小于等于splitLevel的标题时分页
    elements.forEach(element => {
      if (element.type === 'heading' && element.level && element.level <= splitLevel) {
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
        }
      }
      currentPage.push(element);
    });
  }
  
  // 添加最后一页
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages.length > 0 ? pages : [elements];
}

export function parseMarkdownToPages(markdown: string, splitLevel: number = 1): MarkdownElement[][] {
  // First parse markdown to elements with layout config
  const allElements = parseMarkdownToElements(markdown);
  
  // Then split by headings
  const pages = splitContentByHeadings(allElements, splitLevel);
  
  // Adjust positions for each page with improved layout
  return pages.map(pageElements => {
    const layoutConfig = {
      canvasWidth: 1080,
      canvasHeight: 1440,
      padding: 80,
      lineSpacing: 40
    };
    
    const contentWidth = layoutConfig.canvasWidth - (layoutConfig.padding * 2);
    let yOffset = layoutConfig.padding;
    
    const adjustedElements = pageElements.map(element => {
      const adjustedElement = {
        ...element,
        x: layoutConfig.padding, // 居中对齐
        y: yOffset,
        width: contentWidth // 使用完整宽度
      };
      yOffset += element.height + layoutConfig.lineSpacing;
      return adjustedElement;
    });
    
    // 如果页面内容总高度小于画布高度，垂直居中
    const totalHeight = yOffset - layoutConfig.lineSpacing + layoutConfig.padding;
    if (totalHeight < layoutConfig.canvasHeight) {
      const verticalOffset = (layoutConfig.canvasHeight - totalHeight) / 2;
      adjustedElements.forEach(element => {
        element.y += verticalOffset;
      });
    }
    
    return adjustedElements;
  });
}