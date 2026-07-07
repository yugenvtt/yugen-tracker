/**
 * @file src/hooks/render-chat-log.ts
 * injects a launch button for the log viewer into the chat log header.
 **/

import { LogViewer } from '../module/log-viewer.js';

export const render_chat_log_hook = ( ) => 
{
	/** listen for the chat log rendering to inject the log history button **/
	Hooks.on( 'renderChatLog', ( _app: any, html: any, _data: any ) => 
	{
		const show_button = ( game as any ).settings.get( 'yugen-tracker', 'show-sidebar-button' );
		const allow_players = ( game as any ).settings.get( 'yugen-tracker', 'allow-player-log-viewer' );
		
		if ( !show_button ) 
		{
			return;
		}

		if ( !( game as any ).user.isGM && !allow_players ) 
		{
			return;
		}

		/** create the log history button element **/
		const button = document.createElement( 'a' );
		button.classList.add( 'yugen-tracker-log-button' );
		button.title = ( game as any ).i18n.localize( 'yugen-tracker.log-viewer.title' );
		button.innerHTML = '<i class="fa-solid fa-scroll"></i>';
		
		button.addEventListener( 'click', ( ) => 
		{
			const viewer = LogViewer.instance;
			viewer.render( { force: true } );
			void viewer._request_logs( );
		} );

		/** append the button to the chat log header controls **/
		const root = html instanceof HTMLElement ? html : html[ 0 ];
		const header = root?.querySelector( '.control-buttons' ) || root?.querySelector( '.header-actions' ) || root?.querySelector( '.directory-header' );

		if ( header ) 
		{
			/** check if button already exists to prevent duplicates on re-render **/
			if ( !header.querySelector( '.yugen-tracker-log-button' ) ) 
			{
				header.appendChild( button );
			}
		}
	} );
};
