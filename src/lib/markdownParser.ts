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
  // 先用临时配置解析元素，估算总高度
  const tempTokens = marked.lexer(markdown) as ParsedToken[];
  
  // 估算内容总高度（使用较大的行间距进行初步计算）
  let estimatedHeight = 200; // 起始边距
  tempTokens.forEach(token => {
    switch (token.type) {
      case 'heading':
        const level = token.depth || 1;
        const fontSize = level === 1 ? 72 : level === 2 ? 56 : 44;
        estimatedHeight += fontSize * 1.8 + 60; // 估算标题高度
        break;
      case 'paragraph':
        estimatedHeight += 32 * 1.8 + 40; // 估算段落高度
        break;
      case 'list':
        const items = token.items?.length || 1;
        estimatedHeight += items * 28 * 1.5 + 40; // 估算列表高度
        break;
      default:
        estimatedHeight += 60; // 其他元素的默认高度
    }
  });
  
  // 根据内容密度动态调整行间距
  const canvasHeight = 1440;
  const contentDensity = estimatedHeight / canvasHeight;
  
  let dynamicLineSpacing;
  if (contentDensity > 1.5) {
    dynamicLineSpacing = 15; // 内容非常密集
  } else if (contentDensity > 1.2) {
    dynamicLineSpacing = 25; // 内容很密集
  } else if (contentDensity > 1.0) {
    dynamicLineSpacing = 35; // 内容较密集
  } else if (contentDensity > 0.7) {
    dynamicLineSpacing = 45; // 内容适中
  } else {
    dynamicLineSpacing = 55; // 内容较少，可以用大行间距
  }
  
  const config = layoutConfig || {
    canvasWidth: 1080,
    canvasHeight: 1440,
    padding: 100, // 增加上下左右边距，防止大字体超出
    lineSpacing: dynamicLineSpacing // 智能动态行间距
  };
  
  const tokens = marked.lexer(markdown) as ParsedToken[];
  const elements: MarkdownElement[] = [];
  
  // 计算内容区域
  const contentWidth = config.canvasWidth - (config.padding * 2);
  let yOffset = config.padding;
  
  tokens.forEach((token, index) => {
    const element = createElementFromToken(token, index, yOffset, config, contentWidth, contentDensity);
    if (element) {
      elements.push(element);
      yOffset += element.height + config.lineSpacing;
    }
  });
  
  // 如果内容总高度小于画布高度，垂直居中（但保持最小边距）
  const totalHeight = yOffset - config.lineSpacing + config.padding;
  const finalContentDensity = totalHeight / config.canvasHeight;
  
  if (totalHeight < config.canvasHeight) {
    const availableSpace = config.canvasHeight - totalHeight;
    
    // 根据内容密度决定居中策略
    let verticalOffset;
    if (finalContentDensity > 0.9) {
      // 内容很密集时，只保持最小顶部边距，不强制居中
      verticalOffset = Math.max(0, config.padding * 0.5);
    } else if (finalContentDensity > 0.7) {
      // 内容较密集时，轻微居中
      verticalOffset = Math.max(availableSpace * 0.3, config.padding * 0.7);
    } else {
      // 内容较少时，正常居中
      verticalOffset = Math.max(availableSpace / 2, config.padding);
    }
    
    // 确保不会超出底部边界
    const maxOffset = config.canvasHeight - totalHeight - config.padding * 0.5;
    const safeOffset = Math.min(verticalOffset, Math.max(0, maxOffset));
    
    elements.forEach(element => {
      element.y += safeOffset;
    });
  }
  
  return elements;
}

function createElementFromToken(
  token: ParsedToken, 
  index: number, 
  yOffset: number, 
  config: LayoutConfig,
  contentWidth: number,
  contentDensity: number
): MarkdownElement | null {
  const id = `element-${index}-${Date.now()}`;
  // 根据内容密度调整基础字体大小
  const baseFontSize = contentDensity > 1.2 ? 28 : contentDensity > 1.0 ? 30 : 32;
  
  const baseElement = {
    id,
    x: config.padding, // 左对齐到内容区域
    y: yOffset,
    width: contentWidth, // 使用完整内容宽度
    fontSize: baseFontSize, // 根据内容密度调整字体大小
    color: '#1f2937',
    textAlign: 'center' as const, // 文字居中
  };
  
  switch (token.type) {
    case 'heading':
      const headingLevel = token.depth || 1;
      // 根据内容密度动态调整标题字体大小
      let h1Size = 72, h2Size = 56, h3Size = 44;
      if (contentDensity > 1.2) {
        h1Size = 60; h2Size = 48; h3Size = 36; // 内容很密集时减小标题
      } else if (contentDensity > 1.0) {
        h1Size = 66; h2Size = 52; h3Size = 40; // 内容较密集时稍微减小
      }
      const headingFontSize = headingLevel === 1 ? h1Size : headingLevel === 2 ? h2Size : h3Size;
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
  
  // 为大字体提供额外的垂直空间
  const extraPadding = fontSize > 50 ? 80 : fontSize > 30 ? 60 : 40;
  
  return Math.max(lines * lineHeight + extraPadding, 80); // 根据字体大小动态调整最小高度
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