/**
 * @file src/module/log-viewer.ts
 * provides a user interface for viewing and managing the log history.
 **/

/**
 * utilizes applicationv2 and handlebarsapplicationmixin for a modern, reactive log viewer
 * that coordinates with the primary gm via sockets to retrieve server-side log files.
 **/

import { SocketHandler } from './socket-handler.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class LogViewer extends HandlebarsApplicationMixin( ApplicationV2 ) 
{
	private static _instance: LogViewer | null = null;
	private _logs: string = '';

	constructor( options: any = { } ) 
	{
		super( options );

		/** register hook listeners for log data updates **/
		Hooks.on( 'yugen-tracker.logs-received', ( content: string ) => 
		{
			this._logs = content;
			/** only trigger a re-render if the application is currently active **/
			if ( this.state === ( ApplicationV2 as any ).RENDER_STATES.RENDERED ) 
			{
				this.render( );
			}
		} );

		Hooks.on( 'yugen-tracker.logs-cleared', ( ) => 
		{
			this._logs = '';
			/** only trigger a re-render if the application is currently active **/
			if ( this.state === ( ApplicationV2 as any ).RENDER_STATES.RENDERED ) 
			{
				this.render( );
			}
		} );
	}

	/**
	 * singleton accessor to ensure only one log viewer is active at a time
	 **/
	public static get instance( ): LogViewer 
	{
		if ( !this._instance ) 
		{
			this._instance = new LogViewer( );
		}
		return this._instance;
	}

	static override DEFAULT_OPTIONS = 
	{
		id: 'yugen-tracker-log-viewer',
		tag: 'form',
		window: 
		{
			title: 'yugen-tracker.log-viewer.title',
			icon: 'fas fa-history',
			resizable: true
		},
		position: 
		{
			width: 600,
			height: 800
		},
		actions: 
		{
			refresh: LogViewer.prototype._on_refresh,
			clear: LogViewer.prototype._on_clear
		}
	};

	static override PARTS = 
	{
		logs: 
		{
			template: 'modules/yugen-tracker/templates/log-viewer.hbs'
		}
	};

	/**
	 * prepares data for the handlebars template
	 **/
	override async _prepareContext( _options: any ): Promise<any> 
	{
		const lines = this._logs.split( '\n' ).filter( ( l: string ) => l.trim( ) !== '' );
		const parsed = lines.map( ( line: string ) => 
		{
			try 
			{
				const data = JSON.parse( line );
				/** format timestamp for local display **/
				const date = new Date( data.t );
				data.t = `${ date.toLocaleDateString( ) } ${ date.toLocaleTimeString( ) }`;
				return data;
			}
			catch ( e ) 
			{
				/** fallback for legacy non-json logs **/
				return { t: '', u: 'Legacy', m: line };
			}
		} );

		return {
			logs: parsed.reverse( ), /** newest first **/
			is_gm: ( game as any ).user.isGM
		};
	}

	/**
	 * handles the refresh action to request updated logs
	 **/
	private async _on_refresh( event: Event, _target: HTMLElement ): Promise<void> 
	{
		event.preventDefault( );
		void this._request_logs( );
	}

	/**
	 * handles the clear action to wipe the log history
	 **/
	private async _on_clear( event: Event, _target: HTMLElement ): Promise<void> 
	{
		event.preventDefault( );

		if ( !( game as any ).user.isGM ) 
		{
			return;
		}

		/** emit a socket event to request log clearing on the primary gm client **/
		void SocketHandler.emit( 
		{
			type: 'clear-logs',
			user_id: ( game as any ).user.id
		} );
	}

	/**
	 * sends a socket request to retrieve the current log content
	 **/
	public async _request_logs( ): Promise<void> 
	{
		const output_to_file = ( game as any ).settings.get( 'yugen-tracker', 'output-to-file' );
		
		if ( !output_to_file && ( game as any ).user.isGM ) 
		{
			( ui as any ).notifications?.warn( ( game as any ).i18n.localize( 'yugen-tracker.log-viewer.logging-disabled-warn' ) );
		}

		void SocketHandler.emit( 
		{
			type: 'request-logs',
			user_id: ( game as any ).user.id
		} );
	}
}
