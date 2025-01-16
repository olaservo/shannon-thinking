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
 * This tool implements Claude Shannon's systematic approach to complex problems,
 * breaking them down into clear steps of abstraction, modeling, and implementation.
 */

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
            type: "string",
            description: "The hypothesis being tested"
          },
          validation: {
            type: "string",
            description: "How the hypothesis was validated"
          }
        },
        required: ["hypothesis", "validation"],
        description: "Elements required for proof/validation steps"
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
