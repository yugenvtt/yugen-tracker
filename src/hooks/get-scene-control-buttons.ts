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

		/** in foundry v14+, controls is an object keyed by layer name rather than an array **/
		const notes_controls = Array.isArray( controls )
			? controls.find( ( c: any ) => c.name === 'notes' )
			: controls[ 'notes' ];

		if ( !notes_controls )
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

		/** in v14, tools is also an object keyed by tool name rather than an array **/
		if ( Array.isArray( notes_controls.tools ) )
		{
			notes_controls.tools.push( tool );
		}
		else
		{
			notes_controls.tools[ tool.name ] = tool;
		}
	} );
};
