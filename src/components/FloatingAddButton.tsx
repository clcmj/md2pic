import React, { useState } from 'react';
import { Plus, Type, Heading1, Heading2, Heading3, AlignLeft, Quote, Code, Table, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface FloatingAddButtonProps {
  className?: string;
}

export function FloatingAddButton({ className = '' }: FloatingAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addElement, canvasFormat, styleSettings } = useAppStore();

  // 获取默认颜色
  const getDefaultColor = (type: string, level?: number) => {
    switch (type) {
      case 'heading':
        if (level === 1) return styleSettings.h1Color;
        if (level === 2) return styleSettings.h2Color;
        if (level === 3) return styleSettings.h3Color;
        return styleSettings.h1Color;
      default:
        return '#374151';
    }
  };

  // 获取默认字体大小
  const getDefaultFontSize = (type: string, level?: number) => {
    const base = styleSettings.globalFontSize;
    switch (type) {
      case 'heading':
        if (level === 1) return Math.round(base * 2.25);
        if (level === 2) return Math.round(base * 1.75);
        if (level === 3) return Math.round(base * 1.375);
        return base;
      case 'paragraph':
        return base;
      case 'list':
        return Math.round(base * 0.875);
      case 'blockquote':
        return Math.round(base * 0.8125);
      case 'code':
        return Math.round(base * 0.75);
      case 'table':
        return Math.round(base * 0.75);
      default:
        return base;
    }
  };

  // 获取默认内容
  const getDefaultContent = (type: string, level?: number): string => {
    switch (type) {
      case 'heading':
        if (level === 1) return '主标题';
        if (level === 2) return '副标题';
        if (level === 3) return '三级标题';
        return '标题';
      case 'paragraph':
        return '点击编辑文本内容...';
      case 'list':
        return '• 列表项 1\n• 列表项 2\n• 列表项 3';
      case 'blockquote':
        return '这是一个引用块，用于突出重要内容。';
      case 'code':
        return 'console.log("Hello World!");';
      case 'table':
        return '标题1 | 标题2 | 标题3\n---|---|---\n内容1 | 内容2 | 内容3\n数据1 | 数据2 | 数据3';
      default:
        return '新元素';
    }
  };

  // 添加元素
  const handleAddElement = (
    type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'code' | 'table',
    level?: number
  ) => {
    const fontSize = getDefaultFontSize(type, level);
    const color = getDefaultColor(type, level);
    
    const defaultWidth = Math.min(400, canvasFormat.width * 0.8);
    const defaultHeight = type === 'table' ? 150 : fontSize * 2;
    
    const x = (canvasFormat.width - defaultWidth) / 2;
    const y = (canvasFormat.height - defaultHeight) / 2;

    const elementData = {
      type,
      content: getDefaultContent(type, level),
      level,
      x,
      y,
      width: defaultWidth,
      height: defaultHeight,
      fontSize,
      color,
      textAlign: styleSettings.textAlign,
    };

    addElement(elementData);
    setIsOpen(false);
  };

  const elementTypes = [
    { type: 'heading' as const, level: 1, icon: Heading1, label: 'H1', color: 'text-blue-600' },
    { type: 'heading' as const, level: 2, icon: Heading2, label: 'H2', color: 'text-purple-600' },
    { type: 'heading' as const, level: 3, icon: Heading3, label: 'H3', color: 'text-orange-600' },
    { type: 'paragraph' as const, icon: Type, label: '文本', color: 'text-gray-600' },
    { type: 'list' as const, icon: AlignLeft, label: '列表', color: 'text-green-600' },
    { type: 'blockquote' as const, icon: Quote, label: '引用', color: 'text-yellow-600' },
    { type: 'code' as const, icon: Code, label: '代码', color: 'text-red-600' },
    { type: 'table' as const, icon: Table, label: '表格', color: 'text-indigo-600' },
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Element type buttons */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="grid grid-cols-4 gap-2">
            {elementTypes.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={`${item.type}-${item.level || 'default'}`}
                  onClick={() => handleAddElement(item.type, item.level)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group flex flex-col items-center"
                  title={`添加${item.label}`}
                >
                  <IconComponent className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs text-gray-600 mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'rotate-45' : 'hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}