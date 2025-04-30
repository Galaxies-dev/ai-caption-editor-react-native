import { QueryCtx, MutationCtx } from './_generated/server';
import { ConvexError } from 'convex/values';
import { Id } from './_generated/dataModel';

/**
 * Get the current user's ID from the given context.
 *
 * Throws a ConvexError if the user is not authenticated.
 */
export async function getUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError('You must be logged in to access this resource');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('byExternalId', (q: any) => q.eq('externalId', identity.subject))
    .first();

  if (!user) {
    throw new ConvexError('User not found');
  }

  return user;
}

/**
 * Checks if the current user has access to the specified project.
 *
 * Throws a ConvexError if:
 * 1. The user is not authenticated
 * 2. The project doesn't exist
 * 3. The user doesn't own the project
 */
export async function authorizeProject(ctx: QueryCtx | MutationCtx, projectId: Id<'projects'>) {
  const user = await getUser(ctx);

  const project = await ctx.db.get(projectId);

  if (!project) {
    throw new ConvexError('Project not found');
  }

  if (project.userId !== user._id) {
    throw new ConvexError("You don't have access to this project");
  }

  return { user, project };
}
