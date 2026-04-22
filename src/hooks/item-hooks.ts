/**
 * @file src/hooks/item-hooks.ts
 * registers item lifecycle hooks for document tracking.
 **/

import { ItemHandler } from '../module/item-handler.js';

export const item_hooks = ( ) => 
{
	/** listen for new item document creation on actors **/
	Hooks.on( 'createItem', ( item: any, _options: any, user_id: string ) => 
	{
		ItemHandler.handle_create( item, user_id );
	} );

	/** listen for item document deletion from actors **/
	Hooks.on( 'deleteItem', ( item: any, _options: any, user_id: string ) => 
	{
		ItemHandler.handle_delete( item, user_id );
	} );

	/** listen for item document updates (e.g., preparation, equipment) **/
	Hooks.on( 'updateItem', ( item: any, change: any, _options: any, user_id: string ) => 
	{
		ItemHandler.handle_update( item, change, user_id );
	} );
};
