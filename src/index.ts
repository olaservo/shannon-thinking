#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { ThoughtType, ShannonThoughtData } from "./types.js";
import { ShannonThinkingServer } from "./server.js";

/**
 * Tool definition for the Shannon Thinking problem-solving methodology.
 * This tool implements Claude Shannon's systematic and iterative approach to complex problems,
 * breaking them down into clear steps of problem definition, modeling, validation, and implementation.
 * It supports revisions and re-examination as understanding evolves.
 */

const SHANNON_THINKING_TOOL: Tool = {
  name: "shannonthinking",
  description: `A problem-solving tool inspired by Claude Shannon's systematic and iterative approach to complex problems.

This tool helps break down problems using Shannon's methodology of problem definition, mathematical modeling, validation, and practical implementation.

When to use this tool:
- Complex system analysis
- Information processing problems
- Engineering design challenges
- Problems requiring theoretical frameworks
- Optimization problems
- Systems requiring practical implementation
- Problems that need iterative refinement
- Cases where experimental validation complements theory

Key features:
- Systematic progression through problem definition → constraints → modeling → validation → implementation
- Support for revising earlier steps as understanding evolves
- Ability to mark steps for re-examination with new information
- Experimental validation alongside formal proofs
- Explicit tracking of assumptions and dependencies
- Confidence levels for each step
- Rich feedback and validation results

Parameters explained:
- thoughtType: Type of thinking step (PROBLEM_DEFINITION, CONSTRAINTS, MODEL, PROOF, IMPLEMENTATION)
- uncertainty: Confidence level in the current thought (0-1)
- dependencies: Which previous thoughts this builds upon
- assumptions: Explicit listing of assumptions made
- isRevision: Whether this revises an earlier thought
- revisesThought: Which thought is being revised
- recheckStep: For marking steps that need re-examination
- proofElements: For formal validation steps
- experimentalElements: For empirical validation
- implementationNotes: For practical application steps

The tool supports an iterative approach:
1. Define the problem's fundamental elements (revisable as understanding grows)
2. Identify system constraints and limitations (can be rechecked with new information)
3. Develop mathematical/theoretical models
4. Validate through proofs and/or experimental testing
5. Design and test practical implementations

Each thought can build on, revise, or re-examine previous steps, creating a flexible yet rigorous problem-solving framework.`,
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
      isRevision: {
        type: "boolean",
        description: "Whether this thought revises an earlier one"
      },
      revisesThought: {
        type: "integer",
        description: "The thought number being revised",
        minimum: 1
      },
      recheckStep: {
        type: "object",
        properties: {
          stepToRecheck: {
            type: "string",
            enum: Object.values(ThoughtType),
            description: "Which type of step needs re-examination"
          },
          reason: {
            type: "string",
            description: "Why the step needs to be rechecked"
          },
          newInformation: {
            type: "string",
            description: "New information prompting the recheck"
          }
        },
        required: ["stepToRecheck", "reason"],
        description: "For marking steps that need re-examination"
      },
      proofElements: {
        type: "object",
        properties: {
          hypothesis: {
            type: "string",
            description: "The hypothesis being tested"
          },
          validation: {
            type: "string",
            description: "How the hypothesis was validated"
          }
        },
        required: ["hypothesis", "validation"],
        description: "Elements required for formal proof steps"
      },
      experimentalElements: {
        type: "object",
        properties: {
          testDescription: {
            type: "string",
            description: "Description of the experimental test"
          },
          results: {
            type: "string",
            description: "Results of the experiment"
          },
          confidence: {
            type: "number",
            description: "Confidence in the experimental results (0-1)",
            minimum: 0,
            maximum: 1
          },
          limitations: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Limitations of the experimental validation"
          }
        },
        required: ["testDescription", "results", "confidence", "limitations"],
        description: "Elements for experimental validation"
      },
      implementationNotes: {
        type: "object",
        properties: {
          practicalConstraints: {
            type: "array",
            items: {
              type: "string"
            },
            description: "List of practical limitations and constraints"
          },
          proposedSolution: {
            type: "string",
            description: "Detailed implementation proposal"
          }
        },
        required: ["practicalConstraints", "proposedSolution"],
        description: "Notes for practical implementation steps"
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
