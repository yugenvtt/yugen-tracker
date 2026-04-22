/**
 * @file src/module/base-handler.ts
 * abstract base class for document handlers with shared filtering logic.
 **/

export abstract class BaseHandler 
{
	/**
	 * determines if a document update should be ignored based on user roles and settings.
	 **/
	protected static should_ignore( user_id: string, actor?: any ): boolean 
	{
		/** retrieve the initiating user document **/
		const user = ( game as any ).users.get( user_id );
		
		if ( !user ) 
		{
			return true;
		}

		/** retrieve the gm change visibility setting **/
		const hide_gm = ( game as any ).settings.get( 'yugen-tracker', 'hide-gm-changes' );
		
		if ( hide_gm && user.isGM ) 
		{
			return true;
		}

		if ( !actor ) 
		{
			return false;
		}

		/** retrieve the ownership tracking setting **/
		const track_all_owned = ( game as any ).settings.get( 'yugen-tracker', 'track-all-owned' );
		
		if ( track_all_owned ) 
		{
			if ( !user.isGM ) 
			{
				/** verify if the user has owner permissions for the actor **/
				return !actor.testUserPermission( user, 'OWNER' );
			}
			
			return false;
		}

		/** check if the actor is assigned as a primary character to any user **/
		const is_assigned = ( game as any ).users.some( ( u: any ) => u.character?.id === actor.id );
		
		return !is_assigned;
	}
}
