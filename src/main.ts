import { EditorRuntime } from './EditorRuntime.js';
import { CommandDispatcher } from './cli/CommandDispatcher.js';
import { CliApplication } from './cli/CliApplication.js';
const runtime=new EditorRuntime();
const cli=new CliApplication(new CommandDispatcher(runtime.session,runtime.history),runtime.invoker);
await cli.run(process.stdin,process.stdout,Boolean(process.stdin.isTTY&&process.stdout.isTTY));
