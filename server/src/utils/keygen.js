const uuid = require('uuid');

let text = uuid.v4().toString().replace(/-/g, '');

console.log(text);