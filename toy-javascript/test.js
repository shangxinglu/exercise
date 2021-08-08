import syntaxParse from './syntaxParse.js';
import { Execution, Realm, ExecutionContext, pushExecStack } from './runtime.js';

const realm = new Realm;
const global = {};
const execCtx = new ExecutionContext(realm, global);

pushExecStack(execCtx);

const textEl = document.getElementById('text');
const runEl = document.getElementById('run');

const exec = new Execution(realm);

runEl.addEventListener('click', () => {
    const code = textEl.value;

    const tree = syntaxParse(code);

    const result = exec.exec(tree);

    console.log(result);
})
