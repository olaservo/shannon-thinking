#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';

enum ThoughtType {
  ABSTRACTION = 'abstraction',
  CONSTRAINTS = 'constraints',
  MODEL = 'model',
  PROOF = 'proof',
  IMPLEMENTATION = 'implementation'
}

interface ShannonThoughtData {
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

class ShannonThinkingServer {
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

    return {
      thought: data.thought as string,
      thoughtType: data.thoughtType as ThoughtType,
      thoughtNumber: data.thoughtNumber as number,
      totalThoughts: data.totalThoughts as number,
      uncertainty: data.uncertainty as number,
      dependencies: data.dependencies as number[],
      assumptions: data.assumptions as string[],
      nextThoughtNeeded: data.nextThoughtNeeded as boolean,
      proofElements: data.proofElements as ShannonThoughtData['proofElements'],
      implementationNotes: data.implementationNotes as ShannonThoughtData['implementationNotes'],
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

    const typeColors = {
      [ThoughtType.ABSTRACTION]: chalk.blue,
      [ThoughtType.CONSTRAINTS]: chalk.yellow,
      [ThoughtType.MODEL]: chalk.green,
      [ThoughtType.PROOF]: chalk.magenta,
      [ThoughtType.IMPLEMENTATION]: chalk.cyan
    };

    const typeSymbols = {
      [ThoughtType.ABSTRACTION]: '🔍',
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
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │`;

    if (thoughtData.assumptions && thoughtData.assumptions.length > 0) {
      output += `\n├${border}┤\n│ Assumptions: ${thoughtData.assumptions.join(', ')} │`;
    }

    if (thoughtData.proofElements) {
      output += `\n├${border}┤
│ Proof Hypothesis: ${thoughtData.proofElements.hypothesis.padEnd(border.length - 18)} │
│ Validation: ${thoughtData.proofElements.validation.padEnd(border.length - 13)} │`;
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

      // Validate dependencies
      for (const depNumber of validatedInput.dependencies) {
        if (depNumber >= validatedInput.thoughtNumber) {
          throw new Error(`Invalid dependency: cannot depend on future thought ${depNumber}`);
        }
        if (!this.thoughtHistory.some(t => t.thoughtNumber === depNumber)) {
          throw new Error(`Invalid dependency: thought ${depNumber} does not exist`);
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
            thoughtHistoryLength: this.thoughtHistory.length
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

const SHANNON_THINKING_TOOL: Tool = {
  name: "shannonthinking",
  description: `A problem-solving tool inspired by Claude Shannon's systematic approach to complex problems.
This tool helps break down problems using Shannon's methodology of abstraction, mathematical modeling, and practical implementation.

When to use this tool:
- Complex system analysis
- Information processing problems
- Engineering design challenges
- Problems requiring theoretical frameworks
- Optimization problems
- Systems requiring practical implementation

Key features:
- Systematic progression through abstraction → constraints → modeling → proof → implementation
- Explicit tracking of assumptions and dependencies
- Confidence levels for each step
- Mathematical/theoretical framework development
- Practical implementation considerations

Parameters explained:
- thoughtType: Type of thinking step (ABSTRACTION, CONSTRAINTS, MODEL, PROOF, IMPLEMENTATION)
- uncertainty: Confidence level in the current thought (0-1)
- dependencies: Which previous thoughts this builds upon
- assumptions: Explicit listing of assumptions made
- proofElements: For validation steps
- implementationNotes: For practical application steps

The tool enforces Shannon's systematic approach:
1. Abstract the problem to fundamental elements
2. Identify system constraints and limitations
3. Develop mathematical/theoretical models
4. Prove theoretical bounds
5. Design practical implementations

Each thought must explicitly state assumptions and build on previous steps, creating a rigorous problem-solving framework.`,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current thinking step"
      },
      thoughtType: {
        type: "string",
        enum: Object.values(ThoughtType),
        description: "Type of thinking step"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed",
        minimum: 1
      },
      uncertainty: {
        type: "number",
        description: "Confidence level (0-1)",
        minimum: 0,
        maximum: 1
      },
      dependencies: {
        type: "array",
        items: {
          type: "integer",
          minimum: 1
        },
        description: "Thought numbers this builds upon"
      },
      assumptions: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Explicit list of assumptions"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      proofElements: {
        type: "object",
        properties: {
          hypothesis: {
            type: "string"
          },
          validation: {
            type: "string"
          }
        },
        required: ["hypothesis", "validation"]
      },
      implementationNotes: {
        type: "object",
        properties: {
          practicalConstraints: {
            type: "array",
            items: {
              type: "string"
            }
          },
          proposedSolution: {
            type: "string"
          }
        },
        required: ["practicalConstraints", "proposedSolution"]
      }
    },
    required: ["thought", "thoughtType", "thoughtNumber", "totalThoughts", "uncertainty", "dependencies", "assumptions", "nextThoughtNeeded"]
  }
};

const server = new Server(
  {
    name: "shannon-thinking-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const thinkingServer = new ShannonThinkingServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SHANNON_THINKING_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "shannonthinking") {
    return thinkingServer.processThought(request.params.arguments);
  }

  return {
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }],
    isError: true
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shannon Thinking MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
