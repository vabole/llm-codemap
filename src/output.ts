import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { extractDeclarations } from './extractor';

export function generateCodemap(program: ts.Program, checker: ts.TypeChecker): string {
  const fileMap: { [file: string]: string } = {};
  const sourceFiles = program.getSourceFiles().filter(sf => !sf.isDeclarationFile);

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(process.cwd(), sourceFile.fileName);
    const { classes, interfaces, types, functions, enums, variables } = extractDeclarations(sourceFile, checker);
    const fileSections: string[] = [];

    if (classes.length) fileSections.push("Classes:", ...classes.map(cls => `  ${cls}`));
    if (interfaces.length) fileSections.push("Interfaces:", ...interfaces.map(intf => `  ${intf}`));
    if (types.length) fileSections.push("Types:", ...types.map(t => `  ${t}`));
    if (functions.length) fileSections.push("Functions:", ...functions.map(f => `  ${f}`));
    if (enums.length) fileSections.push("Enums:", ...enums.map(e => `  ${e}`));
    if (variables.length) fileSections.push("Variables:", ...variables.map(v => `  ${v}`));

    if (fileSections.length) fileMap[relativePath] = fileSections.join('\n');
  }

  let mapString = '<file_map>\n';
  mapString += generateFileTree(sourceFiles);
  mapString += '\n\n<Complete Definitions>\n';

  for (const [file, output] of Object.entries(fileMap)) {
    mapString += `Path: ${file}\n\n---\n\n${output}\n\n---\n\n`;
  }

  mapString += '</file_map>';
  return mapString;
}

function generateFileTree(sourceFiles: ts.SourceFile[]): string {
  const filePaths = sourceFiles.map(sf => path.relative(process.cwd(), sf.fileName));
  const tree: { [key: string]: any } = {};

  for (const filePath of filePaths) {
    const parts = filePath.split(path.sep);
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) current[part] = null;
      else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
  }

  function printTree(node: any, indent: string = ''): string {
    let result = '';
    for (const [key, value] of Object.entries(node)) {
      result += `${indent}${key}\n`;
      if (value && typeof value === 'object') result += printTree(value, indent + '  ');
    }
    return result;
  }

  return printTree(tree);
}

export function writeOutput(outputFile: string, content: string): void {
  fs.writeFileSync(outputFile, content, 'utf8');
  console.log(`Type map written to ${outputFile}`);
} 