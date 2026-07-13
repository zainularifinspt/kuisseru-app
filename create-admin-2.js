require('dotenv').config({ path: '.env' });
const { auth } = require('./src/lib/auth');

async function main() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "mzainul.arifin@ulm.ac.id",
        password: "ARIfin8167",
        name: "Admin Zainul"
      }
    });
    console.log("Registered:", res);
    
    // Now set the role to admin
    if (res.user) {
       const { createClient } = require('@libsql/client');
       const client = createClient({
         url: process.env.DATABASE_URL,
         authToken: process.env.DATABASE_AUTH_TOKEN
       });
       await client.execute({
         sql: 'UPDATE user SET role = ? WHERE id = ?',
         args: ['admin', res.user.id]
       });
       console.log("Updated role to admin!");
    }
  } catch (e) {
    console.error(e);
  }
}

main();
