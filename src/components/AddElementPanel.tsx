import React from 'react';
import { Plus, Type, Heading1, Heading2, Heading3, AlignLeft, Quote, Code, Table } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface AddElementPanelProps {
  className?: string;
}

export function AddElementPanel({ className = '' }: AddElementPanelProps) {
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
        return '项目 | 状态 | 备注\n---|---|---\n任务A | 完成 | 按时交付\n任务B | 进行中 | 延期一天\n任务C | 待开始 | 等待资源';
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
    <div className={`p-5 space-y-5 ${className}`}>
      {/* Element Types Grid */}
      <div className="grid grid-cols-2 gap-3">
        {elementTypes.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={`${item.type}-${item.level || 'default'}`}
              onClick={() => handleAddElement(item.type, item.level)}
              className="p-4 border border-slate-200/80 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 text-left group hover:shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-2">
                <IconComponent className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-800">
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 group-hover:text-indigo-600 leading-relaxed">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Add Tips */}
      <div className="text-xs bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
        <div className="flex items-center space-x-2 mb-3">
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-slate-700">快速添加提示</span>
        </div>
        <ul className="space-y-2 text-slate-600">
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>新元素将添加到画布中心位置</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>双击元素可直接编辑，支持多行文本</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>Enter换行，Ctrl+Enter保存，Esc取消</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>拖拽元素可调整位置和大小</span>
          </li>
        </ul>
      </div>
    </div>
  );
}