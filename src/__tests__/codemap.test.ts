import * as path from 'path';
import * as fs from 'fs';
import { createTempTsConfig, createTempSourceFile } from './test-helpers';
import { setupTypeScriptProgram } from '../programSetup';
import { generateCodemap } from '../output';

describe('Codemap Generation', () => {
  let tempConfig: { path: string; cleanup: () => void };
  let outputPath: string;

  beforeEach(() => {
    tempConfig = createTempTsConfig();
    outputPath = path.join(tempConfig.path, 'output.txt');
  });

  afterEach(() => {
    tempConfig.cleanup();
  });

  test('should generate a codemap containing basic TypeScript constructs', () => {
    // Create a sample TypeScript file
    createTempSourceFile(tempConfig.path);

    // Change to temp directory for the test
    const originalCwd = process.cwd();
    process.chdir(tempConfig.path);

    try {
      // Generate codemap
      const { program, checker } = setupTypeScriptProgram();
      const codemap = generateCodemap(program, checker);

      // Basic structure checks
      expect(codemap).toContain('<file_map>');
      expect(codemap).toContain('</file_map>');
      expect(codemap).toContain('<Complete Definitions>');

      // Check for all declaration types
      expect(codemap).toContain('Interface: User');
      expect(codemap).toContain('type Status =');
      expect(codemap).toContain('Class: UserManager');
      expect(codemap).toContain('Enum: UserRole');
      expect(codemap).toContain('const DEFAULT_STATUS:');

      // Check for class members
      expect(codemap).toContain('addUser');
      expect(codemap).toContain('getUser');
    } finally {
      // Restore original working directory
      process.chdir(originalCwd);
    }
  });

  test('should handle empty TypeScript files', () => {
    // Create an empty TypeScript file
    createTempSourceFile(tempConfig.path, '');

    // Change to temp directory for the test
    const originalCwd = process.cwd();
    process.chdir(tempConfig.path);

    try {
      // Generate codemap
      const { program, checker } = setupTypeScriptProgram();
      const codemap = generateCodemap(program, checker);

      // Basic structure checks
      expect(codemap).toContain('<file_map>');
      expect(codemap).toContain('</file_map>');
      expect(codemap).toContain('<Complete Definitions>');

      // Should not contain any declarations
      expect(codemap).not.toContain('Interface:');
      expect(codemap).not.toContain('Class:');
      expect(codemap).not.toContain('Enum:');
    } finally {
      // Restore original working directory
      process.chdir(originalCwd);
    }
  });

  test('should handle files with only imports', () => {
    // Create a TypeScript file with only imports
    const importOnlyCode = `
      import * as fs from 'fs';
      import { join } from 'path';
    `;
    createTempSourceFile(tempConfig.path, importOnlyCode);

    // Change to temp directory for the test
    const originalCwd = process.cwd();
    process.chdir(tempConfig.path);

    try {
      // Generate codemap
      const { program, checker } = setupTypeScriptProgram();
      const codemap = generateCodemap(program, checker);

      // Basic structure checks
      expect(codemap).toContain('<file_map>');
      expect(codemap).toContain('</file_map>');
      expect(codemap).toContain('<Complete Definitions>');

      // Should not contain any declarations
      expect(codemap).not.toContain('Interface:');
      expect(codemap).not.toContain('Class:');
      expect(codemap).not.toContain('Enum:');
    } finally {
      // Restore original working directory
      process.chdir(originalCwd);
    }
  });
}); 