/**
 * @file src/hooks/ready.ts
 * handles the ready hook for user verification and announcements.
 **/

export const ready_hook = ( ) => 
{
	/** listen for the ready hook to perform post-load initialization **/
	Hooks.on( 'ready', ( ) => 
	{
		/** retrieve the current user document **/
		const user = ( game as any ).user;
		/** retrieve the gm change visibility setting **/
		const hide_gm = ( game as any ).settings.get( 'yugen-tracker', 'hide-gm-changes' );

		if ( hide_gm && user.isGM ) 
		{
			return;
		}

		/** check if the current user has an assigned character **/
		if ( !user.character ) 
		{
			/** create a notification message for users without an assigned character **/
			void ( ChatMessage as any ).create( 
			{
				content: `<span style="color: red; font-weight: bold;">[ yugen-tracker ]</span> <strong>${ user.name }</strong> does not have an assigned player character. their sheet changes will NOT be logged until a character is assigned.`,
				speaker: { alias: 'yugen-tracker' }
			} );
			
			console.log( 'yugen-tracker | user has no assigned character, public announcement sent' );
		}
	} );
};
