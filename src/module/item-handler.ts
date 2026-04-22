/**
 * @file src/module/item-handler.ts
 * handles item lifecycle events (create, delete, update).
 **/

import { BaseHandler } from './base-handler.js';
import { ChatManager } from './chat-manager.js';
import { flatten_changes, capitalize } from './utils.js';

export class ItemHandler extends BaseHandler 
{
	/**
	 * handles item document creation
	 **/
	public static handle_create( item: any, user_id: string ): void 
	{
		/** verify the current user matches the initiating user **/
		if ( ( game as any ).user.id !== user_id ) 
		{
			return;
		}

		const owner = item.parent;

		if ( !owner || this.should_ignore( user_id, owner ) ) 
		{
			return;
		}

		/** retrieve the initiating user document **/
		const user = ( game as any ).users.get( user_id );

		/** format and broadcast the item creation message **/
		ChatManager.send_to_chat( ( game as any ).i18n.format( 'yugen-tracker.chat.item.create', 
		{
			user: user.name,
			item: item.name,
			owner: owner.name
		} ) );
	}

	/**
	 * handles item document deletion
	 **/
	public static handle_delete( item: any, user_id: string ): void 
	{
		/** verify the current user matches the initiating user **/
		if ( ( game as any ).user.id !== user_id ) 
		{
			return;
		}

		const owner = item.parent;

		if ( !owner || this.should_ignore( user_id, owner ) ) 
		{
			return;
		}

		/** retrieve the initiating user document **/
		const user = ( game as any ).users.get( user_id );

		/** format and broadcast the item deletion message **/
		ChatManager.send_to_chat( ( game as any ).i18n.format( 'yugen-tracker.chat.item.delete', 
		{
			user: user.name,
			item: item.name,
			owner: owner.name
		} ) );
	}

	/**
	 * handles item document updates
	 **/
	public static handle_update( item: any, change: any, user_id: string ): void 
	{
		/** verify the current user matches the initiating user **/
		if ( ( game as any ).user.id !== user_id ) 
		{
			return;
		}

		const owner = item.parent;

		if ( !owner || this.should_ignore( user_id, owner ) ) 
		{
			return;
		}

		/** retrieve the initiating user document **/
		const user = ( game as any ).users.get( user_id );
		const changes = this.get_filtered_changes( change );

		if ( Object.keys( changes ).length === 0 ) 
		{
			return;
		}

		if ( this.is_simple_action( changes ) ) 
		{
			this.announce_simple_action( item, owner, user.name, changes );
		}
		else 
		{
			this.announce_complex_update( item, owner, user.name, changes );
		}
	}

	private static get_filtered_changes( change: any ): Record<string, any> 
	{
		if ( !change.system ) 
		{
			return { };
		}

		const changes = flatten_changes( change.system );
		const noise_keys = [
			'_stats',
			'_id',
			'modifiedTime'
		];

		for ( const key of Object.keys( changes ) ) 
		{
			if ( noise_keys.some( ( k ) => key.includes( k ) ) ) 
			{
				delete changes[ key ];
			}
		}

		return changes;
	}

	private static is_simple_action( changes: Record<string, any> ): boolean 
	{
		if ( Object.keys( changes ).length !== 1 ) 
		{
			return false;
		}

		const key = Object.keys( changes )[ 0 ];

		return key === 'preparation.prepared' || key === 'prepared' || key === 'equipped';
	}

	private static announce_simple_action( item: any, owner: any, user_name: string, changes: Record<string, any> ): void 
	{
		const key = Object.keys( changes )[ 0 ];
		const value = changes[ key ];
		let action = '';

		if ( key.includes( 'prepared' ) ) 
		{
			/** retrieve the localized action string for preparation state **/
			action = value ? ( game as any ).i18n.localize( 'yugen-tracker.chat.item.prepared' ) : ( game as any ).i18n.localize( 'yugen-tracker.chat.item.unprepared' );
		}
		else if ( key === 'equipped' ) 
		{
			/** retrieve the localized action string for equipment state **/
			action = value ? ( game as any ).i18n.localize( 'yugen-tracker.chat.item.equipped' ) : ( game as any ).i18n.localize( 'yugen-tracker.chat.item.unequipped' );
		}

		/** format and broadcast the simple item action message **/
		ChatManager.send_to_chat( ( game as any ).i18n.format( 'yugen-tracker.chat.item.action-message', 
		{
			user: user_name,
			action: action,
			item: item.name,
			owner: owner.name
		} ) );
	}

	private static announce_complex_update( item: any, owner: any, user_name: string, changes: Record<string, any> ): void 
	{
		/** format the base localization string for item update **/
		let message = ( game as any ).i18n.format( 'yugen-tracker.chat.item.update', 
		{
			user: user_name,
			item: item.name,
			owner: owner.name
		} );

		for ( const [ key, value ] of Object.entries( changes ) ) 
		{
			/** retrieve localized labels for various item properties **/
			const display_key = key.replace( 'uses.value', ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.charges' ) )
				.replace( 'equipped', ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.equipped-status' ) )
				.replace( 'preparation.prepared', ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.prepared-status' ) )
				.replace( 'prepared', ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.prepared-status' ) );

			/** format the property update localization string **/
			message += ( game as any ).i18n.format( 'yugen-tracker.chat.actor.set-to', 
			{
				key: capitalize( display_key ),
				value: value
			} );
		}

		ChatManager.send_to_chat( message );
	}
}
