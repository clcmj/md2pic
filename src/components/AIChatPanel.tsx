import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MessageCircle, Send, Trash2, Plus, Copy, ArrowDown, Loader, AlertTriangle, Bot } from 'lucide-react';
import type { ChatMessage } from '../store/useAppStore';

interface AIChatPanelProps {
  className?: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ className = '' }) => {
  const {
    chatMessages,
    isAILoading,
    aiError,
    aiConfig,
    sendMessageToAI,
    clearChatHistory,
    insertAIContentToMarkdown,
    setAIError
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAILoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessageToAI(message);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsertContent = (content: string, mode: 'append' | 'replace' = 'append') => {
    insertAIContentToMarkdown(content, mode);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        message.role === 'user' 
          ? 'bg-indigo-500 text-white' 
          : 'bg-white border border-slate-200 text-slate-800'
      }`}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
          <span className={`text-xs ${
            message.role === 'user' ? 'text-indigo-100' : 'text-slate-400'
          }`}>
            {formatTime(message.timestamp)}
          </span>
          {message.role === 'assistant' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigator.clipboard.writeText(message.content)}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title="复制内容"
              >
                <Copy className="w-3 h-3 text-slate-400" />
              </button>
              <button
                onClick={() => handleInsertContent(message.content, 'append')}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title="追加到编辑器"
              >
                <Plus className="w-3 h-3 text-slate-400" />
              </button>
              <button
                onClick={() => handleInsertContent(message.content, 'replace')}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title="替换编辑器内容"
              >
                <ArrowDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col bg-slate-50/50 border-t border-slate-200/60 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-800">AI助手</span>
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
        <div className="flex items-center space-x-2">
          {chatMessages.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="清空对话"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>



      {/* Error Display */}
      {aiError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-[200px] max-h-[300px]">
        {chatMessages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <div className="text-sm">
              {aiConfig.enabled ? '开始与AI对话' : '请先配置AI助手'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {aiConfig.enabled 
                ? '尝试说：「帮我写一段关于前端开发的文章」'
                : '点击左侧"AI设置"图标配置API Key'
              }
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isAILoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-sm text-slate-600">AI正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200/60">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={aiConfig.enabled ? "输入消息..." : "请先配置AI API Key"}
              disabled={!aiConfig.enabled || isAILoading}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              rows={1}
              style={{ minHeight: '36px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !aiConfig.enabled || isAILoading}
            className="p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded-lg transition-colors"
            title="发送消息 (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

