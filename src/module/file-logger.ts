/**
 * @file src/module/file-logger.ts
 * handles server-side file logging for the primary gm.
 **/

/**
 * provides static methods for reading and clearing server-side log files,
 * ensuring only the primary gm can perform write operations to avoid race conditions.
 **/

export class FileLogger 
{
	/**
	 * processes a log entry
	 **/
	public static async process_log( text: string ): Promise<void> 
	{
		const is_debug = ( game as any ).settings.get( 'yugen-tracker', 'debug-mode' );

		if ( is_debug ) 
		{
			console.log( `yugen-tracker | FileLogger.process_log called: ${ text.substring( 0, 50 ) }...` );
		}

		/** check if current client is primary gm **/
		const is_primary_gm = ( globalThis as any ).yugen_utils.is_primary_gm( );

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
			const picker = FileLogger.resolve_picker( );
			/** upload the updated log file to the server using the filepicker api **/
			await picker.upload( 'data', folder, file );
		}
		catch ( error ) 
		{
			console.error( 'yugen-tracker | file logging failed:', error );
		}
	}

	/**
	 * retrieves the raw content of the log file
	 **/
	public static async get_logs( ): Promise<string> 
	{
		const folder = 'yugen-tracker-logs';
		const filename = ( game as any ).settings.get( 'yugen-tracker', 'log-file-name' ) || 'yugen-tracker-logs.txt';
		const path = `${ folder }/${ filename }`;

		const is_debug = ( game as any ).settings.get( 'yugen-tracker', 'debug-mode' );

		if ( is_debug ) 
		{
			console.log( `yugen-tracker | fetching logs from: ${ path }` );
		}

		/** 
		 * we use the server-side browser helper to get content.
		 * if the file doesn't exist, this returns an empty string.
		 **/
		const logs = await this.get_existing_content( path );

		if ( is_debug ) 
		{
			console.log( `yugen-tracker | retrieved ${ logs.length } characters of log data` );
		}

		return logs;
	}

	/**
	 * clears the content of the log file
	 **/
	public static async clear_logs( ): Promise<void> 
	{
		/** check if current client is primary gm **/
		const is_primary_gm = ( globalThis as any ).yugen_utils.is_primary_gm( );

		if ( !is_primary_gm ) 
		{
			return;
		}

		const folder = 'yugen-tracker-logs';
		const filename = ( game as any ).settings.get( 'yugen-tracker', 'log-file-name' ) || 'yugen-tracker-logs.txt';

		try 
		{
			await this.ensure_directory( folder );
			const file = new File( [ '' ], filename, { type: 'text/plain' } );
			const picker = FileLogger.resolve_picker( );
			await picker.upload( 'data', folder, file );
		}
		catch ( error ) 
		{
			console.error( 'yugen-tracker | clearing logs failed:', error );
		}
	}

	private static async ensure_directory( folder: string ): Promise<void> 
	{
		const picker = FileLogger.resolve_picker( );
		try 
		{
			/** verify the existence of the directory by attempting to browse it **/
			await picker.browse( 'data', folder );
		}
		catch ( e ) 
		{
			/** create the log directory if the browse attempt fails **/
			await picker.createDirectory( 'data', folder );
		}
	}

	private static async get_existing_content( path: string ): Promise<string> 
	{
		try 
		{
			const folder = path.substring( 0, path.lastIndexOf( '/' ) );
			const picker = FileLogger.resolve_picker( );
			const filename = path.substring( path.lastIndexOf( '/' ) + 1 );

			/** check if the file exists using the filepicker api before fetching **/
			const browse = await picker.browse( 'data', folder );
			const exists = browse.files.some( ( f: string ) => f.endsWith( filename ) );

			if ( !exists ) 
			{
				return '';
			}

			/** fetch the file relative to the foundry data root **/
			const response = await fetch( `/${ path }` );

			if ( response.ok ) 
			{
				return await response.text( );
			}
		}
		catch ( e ) 
		{ 
			/** return empty string if the file is missing or inaccessible **/
		}
		
		return '';
	}

	/**
	 * resolves the appropriate filepicker implementation for the current foundry version
	 **/
	public static resolve_picker( ): any 
	{
		return ( foundry.applications as any )?.apps?.FilePicker?.implementation || ( window as any ).FilePicker;
	}
}
