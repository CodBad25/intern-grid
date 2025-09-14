
import React, { useState, useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Palette,
  Type,
  Mic,
  Indent,
  Outdent,
  Link,
  Unlink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/VoiceInput';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  onLinksExtracted?: (links: string[]) => void;
}

const COLORS = [
  '#000000', '#374151', '#DC2626', '#EA580C', 
  '#D97706', '#65A30D', '#059669', '#0891B2',
  '#3B82F6', '#7C3AED', '#C026D3', '#E11D48'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onValueChange,
  placeholder,
  className,
  rows = 4,
  onLinksExtracted
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const extractLinks = useCallback((content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const links = Array.from(tempDiv.querySelectorAll('a[href]')).map(a => (a as HTMLAnchorElement).href);
    return links;
  }, []);

  // Convert plain text URLs into clickable <a> tags and normalize them
  const convertPlainUrlsToLinks = useCallback((html: string) => {
    const container = document.createElement('div');
    container.innerHTML = html;

    const urlRegex = /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/gi;

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (!urlRegex.test(text)) return;

        const parts = text.split(urlRegex).filter(Boolean);
        const frag = document.createDocumentFragment();

        parts.forEach((part) => {
          if (urlRegex.test(part)) {
            let href = part;
            if (!/^https?:\/\//i.test(href)) {
              href = 'https://' + href;
            }
            const a = document.createElement('a');
            a.href = href;
            a.textContent = part;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            frag.appendChild(a);
          } else {
            frag.appendChild(document.createTextNode(part));
          }
        });

        node.parentNode?.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Don't process inside anchors
        if ((node as HTMLElement).tagName.toLowerCase() === 'a') return;
        Array.from(node.childNodes).forEach(processNode);
      }
    };

    Array.from(container.childNodes).forEach(processNode);

    // Ensure anchors have target and rel
    container.querySelectorAll('a[href]').forEach((a) => {
      const anchor = a as HTMLAnchorElement;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    });

    return container.innerHTML;
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current && onValueChange) {
      const original = editorRef.current.innerHTML;
      const linked = convertPlainUrlsToLinks(original);
      if (linked !== original) {
        editorRef.current.innerHTML = linked;
      }
      onValueChange(linked);
      updateActiveFormats();
      
      // Extract and notify about links
      if (onLinksExtracted) {
        const links = extractLinks(linked);
        onLinksExtracted([...new Set(links)]);
      }
    }
  }, [onValueChange, onLinksExtracted, extractLinks, convertPlainUrlsToLinks]);

  const updateActiveFormats = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const formats = new Set<string>();
    
    // Vérifier les formats actifs
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');

    setActiveFormats(formats);
  }, []);

  const executeCommand = useCallback((command: string, value?: string) => {
    try {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      
      // Forcer une mise à jour après la commande
      setTimeout(() => {
        handleInput();
        updateActiveFormats();
      }, 10);
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande:', error);
    }
  }, [handleInput, updateActiveFormats]);

  const createLink = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const url = prompt('URL du lien:');
    if (url && url.trim()) {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      executeCommand('createLink', finalUrl);
    }
  }, [executeCommand]);

  const removeLink = useCallback(() => {
    executeCommand('unlink');
  }, [executeCommand]);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(' ' + transcript);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Insérer à la fin si pas de sélection
        const textNode = document.createTextNode(' ' + transcript);
        editorRef.current.appendChild(textNode);
      }
      handleInput();
    }
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Gérer les raccourcis clavier
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
    
    // Gérer l'indentation avec Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        executeCommand('outdent');
      } else {
        executeCommand('indent');
      }
    }
  }, [executeCommand]);

  const handleSelectionChange = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  React.useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return (
    <div className={cn('border rounded-md rich-text-editor', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('bold')}
          className={cn(
            'h-8 w-8 p-0',
            activeFormats.has('bold') && 'bg-primary text-primary-foreground'
          )}
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('italic')}
          className={cn(
            'h-8 w-8 p-0',
            activeFormats.has('italic') && 'bg-primary text-primary-foreground'
          )}
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('underline')}
          className={cn(
            'h-8 w-8 p-0',
            activeFormats.has('underline') && 'bg-primary text-primary-foreground'
          )}
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertUnorderedList')}
          className={cn(
            'h-8 w-8 p-0',
            activeFormats.has('ul') && 'bg-primary text-primary-foreground'
          )}
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertOrderedList')}
          className={cn(
            'h-8 w-8 p-0',
            activeFormats.has('ol') && 'bg-primary text-primary-foreground'
          )}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('indent')}
          className="h-8 w-8 p-0"
          title="Augmenter l'indentation"
        >
          <Indent className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('outdent')}
          className="h-8 w-8 p-0"
          title="Diminuer l'indentation"
        >
          <Outdent className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={createLink}
          className="h-8 w-8 p-0"
          title="Insérer un lien"
        >
          <Link className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeLink}
          className="h-8 w-8 p-0"
          title="Supprimer le lien"
        >
          <Unlink className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-8 w-8 p-0"
          >
            <Palette className="w-4 h-4" />
          </Button>
          
          {showColorPicker && (
            <div className="absolute top-10 left-0 z-50 p-2 bg-background border rounded-md shadow-lg">
              <div className="grid grid-cols-6 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      executeCommand('foreColor', color);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('fontSize', '2')}
          className="h-8 px-2 text-xs"
          title="Taille petite"
        >
          <Type className="w-3 h-3 mr-1" />
          P
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('fontSize', '4')}
          className="h-8 px-2 text-sm"
          title="Taille grande"
        >
          <Type className="w-4 h-4 mr-1" />
          G
        </Button>

        <div className="flex-1" />
        
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          size="sm"
          variant="ghost"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setShowColorPicker(false)}
        className={cn(
          'min-h-20 p-3 text-sm focus:outline-none rich-text-content prose prose-sm max-w-none',
          `min-h-[${rows * 1.5}rem]`
        )}
        style={{
          minHeight: `${rows * 1.5}rem`
        }}
        data-placeholder={placeholder}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor .rich-text-content:empty:before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            pointer-events: none;
            font-style: italic;
          }
          
          .rich-text-editor .rich-text-content {
            outline: none;
          }
          
          .rich-text-editor .rich-text-content ul,
          .rich-text-editor .rich-text-content ol {
            margin-left: 1.5rem;
            padding-left: 0.5rem;
          }
          
          .rich-text-editor .rich-text-content li {
            margin: 0.25rem 0;
            list-style-position: outside;
          }
          
          .rich-text-editor .rich-text-content ul li {
            list-style-type: disc;
          }
          
          .rich-text-editor .rich-text-content ol li {
            list-style-type: decimal;
          }
          
          /* Styles pour les sous-listes indentées */
          .rich-text-editor .rich-text-content ul ul,
          .rich-text-editor .rich-text-content ol ol,
          .rich-text-editor .rich-text-content ul ol,
          .rich-text-editor .rich-text-content ol ul {
            margin-left: 2rem;
          }
          
          .rich-text-editor .rich-text-content ul ul li {
            list-style-type: circle;
          }
          
          .rich-text-editor .rich-text-content ul ul ul li {
            list-style-type: square;
          }
          
          /* Support pour l'indentation des blocs */
          .rich-text-editor .rich-text-content blockquote,
          .rich-text-editor .rich-text-content [style*="margin-left"] {
            border-left: 3px solid hsl(var(--border));
            padding-left: 1rem;
            margin-left: 1rem;
          }
          
          .rich-text-editor .rich-text-content p {
            margin: 0.5rem 0;
          }
          
          .rich-text-editor .rich-text-content strong {
            font-weight: 600;
          }
          
          .rich-text-editor .rich-text-content em {
            font-style: italic;
          }
          
          .rich-text-editor .rich-text-content u {
            text-decoration: underline;
          }
          
          .rich-text-editor .rich-text-content a {
            color: hsl(var(--primary));
            text-decoration: underline;
            cursor: pointer;
          }
          
          .rich-text-editor .rich-text-content a:hover {
            color: hsl(var(--primary) / 0.8);
          }
        `
      }} />
    </div>
  );
};
