export enum ThoughtType {
  ABSTRACTION = 'abstraction',
  CONSTRAINTS = 'constraints',
  MODEL = 'model',
  PROOF = 'proof',
  IMPLEMENTATION = 'implementation'
}

export interface ShannonThoughtData {
  thought: string;
  thoughtType: ThoughtType;
  thoughtNumber: number;
  totalThoughts: number;
  uncertainty: number; // 0-1
  dependencies: number[]; // thought numbers this builds on
  assumptions: string[]; // explicit list of assumptions
  nextThoughtNeeded: boolean;
  proofElements?: {
    hypothesis: string;
    validation: string;
  };
  implementationNotes?: {
    practicalConstraints: string[];
    proposedSolution: string;
  };
}
