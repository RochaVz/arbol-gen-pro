export type OperationType =
  | "ADD_PARENT"
  | "ADD_CHILD"
  | "ADD_SPOUSE"
  | "ADD_SIBLING"
  | "REMOVE_RELATIONSHIP"
  | "DELETE_PERSON"
  | "DELETE_BRANCH";

export interface Operation {
  type: OperationType;
  timestamp: number;
  params: any;
}

export class HistoryService {
  private history: Operation[] = [];
  private future: Operation[] = [];
  private maxSteps = 50;

  undo(): Operation | null {
    if (this.history.length === 0) return null;
    const op = this.history.pop()!; // Safe: length > 0 guarantees a value
    this.future.push(op);
    return op;
  }

  redo(): Operation | null {
    if (this.future.length === 0) return null;
    const op = this.future.pop()!; // Safe: length > 0 guarantees a value
    this.history.push(op);
    return op;
  }

  recordOperation(op: Operation): void {
    this.future = [];
    if (this.history.length >= this.maxSteps) {
      this.history.shift();
    }
    this.history.push(op);
  }

  getHistoryLength(): number {
    return this.history.length;
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }
}