[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/olaservo-shannon-thinking-badge.png)](https://mseep.ai/app/olaservo-shannon-thinking)

# shannon-thinking

An MCP server demonstrating Claude Shannon's systematic problem-solving methodology. This server provides a tool that helps break down complex problems into structured thoughts following Shannon's approach of problem definition, mathematical modeling, and practical implementation.

<a href="https://glama.ai/mcp/servers/iffffhwqqw">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/iffffhwqqw/badge" alt="Shannon Thinking Server MCP server" />
</a>

## Overview

Claude Shannon, known as the father of information theory, approached complex problems through a systematic methodology:

1. **Problem Definition**: Strip the problem to its fundamental elements
2. **Constraints**: Identify system limitations and boundaries
3. **Model**: Develop mathematical/theoretical frameworks
4. **Proof/Validation**: Validate through formal proofs or experimental testing
5. **Implementation/Experiment**: Design and test practical solutions

This MCP server demonstrates this methodology as a tool that helps guide systematic problem-solving through these stages.

## Installation

### NPX

```json
{
  "mcpServers": {
    "shannon-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "server-shannon-thinking@latest"
      ]
    }
  }
}
```

## Usage

The server provides a single tool named `shannonthinking` that structures problem-solving thoughts according to Shannon's methodology.

Each thought must include:
- The actual thought content
- Type (problem_definition/constraints/model/proof/implementation)
- Thought number and total thoughts estimate
- Confidence level (uncertainty: 0-1)
- Dependencies on previous thoughts
- Explicit assumptions
- Whether another thought step is needed

Additional capabilities:
- **Revision**: Thoughts can revise earlier steps as understanding evolves
- **Recheck**: Mark steps that need re-examination with new information
- **Experimental Validation**: Support for empirical testing alongside formal proofs
- **Implementation Notes**: Practical constraints and proposed solutions

### Example Usage

```typescript
const thought = {
  thought: "The core problem can be defined as an information flow optimization",
  thoughtType: "problem_definition",
  thoughtNumber: 1,
  totalThoughts: 5,
  uncertainty: 0.2,
  dependencies: [],
  assumptions: ["System has finite capacity", "Information flow is continuous"],
  nextThoughtNeeded: true,
  // Optional: Mark as revision of earlier definition
  isRevision: false,
  // Optional: Indicate step needs recheck
  recheckStep: {
    stepToRecheck: "constraints",
    reason: "New capacity limitations discovered",
    newInformation: "System shows non-linear scaling"
  }
};

// Use with MCP client
const result = await client.callTool("shannonthinking", thought);
```

## Features

- **Iterative Problem-Solving**: Supports revisions and rechecks as understanding evolves
- **Flexible Validation**: Combines formal proofs with experimental validation
- **Dependency Tracking**: Explicitly tracks how thoughts build upon previous ones
- **Assumption Management**: Requires clear documentation of assumptions
- **Confidence Levels**: Quantifies uncertainty in each step
- **Rich Feedback**: Formatted console output with color-coding, symbols, and validation results

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode during development
npm run watch
```

## Tool Schema

The tool accepts thoughts with the following structure:

```typescript
interface ShannonThought {
  thought: string;
  thoughtType: "problem_definition" | "constraints" | "model" | "proof" | "implementation";
  thoughtNumber: number;
  totalThoughts: number;
  uncertainty: number; // 0-1
  dependencies: number[];
  assumptions: string[];
  nextThoughtNeeded: boolean;
  
  // Optional revision fields
  isRevision?: boolean;
  revisesThought?: number;
  
  // Optional recheck field
  recheckStep?: {
    stepToRecheck: ThoughtType;
    reason: string;
    newInformation?: string;
  };
  
  // Optional validation fields
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
  
  // Optional implementation fields
  implementationNotes?: {
    practicalConstraints: string[];
    proposedSolution: string;
  };
}
```

## When to Use

This thinking pattern is particularly valuable for:
- Complex system analysis
- Information processing problems
- Engineering design challenges
- Problems requiring theoretical frameworks
- Optimization problems
- Systems requiring practical implementation
- Problems that need iterative refinement
- Cases where experimental validation complements theory
