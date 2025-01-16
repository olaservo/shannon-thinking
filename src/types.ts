export enum ThoughtType {
  PROBLEM_DEFINITION = 'problem_definition',
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
  recheckStep?: {
    stepToRecheck: ThoughtType;
    reason: string;
    newInformation?: string;
  };
  proofElements?: {
    hypothesis: string;
    validation: string;
  };
  experimentalElements?: {
    testDescription: string;
    results: string;
    confidence: number; // 0-1
    limitations: string[];
  };
  implementationNotes?: {
    practicalConstraints: string[];
    proposedSolution: string;
  };
  isRevision?: boolean;
  revisesThought?: number;
}
