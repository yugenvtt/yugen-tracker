/**
 * @file src/module/concentration-handler.ts
 * handles concentration start and break events via active effects.
 **/

import { BaseHandler } from './base-handler.js';
import { ChatManager } from './chat-manager.js';

export class ConcentrationHandler extends BaseHandler 
{
	/**
	 * handles concentration status changes
	 **/
	public static handle_change( effect: any, user_id: string, type: 'start' | 'break' ): void 
	{
		/** verify the current user matches the initiating user **/
		if ( ( game as any ).user.id !== user_id ) 
		{
			return;
		}

		/** retrieve the concentration tracking toggle setting **/
		const is_track_concentration = ( game as any ).settings.get( 'yugen-tracker', 'track-concentration' );

		if ( !is_track_concentration ) 
		{
			return;
		}

		/** verify if the effect status is concentration **/
		const is_concentration = effect.statuses?.has( 'concentration' ) || effect.getFlag( 'core', 'statusId' ) === 'concentration';

		if ( !is_concentration ) 
		{
			return;
		}

		const actor = effect.parent;

		if ( !actor || actor.constructor.name !== 'Actor' ) 
		{
			return;
		}

		if ( this.should_ignore( user_id, actor ) ) 
		{
			return;
		}

		this.announce_concentration( actor, user_id, type );
	}

	private static announce_concentration( actor: any, user_id: string, type: 'start' | 'break' ): void 
	{
		/** retrieve the initiating user document **/
		const user = ( game as any ).users.get( user_id );
		const actor_name = actor.name;
		const user_name = user?.name || 'unknown user';

		let message = '';

		if ( type === 'start' ) 
		{
			/** format the concentration start localization string **/
			message = ( game as any ).i18n.format( 'yugen-tracker.chat.concentration.start', 
			{
				user: user_name,
				actor: actor_name,
				/** retrieve the name of the concentration-tracked spell from actor flags **/
				spell: actor.getFlag( 'dnd5e', 'concentration' )?.name || ( game as any ).i18n.localize( 'yugen-tracker.chat.concentration.default-spell' )
			} );
		}
		else 
		{
			/** format the concentration break localization string **/
			message = ( game as any ).i18n.format( 'yugen-tracker.chat.concentration.break', 
			{
				user: user_name,
				actor: actor_name
			} );
		}

		ChatManager.send_to_chat( message );
	}
}
