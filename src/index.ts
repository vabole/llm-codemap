#!/usr/bin/env node

import { parseCLIArgs } from './cli';
import { setupTypeScriptProgram } from './programSetup';
import { generateCodemap, writeOutput } from './output';

const options = parseCLIArgs();

if (!options.output) {
  console.error('Error: --output flag is required');
  process.exit(1);
}

try {
  const { program, checker } = setupTypeScriptProgram();
  const codemap = generateCodemap(program, checker);
  writeOutput(options.output, codemap);
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}