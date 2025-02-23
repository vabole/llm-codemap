import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function createTempTsConfig(): { path: string; cleanup: () => void } {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codemap-test-'));
  const tsconfigPath = path.join(tempDir, 'tsconfig.json');
  
  const tsconfig = {
    compilerOptions: {
      target: "es2018",
      module: "commonjs",
      strict: true
    },
    include: ["*.ts"],
    exclude: ["node_modules"]
  };

  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  
  return {
    path: tempDir,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true })
  };
}

export const sampleCode = `
interface User {
  id: number;
  name: string;
}

type Status = 'active' | 'inactive';

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}

enum UserRole {
  Admin = 'ADMIN',
  User = 'USER'
}

const DEFAULT_STATUS: Status = 'active';
`;

export function createTempSourceFile(tempDir: string, content: string = sampleCode): string {
  const filePath = path.join(tempDir, 'sample.ts');
  fs.writeFileSync(filePath, content);
  return filePath;
} 