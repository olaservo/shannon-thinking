import chalk from 'chalk';
import { ShannonThoughtData, ThoughtType } from './types.js';

export class ShannonThinkingServer {
  private thoughtHistory: ShannonThoughtData[] = [];

  private validateThoughtData(input: unknown): ShannonThoughtData {
    const data = input as Record<string, unknown>;
    
    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error(`Invalid thought: must be a string, received ${typeof data.thought}`);
    }
    if (!data.thoughtType || !Object.values(ThoughtType).includes(data.thoughtType as ThoughtType)) {
      throw new Error(`Invalid thoughtType: must be one of: ${Object.values(ThoughtType).join(', ')}, received ${data.thoughtType}`);
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error(`Invalid thoughtNumber: must be a number, received ${typeof data.thoughtNumber}`);
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error(`Invalid totalThoughts: must be a number, received ${typeof data.totalThoughts}`);
    }
    if (typeof data.uncertainty !== 'number' || data.uncertainty < 0 || data.uncertainty > 1) {
      throw new Error(`Invalid uncertainty: must be a number between 0 and 1, received ${data.uncertainty}`);
    }
    if (!Array.isArray(data.dependencies)) {
      throw new Error(`Invalid dependencies: must be an array, received ${typeof data.dependencies}`);
    }
    if (!Array.isArray(data.assumptions)) {
      throw new Error(`Invalid assumptions: must be an array, received ${typeof data.assumptions}`);
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error(`Invalid nextThoughtNeeded: must be a boolean, received ${typeof data.nextThoughtNeeded}`);
    }

    // Optional recheckStep validation
    if (data.recheckStep) {
      const recheck = data.recheckStep as Record<string, unknown>;
      if (!recheck.stepToRecheck || !Object.values(ThoughtType).includes(recheck.stepToRecheck as ThoughtType)) {
        throw new Error('Invalid recheckStep: stepToRecheck must be a valid ThoughtType');
      }
      if (!recheck.reason || typeof recheck.reason !== 'string') {
        throw new Error('Invalid recheckStep: reason must be a string');
      }
      if (recheck.newInformation && typeof recheck.newInformation !== 'string') {
        throw new Error('Invalid recheckStep: newInformation must be a string if provided');
      }
    }

    // Optional proofElements validation
    if (data.proofElements) {
      const proof = data.proofElements as Record<string, unknown>;
      if (!proof.hypothesis || typeof proof.hypothesis !== 'string') {
        throw new Error('Invalid proofElements: hypothesis must be a string');
      }
      if (!proof.validation || typeof proof.validation !== 'string') {
        throw new Error('Invalid proofElements: validation must be a string');
      }
    }

    // Optional experimentalElements validation
    if (data.experimentalElements) {
      const exp = data.experimentalElements as Record<string, unknown>;
      if (!exp.testDescription || typeof exp.testDescription !== 'string') {
        throw new Error('Invalid experimentalElements: testDescription must be a string');
      }
      if (!exp.results || typeof exp.results !== 'string') {
        throw new Error('Invalid experimentalElements: results must be a string');
      }
      if (typeof exp.confidence !== 'number' || exp.confidence < 0 || exp.confidence > 1) {
        throw new Error('Invalid experimentalElements: confidence must be a number between 0 and 1');
      }
      if (!Array.isArray(exp.limitations)) {
        throw new Error('Invalid experimentalElements: limitations must be an array');
      }
    }

    // Optional implementationNotes validation
    if (data.implementationNotes) {
      const impl = data.implementationNotes as Record<string, unknown>;
      if (!Array.isArray(impl.practicalConstraints)) {
        throw new Error('Invalid implementationNotes: practicalConstraints must be an array');
      }
      if (!impl.proposedSolution || typeof impl.proposedSolution !== 'string') {
        throw new Error('Invalid implementationNotes: proposedSolution must be a string');
      }
    }

    // Optional revision validation
    if (data.isRevision !== undefined && typeof data.isRevision !== 'boolean') {
      throw new Error('Invalid isRevision: must be a boolean if provided');
    }
    if (data.revisesThought !== undefined) {
      if (typeof data.revisesThought !== 'number' || data.revisesThought < 1) {
        throw new Error('Invalid revisesThought: must be a positive number if provided');
      }
      if (!data.isRevision) {
        throw new Error('Invalid revisesThought: cannot be set without isRevision being true');
      }
    }

    return {
      thought: data.thought as string,
      thoughtType: data.thoughtType as ThoughtType,
      thoughtNumber: data.thoughtNumber as number,
      totalThoughts: data.totalThoughts as number,
      uncertainty: data.uncertainty as number,
      dependencies: data.dependencies as number[],
      assumptions: data.assumptions as string[],
      nextThoughtNeeded: data.nextThoughtNeeded as boolean,
      recheckStep: data.recheckStep as ShannonThoughtData['recheckStep'],
      proofElements: data.proofElements as ShannonThoughtData['proofElements'],
      experimentalElements: data.experimentalElements as ShannonThoughtData['experimentalElements'],
      implementationNotes: data.implementationNotes as ShannonThoughtData['implementationNotes'],
      isRevision: data.isRevision as boolean | undefined,
      revisesThought: data.revisesThought as number | undefined,
    };
  }

  private formatThought(thoughtData: ShannonThoughtData): string {
    const { thoughtNumber, totalThoughts, thought, thoughtType, uncertainty, dependencies } = thoughtData;
    
    // Enhanced console output for debugging
    console.error(`Processing thought ${thoughtNumber}/${totalThoughts}`);
    console.error(`Type: ${thoughtType}`);
    console.error(`Dependencies: ${dependencies.join(', ') || 'none'}`);
    console.error(`Uncertainty: ${uncertainty}`);
    if (thoughtData.proofElements) {
      console.error('Proof elements present');
    }
    if (thoughtData.implementationNotes) {
      console.error('Implementation notes present');
    }

    const typeColors: Record<ThoughtType, (text: string) => string> = {
      [ThoughtType.PROBLEM_DEFINITION]: chalk.blue,
      [ThoughtType.CONSTRAINTS]: chalk.yellow,
      [ThoughtType.MODEL]: chalk.green,
      [ThoughtType.PROOF]: chalk.magenta,
      [ThoughtType.IMPLEMENTATION]: chalk.cyan
    };

    const typeSymbols: Record<ThoughtType, string> = {
      [ThoughtType.PROBLEM_DEFINITION]: '🔍',
      [ThoughtType.CONSTRAINTS]: '🔒',
      [ThoughtType.MODEL]: '📐',
      [ThoughtType.PROOF]: '✓',
      [ThoughtType.IMPLEMENTATION]: '⚙️'
    };

    const prefix = typeColors[thoughtType](`${typeSymbols[thoughtType]} ${thoughtType.toUpperCase()}`);
    const confidenceDisplay = `[Confidence: ${(uncertainty * 100).toFixed(1)}%]`;
    const dependencyDisplay = dependencies.length > 0 ? 
      `[Builds on thoughts: ${dependencies.join(', ')}]` : '';

    const header = `${prefix} ${thoughtNumber}/${totalThoughts} ${confidenceDisplay} ${dependencyDisplay}`;
    const border = '─'.repeat(Math.max(header.length, thought.length) + 4);

    let output = `
┌${border}┐
│ ${header} │`;

    if (thoughtData.isRevision) {
      output += `\n├${border}┤\n│ 🔄 Revising thought ${thoughtData.revisesThought} │`;
    }

    output += `\n├${border}┤\n│ ${thought.padEnd(border.length - 2)} │`;

    if (thoughtData.assumptions && thoughtData.assumptions.length > 0) {
      output += `\n├${border}┤\n│ Assumptions: ${thoughtData.assumptions.join(', ')} │`;
    }

    if (thoughtData.recheckStep) {
      output += `\n├${border}┤
│ Rechecking Step: ${thoughtData.recheckStep.stepToRecheck.padEnd(border.length - 17)} │
│ Reason: ${thoughtData.recheckStep.reason.padEnd(border.length - 9)} │`;
      if (thoughtData.recheckStep.newInformation) {
        output += `\n│ New Information: ${thoughtData.recheckStep.newInformation.padEnd(border.length - 17)} │`;
      }
    }

    if (thoughtData.proofElements) {
      output += `\n├${border}┤
│ Proof Hypothesis: ${thoughtData.proofElements.hypothesis.padEnd(border.length - 18)} │
│ Validation: ${thoughtData.proofElements.validation.padEnd(border.length - 13)} │`;
    }

    if (thoughtData.experimentalElements) {
      output += `\n├${border}┤
│ Test Description: ${thoughtData.experimentalElements.testDescription.padEnd(border.length - 18)} │
│ Results: ${thoughtData.experimentalElements.results.padEnd(border.length - 10)} │
│ Test Confidence: ${(thoughtData.experimentalElements.confidence * 100).toFixed(1)}% │
│ Limitations: ${thoughtData.experimentalElements.limitations.join(', ').padEnd(border.length - 13)} │`;
    }

    if (thoughtData.implementationNotes) {
      output += `\n├${border}┤
│ Practical Constraints: ${thoughtData.implementationNotes.practicalConstraints.join(', ').padEnd(border.length - 23)} │
│ Proposed Solution: ${thoughtData.implementationNotes.proposedSolution.padEnd(border.length - 19)} │`;
    }

    output += `\n└${border}┘`;
    return output;
  }

  public processThought(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validateThoughtData(input);

      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      // Validate dependencies and revisions
      for (const depNumber of validatedInput.dependencies) {
        if (depNumber >= validatedInput.thoughtNumber) {
          throw new Error(`Invalid dependency: cannot depend on future thought ${depNumber}`);
        }
        if (!this.thoughtHistory.some(t => t.thoughtNumber === depNumber)) {
          throw new Error(`Invalid dependency: thought ${depNumber} does not exist`);
        }
      }

      // Validate revision target
      if (validatedInput.isRevision && validatedInput.revisesThought !== undefined) {
        if (validatedInput.revisesThought >= validatedInput.thoughtNumber) {
          throw new Error(`Invalid revision: cannot revise future thought ${validatedInput.revisesThought}`);
        }
        if (!this.thoughtHistory.some(t => t.thoughtNumber === validatedInput.revisesThought)) {
          throw new Error(`Invalid revision: thought ${validatedInput.revisesThought} does not exist`);
        }
      }

      this.thoughtHistory.push(validatedInput);
      const formattedThought = this.formatThought(validatedInput);
      console.error(formattedThought);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            thoughtNumber: validatedInput.thoughtNumber,
            totalThoughts: validatedInput.totalThoughts,
            nextThoughtNeeded: validatedInput.nextThoughtNeeded,
            thoughtType: validatedInput.thoughtType,
            uncertainty: validatedInput.uncertainty,
            thoughtHistoryLength: this.thoughtHistory.length,
            isRevision: validatedInput.isRevision,
            revisesThought: validatedInput.revisesThought,
            hasExperimentalValidation: !!validatedInput.experimentalElements,
            hasRecheckStep: !!validatedInput.recheckStep
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            details: {
              receivedInput: JSON.stringify(input, null, 2),
              thoughtHistoryLength: this.thoughtHistory.length,
              lastValidThought: this.thoughtHistory.length > 0 ? 
                this.thoughtHistory[this.thoughtHistory.length - 1].thoughtNumber : null
            },
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}
