#!/usr/bin/env node

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { Command, Option, OptionValues } from 'commander';

const program = new Command();
program
  .option('-o, --output <file>', 'output file for the type map')
  .parse(process.argv);

const options = program.opts();

if (!options.output) {
  console.error('Error: --output flag is required');
  process.exit(1);
}

const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error('Error: tsconfig.json not found in current directory');
  process.exit(1);
}

const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
if (configFile.error) {
  console.error('Error reading tsconfig.json:', configFile.error);
  process.exit(1);
}

const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
const tsProgram = ts.createProgram(config.fileNames, config.options);
const checker = tsProgram.getTypeChecker();
const printer = ts.createPrinter();
const map: { [file: string]: string[] } = {};

for (const sourceFile of tsProgram.getSourceFiles()) {
  if (!sourceFile.isDeclarationFile) {
    const declarations: string[] = [];
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node) || ts.isClassDeclaration(node)) {
        const declStr = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
        declarations.push(declStr);
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const symbol = checker.getSymbolAtLocation(decl.name);
            if (symbol) {
              const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
              const typeStr = checker.typeToString(type);
              const declStr = `const ${decl.name.getText()}: ${typeStr};`;
              declarations.push(declStr);
            }
          }
        }
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) {
          const type = checker.getTypeOfSymbolAtLocation(symbol, node);
          const callSignatures = type.getCallSignatures();
          if (callSignatures.length > 0) {
            const signature = callSignatures[0];
            const params = signature.parameters.map(p => `${p.name}: ${checker.typeToString(checker.getTypeOfSymbolAtLocation(p, node))}`).join(', ');
            const returnType = checker.typeToString(signature.getReturnType());
            const declStr = `function ${node.name.getText()}(${params}): ${returnType};`;
            declarations.push(declStr);
          }
        }
      }
    });
    const relativePath = path.relative(process.cwd(), sourceFile.fileName);
    map[relativePath] = declarations;
  }
}

let mapString = '';
for (const [file, decls] of Object.entries(map)) {
  mapString += `file: ${file}\n\n${decls.join('\n')}\n\n`;
}

try {
  fs.writeFileSync(options.output, mapString, 'utf8');
  console.log(`Type map written to ${options.output}`);
} catch (err) {
  console.error('Error writing to output file:', err);
  process.exit(1);
}