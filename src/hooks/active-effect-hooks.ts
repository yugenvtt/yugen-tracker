/**
 * @file src/hooks/active-effect-hooks.ts
 * registers active effect hooks for concentration tracking.
 **/

import { ConcentrationHandler } from '../module/concentration-handler.js';

export const active_effect_hooks = ( ) => 
{
	/** listen for active effect creation to detect concentration start **/
	Hooks.on( 'createActiveEffect', ( effect: any, _options: any, user_id: string ) => 
	{
		ConcentrationHandler.handle_change( effect, user_id, 'start' );
	} );

	/** listen for active effect deletion to detect concentration break **/
	Hooks.on( 'deleteActiveEffect', ( effect: any, _options: any, user_id: string ) => 
	{
		ConcentrationHandler.handle_change( effect, user_id, 'break' );
	} );
};
