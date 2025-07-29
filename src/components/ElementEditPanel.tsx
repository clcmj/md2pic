import React, { useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { MarkdownElement } from '../store/useAppStore';
import { 
  ArrowLeft,
  Edit3, 
  Trash2,
  Plus, 
  Minus, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Square,
  Eye
} from 'lucide-react';

export function ElementEditPanel() {
  const [editingContent, setEditingContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    elements,
    pages,
    currentPage,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteElement,
    setPages
  } = useAppStore();

  // 获取当前页面元素
  const currentPageElements = pages.length > 0 && pages[currentPage - 1] 
    ? pages[currentPage - 1] 
    : elements;

  // 获取选中的元素
  const selectedElement = selectedElementId 
    ? currentPageElements.find(el => el.id === selectedElementId) 
    : null;

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

  // 字体大小调整
  const handleFontSizeChange = useCallback((delta: number) => {
    if (selectedElement) {
      const newFontSize = Math.max(8, Math.min(72, selectedElement.fontSize + delta));
      updateCurrentPageElement(selectedElement.id, { fontSize: newFontSize });
    }
  }, [selectedElement, updateCurrentPageElement]);

  // 对齐方式更改
  const handleTextAlignChange = useCallback((align: 'left' | 'center' | 'right') => {
    if (selectedElement) {
      updateCurrentPageElement(selectedElement.id, { textAlign: align });
    }
  }, [selectedElement, updateCurrentPageElement]);

  // 颜色更改
  const handleColorChange = useCallback((color: string) => {
    if (selectedElement) {
      updateCurrentPageElement(selectedElement.id, { color });
    }
  }, [selectedElement, updateCurrentPageElement]);

  // 背景颜色更改
  const handleBackgroundColorChange = useCallback((backgroundColor: string) => {
    if (selectedElement) {
      updateCurrentPageElement(selectedElement.id, { backgroundColor });
    }
  }, [selectedElement, updateCurrentPageElement]);

  // 尺寸调整
  const handleSizeChange = useCallback((property: 'width' | 'height', delta: number) => {
    if (selectedElement) {
      const currentValue = selectedElement[property];
      const newValue = Math.max(property === 'width' ? 100 : 30, currentValue + delta);
      updateCurrentPageElement(selectedElement.id, { [property]: newValue });
    }
  }, [selectedElement, updateCurrentPageElement]);

  // 位置调整
  const handlePositionChange = useCallback((property: 'x' | 'y', delta: number) => {
    if (selectedElement) {
      const currentValue = selectedElement[property];
      const newValue = Math.max(0, currentValue + delta);
      updateCurrentPageElement(selectedElement.id, { [property]: newValue });
    }
  }, [selectedElement, updateCurrentPageElement]);

  // 开始编辑
  const handleStartEdit = useCallback(() => {
    if (selectedElement) {
      setEditingContent(selectedElement.content);
      setIsEditing(true);
    }
  }, [selectedElement]);

  // 保存编辑
  const handleSaveEdit = useCallback(() => {
    if (selectedElement && editingContent.trim()) {
      updateCurrentPageElement(selectedElement.id, { content: editingContent.trim() });
    }
    setIsEditing(false);
    setEditingContent('');
  }, [selectedElement, editingContent, updateCurrentPageElement]);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingContent('');
  }, []);

  // 删除元素
  const handleDelete = useCallback(() => {
    if (selectedElement) {
      if (pages.length > 0 && pages[currentPage - 1]) {
        const newPages = [...pages];
        const currentPageIndex = currentPage - 1;
        const currentPageElements = newPages[currentPageIndex].filter(el => el.id !== selectedElement.id);
        newPages[currentPageIndex] = currentPageElements;
        setPages(newPages);
      } else {
        deleteElement(selectedElement.id);
      }
      setSelectedElementId(null);
    }
  }, [selectedElement, pages, currentPage, setPages, deleteElement, setSelectedElementId]);

  // 关闭编辑面板
  const handleClose = useCallback(() => {
    setSelectedElementId(null);
    setIsEditing(false);
    setEditingContent('');
  }, [setSelectedElementId]);

  // 颜色预设
  const colorPresets = [
    '#1f2937', // 默认黑色
    '#ef4444', // 红色
    '#f97316', // 橙色
    '#eab308', // 黄色
    '#22c55e', // 绿色
    '#3b82f6', // 蓝色
    '#8b5cf6', // 紫色
    '#ec4899', // 粉色
  ];

  const backgroundColorPresets = [
    'transparent', // 透明
    '#ffffff', // 白色
    '#f3f4f6', // 浅灰
    '#fef3c7', // 浅黄
    '#d1fae5', // 浅绿
    '#dbeafe', // 浅蓝
    '#e0e7ff', // 浅紫
    '#fce7f3', // 浅粉
  ];

  if (!selectedElement) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">元素编辑</h3>
            <p className="text-xs text-gray-500">
              {selectedElement.type === 'heading' ? `标题 H${selectedElement.level}` : 
               selectedElement.type === 'paragraph' ? '段落' :
               selectedElement.type === 'list' ? '列表' :
               selectedElement.type === 'blockquote' ? '引用' :
               selectedElement.type === 'code' ? '代码' :
               selectedElement.type === 'table' ? '表格' : '元素'}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
          title="删除元素"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* 内容编辑 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Edit3 className="w-4 h-4 mr-2" />
              内容编辑
            </label>
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                编辑
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入内容..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {selectedElement.content || '(空内容)'}
              </div>
            </div>
          )}
        </div>

        {/* 字体设置 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Type className="w-4 h-4 mr-2" />
            字体设置
          </label>
          
          <div className="space-y-3">
            {/* 字体大小 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">字体大小</span>
                <span className="text-xs font-mono text-gray-900">{selectedElement.fontSize}px</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFontSizeChange(-2)}
                  className="p-2 hover:bg-gray-100 rounded-lg border"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="flex-1 bg-gray-100 rounded-lg text-center py-2 text-sm">
                  {selectedElement.fontSize}px
                </div>
                <button
                  onClick={() => handleFontSizeChange(2)}
                  className="p-2 hover:bg-gray-100 rounded-lg border"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 文字对齐 */}
            <div>
              <div className="text-xs text-gray-600 mb-2">文字对齐</div>
              <div className="flex space-x-1">
                {[
                  { value: 'left', icon: AlignLeft, label: '左对齐' },
                  { value: 'center', icon: AlignCenter, label: '居中' },
                  { value: 'right', icon: AlignRight, label: '右对齐' }
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handleTextAlignChange(value as any)}
                    className={`flex-1 p-2 rounded-lg border transition-colors ${
                      selectedElement.textAlign === value 
                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                        : 'hover:bg-gray-50'
                    }`}
                    title={label}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 颜色设置 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            颜色设置
          </label>
          
          <div className="space-y-4">
            {/* 文字颜色 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">文字颜色</span>
                <div 
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: selectedElement.color }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-full aspect-square rounded-lg border-2 hover:scale-105 transition-transform ${
                      selectedElement.color === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* 背景颜色 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">背景颜色</span>
                <div 
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ 
                    backgroundColor: selectedElement.backgroundColor || 'transparent',
                    backgroundImage: selectedElement.backgroundColor === 'transparent' || !selectedElement.backgroundColor
                      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                      : 'none',
                    backgroundSize: '4px 4px',
                    backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                  }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {backgroundColorPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleBackgroundColorChange(color)}
                    className={`w-full aspect-square rounded-lg border-2 hover:scale-105 transition-transform ${
                      (selectedElement.backgroundColor || 'transparent') === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: color === 'transparent' ? 'white' : color,
                      backgroundImage: color === 'transparent' 
                        ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                        : 'none',
                      backgroundSize: '4px 4px',
                      backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                    }}
                    title={color === 'transparent' ? '透明' : color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 尺寸和位置 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Square className="w-4 h-4 mr-2" />
            尺寸和位置
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {/* 宽度 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">宽度</span>
                <span className="text-xs font-mono text-gray-900">{selectedElement.width}px</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSizeChange('width', -10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="flex-1 bg-gray-100 rounded text-center py-1 text-xs">
                  {selectedElement.width}
                </div>
                <button
                  onClick={() => handleSizeChange('width', 10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 高度 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">高度</span>
                <span className="text-xs font-mono text-gray-900">{selectedElement.height}px</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSizeChange('height', -10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="flex-1 bg-gray-100 rounded text-center py-1 text-xs">
                  {selectedElement.height}
                </div>
                <button
                  onClick={() => handleSizeChange('height', 10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* X坐标 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">X坐标</span>
                <span className="text-xs font-mono text-gray-900">{selectedElement.x}px</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePositionChange('x', -10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="flex-1 bg-gray-100 rounded text-center py-1 text-xs">
                  {selectedElement.x}
                </div>
                <button
                  onClick={() => handlePositionChange('x', 10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Y坐标 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Y坐标</span>
                <span className="text-xs font-mono text-gray-900">{selectedElement.y}px</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePositionChange('y', -10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="flex-1 bg-gray-100 rounded text-center py-1 text-xs">
                  {selectedElement.y}
                </div>
                <button
                  onClick={() => handlePositionChange('y', 10)}
                  className="p-1.5 hover:bg-gray-100 rounded border"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 元素信息 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            元素信息
          </label>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">类型:</span>
              <span className="font-mono">{selectedElement.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-mono text-gray-500">{selectedElement.id.slice(-8)}</span>
            </div>
            {selectedElement.level && (
              <div className="flex justify-between">
                <span className="text-gray-600">级别:</span>
                <span className="font-mono">H{selectedElement.level}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 