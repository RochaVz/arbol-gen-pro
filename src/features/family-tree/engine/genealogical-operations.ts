export type GenealogicalOperation =
  | 'ADD_PARENT'
  | 'ADD_CHILD'
  | 'ADD_SPOUSE'
  | 'ADD_SIBLING'
  | 'ADD_RELATIVE'
  | 'REMOVE_RELATIONSHIP'
  | 'DELETE_PERSON'
  | 'DELETE_BRANCH';

export interface AddParentOperation {
  personId: string;
  fatherId?: string;
  motherId?: string;
  fatherName: string;
  motherName: string;
  personName: string;
  personLastName?: string;
}

export interface AddChildOperation {
  parentId: string;
  childId?: string;
  childName: string;
  childLastName?: string;
  childSex?: 'male' | 'female' | 'other' | 'unknown';
}

export interface AddSpouseOperation {
  person1Id: string;
  person2Id: string;
  spouseName?: string;
  spouseLastName?: string;
}

export interface AddSiblingOperation {
  referencePersonId: string;
  siblingName: string;
  siblingLastName?: string;
  siblingSex?: 'male' | 'female' | 'other' | 'unknown';
  isOlder?: boolean;
}

export interface RemoveRelationshipOperation {
  relationshipId: string;
}

export interface DeletePersonOperation {
  personId: string;
  confirm: boolean;
  deleteRelations: boolean;
}

export interface DeleteBranchOperation {
  branchRootId: string;
  confirm: boolean;
  deleteRelations: boolean;
}