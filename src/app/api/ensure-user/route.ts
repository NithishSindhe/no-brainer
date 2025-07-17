// app/api/ensure-user/route.ts (Edge or Node.js API Route)
import { currentUser } from '@clerk/nextjs/server';
import { db } from '~/lib/db';
import { users } from '~/lib/schema'

export async function POST() {
  const user = await currentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const email = user?.primaryEmailAddress?.emailAddress ?? "missing-email";
  const username = user?.username || (user?.primaryEmailAddress?.emailAddress ?? "missing-username");

  await db.insert(users).values({
    id: user.id,
    username: username,
    email: email,
    created_at: new Date().toISOString(),
    last_logged_in: new Date().toISOString(),
  }).onConflictDoUpdate({
    target: users.id,
    set: {
      username: username,
      email: email,
      last_logged_in: new Date().toISOString(),
    }
  });


  return new Response('OK');
}

