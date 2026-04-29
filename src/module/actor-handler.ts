/**
 * @file src/module/actor-handler.ts
 * handles actor document updates and property formatting.
 **/

import { BaseHandler } from './base-handler.js';
import { ChatManager } from './chat-manager.js';
import { flatten_changes, capitalize } from './utils.js';

export class ActorHandler extends BaseHandler 
{
	/**
	 * we verify the initiating user locally because document updates 
	 * in v14 are broadcast to all connected clients.
	 **/

	/**
	 * handles actor document updates
	 **/
	public static handle_update( actor: any, change: any, user_id: string ): void 
	{
		/** verify the current user matches the initiating user **/
		if ( ( game as any ).user.id !== user_id ) 
		{
			return;
		}

		if ( this.should_ignore( user_id, actor ) ) 
		{
			return;
		}

		const is_debug = ( game as any ).settings.get( 'yugen-tracker', 'debug-mode' );

		if ( is_debug ) 
		{
			console.log( `yugen-tracker | handling update for ${ actor.name }`, change );
		}

		if ( !change.system ) 
		{
			return;
		}

		/** retrieve the user document for the initiating user **/
		const user = ( game as any ).users.get( user_id );
		const changes = flatten_changes( change.system );
		
		const filtered_changes = this.filter_sensitive_keys( changes );

		if ( Object.keys( filtered_changes ).length > 0 ) 
		{
			this.announce_changes( actor, user.name, filtered_changes );
		}
	}

	private static filter_sensitive_keys( changes: Record<string, any> ): Record<string, any> 
	{
		/** retrieve the biography visibility setting **/
		const show_bio = ( game as any ).settings.get( 'yugen-tracker', 'display-biography-changes' );

		if ( show_bio ) 
		{
			return changes;
		}

		/** retrieve the filtered sensitive keys string **/
		const sensitive_keys_string = ( game as any ).settings.get( 'yugen-tracker', 'sensitive-keys' ) || '';
		const sensitive_keys = sensitive_keys_string.split( ',' ).map( ( k: string ) => k.trim( ) ).filter( ( k: string ) => k !== '' );

		const filtered = { ...changes };

		for ( const key of Object.keys( filtered ) ) 
		{
			if ( sensitive_keys.some( ( k: string ) => key.includes( k ) ) ) 
			{
				delete filtered[ key ];
			}
		}

		return filtered;
	}

	private static announce_changes( actor: any, user_name: string, changes: Record<string, any> ): void 
	{
		/** format the base localization string for actor modification **/
		let message = ( game as any ).i18n.format( 'yugen-tracker.chat.actor.modified', 
		{
			user: user_name,
			actor: actor.name
		} );

		for ( const [ key, value ] of Object.entries( changes ) ) 
		{
			const display_key = this.resolve_display_key( key );
			let resolved_value = this.resolve_display_value( key, value );
			
			if ( display_key === 'ac.calc' ) 
			{
				resolved_value = `${ resolved_value } (Total AC: ${ actor.system.attributes.ac.value })`;
			}

			/** format the property update localization string **/
			message += ( game as any ).i18n.format( 'yugen-tracker.chat.actor.set-to', 
			{
				key: capitalize( display_key ),
				value: resolved_value
			} );
		}

		ChatManager.send_to_chat( message );
	}

	private static resolve_display_key( key: string ): string 
	{
		/** retrieve localized labels for actor property keys via the i18n api **/
		let display = key.replace( 'currency.', ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.currency' ) )
			.replace( 'attributes.', '' )
			.replace( 'details.', '' )
			.replace( 'traits.', '' )
			.replace( 'details.race', ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.race' ) );

		/** format localized labels for spell slot properties **/
		display = display.replace( /^(?:system\.)?spells\.spell(\d+)\.value$/i, ( _match, level ) => ( game as any ).i18n.format( 'yugen-tracker.chat.labels.level-spell-slots', { level } ) )
			.replace( /^(?:system\.)?spells\.spell(\d+)\.max$/i, ( _match, level ) => ( game as any ).i18n.format( 'yugen-tracker.chat.labels.level-spell-slots-max', { level } ) )
			.replace( /^(?:system\.)?spells\.pact\.value$/i, ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.pact-spell-slots' ) )
			.replace( /^(?:system\.)?spells\.pact\.max$/i, ( game as any ).i18n.localize( 'yugen-tracker.chat.labels.pact-spell-slots-max' ) );

		return display;
	}

	private static resolve_display_value( key: string, value: any ): string 
	{
		if ( typeof value !== 'string' ) 
		{
			return value;
		}

		if ( value.length === 16 && /^[a-zA-Z0-9]+$/.test( value ) ) 
		{
			if ( key.includes( 'race' ) || key.includes( 'background' ) || key.includes( 'class' ) ) 
			{
				/** retrieve a document from the world items collection for id resolution **/
				const doc = ( game as any ).items?.get( value );

				if ( doc ) 
				{
					return doc.name;
				}
			}
		}

		return value;
	}
}
