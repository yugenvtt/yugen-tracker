/**
 * @file src/hooks/get-scene-control-buttons.ts
 * adds a tool button to the scene controls for the log viewer.
 **/

import { LogViewer } from '../module/log-viewer.js';

export const get_scene_control_buttons_hook = ( ) => 
{
	/** listen for the scene controls construction to inject the log history tool **/
	Hooks.on( 'getSceneControlButtons', ( controls: any ) =>
	{
		/** retrieve settings value **/
		const show_button = ( game as any ).settings.get( 'yugen-tracker', 'show-sidebar-button' );

		/** retrieve settings value **/
		const allow_players = ( game as any ).settings.get( 'yugen-tracker', 'allow-player-log-viewer' );

		if ( !show_button ) 
		{
			return;
		}

		if ( !( game as any ).user.isGM && !allow_players )
		{
			return;
		}

		const tool =
		{
			name: 'yugen-tracker-logs',
			title: ( game as any ).i18n.localize( 'yugen-tracker.log-viewer.title' ),
			icon: 'fas fa-file-medical-alt',
			onClick: ( ) =>
			{
				const viewer = LogViewer.instance;
				viewer.render( { force: true } );
				void viewer._request_logs( );
			},
			button: true
		};

		/** register log viewer tool button via shared library control utility **/
		( globalThis as any ).yugen_utils.register_control_tool( controls, 'tokens', tool );
	} );
};
