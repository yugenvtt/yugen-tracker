/**
 * @file src/hooks/socket-hooks.ts
 * registers socket listeners for cross-client coordination.
 **/

import { FileLogger } from '../module/file-logger.js';

export const socket_hooks = ( ) => 
{
	const socket_name = 'module.yugen-tracker';

	/** register a socket listener for cross-client logging coordination **/
	( game as any ).socket.on( socket_name, ( data: any ) => 
	{
		if ( data.type === 'log-to-file' && ( game as any ).user.isGM ) 
		{
			void FileLogger.process_log( data.content );
		}
	} );
};
