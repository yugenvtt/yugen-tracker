/**
 * @file src/hooks/update-actor.ts
 * registers the updateActor hook for document tracking.
 **/

import { ActorHandler } from '../module/actor-handler.js';

export const update_actor_hook = ( ) => 
{
	/** listen for actor document updates across the world **/
	Hooks.on( 'updateActor', ( actor: any, change: any, _options: any, user_id: string ) => 
	{
		ActorHandler.handle_update( actor, change, user_id );
	} );
};
