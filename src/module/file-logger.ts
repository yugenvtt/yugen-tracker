/**
 * @file src/module/file-logger.ts
 * handles server-side file logging for the primary gm.
 **/

export class FileLogger 
{
	/**
	 * processes a log entry
	 **/
	public static async process_log( text: string ): Promise<void> 
	{
		/** determine if the current user is the primary active gamemaster **/
		const is_primary_gm = ( game as any ).user.id === ( game as any ).users.find( ( u: any ) => u.isGM && u.active )?.id;

		if ( !is_primary_gm ) 
		{
			return;
		}

		const folder = 'yugen-tracker-logs';
		/** retrieve the log file name from module settings **/
		const filename = ( game as any ).settings.get( 'yugen-tracker', 'log-file-name' ) || 'yugen-tracker-logs.txt';
		const path = `${ folder }/${ filename }`;

		try 
		{
			await this.ensure_directory( folder );
			const existing_content = await this.get_existing_content( path );
			const new_content = existing_content + text + '\n';
			
			const file = new File( [ new_content ], filename, { type: 'text/plain' } );
			/** upload the updated log file to the server using the filepicker api **/
			await ( FilePicker as any ).upload( 'data', folder, file );
		}
		catch ( error ) 
		{
			console.error( 'yugen-tracker | file logging failed:', error );
		}
	}

	private static async ensure_directory( folder: string ): Promise<void> 
	{
		try 
		{
			/** verify the existence of the directory by attempting to browse it **/
			await ( FilePicker as any ).browse( 'data', folder );
		}
		catch ( e ) 
		{
			/** create the log directory if the browse attempt fails **/
			await ( FilePicker as any ).createDirectory( 'data', folder );
		}
	}

	private static async get_existing_content( path: string ): Promise<string> 
	{
		try 
		{
			const response = await fetch( path );

			if ( response.ok ) 
			{
				return await response.text( );
			}
		}
		catch ( e ) 
		{ 
		}
		
		return '';
	}
}
