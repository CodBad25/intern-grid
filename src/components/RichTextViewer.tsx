
import React from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface RichTextViewerProps {
  html: string;
  className?: string;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({ html, className }) => {
  // Configuration DOMPurify plus permissive pour préserver la mise en forme
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'div', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'font'],
    ALLOWED_ATTR: ['class', 'href', 'target', 'rel', 'style', 'color', 'size'],
    ALLOWED_URI_REGEXP: /^https?:\/\/|^mailto:|^tel:/i,
    ADD_ATTR: ['style', 'color'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
  });

  // Post-traitement moins restrictif pour préserver plus de styles
  const safeHtml = sanitizedHtml.replace(
    /style="([^"]*)"/g,
    (match, styleContent) => {
      // Autoriser plus de propriétés CSS sécurisées
      const safeStyles = styleContent
        .split(';')
        .filter((style: string) => {
          const trimmed = style.trim().toLowerCase();
          return trimmed.startsWith('color:') || 
                 trimmed.startsWith('font-size:') ||
                 trimmed.startsWith('font-weight:') ||
                 trimmed.startsWith('text-decoration:') ||
                 trimmed.startsWith('background-color:') ||
                 trimmed.startsWith('margin:') ||
                 trimmed.startsWith('padding:') ||
                 trimmed.startsWith('text-align:');
        })
        .join(';');
      
      return safeStyles ? `style="${safeStyles}"` : '';
    }
  );

  return (
    <div className={cn('rich-text-viewer', className)}>
      <div
        className="rich-text-content prose prose-sm max-w-none text-foreground"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <style
        // Styles scoppés au viewer pour garantir l'affichage des puces et de l'indentation
        dangerouslySetInnerHTML={{
          __html: `
          .rich-text-viewer .rich-text-content ul,
          .rich-text-viewer .rich-text-content ol {
            margin-left: 1.5rem;
            padding-left: 0.5rem;
          }

          .rich-text-viewer .rich-text-content li {
            margin: 0.25rem 0;
            list-style-position: outside;
          }

          .rich-text-viewer .rich-text-content ul li {
            list-style-type: disc;
          }

          .rich-text-viewer .rich-text-content ol li {
            list-style-type: decimal;
          }

          .rich-text-viewer .rich-text-content p {
            margin: 0.5rem 0;
          }

          .rich-text-viewer .rich-text-content strong { font-weight: 600; }
          .rich-text-viewer .rich-text-content em { font-style: italic; }
          .rich-text-viewer .rich-text-content u { text-decoration: underline; }
          
          .rich-text-viewer .rich-text-content a {
            color: hsl(var(--primary));
            text-decoration: underline;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          
          .rich-text-viewer .rich-text-content a:hover {
            color: hsl(var(--primary) / 0.8);
            text-decoration: underline;
          }
          
          .rich-text-viewer .rich-text-content a:visited {
            color: hsl(var(--primary) / 0.7);
          }
        `
        }}
      />
    </div>
  );
};
