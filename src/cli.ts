import { Command, OptionValues } from 'commander';

export function parseCLIArgs(): OptionValues {
  const program = new Command();
  program
    .option('-o, --output <file>', 'output file for the type map')
    .parse(process.argv);
  return program.opts();
} 