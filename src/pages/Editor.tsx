import React, { useEffect, useState } from 'react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { VisualCanvas } from '../components/VisualCanvas';
import { SidebarMenu, MenuTab } from '../components/SidebarMenu';
import { ControlPanel } from '../components/ControlPanel';
import { FloatingAddButton } from '../components/FloatingAddButton';
import { AIChatPanel } from '../components/AIChatPanel';
import { useAppStore } from '../store/useAppStore';
import { parseMarkdownToElements } from '../lib/markdownParser';
import { FileText, Palette, Settings, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';

export function Editor() {
  const [activeTab, setActiveTab] = useState<MenuTab>('elements');
  
  const { 
    markdownContent, 
    setMarkdownContent,
    setElements, 
    currentPage, 
    totalPages, 
    setCurrentPage,
    selectedElementId
  } = useAppStore();

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.match(/\.(md|markdown)$/i)) {
      toast.error('请选择 .md 或 .markdown 文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setMarkdownContent(content);
        try {
          const elements = parseMarkdownToElements(content);
          setElements(elements);
          toast.success(`已导入文件: ${file.name}`);
        } catch (error) {
          console.error('Failed to parse markdown:', error);
          toast.error('Markdown 解析失败');
        }
      }
    };
    
    reader.onerror = () => {
      toast.error('文件读取失败');
    };
    
    reader.readAsText(file);
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Handle file export
  const handleFileExport = () => {
    try {
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `md2pic-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('文件导出成功');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('文件导出失败');
    }
  };

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
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 shadow-sm/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">md2pic</h1>
                <p className="text-sm text-slate-500">Markdown 转图片工具</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200/60">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 font-medium">实时预览</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200/60">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span className="text-indigo-700 font-medium">拖拽编辑</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Icon Menu */}
        <SidebarMenu activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Left Panel - Control Panel */}
        <ControlPanel activeTab={activeTab} />

        {/* Center Panel - Visual Canvas */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-200/60">
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-50/80 border-b border-slate-200/60">
            <div className="flex items-center space-x-3">
              <Palette className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-sm font-semibold text-slate-800">可视化画布</span>
                <div className="text-xs text-slate-500">拖拽编辑和实时预览</div>
              </div>
            </div>
            
            {/* Page Navigation */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                页面 {currentPage} / {totalPages}
              </span>
              <div className="flex space-x-1">
              <button
                onClick={() => {
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                disabled={currentPage <= 1}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <button
                onClick={() => {
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
              </div>
            </div>
          </div>
          
          {/* Visual Canvas */}
          <VisualCanvas className="flex-1 bg-slate-50/30" />
        </div>

                {/* Right Panel - Markdown Editor & AI Chat */}
        <div className="w-1/3 min-w-[300px] max-w-[500px] flex flex-col bg-white">
          {/* Markdown Editor Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-50/80 border-b border-slate-200/60">
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-sm font-semibold text-slate-800">Markdown 编辑器</span>
                  <div className="text-xs text-slate-500">实时编辑和语法高亮</div>
                </div>
              </div>
              
              {/* Import/Export Buttons */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".md,.markdown"
                  onChange={handleFileImport}
                  className="hidden"
                  id="header-file-input"
                />
                <button
                  onClick={() => {
                    document.getElementById('header-file-input')?.click();
                  }}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg transition-all duration-200 text-xs font-medium"
                  title="导入文件 (Ctrl+O)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>导入</span>
                </button>
                
                <button
                  onClick={handleFileExport}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-lg transition-all duration-200 text-xs font-medium"
                  title="导出文件 (Ctrl+S)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出</span>
                </button>
              </div>
            </div>
            <MarkdownEditor className="flex-1 min-h-0" />
          </div>
          
          {/* AI Chat Section */}
          <AIChatPanel className="flex-shrink-0" />
        </div>
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60 px-6 py-3 shadow-sm/60">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-slate-500">
            <span className="text-slate-400">快捷键:</span>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">双击编辑</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">Enter换行</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">Ctrl+Z撤销</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">Delete删除</span>
            </div>
          </div>
          <div className="text-slate-400">
            <span>© 2024 md2pic - Markdown to Image Tool</span>
          </div>
        </div>
      </footer>
    </div>
  );
}