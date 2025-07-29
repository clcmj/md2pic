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
}

export function VisualCanvas({ className = '' }: VisualCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  
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

  // Handle element selection
  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElementId(elementId);
  }, [setSelectedElementId]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    setSelectedElementId(null);
  }, [setSelectedElementId]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, dragType: 'move' | 'resize', resizeHandle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = currentPageElements.find(el => el.id === elementId);
    if (!element) return;
    
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
      resizeHandle
    });
  }, [currentPageElements, setSelectedElementId]);

  // Handle drag move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !selectedElementId) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const deltaX = (e.clientX - dragState.startX) / canvasScale;
    const deltaY = (e.clientY - dragState.startY) / canvasScale;
    
    if (dragState.dragType === 'move') {
      updateCurrentPageElement(selectedElementId, {
        x: Math.max(0, dragState.startElementX + deltaX),
        y: Math.max(0, dragState.startElementY + deltaY)
      });
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
  }, [dragState, selectedElementId, canvasScale, updateCurrentPageElement]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (dragState) {
      // Save to history when drag ends
      const { saveToHistory } = useAppStore.getState();
      saveToHistory();
    }
    setDragState(null);
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
      padding: '8px',
      border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
      borderRadius: '4px',
      cursor: dragState?.isDragging ? 'grabbing' : 'grab',
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
          onMouseDown={(e) => handleMouseDown(e, element.id, 'move')}
        >
          <div className="w-full h-full pointer-events-none">
            {element.type === 'table' ? (
              <div className="text-xs">
                {element.content.split('\n').map((line, i) => (
                  <div key={i} className={i === 1 ? 'border-b border-gray-300 pb-1 mb-1' : ''}>
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              element.content
            )}
          </div>
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
        className="relative bg-white shadow-lg mx-auto my-8"
        style={{
          width: canvasFormat.width,
          height: canvasFormat.height,
          transform: `scale(${canvasScale})`,
          transformOrigin: 'top center',
        }}
        onClick={handleCanvasClick}
      >
        {/* Canvas background */}
        <div className="absolute inset-0 bg-white" />
        
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
        
        {/* Elements */}
        {currentPageElements.map(renderElement)}
        
        {/* Canvas info */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {canvasFormat.name} ({canvasFormat.width} × {canvasFormat.height})
        </div>
        
        {/* Instruction overlay when no element is selected */}
        {!selectedElementId && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-400 pointer-events-none">
            <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-lg">
              <p className="text-sm">点击元素进行编辑</p>
              <p className="text-xs mt-1">编辑选项将在右侧面板显示</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}