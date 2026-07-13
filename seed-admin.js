const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:./sqlite.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  const email = 'mzainul.arifin@ulm.ac.id';
  
  // check if user exists
  const res = await client.execute({
    sql: 'SELECT * FROM user WHERE email = ?',
    args: [email]
  });

  if (res.rows.length > 0) {
    const id = res.rows[0].id;
    console.log('Admin user exists. Updating role to admin...');
    await client.execute({
      sql: 'UPDATE user SET role = ? WHERE id = ?',
      args: ['admin', id]
    });
  } else {
    console.log('User not found. Please register this user via the normal signup flow, then run this script again to make them an admin.');
  }
}

main().catch(console.error);
