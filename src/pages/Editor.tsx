import React, { useEffect } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { VisualCanvas } from '../components/VisualCanvas';
import { StylePanel } from '../components/StylePanel';
import { CanvasFormatPanel } from '../components/CanvasFormatPanel';
import { ExportPanel } from '../components/ExportPanel';
import { PageSplitPanel } from '../components/PageSplitPanel';
import { ElementEditPanel } from '../components/ElementEditPanel';
import { BackgroundPanel } from '../components/BackgroundPanel';
import { AddElementPanel } from '../components/AddElementPanel';
import { FloatingAddButton } from '../components/FloatingAddButton';
import { useAppStore } from '../store/useAppStore';
import { parseMarkdownToElements } from '../lib/markdownParser';
import { FileText, Palette, Download, Settings } from 'lucide-react';

export function Editor() {
  const { 
    markdownContent, 
    setElements, 
    currentPage, 
    totalPages, 
    setCurrentPage,
    selectedElementId
  } = useAppStore();

  // Initialize with default content
  useEffect(() => {
    if (markdownContent) {
      try {
        const elements = parseMarkdownToElements(markdownContent);
        setElements(elements);
      } catch (error) {
        console.error('Failed to parse initial markdown:', error);
      }
    }
  }, []);

  // Auto split pages when markdown content changes
  const { autoSplit, splitPages } = useAppStore();
  useEffect(() => {
    if (autoSplit && markdownContent) {
      splitPages();
    }
  }, [markdownContent, autoSplit, splitPages]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">md2pic</h1>
                <p className="text-sm text-gray-500">Markdown 转图片工具</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>实时预览</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <Settings className="w-4 h-4" />
                  <span>拖拽编辑</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Markdown Editor */}
        <div className="w-1/3 min-w-[300px] max-w-[500px] flex flex-col border-r border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">编辑器</span>
            </div>
          </div>
          <MarkdownEditor className="flex-1" />
        </div>

        {/* Center Panel - Visual Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">可视化画布</span>
            </div>
            
            {/* Page Navigation */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">页面 {currentPage} / {totalPages}</span>
              <button
                onClick={() => {
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                disabled={currentPage <= 1}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => {
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                disabled={currentPage >= totalPages}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
          
          {/* Visual Canvas */}
          <VisualCanvas className="flex-1" />
        </div>

        {/* Right Panel - Controls */}
        <div className="w-80 flex flex-col border-l border-gray-200 bg-white">
          {selectedElementId ? (
            // 元素编辑面板
            <ElementEditPanel />
          ) : (
            // 默认控制面板
            <>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">控制面板</span>
                </div>
              </div>
              
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto">
                {/* Add Element Panel */}
                <AddElementPanel />
                
                {/* Page Split Panel */}
                <PageSplitPanel />
                
                {/* Background Panel */}
                <BackgroundPanel />
                
                {/* Canvas Format Panel */}
                <CanvasFormatPanel />
                
                {/* Export Panel */}
                <ExportPanel />
                
                {/* Style Panel */}
                <StylePanel />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>快捷键: 双击编辑 | Enter换行 | Ctrl+Enter保存 | Esc取消 | Ctrl+Z撤销 | Delete删除</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>© 2024 md2pic - Markdown to Image Tool</span>
          </div>
        </div>
      </footer>
    </div>
  );
}