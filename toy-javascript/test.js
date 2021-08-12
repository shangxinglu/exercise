import syntaxParse from './syntaxParse.js';
import {
    Execution,
    Realm,
    ExecutionContext,
    pushExecStack,
    EnvironmentRecord,
    ObjectEnvironmentRecord
} from './runtime.js';

import { JSObject } from './type.js';

const realm = new Realm;
const global = new JSObject;
const execCtx = new ExecutionContext(realm, new ObjectEnvironmentRecord(global),new ObjectEnvironmentRecord(global));

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
