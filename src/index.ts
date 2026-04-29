/**
 * @file src/index.ts
 * entry point for the yugen-tracker module.
 **/

import { init_hook } from './hooks/init.js';
export { LogViewer } from './module/log-viewer.js';

/** initialize the module hooks **/
init_hook( );
