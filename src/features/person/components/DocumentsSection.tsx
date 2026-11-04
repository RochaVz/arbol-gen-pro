import React from "react";
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export interface DocumentItem {
  id: string;
  title: string;
  type: 'acta' | 'fotografia' | 'carta' | 'documento';
  date?: string;
  url?: string;
}

export interface DocumentsSectionProps {
  documents: DocumentItem[];
  onAddDocument: () => void;
  className?: string;
}

export const DocumentsSection = React.forwardRef<
  HTMLDivElement,
  DocumentsSectionProps
>(
  ({ documents, onAddDocument, className = '' }, ref) => {
    const TYPE_LABEL: Record<string, string> = {
      acta: 'Acta',
      fotografia: 'Fotografía',
      carta: 'Carta',
      documento: 'Documento',
    };

    return (
      <Card
        ref={ref}
        radius="lg"
        className={`
          bg-surface border border-border shadow-sm
          ${className}
        `.trim()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-ink font-serif-titles">
              Documentos familiares
            </h3>
            <Button size="sm" variant="ghost" onClick={onAddDocument}>
              Agregar documento
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-paper/50">
              <span className="text-6xl mb-3 block">📄</span>
              <p className="text-wood text-sm font-serif-content">
                No hay documentos guardados aún.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-parchment rounded-lg border border-border"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-surface border border-border rounded flex items-center justify-center text-sepia text-xl">
                    {doc.type === 'acta' ? '📜' : doc.type === 'fotografia' ? '🖼️' : doc.type === 'carta' ? '✉️' : '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-ink font-serif-titles leading-tight">
                      {doc.title}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-wood mt-0.5">
                      <span>{TYPE_LABEL[doc.type]}</span>
                      {doc.date && <span>· {doc.date}</span>}
                    </p>
                  </div>
                  {doc.url && (
                    <Button variant="ghost" size="sm" onClick={() => {}}>
                      Abrir
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  },
);

DocumentsSection.displayName = 'DocumentsSection';