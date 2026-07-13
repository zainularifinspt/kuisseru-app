import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { auth } from './src/lib/auth';

async function main() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "mzainul.arifin@ulm.ac.id",
        password: "ARIfin8167",
        name: "Admin Zainul"
      }
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

main();
