import { ThoughtType } from '../types.js';
import { ShannonThinkingServer } from '../server.js';

describe('ShannonThinkingServer', () => {
  let server: ShannonThinkingServer;

  beforeEach(() => {
    server = new ShannonThinkingServer();
  });

  describe('processThought', () => {
    it('should process a valid thought successfully', () => {
      const validThought = {
        thought: "Test thought",
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 0.5,
        dependencies: [],
        assumptions: ["Test assumption"],
        nextThoughtNeeded: false
      };

      const result = server.processThought(validThought);
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        uncertainty: 0.5,
        thoughtHistoryLength: 1
      });
    });

    it('should handle invalid thought data', () => {
      const invalidThought = {
        thought: "Test thought",
        // Missing required fields
      };

      const result = server.processThought(invalidThought);
      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text)).toHaveProperty('error');
    });

    it('should validate dependencies correctly', () => {
      // First thought
      const thought1 = {
        thought: "First thought",
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        thoughtNumber: 1,
        totalThoughts: 2,
        uncertainty: 0.5,
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: true
      };

      // Second thought depending on first
      const thought2 = {
        thought: "Second thought",
        thoughtType: ThoughtType.MODEL,
        thoughtNumber: 2,
        totalThoughts: 2,
        uncertainty: 0.3,
        dependencies: [1],
        assumptions: [],
        nextThoughtNeeded: false
      };

      server.processThought(thought1);
      const result = server.processThought(thought2);
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        thoughtNumber: 2,
        thoughtHistoryLength: 2
      });
    });

    it('should reject invalid dependencies', () => {
      const thoughtWithInvalidDep = {
        thought: "Invalid dependency",
        thoughtType: ThoughtType.MODEL,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 0.5,
        dependencies: [2], // Depending on non-existent thought
        assumptions: [],
        nextThoughtNeeded: false
      };

      const result = server.processThought(thoughtWithInvalidDep);
      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text).error).toContain('Invalid dependency');
    });

    it('should validate uncertainty range', () => {
      const thoughtWithInvalidUncertainty = {
        thought: "Invalid uncertainty",
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 1.5, // Invalid: should be between 0 and 1
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: false
      };

      const result = server.processThought(thoughtWithInvalidUncertainty);
      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text).error).toContain('uncertainty');
    });

    it('should handle proof elements correctly', () => {
      const thoughtWithProof = {
        thought: "Proof thought",
        thoughtType: ThoughtType.PROOF,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 0.2,
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: false,
        proofElements: {
          hypothesis: "Test hypothesis",
          validation: "Test validation"
        }
      };

      const result = server.processThought(thoughtWithProof);
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        thoughtNumber: 1,
        thoughtType: ThoughtType.PROOF
      });
    });

    it('should handle implementation notes correctly', () => {
      const thoughtWithImplementation = {
        thought: "Implementation thought",
        thoughtType: ThoughtType.IMPLEMENTATION,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 0.3,
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: false,
        implementationNotes: {
          practicalConstraints: ["Test constraint"],
          proposedSolution: "Test solution"
        }
      };

      const result = server.processThought(thoughtWithImplementation);
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        thoughtNumber: 1,
        thoughtType: ThoughtType.IMPLEMENTATION
      });
    });

    it('should handle recheckStep correctly', () => {
      const thoughtWithRecheck = {
        thought: "Recheck thought",
        thoughtType: ThoughtType.MODEL,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 0.4,
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: true,
        recheckStep: {
          stepToRecheck: ThoughtType.CONSTRAINTS,
          reason: "New information available",
          newInformation: "Additional constraint discovered"
        }
      };

      const result = server.processThought(thoughtWithRecheck);
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        thoughtNumber: 1,
        thoughtType: ThoughtType.MODEL
      });
    });
    it('should handle experimentalElements correctly', () => {
      const thoughtWithExperiment = {
        thought: "Experimental validation",
        thoughtType: ThoughtType.PROOF,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 0.3,
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: false,
        experimentalElements: {
          testDescription: "Test case scenario",
          results: "Observed behavior matches expected",
          confidence: 0.85,
          limitations: ["Limited test coverage", "Specific environment only"]
        }
      };

      const result = server.processThought(thoughtWithExperiment);
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        thoughtNumber: 1,
        thoughtType: ThoughtType.PROOF
      });
    });

    it('should handle thought revisions correctly', () => {
      // First thought
      const originalThought = {
        thought: "Original thought",
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        thoughtNumber: 1,
        totalThoughts: 2,
        uncertainty: 0.5,
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: true
      };

      // Revision of first thought
      const revisionThought = {
        thought: "Revised definition",
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        thoughtNumber: 2,
        totalThoughts: 2,
        uncertainty: 0.3,
        dependencies: [1],
        assumptions: [],
        nextThoughtNeeded: false,
        isRevision: true,
        revisesThought: 1
      };

      server.processThought(originalThought);
      const result = server.processThought(revisionThought);
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        thoughtNumber: 2,
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        thoughtHistoryLength: 2
      });
    });

    it('should validate revision fields correctly', () => {
      const invalidRevision = {
        thought: "Invalid revision",
        thoughtType: ThoughtType.PROBLEM_DEFINITION,
        thoughtNumber: 1,
        totalThoughts: 1,
        uncertainty: 0.5,
        dependencies: [],
        assumptions: [],
        nextThoughtNeeded: false,
        revisesThought: 2, // Invalid: can't revise future thought
        isRevision: true
      };

      const result = server.processThought(invalidRevision);
      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text).error).toContain('Invalid revision');
    });
  });
});
