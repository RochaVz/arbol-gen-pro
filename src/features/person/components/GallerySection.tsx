import React from "react";
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

export interface GalleryPhoto {
  id: string;
  url: string;
  title?: string;
  date?: string;
  description?: string;
}

export interface GallerySectionProps {
  photos: GalleryPhoto[];
  onAddPhoto: () => void;
  onViewPhoto: (id: string) => void;
  className?: string;
}

export const GallerySection = React.forwardRef<
  HTMLDivElement,
  GallerySectionProps
>(
  ({ photos, onAddPhoto, onViewPhoto, className = '' }, ref) => {
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
              Galería de fotos
            </h3>
            <Button size="sm" variant="ghost" onClick={onAddPhoto}>
              Agregar foto
            </Button>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-paper/50">
              <span className="text-6xl mb-3 block">📷</span>
              <p className="text-wood text-sm font-serif-content">
                No hay fotografías aún. Agrega una imagen de esta persona.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-parchment shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  onClick={() => onViewPhoto(photo.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="h-32 sm:h-40 overflow-hidden bg-sepia/20">
                    <img
                      src={photo.url}
                      alt={photo.title ?? 'Fotografía familiar'}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    {photo.title && (
                      <h4 className="text-sm font-semibold text-ink font-serif-titles mb-1">
                        {photo.title}
                      </h4>
                    )}
                    {photo.date && (
                      <p className="text-xs text-forest">{photo.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  },
);

GallerySection.displayName = 'GallerySection';