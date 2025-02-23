import * as ts from 'typescript';

export function formatClass(node: ts.ClassDeclaration, checker: ts.TypeChecker): string {
  const className = node.name?.getText() || "Anonymous";
  const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => p.name.getText()).join(', ')}>` : '';
  let classStr = `Class: ${className}${typeParams}`;
  const properties: string[] = [];
  const methods: string[] = [];

  for (const member of node.members) {
    if (ts.isPropertyDeclaration(member) && member.name) {
      const propName = member.name.getText();
      const propType = checker.getTypeAtLocation(member);
      properties.push(`  - ${propName}: ${checker.typeToString(propType)}`);
    } else if (ts.isMethodDeclaration(member) && member.name) {
      const methodName = member.name.getText();
      const signature = checker.getSignatureFromDeclaration(member);
      if (signature) {
        const params = signature.parameters.map(p => `${p.name}: ${checker.typeToString(checker.getTypeOfSymbolAtLocation(p, member))}`).join(', ');
        methods.push(`  - ${methodName}(${params}): ${checker.typeToString(signature.getReturnType())}`);
      }
    }
  }

  if (properties.length) classStr += `\n  Properties:\n${properties.join('\n')}`;
  if (methods.length) classStr += `\n  Methods:\n${methods.join('\n')}`;
  return classStr;
}

export function formatInterface(node: ts.InterfaceDeclaration, checker: ts.TypeChecker): string {
  const interfaceName = node.name.getText();
  const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => p.name.getText()).join(', ')}>` : '';
  let interfaceStr = `Interface: ${interfaceName}${typeParams}`;
  const properties: string[] = [];

  for (const member of node.members) {
    if (ts.isPropertySignature(member) && member.name) {
      const propName = member.name.getText();
      const propType = checker.getTypeAtLocation(member);
      properties.push(`  - ${propName}: ${checker.typeToString(propType)}`);
    }
  }

  if (properties.length) interfaceStr += `\n  Properties:\n${properties.join('\n')}`;
  return interfaceStr;
}

export function formatTypeAlias(node: ts.TypeAliasDeclaration, checker: ts.TypeChecker): string {
  return `- type ${node.name.getText()} = ${checker.typeToString(checker.getTypeAtLocation(node))}`;
}

export function formatFunction(node: ts.FunctionDeclaration, checker: ts.TypeChecker): string {
  if (node.name) {
    const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => p.name.getText()).join(', ')}>` : '';
    const signature = checker.getSignatureFromDeclaration(node);
    if (signature) {
      const params = signature.parameters.map(p => `${p.name}: ${checker.typeToString(checker.getTypeOfSymbolAtLocation(p, node))}`).join(', ');
      return `- function ${node.name.getText()}${typeParams}(${params}): ${checker.typeToString(signature.getReturnType())}`;
    }
  }
  return "";
}

export function formatEnum(node: ts.EnumDeclaration): string {
  const enumName = node.name.getText();
  const cases = node.members.map(m => `  - ${m.name.getText()}`).join('\n');
  return `Enum: ${enumName}\n  Cases:\n${cases}`;
}

export function formatVariable(decl: ts.VariableDeclaration, checker: ts.TypeChecker): string {
  if (ts.isIdentifier(decl.name)) {
    const type = checker.getTypeAtLocation(decl);
    return `- const ${decl.name.getText()}: ${checker.typeToString(type)}`;
  }
  return "";
} 