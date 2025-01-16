# shannon-thinking

An MCP server implementing Claude Shannon's systematic problem-solving methodology. This server provides a tool that helps break down complex problems into structured thoughts following Shannon's approach of abstraction, mathematical modeling, and practical implementation.

## Overview

Claude Shannon, known as the father of information theory, approached complex problems through a systematic methodology:

1. **Abstraction**: Strip the problem to its fundamental elements
2. **Constraints**: Identify system limitations and boundaries
3. **Model**: Develop mathematical/theoretical frameworks
4. **Proof**: Validate theoretical bounds and assumptions
5. **Implementation**: Design practical solutions

This MCP server implements this methodology as a tool that helps guide systematic problem-solving through these stages.

## Installation

```bash
npm install @modelcontextprotocol/server-shannon-thinking
```

## Usage

The server provides a single tool named `shannonthinking` that structures problem-solving thoughts according to Shannon's methodology.

Each thought must include:
- The actual thought content
- Type (abstraction/constraints/model/proof/implementation)
- Thought number and total thoughts estimate
- Confidence level (uncertainty: 0-1)
- Dependencies on previous thoughts
- Explicit assumptions
- Whether another thought step is needed

Additional fields for specific thought types:
- **Proof** thoughts require hypothesis and validation
- **Implementation** thoughts require practical constraints and proposed solutions

### Example Usage

```typescript
const thought = {
  thought: "The core problem can be abstracted to an information flow optimization",
  thoughtType: "abstraction",
  thoughtNumber: 1,
  totalThoughts: 5,
  uncertainty: 0.2,
  dependencies: [],
  assumptions: ["System has finite capacity", "Information flow is continuous"],
  nextThoughtNeeded: true
};

// Use with MCP client
const result = await client.callTool("shannonthinking", thought);
```

## Features

- **Systematic Progression**: Enforces methodical problem-solving through Shannon's stages
- **Dependency Tracking**: Explicitly tracks how thoughts build upon previous ones
- **Assumption Management**: Requires clear documentation of assumptions
- **Confidence Levels**: Quantifies uncertainty in each step
- **Validation Framework**: Structured approach for proofs and implementation
- **Visual Output**: Formatted console output with color-coding and symbols

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
  thoughtType: "abstraction" | "constraints" | "model" | "proof" | "implementation";
  thoughtNumber: number;
  totalThoughts: number;
  uncertainty: number; // 0-1
  dependencies: number[];
  assumptions: string[];
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
```

## When to Use

This tool is particularly valuable for:
- Complex system analysis
- Information processing problems
- Engineering design challenges
- Problems requiring theoretical frameworks
- Optimization problems
- Systems requiring practical implementation

## License

MIT
