import React from 'react';

export interface PersonProfilePageProps {
  personId?: string;
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
