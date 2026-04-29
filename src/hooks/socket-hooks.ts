/**
 * @file src/hooks/socket-hooks.ts
 * registers socket listeners for cross-client coordination.
 **/

import { SocketHandler } from '../module/socket-handler.js';

export const socket_hooks = ( ) => 
{
	/** register the centralized socket handler **/
	SocketHandler.register( );
};
