/**
 * @file src/hooks/init.ts
 * registers module settings and modular hooks.
 **/

import { YugenTracker } from '../module/yugen-tracker.js';
import { update_actor_hook } from './update-actor.js';
import { item_hooks } from './item-hooks.js';
import { active_effect_hooks } from './active-effect-hooks.js';
import { socket_hooks } from './socket-hooks.js';

export const init_hook = ( ) => 
{
	/** register the initialization hook **/
	Hooks.once( 'init', async ( ) => 
	{
		register_settings( );
		
		/** initialize document and networking hooks **/
		update_actor_hook( );
		item_hooks( );
		active_effect_hooks( );
		socket_hooks( );

		new YugenTracker( );
	} );
};

const register_settings = ( ) => 
{
	/** register settings for hiding gm changes **/
	( game as any ).settings.register( 'yugen-tracker', 'hide-gm-changes', 
	{
		name: 'yugen-tracker.settings.hide-gm-changes.name',
		hint: 'yugen-tracker.settings.hide-gm-changes.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	} );

	/** register settings for tracking all owned documents **/
	( game as any ).settings.register( 'yugen-tracker', 'track-all-owned', 
	{
		name: 'yugen-tracker.settings.track-all-owned.name',
		hint: 'yugen-tracker.settings.track-all-owned.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	} );

	/** register settings for concentration tracking **/
	( game as any ).settings.register( 'yugen-tracker', 'track-concentration', 
	{
		name: 'yugen-tracker.settings.track-concentration.name',
		hint: 'yugen-tracker.settings.track-concentration.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	} );

	/** register settings for biography change visibility **/
	( game as any ).settings.register( 'yugen-tracker', 'display-biography-changes', 
	{
		name: 'yugen-tracker.settings.display-biography-changes.name',
		hint: 'yugen-tracker.settings.display-biography-changes.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false
	} );

	/** register settings for sensitive key filtering **/
	( game as any ).settings.register( 'yugen-tracker', 'sensitive-keys', 
	{
		name: 'yugen-tracker.settings.sensitive-keys.name',
		hint: 'yugen-tracker.settings.sensitive-keys.hint',
		scope: 'world',
		config: true,
		type: String,
		default: 'details.biography, details.ideal, details.bond, details.flaw, details.trait, details.appearance'
	} );

	/** register settings for file logging toggle **/
	( game as any ).settings.register( 'yugen-tracker', 'output-to-file', 
	{
		name: 'yugen-tracker.settings.output-to-file.name',
		hint: 'yugen-tracker.settings.output-to-file.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: false
	} );

	/** register settings for log file path **/
	( game as any ).settings.register( 'yugen-tracker', 'log-file-name', 
	{
		name: 'yugen-tracker.settings.log-file-name.name',
		hint: 'yugen-tracker.settings.log-file-name.hint',
		scope: 'world',
		config: true,
		type: String,
		default: 'yugen-tracker-logs.txt'
	} );

	/** register settings for discord integration **/
	( game as any ).settings.register( 'yugen-tracker', 'discord-webhook', 
	{
		name: 'yugen-tracker.settings.discord-webhook.name',
		hint: 'yugen-tracker.settings.discord-webhook.hint',
		scope: 'world',
		config: true,
		type: String,
		default: ''
	} );

	/** register settings for gamemaster announcements **/
	( game as any ).settings.register( 'yugen-tracker', 'announce-gamemasters', 
	{
		name: 'yugen-tracker.settings.announce-gamemasters.name',
		hint: 'yugen-tracker.settings.announce-gamemasters.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	} );

	/** register settings for assistant gamemaster announcements **/
	( game as any ).settings.register( 'yugen-tracker', 'announce-assistant-gamemasters', 
	{
		name: 'yugen-tracker.settings.announce-assistant-gamemasters.name',
		hint: 'yugen-tracker.settings.announce-assistant-gamemasters.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	} );

	/** register settings for trusted player announcements **/
	( game as any ).settings.register( 'yugen-tracker', 'announce-trusted-players', 
	{
		name: 'yugen-tracker.settings.announce-trusted-players.name',
		hint: 'yugen-tracker.settings.announce-trusted-players.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	} );

	/** register settings for standard player announcements **/
	( game as any ).settings.register( 'yugen-tracker', 'announce-all-players', 
	{
		name: 'yugen-tracker.settings.announce-all-players.name',
		hint: 'yugen-tracker.settings.announce-all-players.hint',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	} );
};
