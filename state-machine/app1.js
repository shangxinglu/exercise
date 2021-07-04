const target = '1234abc123abc';
const regexp = /a/g;

const {log}=console;

let match;
while(match=regexp.exec(target)){
   log(match[0],match.index);
}