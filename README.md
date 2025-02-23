# llm-codemap

llm-codemap is a command-line utility that extracts type information from a TypeScript codebase and generates a concise type map. This tool is designed to help developers provide type context to large language models (LLMs) or other tools by focusing solely on type declarations, minimizing token usage while preserving the essential structure of the code. It operates on TypeScript files specified in a tsconfig.json and outputs the type map to a specified file.

## Features

- Extracts type information from interfaces, type aliases, classes, enums, functions, and variables
- Infers types for declarations without explicit annotations using the TypeScript compiler
- Organizes type information by file in a simple, readable text format
- Integrates easily into workflows like Prettier or build scripts
- Lightweight and token-efficient for LLM context usage

## Installation

You can install llm-codemap globally or locally via npm.

### Global Installation

```sh
npm install -g llm-codemap
```

### Local Installation

```sh
npm install llm-codemap
```

If installed locally, you can add it to your package.json scripts for easy access (see Usage below).

## Usage

llm-codemap requires a tsconfig.json file in the working directory to determine which TypeScript files to process. Run the tool with the --output flag to specify where the type map should be saved.

### Basic Command

```sh
llm-codemap --output type-map.txt
```

This generates a type-map.txt file containing the type map of your codebase.

### Example Output

For a project with the following files:

src/utils.ts:
```typescript
interface User {
  id: number;
  name: string;
}
type Status = 'active' | 'inactive';
const config = { timeout: 5000 };
```

src/index.ts:
```typescript
function processData(data: User): Status {
  return data.name ? 'active' : 'inactive';
}
```

Running `llm-codemap --output type-map.txt` produces:

```
file: src/utils.ts

interface User { id: number; name: string; }
type Status = 'active' | 'inactive';
const config: { timeout: number };

file: src/index.ts

function processData(data: User): Status;
```

### Adding to Project Scripts

To run llm-codemap regularly (e.g., like Prettier), add it to your package.json scripts:

```json
{
  "scripts": {
    "generate-type-map": "llm-codemap --output type-map.txt"
  }
}
```

Then execute it with:

```sh
npm run generate-type-map
```

## Requirements

- A tsconfig.json file must exist in the current working directory
- The --output flag is required to specify the output file

## Options

| Option | Description | Required |
|--------|-------------|----------|
| -o, --output | Path to the output file for the type map | Yes |

If the --output flag is omitted or tsconfig.json is missing, the tool will exit with an error message.

## Configuration

llm-codemap uses the tsconfig.json file in the current directory to determine:

- The list of TypeScript files to process (via include, exclude, and files options)
- Compiler options (e.g., strict, target) that influence type inference

Example tsconfig.json:

```json
{
  "compilerOptions": {
    "target": "es6",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Adjust your tsconfig.json to include the desired files for type extraction.

## Development

### Prerequisites

- Node.js (v14 or higher recommended)
- npm

### Setup

Clone the repository:

```sh
git clone https://github.com/yourusername/llm-codemap.git
cd llm-codemap
```

Install dependencies:

```sh
npm install
```

Build the project:

```sh
npm run build
```

### Local Testing

Link the package locally to test it:

```sh
npm link
```

Then, in a test project directory with a tsconfig.json, run:

```sh
llm-codemap --output test-map.txt
```

## Limitations

- Only processes top-level declarations (nested types within functions are excluded)
- Requires a tsconfig.json file; does not support standalone file lists yet
- Does not resolve import statements in the output (type names are preserved as-is)

## Contributing

Contributions are welcome! Please submit issues or pull requests to the GitHub repository. For major changes, open an issue first to discuss the proposal.

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Acknowledgments

Built with the TypeScript Compiler API and Commander.js.