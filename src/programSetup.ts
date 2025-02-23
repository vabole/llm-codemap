import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

export function setupTypeScriptProgram(): { program: ts.Program; checker: ts.TypeChecker } {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error('tsconfig.json not found in current directory');
  }

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(`Error reading tsconfig.json: ${configFile.error.messageText}`);
  }

  const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
  const program = ts.createProgram(config.fileNames, config.options);
  const checker = program.getTypeChecker();
  return { program, checker };
} 