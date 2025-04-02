import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';

const http = httpRouter();

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const { data, type } = await request.json();

  switch (type) {
    case 'user.created':
      await ctx.runMutation(internal.users.upsertFromClerk, {
        data,
      });
      break;
    case 'user.deleted':
      const clerkUserId = data.id!;
      await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
      break;
    case 'user.updated':
      await ctx.runMutation(internal.users.upsertFromClerk, {
        data,
      });
      break;
    default:
      break;
  }
  return new Response(null, { status: 200 });
});

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
});

export default http;
