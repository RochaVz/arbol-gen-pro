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
    const getTypeIcon = (type?: string) => {
      switch (type) {
        case 'photo':
          return '📸';
        case 'document':
          return '📄';
        case 'story':
          return '📖';
        default:
          return '📷';
      }
    };

    const getTypeLabel = (type?: string) => {
      switch (type) {
        case 'photo':
          return 'Fotografía';
        case 'document':
          return 'Documento';
        case 'story':
          return 'Historia';
        default:
          return 'Recuerdo';
      }
    };

    return (
      <div ref={ref} className={className}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <span className="text-7xl mb-4 block">📷</span>
              <p className="text-neutral-600 text-lg">
                No hay recuerdos aún. ¡Comienza a documentar momentos especiales!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => onViewMemory(item.id)}
                className="group cursor-pointer rounded-xl overflow-hidden border-2 border-neutral-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
                role="button"
                tabIndex={0}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {getTypeIcon(item.type)}
                    </div>
                  )}
                  {item.type && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary-600 shadow-md">
                      {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-bold text-neutral-900 font-serif-titles mb-2">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  )}
                  {item.date && (
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      📅 {item.date}
                    </p>
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