/**
 * One-off script: grant admin role to an email.
 * Usage: node src/scripts/setAdmin.js <email>
 */
import { getAuth, getDb } from '../config/firebase.js';
import { env } from '../config/env.js';

async function main() {
  const email = (process.argv[2] || env.superAdminEmail || '').toLowerCase();
  if (!email) {
    console.error('Usage: node src/scripts/setAdmin.js <email>');
    process.exit(1);
  }

  const auth = getAuth();
  const db = getDb();

  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { role: 'admin', plan: 'ultra' });
  await db.collection('users').doc(user.uid).set(
    { role: 'admin', plan: 'ultra', updatedAt: new Date().toISOString() },
    { merge: true }
  );
  console.log(`✅ ${email} is now admin + ultra.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
