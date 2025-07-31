import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { MarkdownElement } from '../store/useAppStore';
import { Trash2, Edit3 } from 'lucide-react';

interface VisualCanvasProps {
  className?: string;
}

interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize';
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
  startElementWidth: number;
  startElementHeight: number;
  resizeHandle?: string;
  hasMoved?: boolean;
}

interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  elements: string[]; // 对齐的元素ID
  snapDistance: number;
}

interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

export function VisualCanvas({ className = '' }: VisualCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  
  const {
    elements,
    pages,
    currentPage,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
    canvasFormat,
    canvasScale,
    backgroundSettings,
    undo,
    redo,
    setPages
  } = useAppStore();

  // Get current page elements
  const currentPageElements = pages.length > 0 && pages[currentPage - 1] 
    ? pages[currentPage - 1] 
    : elements;

  // 更新当前页面元素的函数
  const updateCurrentPageElement = useCallback((elementId: string, updates: Partial<MarkdownElement>) => {
    if (pages.length > 0 && pages[currentPage - 1]) {
      // 如果是分页模式，更新当前页面的元素
      const newPages = [...pages];
      const currentPageIndex = currentPage - 1;
      const currentPageElements = [...newPages[currentPageIndex]];
      
      const elementIndex = currentPageElements.findIndex(el => el.id === elementId);
      if (elementIndex !== -1) {
        currentPageElements[elementIndex] = {
          ...currentPageElements[elementIndex],
          ...updates
        };
        newPages[currentPageIndex] = currentPageElements;
        setPages(newPages);
      }
    } else {
      // 如果不是分页模式，使用原来的更新方式
      updateElement(elementId, updates);
    }
  }, [pages, currentPage, setPages, updateElement]);

  // Handle element selection with click delay to avoid double-click conflict
  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTimeRef.current;
    
    // If double-click (< 400ms between clicks), ignore single click
    if (timeDiff < 400) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      return;
    }
    
    // Delay single click to allow for potential double-click
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      setSelectedElementId(elementId);
      clickTimeoutRef.current = null;
    }, 200);
    
    lastClickTimeRef.current = currentTime;
  }, [setSelectedElementId]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    setSelectedElementId(null);
    setAlignmentGuides([]); // 清除辅助线
  }, [setSelectedElementId]);

  // 计算对齐辅助线
  const calculateAlignmentGuides = useCallback((draggedElement: MarkdownElement, otherElements: MarkdownElement[]): AlignmentGuide[] => {
    const guides: AlignmentGuide[] = [];
    const snapThreshold = 8; // 8px 磁吸距离
    
    // 画布中心线
    const canvasCenterX = canvasFormat.width / 2;
    const canvasCenterY = canvasFormat.height / 2;
    
    // 被拖拽元素的边界
    const draggedLeft = draggedElement.x;
    const draggedRight = draggedElement.x + draggedElement.width;
    const draggedTop = draggedElement.y;
    const draggedBottom = draggedElement.y + draggedElement.height;
    const draggedCenterX = draggedElement.x + draggedElement.width / 2;
    const draggedCenterY = draggedElement.y + draggedElement.height / 2;
    
    // 画布中心对齐
    if (Math.abs(draggedCenterX - canvasCenterX) <= snapThreshold) {
      guides.push({
        type: 'vertical',
        position: canvasCenterX,
        elements: ['canvas-center'],
        snapDistance: Math.abs(draggedCenterX - canvasCenterX)
      });
    }
    
    if (Math.abs(draggedCenterY - canvasCenterY) <= snapThreshold) {
      guides.push({
        type: 'horizontal',
        position: canvasCenterY,
        elements: ['canvas-center'],
        snapDistance: Math.abs(draggedCenterY - canvasCenterY)
      });
    }
    
    // 与其他元素对齐
    otherElements.forEach(element => {
      if (element.id === draggedElement.id) return;
      
      const elementLeft = element.x;
      const elementRight = element.x + element.width;
      const elementTop = element.y;
      const elementBottom = element.y + element.height;
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;
      
      // 垂直对齐（X轴）
      const verticalAlignments = [
        { pos: elementLeft, type: 'left-left' },
        { pos: elementRight, type: 'right-right' },
        { pos: elementCenterX, type: 'center-center' },
        { pos: elementLeft, type: 'right-left', dragPos: draggedRight },
        { pos: elementRight, type: 'left-right', dragPos: draggedLeft }
      ];
      
      verticalAlignments.forEach(({ pos, type, dragPos }) => {
        const comparePos = dragPos || draggedCenterX;
        if (type === 'center-center') {
          if (Math.abs(draggedCenterX - pos) <= snapThreshold) {
            guides.push({
              type: 'vertical',
              position: pos,
              elements: [element.id],
              snapDistance: Math.abs(draggedCenterX - pos)
            });
          }
        } else if (Math.abs(comparePos - pos) <= snapThreshold) {
          guides.push({
            type: 'vertical',
            position: pos,
            elements: [element.id],
            snapDistance: Math.abs(comparePos - pos)
          });
        }
      });
      
      // 水平对齐（Y轴）
      const horizontalAlignments = [
        { pos: elementTop, type: 'top-top' },
        { pos: elementBottom, type: 'bottom-bottom' },
        { pos: elementCenterY, type: 'center-center' },
        { pos: elementTop, type: 'bottom-top', dragPos: draggedBottom },
        { pos: elementBottom, type: 'top-bottom', dragPos: draggedTop }
      ];
      
      horizontalAlignments.forEach(({ pos, type, dragPos }) => {
        const comparePos = dragPos || draggedCenterY;
        if (type === 'center-center') {
          if (Math.abs(draggedCenterY - pos) <= snapThreshold) {
            guides.push({
              type: 'horizontal',
              position: pos,
              elements: [element.id],
              snapDistance: Math.abs(draggedCenterY - pos)
            });
          }
        } else if (Math.abs(comparePos - pos) <= snapThreshold) {
          guides.push({
            type: 'horizontal',
            position: pos,
            elements: [element.id],
            snapDistance: Math.abs(comparePos - pos)
          });
        }
      });
    });
    
    // 按距离排序，优先选择最近的辅助线
    return guides.sort((a, b) => a.snapDistance - b.snapDistance);
  }, [canvasFormat.width, canvasFormat.height]);

  // 应用磁吸对齐
  const applySnapping = useCallback((element: MarkdownElement, otherElements: MarkdownElement[]): SnapResult => {
    const guides = calculateAlignmentGuides(element, otherElements);
    let snappedX = element.x;
    let snappedY = element.y;
    const activeGuides: AlignmentGuide[] = [];
    const snapThreshold = 8;
    
    // 画布中心线
    const canvasCenterX = canvasFormat.width / 2;
    const canvasCenterY = canvasFormat.height / 2;
    
    // 应用垂直对齐（X轴）
    const verticalGuide = guides.find(g => g.type === 'vertical');
    if (verticalGuide) {
      if (verticalGuide.elements.includes('canvas-center')) {
        // 画布中心对齐
        snappedX = canvasCenterX - element.width / 2;
      } else {
        // 与其他元素对齐，默认使用中心对齐
        snappedX = verticalGuide.position - element.width / 2;
      }
      activeGuides.push(verticalGuide);
    }
    
    // 应用水平对齐（Y轴）
    const horizontalGuide = guides.find(g => g.type === 'horizontal');
    if (horizontalGuide) {
      if (horizontalGuide.elements.includes('canvas-center')) {
        // 画布中心对齐
        snappedY = canvasCenterY - element.height / 2;
      } else {
        // 与其他元素对齐，默认使用中心对齐
        snappedY = horizontalGuide.position - element.height / 2;
      }
      activeGuides.push(horizontalGuide);
    }
    
    // 边界检查，确保元素不会移动到画布外
    snappedX = Math.max(0, Math.min(canvasFormat.width - element.width, snappedX));
    snappedY = Math.max(0, Math.min(canvasFormat.height - element.height, snappedY));
    
    return {
      x: snappedX,
      y: snappedY,
      guides: activeGuides
    };
  }, [calculateAlignmentGuides, canvasFormat.width, canvasFormat.height]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, dragType: 'move' | 'resize', resizeHandle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cancel any pending click timeout to prevent selection delay during drag
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    const element = currentPageElements.find(el => el.id === elementId);
    if (!element) return;
    
    // Immediately select element for drag operations
    setSelectedElementId(elementId);
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    setDragState({
      isDragging: true,
      dragType,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: element.x,
      startElementY: element.y,
      startElementWidth: element.width,
      startElementHeight: element.height,
      resizeHandle,
      hasMoved: false
    });
  }, [currentPageElements, setSelectedElementId]);

  // Handle drag move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !selectedElementId) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const deltaX = (e.clientX - dragState.startX) / canvasScale;
    const deltaY = (e.clientY - dragState.startY) / canvasScale;
    
    // Mark as moved if there's any significant movement
    if (!dragState.hasMoved && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
      setDragState(prev => prev ? { ...prev, hasMoved: true } : null);
    }
    
    if (dragState.dragType === 'move') {
      const newX = Math.max(0, dragState.startElementX + deltaX);
      const newY = Math.max(0, dragState.startElementY + deltaY);
      
      // 获取当前元素信息用于对齐计算
      const currentElement = currentPageElements.find(el => el.id === selectedElementId);
      if (currentElement) {
        const tempElement = {
          ...currentElement,
          x: newX,
          y: newY
        };
        
        // 计算对齐辅助线和磁吸
        const otherElements = currentPageElements.filter(el => el.id !== selectedElementId);
        const snapResult = applySnapping(tempElement, otherElements);
        
        // 更新元素位置（应用磁吸后的位置）
        updateCurrentPageElement(selectedElementId, {
          x: Math.max(0, Math.min(canvasFormat.width - currentElement.width, snapResult.x)),
          y: Math.max(0, Math.min(canvasFormat.height - currentElement.height, snapResult.y))
        });
        
        // 更新辅助线
        setAlignmentGuides(snapResult.guides);
      } else {
        // 如果没有找到元素，使用原始逻辑
      updateCurrentPageElement(selectedElementId, {
          x: Math.max(0, newX),
          y: Math.max(0, newY)
      });
      }
    } else if (dragState.dragType === 'resize') {
      const updates: Partial<MarkdownElement> = {};
      
      switch (dragState.resizeHandle) {
        case 'se': // bottom-right
          updates.width = Math.max(100, dragState.startElementWidth + deltaX);
          updates.height = Math.max(30, dragState.startElementHeight + deltaY);
          break;
        case 'sw': // bottom-left
          updates.width = Math.max(100, dragState.startElementWidth - deltaX);
          updates.height = Math.max(30, dragState.startElementHeight + deltaY);
          updates.x = dragState.startElementX + deltaX;
          break;
        case 'ne': // top-right
          updates.width = Math.max(100, dragState.startElementWidth + deltaX);
          updates.height = Math.max(30, dragState.startElementHeight - deltaY);
          updates.y = dragState.startElementY + deltaY;
          break;
        case 'nw': // top-left
          updates.width = Math.max(100, dragState.startElementWidth - deltaX);
          updates.height = Math.max(30, dragState.startElementHeight - deltaY);
          updates.x = dragState.startElementX + deltaX;
          updates.y = dragState.startElementY + deltaY;
          break;
        case 'e': // right
          updates.width = Math.max(100, dragState.startElementWidth + deltaX);
          break;
        case 'w': // left
          updates.width = Math.max(100, dragState.startElementWidth - deltaX);
          updates.x = dragState.startElementX + deltaX;
          break;
        case 's': // bottom
          updates.height = Math.max(30, dragState.startElementHeight + deltaY);
          break;
        case 'n': // top
          updates.height = Math.max(30, dragState.startElementHeight - deltaY);
          updates.y = dragState.startElementY + deltaY;
          break;
      }
      
      updateCurrentPageElement(selectedElementId, updates);
    }
  }, [dragState, selectedElementId, canvasScale, updateCurrentPageElement, currentPageElements, applySnapping, canvasFormat.width, canvasFormat.height]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (dragState) {
      // Save to history when drag ends (only if actually moved)
      if (dragState.hasMoved) {
        const { saveToHistory } = useAppStore.getState();
        saveToHistory();
      }
    }
    setDragState(null);
    setAlignmentGuides([]); // 清除辅助线
  }, [dragState]);

  // Handle delete
  const handleDelete = useCallback((elementId: string) => {
    if (pages.length > 0 && pages[currentPage - 1]) {
      // 如果是分页模式，从当前页面删除元素
      const newPages = [...pages];
      const currentPageIndex = currentPage - 1;
      const currentPageElements = newPages[currentPageIndex].filter(el => el.id !== elementId);
      newPages[currentPageIndex] = currentPageElements;
      setPages(newPages);
      setSelectedElementId(null);
    } else {
      // 如果不是分页模式，使用原来的删除方式
    deleteElement(elementId);
    }
  }, [pages, currentPage, setPages, deleteElement, setSelectedElementId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      } else if (e.key === 'Delete' && selectedElementId) {
        handleDelete(selectedElementId);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, handleDelete, undo, redo]);

  // Mouse event listeners
  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Handle double click to edit element
  const handleDoubleClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any pending click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    // Don't enter edit mode if we're currently dragging
    if (dragState?.isDragging) {
      return;
    }
    
    const element = currentPageElements.find(el => el.id === elementId);
    if (!element) return;
    
    setEditingElementId(elementId);
    setEditingContent(element.content);
    setSelectedElementId(elementId);
    
    // Focus textarea after it's rendered
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  }, [currentPageElements, setSelectedElementId, dragState?.isDragging]);

  // Handle save edit
  const handleSaveEdit = useCallback(() => {
    if (!editingElementId) return;
    
    updateCurrentPageElement(editingElementId, { content: editingContent });
    setEditingElementId(null);
    setEditingContent('');
  }, [editingElementId, editingContent, updateCurrentPageElement]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingElementId(null);
    setEditingContent('');
  }, []);

  // Handle edit keydown
  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // Ctrl+Enter 保存
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      // Esc 取消
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Tab') {
      // Tab 插入制表符
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = editingContent.substring(0, start) + '\t' + editingContent.substring(end);
      setEditingContent(newContent);
      
      // 恢复光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
    // 允许正常的 Enter 换行
  }, [handleSaveEdit, handleCancelEdit, editingContent]);

  // Render table content as HTML table
  const renderTable = (content: string) => {
    if (typeof content !== 'string') {
      return '';
    }
    
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 3) {
      return content;
    }
    
    // 解析表格
    const headerLine = lines[0];
    const dataLines = lines.slice(2); // 跳过分隔符行
    
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h !== '');
    const rows = dataLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
    );
    
    // 生成HTML表格
    let html = '<table style="width: 100%; border-collapse: collapse; font-size: inherit;">';
    
    // 表头
    html += '<thead><tr>';
    headers.forEach(header => {
      html += `<th style="border: 1px solid #d1d5db; background-color: #f9fafb; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151;">${header}</th>`;
    });
    html += '</tr></thead>';
    
    // 表体
    html += '<tbody>';
    rows.forEach((row, i) => {
      const bgColor = i % 2 === 0 ? '#ffffff' : '#f9fafb';
      html += `<tr style="background-color: ${bgColor};">`;
      headers.forEach((_, j) => {
        const cellContent = row[j] || '';
        html += `<td style="border: 1px solid #d1d5db; padding: 8px 12px; color: #1f2937;">${cellContent}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
  };

  // Generate background style based on settings
  const getCanvasBackgroundStyle = () => {
    const style: React.CSSProperties = {};
    
    // 基础背景
    if (backgroundSettings.type === 'gradient') {
      style.background = `linear-gradient(${backgroundSettings.gradientDirection}, ${backgroundSettings.gradientColors?.join(', ') || '#ffffff, #f0f0f0'})`;
    } else {
      style.backgroundColor = backgroundSettings.solidColor || '#ffffff';
    }
    
    // 边框
    if (backgroundSettings.border.enabled) {
      style.border = `${backgroundSettings.border.width}px ${backgroundSettings.border.style} ${backgroundSettings.border.color}`;
      style.borderRadius = `${backgroundSettings.border.radius}px`;
    }
    
    // 阴影
    if (backgroundSettings.shadow.enabled) {
      const shadowColor = backgroundSettings.shadow.color + Math.round(backgroundSettings.shadow.opacity * 255).toString(16).padStart(2, '0');
      style.boxShadow = `${backgroundSettings.shadow.x}px ${backgroundSettings.shadow.y}px ${backgroundSettings.shadow.blur}px ${shadowColor}`;
    }
    
    // 相框效果
    if (backgroundSettings.frame.enabled) {
      switch (backgroundSettings.frame.type) {
        case 'elegant':
          style.outline = `${backgroundSettings.frame.width}px solid ${backgroundSettings.frame.color}`;
          style.outlineOffset = `${backgroundSettings.frame.width}px`;
          break;
        case 'modern':
          style.borderTop = `${backgroundSettings.frame.width * 2}px solid ${backgroundSettings.frame.color}`;
          style.borderLeft = `1px solid ${backgroundSettings.frame.color}`;
          break;
        case 'vintage':
          style.border = `${backgroundSettings.frame.width}px double ${backgroundSettings.frame.color}`;
          break;
        default: // simple
          style.outline = `${backgroundSettings.frame.width}px solid ${backgroundSettings.frame.color}`;
      }
    }
    
    return style;
  };

  // Generate pattern overlay
  const getPatternOverlay = () => {
    if (!backgroundSettings.pattern.enabled) return null;
    
    const { type, color, opacity, size } = backgroundSettings.pattern;
    const patternOpacity = opacity;
    
    let patternSvg = '';
    switch (type) {
      case 'dots':
        patternSvg = `
          <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size/2}" cy="${size/2}" r="2" fill="${color}" fill-opacity="${patternOpacity}"/>
          </svg>
        `;
        break;
      case 'grid':
        patternSvg = `
          <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-opacity="${patternOpacity}" stroke-width="1"/>
          </svg>
        `;
        break;
      case 'diagonal':
        patternSvg = `
          <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 ${size} L ${size} 0" stroke="${color}" stroke-opacity="${patternOpacity}" stroke-width="1"/>
          </svg>
        `;
        break;
    }
    
    const encodedSvg = encodeURIComponent(patternSvg);
    
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodedSvg}")`,
          backgroundRepeat: 'repeat',
          zIndex: 1
        }}
      />
    );
  };

  const renderElement = (element: MarkdownElement) => {
    const isSelected = selectedElementId === element.id;
    
    const elementStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      fontSize: element.fontSize,
      color: element.color,
      backgroundColor: element.backgroundColor || 'transparent',
      textAlign: element.textAlign,
      padding: '12px',
      border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
      borderRadius: '4px',
      cursor: dragState?.isDragging ? 'grabbing' : (editingElementId === element.id ? 'text' : 'grab'),
      transition: dragState?.isDragging ? 'none' : 'all 0.1s ease',
      userSelect: 'none',
      lineHeight: '1.5',
      overflow: 'hidden',
      wordWrap: 'break-word',
      zIndex: isSelected ? 10 : 1,
    };
    
    if (element.type === 'heading') {
      elementStyle.fontWeight = 'bold';
    } else if (element.type === 'code') {
      elementStyle.fontFamily = 'JetBrains Mono, Consolas, Monaco, monospace';
      elementStyle.whiteSpace = 'pre-wrap';
    } else if (element.type === 'blockquote') {
      elementStyle.borderLeft = '4px solid #d1d5db';
      elementStyle.paddingLeft = '12px';
      elementStyle.fontStyle = 'italic';
    }
    
    return (
      <div key={element.id}>
        {/* Element */}
        <div
          style={elementStyle}
          onClick={(e) => handleElementClick(e, element.id)}
          onDoubleClick={(e) => handleDoubleClick(e, element.id)}
          onMouseDown={(e) => !editingElementId ? handleMouseDown(e, element.id, 'move') : undefined}
          className={editingElementId !== element.id ? 'hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50 transition-all' : ''}
          title={editingElementId !== element.id ? '双击编辑内容' : ''}
        >
          {editingElementId === element.id ? (
            // Edit mode - show textarea with editing indicator
            <div className="relative w-full h-full">
                             <textarea
                 ref={textareaRef}
                 value={editingContent}
                 onChange={(e) => setEditingContent(e.target.value)}
                 onKeyDown={handleEditKeyDown}
                 onBlur={handleSaveEdit}
                 className="w-full h-full p-0 bg-white bg-opacity-90 border-2 border-blue-400 border-dashed outline-none resize-none rounded"
                 style={{
                   fontSize: element.fontSize,
                   color: element.color,
                   textAlign: element.textAlign,
                   fontFamily: element.type === 'code' || element.type === 'table' ? 'JetBrains Mono, Consolas, Monaco, monospace' : 'inherit',
                   fontWeight: element.type === 'heading' ? 'bold' : 'normal',
                   fontStyle: element.type === 'blockquote' ? 'italic' : 'normal',
                   whiteSpace: 'pre-wrap',
                   lineHeight: '1.5',
                   padding: '8px',
                   wordWrap: 'break-word',
                   overflowWrap: 'break-word',
                 }}
                 placeholder="输入内容... (Enter换行, Ctrl+Enter保存)"
                 autoFocus
               />
                             {/* Edit indicator */}
               <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                 编辑中 - Enter换行 / Ctrl+Enter保存 / Esc取消
               </div>
            </div>
          ) : (
                         // Display mode - show content
             <div className="w-full h-full pointer-events-none" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
               {element.type === 'table' ? (
                 <div 
                   style={{ fontSize: element.fontSize }}
                   dangerouslySetInnerHTML={{ 
                     __html: typeof element.content === 'string' ? renderTable(element.content) : ''
                   }}
                 />
               ) : (
                 element.content
               )}
             </div>
          )}
        </div>
        
        {/* Selection handles */}
        {isSelected && (
          <>
            {/* Resize handles */}
            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
              const handleStyle: React.CSSProperties = {
                position: 'absolute',
                width: '8px',
                height: '8px',
                backgroundColor: '#3b82f6',
                border: '1px solid white',
                borderRadius: '2px',
                cursor: `${handle}-resize`,
                zIndex: 20,
              };
              
              // Position handles
              switch (handle) {
                case 'nw':
                  handleStyle.left = element.x - 4;
                  handleStyle.top = element.y - 4;
                  break;
                case 'n':
                  handleStyle.left = element.x + element.width / 2 - 4;
                  handleStyle.top = element.y - 4;
                  break;
                case 'ne':
                  handleStyle.left = element.x + element.width - 4;
                  handleStyle.top = element.y - 4;
                  break;
                case 'e':
                  handleStyle.left = element.x + element.width - 4;
                  handleStyle.top = element.y + element.height / 2 - 4;
                  break;
                case 'se':
                  handleStyle.left = element.x + element.width - 4;
                  handleStyle.top = element.y + element.height - 4;
                  break;
                case 's':
                  handleStyle.left = element.x + element.width / 2 - 4;
                  handleStyle.top = element.y + element.height - 4;
                  break;
                case 'sw':
                  handleStyle.left = element.x - 4;
                  handleStyle.top = element.y + element.height - 4;
                  break;
                case 'w':
                  handleStyle.left = element.x - 4;
                  handleStyle.top = element.y + element.height / 2 - 4;
                  break;
              }
              
              return (
                <div
                  key={handle}
                  style={handleStyle}
                  onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', handle)}
                />
              );
            })}
            
            {/* Simple action indicator */}
            <div
              className="absolute bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg"
              style={{
                left: element.x + element.width + 8,
                top: element.y,
                zIndex: 1000,
              }}
            >
              已选中 - 查看右侧面板编辑
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`relative bg-gray-50 overflow-auto ${className}`}>
      <div
        ref={canvasRef}
        className="relative shadow-lg mx-auto mt-4 mb-8"
        style={{
          width: canvasFormat.width,
          height: canvasFormat.height,
          transform: `scale(${canvasScale})`,
          transformOrigin: 'top center',
          ...getCanvasBackgroundStyle()
        }}
        onClick={handleCanvasClick}
      >
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Pattern overlay */}
        {getPatternOverlay()}
        
        {/* Elements */}
        {currentPageElements.map(renderElement)}
        
        {/* Alignment guides */}
        {alignmentGuides.map((guide, index) => (
          <div
            key={`guide-${index}`}
            className="absolute pointer-events-none alignment-guide"
            style={{
              ...(guide.type === 'vertical' ? {
                left: guide.position,
                top: 0,
                width: '2px',
                height: '100%',
                background: 'linear-gradient(to bottom, transparent 10%, #3b82f6 10%, #3b82f6 90%, transparent 90%)',
                backgroundSize: '100% 20px',
              } : {
                left: 0,
                top: guide.position,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(to right, transparent 10%, #3b82f6 10%, #3b82f6 90%, transparent 90%)',
                backgroundSize: '20px 100%',
              }),
              zIndex: 1000,
            }}
          >
            {/* Guide label */}
            <div 
              className="absolute bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-medium shadow-sm"
              style={{
                ...(guide.type === 'vertical' ? {
                  left: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                } : {
                  left: '50%',
                  top: '4px',
                  transform: 'translateX(-50%)',
                }),
                fontSize: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              {guide.elements.includes('canvas-center') 
                ? (guide.type === 'vertical' ? '中心线' : '中心线')
                : '对齐'}
            </div>
          </div>
        ))}
        
        {/* Canvas info */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {canvasFormat.name} ({canvasFormat.width} × {canvasFormat.height})
        </div>
        

      </div>
    </div>
  );
}