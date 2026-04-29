/**
 * @file src/module/chat-manager.ts
 * centralizes delivery of messages to chat, discord, and sockets.
 **/

import { SocketHandler } from './socket-handler.js';

export class ChatManager 
{
	private static socket_name = 'module.yugen-tracker';

	/**
	 * sends messages to chat, discord, and sockets.
	 **/
	public static send_to_chat( content: string ): void 
	{
		/** format for chat (with html) **/
		const chat_content = content.replace( /\n/g, '<br/>' );
		
		/** retrieve module settings for various role-based announcement toggles **/
		const all_players = ( game as any ).settings.get( 'yugen-tracker', 'announce-all-players' );
		const whisper_gms = ( game as any ).settings.get( 'yugen-tracker', 'announce-gamemasters' );
		const whisper_assistants = ( game as any ).settings.get( 'yugen-tracker', 'announce-assistant-gamemasters' );
		const whisper_trusted = ( game as any ).settings.get( 'yugen-tracker', 'announce-trusted-players' );

		let whisper: string[] = [ ];

		if ( !all_players ) 
		{
			/** calculate the list of recipient user ids based on active settings and roles **/
			whisper = ( game as any ).users.contents
				.filter( ( u: any ) => 
				{
					/** check role constants to filter users by their assigned foundry permissions **/
					if ( u.role === ( CONST as any ).USER_ROLES.GAMEMASTER && whisper_gms ) 
					{
						return true;
					}

					if ( u.role === ( CONST as any ).USER_ROLES.ASSISTANT && whisper_assistants ) 
					{
						return true;
					}

					return !!( u.role === ( CONST as any ).USER_ROLES.TRUSTED && whisper_trusted );
				} )
				.map( ( u: any ) => u.id );

			if ( whisper.length === 0 ) 
			{
				return;
			}
		}

		/** create a new chat message document in the world database **/
		void ( ChatMessage as any ).create( 
		{
			content: chat_content,
			speaker: { alias: 'yugen-tracker' },
			whisper: whisper
		} );

		this.trigger_secondary_outputs( content );
	}

	private static trigger_secondary_outputs( content: string ): void 
	{
		/** check if file logging is enabled before emitting to gm socket **/
		const output_to_file = ( game as any ).settings.get( 'yugen-tracker', 'output-to-file' );
		const is_debug = ( game as any ).settings.get( 'yugen-tracker', 'debug-mode' );

		if ( is_debug ) 
		{
			console.log( `yugen-tracker | trigger_secondary_outputs: output_to_file=${ output_to_file }` );
		}

		if ( output_to_file ) 
		{
			if ( is_debug ) 
			{
				console.log( 'yugen-tracker | emitting log-to-file socket event' );
			}

			/** strip html tags and extract user if possible for structured logging **/
			const div = document.createElement( 'div' );
			div.innerHTML = content;
			const text_content = div.textContent || div.innerText || '';
			
			const user_match = content.match( /^<strong>(.*?)<\/strong>/ );
			const user = user_match ? user_match[ 1 ] : 'System';
			const message = text_content.replace( user, '' ).replace( /^[:\s]+/, '' );

			/** emit a socket event to coordinate file writing on the gm's client **/
			void SocketHandler.emit( 
			{
				type: 'log-to-file',
				content: JSON.stringify( 
				{
					t: new Date( ).toISOString( ),
					u: user,
					m: message
				} )
			} );
		}

		/** retrieve configured discord webhook url from module settings **/
		const discord_url = ( game as any ).settings.get( 'yugen-tracker', 'discord-webhook' );

		if ( discord_url && discord_url.trim( ) !== '' ) 
		{
			void this.send_to_discord( discord_url, content );
		}
	}

	private static async send_to_discord( url: string, content: string ): Promise<void> 
	{
		try 
		{
			/** format content for discord (markdown) **/
			const discord_content = content.replace( /<strong>/g, '**' ).replace( /<\/strong>/g, '**' );
			
			const payload = 
			{
				username: 'yugen-tracker',
				content: discord_content
			};

			/** execute external network request to the discord webhook endpoint **/
			const response = await fetch( url, 
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( payload )
			} );

			if ( !response.ok ) 
			{
				console.error( `yugen-tracker | discord response error: ${ response.statusText }` );
			}
		}
		catch ( error ) 
		{
			console.error( 'yugen-tracker | discord webhook failed:', error );
		}
	}
}
