
import React from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface RichTextViewerProps {
  html: string;
  className?: string;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({ html, className }) => {
  // Nettoyer le HTML pour prévenir les attaques XSS
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class']
  });

  return (
    <div className={cn('rich-text-viewer', className)}>
      <div
        className="rich-text-content prose prose-sm max-w-none text-foreground"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
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
        `
        }}
      />
    </div>
  );
};
