import React from 'react';
import { Button } from '../../shared/components/ui/Button';
import { Card } from '../../shared/components/ui/Card';
import type { Person } from '../../core/db';

export interface PersonProfilePageProps {
  personId?: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
  lifeStatus?: 'living' | 'deceased' | 'unknown';
  parents?: Person[];
  familyChildren?: Person[];
  partners?: Person[];
  events?: Array<{ id: string; title: string; date: string }>;
  gallery?: Array<{ id: string; url: string }>;
  documents?: Array<{ id: string; name?: string; type?: string }>;
  onSelectPerson?: (id: string) => void;
  onBack?: () => void;
  onEdit?: () => void;
  onAddPhoto?: () => void;
  onAddParent?: () => void;
  onAddChild?: () => void;
  onAddPartner?: () => void;
  onAddEvent?: () => void;
  onAddDocument?: () => void;
}

export const PersonProfilePage: React.FC<PersonProfilePageProps> = ({
  photoUrl,
  firstName = 'Persona',
  lastName = '',
  birthDate,
  deathDate,
  lifeStatus = 'living',
  parents = [],
  familyChildren = [],
  partners = [],
  events = [],
  gallery = [],
  documents = [],
  onSelectPerson,
  onBack,
  onEdit,
  onAddPhoto,
  onAddParent,
  onAddChild,
  onAddPartner,
  onAddEvent,
  onAddDocument,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header con botón atrás */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            ← Volver
          </button>
          <Button variant="secondary" size="md" onClick={onEdit} disabled={!onEdit}>
            ✏️ Editar perfil
          </Button>
        </div>

        {/* Hero Section - Perfil principal */}
        <Card elevated radius="xl" className="mb-8 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            {/* Foto y datos principales */}
            <div className="md:col-span-1">
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 mb-6 rounded-2xl overflow-hidden shadow-xl border-4 border-primary-200 bg-primary-50">
                  {photoUrl ? (
                    <img src={photoUrl} alt={firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-primary-600">
                      {firstName.charAt(0)}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="secondary" onClick={onAddPhoto} fullWidth>
                  📸 Cambiar foto
                </Button>
              </div>
            </div>

            {/* Información principal */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                {firstName} {lastName}
              </h1>
              
              <div className="space-y-4 mb-8">
                {birthDate && (
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-600 font-semibold">📅 Nacimiento:</span>
                    <span className="text-neutral-900">{birthDate}</span>
                  </div>
                )}
                {deathDate && (
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-600 font-semibold">✝️ Fallecimiento:</span>
                    <span className="text-neutral-900">{deathDate}</span>
                  </div>
                )}
                {!deathDate && lifeStatus === 'living' && (
                  <div className="flex items-center gap-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      ✓ Vivo
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button size="md" variant="primary" onClick={onAddParent}>
                  👨‍👩‍👧 Agregar padres
                </Button>
                <Button size="md" variant="primary" onClick={onAddPartner}>
                  💑 Agregar pareja
                </Button>
                <Button size="md" variant="secondary" onClick={onAddChild}>
                  👶 Agregar hijos
                </Button>
                <Button size="md" variant="secondary" onClick={onAddEvent}>
                  📝 Agregar evento
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Grid de secciones: 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Padres */}
          <Card elevated radius="lg">
            <div className="border-b border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900">👨‍👩‍👧 Padres</h2>
            </div>
            <div className="p-6">
              {parents.length === 0 ? (
                <p className="text-neutral-600 text-center py-8">Sin padres registrados</p>
              ) : (
                <div className="space-y-4">
                  {parents.map((parent) => (
                    <div
                      key={parent.id}
                      onClick={() => onSelectPerson?.(parent.id)}
                      className="p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors border border-neutral-200 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 border-2 border-primary-200 flex items-center justify-center font-bold text-primary-600">
                        {parent.firstName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{parent.firstName} {parent.lastName}</p>
                        <p className="text-sm text-neutral-600">Pariente</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Pareja */}
          <Card elevated radius="lg">
            <div className="border-b border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900">💑 Pareja</h2>
            </div>
            <div className="p-6">
              {partners.length === 0 ? (
                <p className="text-neutral-600 text-center py-8">Sin pareja registrada</p>
              ) : (
                <div className="space-y-4">
                  {partners.map((partner) => (
                    <div
                      key={partner.id}
                      onClick={() => onSelectPerson?.(partner.id)}
                      className="p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors border border-neutral-200 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 border-2 border-rose-200 flex items-center justify-center font-bold text-rose-600">
                        {partner.firstName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{partner.firstName} {partner.lastName}</p>
                        <p className="text-sm text-neutral-600">Pareja</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Hijos */}
          <Card elevated radius="lg">
            <div className="border-b border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900">👶 Hijos</h2>
            </div>
            <div className="p-6">
              {familyChildren.length === 0 ? (
                <p className="text-neutral-600 text-center py-8">Sin hijos registrados</p>
              ) : (
                <div className="space-y-4">
                  {familyChildren.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => onSelectPerson?.(child.id)}
                      className="p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors border border-neutral-200 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 flex items-center justify-center font-bold text-blue-600">
                        {child.firstName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{child.firstName} {child.lastName}</p>
                        <p className="text-sm text-neutral-600">Hijo/a</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Eventos */}
          <Card elevated radius="lg">
            <div className="border-b border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900">📅 Eventos</h2>
            </div>
            <div className="p-6">
              {events.length === 0 ? (
                <p className="text-neutral-600 text-center py-8">Sin eventos registrados</p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                      <p className="font-semibold text-neutral-900">{event.title}</p>
                      <p className="text-sm text-neutral-600">{event.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Galería y Documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería */}
          <Card elevated radius="lg">
            <div className="border-b border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900">📸 Galería</h2>
            </div>
            <div className="p-6">
              {gallery.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-600 mb-4">No hay fotos aún</p>
                  <Button size="sm" variant="secondary" onClick={onAddPhoto}>
                    📸 Agregar fotos
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {gallery.map((photo, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
                      {photo.url ? (
                        <img src={photo.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📷</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Documentos */}
          <Card elevated radius="lg">
            <div className="border-b border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900">📄 Documentos</h2>
            </div>
            <div className="p-6">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-600 mb-4">No hay documentos aún</p>
                  <Button size="sm" variant="secondary" onClick={onAddDocument} disabled={!onAddDocument}>
                    📄 Agregar documentos
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors flex items-center gap-3 cursor-pointer">
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{doc.name || `Documento ${idx + 1}`}</p>
                        <p className="text-sm text-neutral-600">{doc.type || 'PDF'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
