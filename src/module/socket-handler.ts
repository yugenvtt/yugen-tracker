/**
 * @file src/module/socket-handler.ts
 * handles cross-client coordination via sockets.
 **/

import { FileLogger } from './file-logger.js';

export class SocketHandler 
{
	private static socket_name = 'module.yugen-tracker';

	/**
	 * registers the socket listener
	 **/
	public static register( ): void 
	{
		/** register socket listener via shared library **/
		( globalThis as any ).yugen_utils.register_socket( this.socket_name, ( data: any ) => 
		{
			void this.handle( data );
		} );
	}

	/**
	 * emits data to all other clients and handles it locally
	 **/
	public static async emit( data: any ): Promise<void> 
	{
		/** emit socket event via shared library **/
		( globalThis as any ).yugen_utils.emit_socket( this.socket_name, data );
		await this.handle( data );
	}

	/**
	 * processes socket data
	 **/
	public static async handle( data: any ): Promise<void> 
	{
		/** check if current client is primary gm **/
		const is_primary_gm = ( globalThis as any ).yugen_utils.is_primary_gm( );
		const is_debug = ( game as any ).settings.get( 'yugen-tracker', 'debug-mode' );

		if ( is_debug ) 
		{
			console.log( `yugen-tracker | socket event received: ${ data.type } (User: ${ data.user_id }, Is GM: ${ is_primary_gm })` );
		}

		if ( data.type === 'log-to-file' ) 
		{
			if ( is_primary_gm ) 
			{
				void FileLogger.process_log( data.content );
			}
			return;
		}

		if ( data.type === 'request-logs' && is_primary_gm ) 
		{
			const allow_players = ( game as any ).settings.get( 'yugen-tracker', 'allow-player-log-viewer' );
			
			if ( allow_players || ( game as any ).users.get( data.user_id )?.isGM ) 
			{
				const logs = await FileLogger.get_logs( );
				await this.emit( 
				{
					type: 'logs-data',
					user_id: data.user_id,
					content: logs
				} );
			}
		}

		if ( data.type === 'logs-data' && data.user_id === ( game as any ).user.id ) 
		{
			/** dispatch a hook for the ui to consume the returned log data **/
			Hooks.callAll( 'yugen-tracker.logs-received', data.content );
		}

		if ( data.type === 'clear-logs' && is_primary_gm ) 
		{
			if ( is_debug ) 
			{
				console.log( 'yugen-tracker | clearing log file...' );
			}
			await FileLogger.clear_logs( );
			/** notify all clients that logs were cleared **/
			await this.emit( { type: 'logs-cleared' } );
		}

		if ( data.type === 'logs-cleared' ) 
		{
			Hooks.callAll( 'yugen-tracker.logs-cleared' );
		}
	}
}
