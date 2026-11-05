import React from 'react';

export interface PersonProfilePageProps {
  personId?: string;
  photoUrl?: string;
  parents?: any[];
  children?: any[];
  partners?: any[];
  events?: any[];
  gallery?: any[];
  documents?: any[];
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
  personId,
}) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-ink mb-4">Perfil de Persona</h2>
      {personId ? (
        <p className="text-text">Person ID: {personId}</p>
      ) : (
        <p className="text-text">Seleccione una persona para ver su perfil</p>
      )}
    </div>
  );
};
