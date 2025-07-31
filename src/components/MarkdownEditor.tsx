import React, { useRef, useCallback, useEffect } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { parseMarkdownToElements } from '../lib/markdownParser';
import { toast } from 'sonner';

interface MarkdownEditorProps {
  className?: string;
}

export function MarkdownEditor({ className = '' }: MarkdownEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    markdownContent, 
    setMarkdownContent, 
    setElements 
  } = useAppStore();

  // Parse markdown and update elements when content changes
  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content);
    
    // Debounce parsing to avoid too frequent updates
    const timeoutId = setTimeout(() => {
      try {
        const elements = parseMarkdownToElements(content);
        setElements(elements);
      } catch (error) {
        console.error('Failed to parse markdown:', error);
        toast.error('Markdown 解析失败');
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [setMarkdownContent, setElements]);

  // Handle file import
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
        handleContentChange(content);
        toast.success(`已导入文件: ${file.name}`);
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
  }, [handleContentChange]);

  // Handle file export
  const handleFileExport = useCallback(() => {
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
  }, [markdownContent]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const mdFile = files.find(file => file.name.match(/\.(md|markdown)$/i));
    
    if (!mdFile) {
      toast.error('请拖拽 .md 或 .markdown 文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleContentChange(content);
        toast.success(`已导入文件: ${mdFile.name}`);
      }
    };
    
    reader.onerror = () => {
      toast.error('文件读取失败');
    };
    
    reader.readAsText(mdFile);
  }, [handleContentChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleFileExport();
            break;
          case 'o':
            e.preventDefault();
            fileInputRef.current?.click();
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleFileExport]);

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Editor */}
      <div 
        className="flex-1 relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={markdownContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="在此输入 Markdown 内容，或拖拽 .md 文件到此处..."
          className="w-full h-full p-5 bg-white text-slate-800 border-none outline-none resize-none font-mono text-sm leading-relaxed placeholder-slate-400 focus:bg-slate-50/30 transition-colors"
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            tabSize: 2,
          }}
          spellCheck={false}
        />
        
        {/* Drag overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-transparent hover:border-indigo-300 transition-colors rounded-lg" />
        </div>
      </div>

      {/* Status bar */}
      <div className="px-5 py-2 bg-slate-50/80 border-t border-slate-200/60 text-xs text-slate-500">
        <div className="flex justify-between items-center">
          <span>字符数: {markdownContent.length}</span>
          <span>行数: {markdownContent.split('\n').length}</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
}