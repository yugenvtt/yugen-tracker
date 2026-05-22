/**
 * @file src/index.ts
 * entry point for the yugen-tracker module.
 **/

import { init_hook } from './hooks/init.js';

/** initialize the module hooks **/
init_hook( );

/**
 * export the log viewer class for external macro access
 **/
export { LogViewer } from './module/log-viewer.js';
