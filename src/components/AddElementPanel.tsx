import React, { useState } from 'react';
import { Plus, Type, Heading1, Heading2, Heading3, AlignLeft, Quote, Code, Table, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface AddElementPanelProps {
  className?: string;
}

export function AddElementPanel({ className = '' }: AddElementPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
        return '#374151'; // 默认文本颜色
    }
  };

  // 获取默认字体大小
  const getDefaultFontSize = (type: string, level?: number) => {
    const base = styleSettings.globalFontSize;
    switch (type) {
      case 'heading':
        if (level === 1) return Math.round(base * 2.25); // 72px
        if (level === 2) return Math.round(base * 1.75); // 56px
        if (level === 3) return Math.round(base * 1.375); // 44px
        return base;
      case 'paragraph':
        return base; // 32px
      case 'list':
        return Math.round(base * 0.875); // 28px
      case 'blockquote':
        return Math.round(base * 0.8125); // 26px
      case 'code':
        return Math.round(base * 0.75); // 24px
      case 'table':
        return Math.round(base * 0.75); // 24px
      default:
        return base;
    }
  };

  // 添加元素的通用方法
  const handleAddElement = (
    type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'code' | 'table',
    level?: number,
    defaultContent?: string
  ) => {
    const fontSize = getDefaultFontSize(type, level);
    const color = getDefaultColor(type, level);
    
    // 计算默认尺寸
    const defaultWidth = Math.min(400, canvasFormat.width * 0.8);
    const defaultHeight = type === 'table' ? 150 : fontSize * 2;
    
    // 计算居中位置
    const x = (canvasFormat.width - defaultWidth) / 2;
    const y = (canvasFormat.height - defaultHeight) / 2;

    const elementData = {
      type,
      content: defaultContent || getDefaultContent(type, level),
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
        return '这里是段落文本\n可以使用Enter键换行\n支持多行内容编辑';
      case 'list':
        return '• 列表项 1\n• 列表项 2\n• 列表项 3\n• 可以添加更多项目';
      case 'blockquote':
        return '这是一个引用块\n用于突出重要内容\n支持多行引用文字';
      case 'code':
        return 'function hello() {\n  console.log("Hello World!");\n  return "支持多行代码";\n}';
      case 'table':
        return '标题1 | 标题2 | 标题3\n---|---|---\n内容1 | 内容2 | 内容3\n数据1 | 数据2 | 数据3';
      default:
        return '新元素';
    }
  };

  const elementTypes = [
    {
      type: 'heading' as const,
      level: 1,
      icon: Heading1,
      label: 'H1标题',
      description: '主标题，大字体'
    },
    {
      type: 'heading' as const,
      level: 2,
      icon: Heading2,
      label: 'H2标题',
      description: '副标题，中字体'
    },
    {
      type: 'heading' as const,
      level: 3,
      icon: Heading3,
      label: 'H3标题',
      description: '三级标题，较小字体'
    },
    {
      type: 'paragraph' as const,
      icon: Type,
      label: '文本段落',
      description: '普通文本内容'
    },
    {
      type: 'list' as const,
      icon: AlignLeft,
      label: '列表',
      description: '项目符号列表'
    },
    {
      type: 'blockquote' as const,
      icon: Quote,
      label: '引用',
      description: '引用块，突出显示'
    },
    {
      type: 'code' as const,
      icon: Code,
      label: '代码',
      description: '代码块，等宽字体'
    },
    {
      type: 'table' as const,
      icon: Table,
      label: '表格',
      description: '数据表格'
    }
  ];

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-700">添加元素</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {/* Element Types Grid */}
            <div className="grid grid-cols-2 gap-2">
              {elementTypes.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.level || 'default'}`}
                    onClick={() => handleAddElement(item.type, item.level)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComponent className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-800">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-blue-600">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Quick Add Tips */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
              <div className="flex items-center space-x-1 mb-1">
                <Plus className="w-3 h-3" />
                <span className="font-medium">快速添加提示：</span>
              </div>
              <ul className="space-y-1 ml-4">
                <li>• 新元素将添加到画布中心位置</li>
                <li>• 双击元素可直接编辑，支持多行文本</li>
                <li>• Enter换行，Ctrl+Enter保存，Esc取消</li>
                <li>• 拖拽元素可调整位置和大小</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}