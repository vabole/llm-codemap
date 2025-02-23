import * as ts from 'typescript';
import { formatClass, formatInterface, formatTypeAlias, formatFunction, formatEnum, formatVariable } from './formatter';

export function extractDeclarations(sourceFile: ts.SourceFile, checker: ts.TypeChecker): {
  classes: string[];
  interfaces: string[];
  types: string[];
  functions: string[];
  enums: string[];
  variables: string[];
} {
  const classes: string[] = [];
  const interfaces: string[] = [];
  const types: string[] = [];
  const functions: string[] = [];
  const enums: string[] = [];
  const variables: string[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      const classStr = formatClass(node, checker);
      if (classStr) classes.push(classStr);
    } else if (ts.isInterfaceDeclaration(node)) {
      const interfaceStr = formatInterface(node, checker);
      if (interfaceStr) interfaces.push(interfaceStr);
    } else if (ts.isTypeAliasDeclaration(node)) {
      const typeStr = formatTypeAlias(node, checker);
      if (typeStr) types.push(typeStr);
    } else if (ts.isFunctionDeclaration(node)) {
      const funcStr = formatFunction(node, checker);
      if (funcStr) functions.push(funcStr);
    } else if (ts.isEnumDeclaration(node)) {
      const enumStr = formatEnum(node);
      if (enumStr) enums.push(enumStr);
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        const varStr = formatVariable(decl, checker);
        if (varStr) variables.push(varStr);
      }
    }
  });

  return { classes, interfaces, types, functions, enums, variables };
} 