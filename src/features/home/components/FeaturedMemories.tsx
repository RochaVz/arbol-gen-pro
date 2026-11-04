import React from "react";
export interface MemoryItem {
  id: string;
  title: string;
  description?: string;
  photoUrl?: string;
  date?: string;
  type?: 'photo' | 'document' | 'story';
}

export interface FeaturedMemoriesProps {
  items: MemoryItem[];
  onViewMemory: (id: string) => void;
  className?: string;
}

export const FeaturedMemories = React.forwardRef<
  HTMLDivElement,
  FeaturedMemoriesProps
>(
  ({ items, onViewMemory, className = '' }, ref) => {
    return (
      <div ref={ref} className={className}>
        <h3 className="text-lg font-semibold text-ink font-serif-titles mb-4 sm:mb-6">
          Recuerdos destacados
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {items.length === 0 ? (
            <div className="col-span-2 sm:col-span-4 text-center py-12">
              <span className="text-6xl mb-3 block">📷</span>
              <p className="text-wood text-sm font-serif-content">
                No hay recuerdos destacados aún. Agrega una fotografía familiar.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                onClick={() => onViewMemory(item.id)}
                role="button"
                tabIndex={0}
              >
                <div className="relative h-32 sm:h-40 overflow-hidden bg-parchment">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-sepia/40">
                      📷
                    </div>
                  )}
                  {item.type && (
                    <span className="absolute top-2 left-2 bg-surface/90 backdrop-blur px-2 py-1 rounded text-[10px] font-medium text-wood uppercase tracking-wider">
                      {item.type === 'photo' ? 'Fotografía' : item.type === 'document' ? 'Documento' : 'Historia'}
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h4 className="text-base font-semibold text-ink font-serif-titles mb-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-wood font-serif-content line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.date && (
                    <p className="text-xs text-forest mt-2">{item.date}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  },
);

FeaturedMemories.displayName = 'FeaturedMemories';