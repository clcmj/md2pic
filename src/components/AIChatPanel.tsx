import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bot, Send, Loader, AlertTriangle } from 'lucide-react';

interface AIChatPanelProps {
  className?: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ className = '' }) => {
  const {
    isAILoading,
    aiError,
    aiConfig,
    generateContentWithAI,
    setAIError
  } = useAppStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerateContent = async () => {
    if (!inputPrompt.trim() || isAILoading) return;
    
    const prompt = inputPrompt.trim();
    
    try {
      await generateContentWithAI(prompt, 'replace');
      // 生成成功后清空输入框
      setInputPrompt('');
    } catch (error) {
      console.error('生成内容失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateContent();
    }
  };



  return (
    <div className={`flex flex-col bg-slate-50/50 border-t border-slate-200/60 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-800">AI内容生成</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              aiConfig.enabled ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className={`text-xs px-2 py-1 rounded-full ${
              aiConfig.enabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {aiConfig.enabled ? '已启用' : '未配置'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {aiError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-red-700 font-medium">AI调用错误</div>
            <div className="text-xs text-red-600 mt-1">{aiError}</div>
            <button
              onClick={() => setAIError(null)}
              className="text-xs text-red-500 hover:text-red-700 mt-1 underline"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Status Area */}
      {!aiConfig.enabled && (
        <div className="px-4 py-4">
          <div className="text-center text-slate-500 py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <div className="text-sm">请先配置AI助手</div>
            <div className="text-xs text-slate-400 mt-1">
              点击左侧"AI设置"图标配置API Key
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200/60">
        <div className="space-y-3">
          {/* Loading State */}
          {isAILoading && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
              <Loader className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-sm text-indigo-700">AI正在生成内容...</span>
            </div>
          )}

          {/* Input */}
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={aiConfig.enabled ? "描述你想要生成的内容..." : "请先配置AI API Key"}
                disabled={!aiConfig.enabled || isAILoading}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                rows={2}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleGenerateContent}
              disabled={!inputPrompt.trim() || !aiConfig.enabled || isAILoading}
              className="p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded-lg transition-colors min-w-[40px] h-[48px] flex items-center justify-center"
              title="生成内容 (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Tips */}
          <div className="text-xs text-slate-400">
            <span>💡 提示：AI将生成新内容并覆盖当前编辑器内容</span>
          </div>
        </div>
      </div>
    </div>
  );
};