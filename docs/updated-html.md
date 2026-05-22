```html
<h1>yugen-tracker</h1>
<p align="center">
  <a href="https://www.youtube.com/watch?v=HaS7BjKM3xY">
    <img src="https://img.youtube.com/vi/HaS7BjKM3xY/maxresdefault.jpg" width="100%" alt="Watch the demo">
  </a>
  <br>
  <a href="https://www.youtube.com/watch?v=HaS7BjKM3xY">Click here for video demonstration</a>
</p>
<p><em>A Foundry VTT sheet tracking module with Discord Integration for maintaining campaign integrity.</em></p>
<hr />
<p>With real-time tracking and ingame alerts, you can see if players are making modifications to their sheet during games or while the session isn't active.</p>
<p>This provides a reliable audit log for GMs against players you may suspect are tampering with their sheets without you knowing (adding/removing/changing spell slots, etc.).</p>
<p><img src="https://raw.githubusercontent.com/yugenvtt/yugen-tracker/main/.github/assets/equip.png" alt="equipping" /> <img src="https://raw.githubusercontent.com/yugenvtt/yugen-tracker/main/.github/assets/prepare.png" alt="spell prep" /> <img src="https://raw.githubusercontent.com/yugenvtt/yugen-tracker/main/.github/assets/spellslots.png" alt="spell slots" /></p>
<h2>Settings</h2>
<table>
<thead>
<tr>
<th>Setting</th>
<th>Description</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Hide Gamemaster Changes</strong></td>
<td>If enabled, changes made by Gamemasters will not be tracked or announced.</td>
<td><code>true</code></td>
</tr>
<tr>
<td><strong>Track All Owned Sheets</strong></td>
<td>If enabled, all sheets owned by a player will be tracked (preventing cheating on unassigned sheets). If disabled, only assigned characters are tracked.</td>
<td><code>true</code></td>
</tr>
<tr>
<td><strong>Track Concentration</strong></td>
<td>If enabled, starting or breaking concentration will be announced in chat.</td>
<td><code>true</code></td>
</tr>
<tr>
<td><strong>Display Biography Changes</strong></td>
<td>If enabled, changes to the character biography and personality traits will be announced.</td>
<td><code>false</code></td>
</tr>
<tr>
<td><strong>Sensitive Keys</strong></td>
<td>A comma-separated list of keys to ignore when "Display Biography Changes" is disabled.</td>
<td><code>details.biography, ...</code></td>
</tr>
<tr>
<td><strong>Output to File</strong></td>
<td>If enabled, logs will be saved to a .txt file in your Foundry data folder (Data/yugen-tracker-logs/).</td>
<td><code>false</code></td>
</tr>
<tr>
<td><strong>Log File Name</strong></td>
<td>The name of the log file (e.g., combat-log.txt).</td>
<td><code>yugen-tracker-logs.txt</code></td>
</tr>
<tr>
<td><strong>Allow Player Log Viewer</strong></td>
<td>If enabled, players will be able to open the log history viewer.</td>
<td><code>false</code></td>
</tr>
<tr>
<td><strong>Show Sidebar Button</strong></td>
<td>If enabled, the Log History button will appear in the Journal Notes sidebar and Directory header.</td>
<td><code>true</code></td>
</tr>
<tr>
<td><strong>Debug Mode</strong></td>
<td>If enabled, detailed technical logs will be printed to the browser console.</td>
<td><code>false</code></td>
</tr>
<tr>
<td><strong>Discord Webhook</strong></td>
<td>Enter a Discord Webhook URL to send logs to a Discord channel. Leave empty to disable.</td>
<td><code>""</code></td>
</tr>
<tr>
<td><strong>Announce to Gamemasters</strong></td>
<td>If enabled, changes will be whispered to Gamemasters.</td>
<td><code>true</code></td>
</tr>
<tr>
<td><strong>Announce to Assistant Gamemasters</strong></td>
<td>If enabled, changes will be whispered to Assistant Gamemasters.</td>
<td><code>true</code></td>
</tr>
<tr>
<td><strong>Announce to Trusted Players</strong></td>
<td>If enabled, changes will be whispered to Trusted Players.</td>
<td><code>true</code></td>
</tr>
<tr>
<td><strong>Announce to All Players</strong></td>
<td>If enabled, changes will be sent as public chat messages to everyone (overrides other role settings).</td>
<td><code>true</code></td>
</tr>
</tbody>
</table>
<h2>UI</h2>
<p><img src="https://raw.githubusercontent.com/yugenvtt/yugen-tracker/main/.github/assets/ui.png" alt="ui" /></p>
<p>You can access the Log History UI by clicking the <strong>Log History</strong> icon (a file with a medical cross) in the following locations:</p>
<ul>
<li><strong>Journal Notes</strong>: In the left-hand Scene Controls sidebar, under the Journal Notes group.</li>
<li><strong>Journal Directory</strong>: In the header of the Journal sidebar tab.</li>
</ul>
<h3>Accessing via Macro</h3>
<p>If you have disabled the sidebar buttons or are using an older version of Foundry VTT where the buttons do not appear, you can open the UI using a <strong>Script Macro</strong>:</p>
<pre><code>/**
 * open the yugen-tracker log history viewer
 **/
const module = game.modules.get( 'yugen-tracker' );

if ( !module?.active ) 
{
	ui.notifications.error( 'yugen-tracker is not active.' );
}
else 
{
	/** import the exported LogViewer class from the module entry point **/
	const { LogViewer } = await import( '/modules/yugen-tracker/scripts/module.js' );
	
	const viewer = LogViewer.instance;
	viewer.render( { force: true } );
	
	/** trigger a fresh log request upon opening **/
	void viewer._request_logs( );
}</code></pre>
<h2>Compatibility</h2>
<ul>
<li>D&amp;D 5e (2014 &amp; 2024)</li>
<li>Pathfinder 2e</li>
<li>Warhammer Fantasy Roleplay 4th Edition</li>
<li>Call of Cthulhu 7th Edition</li>
<li>Foundry V14</li>
</ul>
```
