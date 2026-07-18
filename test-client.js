const { createAuthClient } = require("better-auth/react");
const client = createAuthClient();
console.log(Object.keys(client));
