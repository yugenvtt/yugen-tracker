/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention */
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

	/**
	 * returns the localized window title.
	 **/
	override get title( ): string 
	{
		return ( game as any ).i18n.localize( 'yugen-tracker.log-viewer.title' );
	}

	static override DEFAULT_OPTIONS = 
	{
		id: 'yugen-tracker-log-viewer',
		tag: 'form',
		classes: [ 
			'yugen-app', 
			'app' 
		],
		window: 
		{
			title: 'yugen-tracker.log-viewer.title',
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
			'snapshot-all': LogViewer.prototype._on_snapshot_all,
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
	 * binds event listeners for search and tab clicks when the layout renders.
	 **/
	override _onRender( context: any, options: any ): void 
	{
		super._onRender( context, options );
		
		const html = this.element;
		const search_input = html.querySelector( '.yugen-tracker-search-input' ) as HTMLInputElement;
		const tabs = html.querySelectorAll( '.yugen-tracker-tab' );
		const log_entries = html.querySelectorAll( '.yugen-tracker-log-entry' );

		let active_tab = 'all';
		let search_query = '';

		const filter_logs = ( ) => 
		{
			for ( const entry of log_entries ) 
			{
				const html_entry = entry as HTMLElement;
				const category = html_entry.dataset.category || '';
				const text = html_entry.textContent?.toLowerCase( ) || '';

				const matches_tab = active_tab === 'all' || category === active_tab;
				const matches_search = search_query === '' || text.includes( search_query );

				if ( matches_tab && matches_search ) 
				{
					html_entry.classList.remove( 'is-hidden' );
				}
				else 
				{
					html_entry.classList.add( 'is-hidden' );
				}
			}
		};

		if ( search_input ) 
		{
			search_input.addEventListener( 'input', ( event ) => 
			{
				search_query = ( event.target as HTMLInputElement ).value.toLowerCase( ).trim( );
				filter_logs( );
			} );
		}

		for ( const tab of tabs ) 
		{
			tab.addEventListener( 'click', ( event ) => 
			{
				event.preventDefault( );
				
				for ( const t of tabs ) 
				{
					t.classList.remove( 'active' );
				}

				const target_tab = tab as HTMLElement;
				target_tab.classList.add( 'active' );
				active_tab = target_tab.dataset.tab || 'all';

				filter_logs( );
			} );
		}
	}

	/**
	 * prepares data for the handlebars template
	 **/
	override async _prepareContext( _options: any ): Promise<any> 
	{
		const lines = this._logs.split( '\n' ).filter( ( l: string ) => 
		{
			return l.trim( ) !== '';
		} );
		
		const parsed = lines.map( ( line: string ) => 
		{
			try 
			{
				const data = JSON.parse( line );
				/** format timestamp for local display **/
				const date = new Date( data.t );
				data.t = `${ date.toLocaleDateString( ) } ${ date.toLocaleTimeString( ) }`;
				
				/** determine log category **/
				const msg = data.m.toLowerCase( );
				let category = 'attributes';
				
				if ( msg.includes( 'concentrat' ) ) 
				{
					category = 'concentration';
				}
				else if ( msg.includes( 'spell' ) || msg.includes( 'slots' ) || msg.includes( 'pact' ) ) 
				{
					category = 'spells';
				}
				else if ( msg.includes( 'item' ) || msg.includes( 'equipped' ) || msg.includes( 'unequipped' ) || msg.includes( 'charges' ) || msg.includes( 'prepared' ) || msg.includes( 'unprepared' ) ) 
				{
					category = 'inventory';
				}

				data.category = category;
				return data;
			}
			catch ( e ) 
			{
				/** fallback for legacy non-json logs **/
				return { t: '', u: 'Legacy', m: line, category: 'attributes' };
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
	 * handles the snapshot-all action to snapshot all active characters
	 **/
	private async _on_snapshot_all( event: Event, _target: HTMLElement ): Promise<void> 
	{
		event.preventDefault( );

		if ( !( game as any ).user.isGM ) 
		{
			return;
		}

		const { SnapshotHandler } = await import( './snapshot-handler.js' );
		await SnapshotHandler.snapshot_all_characters( );
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
