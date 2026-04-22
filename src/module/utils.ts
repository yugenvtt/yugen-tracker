/**
 * @file src/module/utils.ts
 * pure utility functions for data transformation.
 **/

/**
 * flattens a nested object into dot-notation keys.
 **/
export const flatten_changes = ( obj: any, prefix = '' ): Record<string, any> => 
{
	return Object.keys( obj ).reduce( ( acc: Record<string, any>, key: string ) => 
	{
		const path = prefix ? `${ prefix }.${ key }` : key;
		
		if ( typeof obj[ key ] === 'object' && obj[ key ] !== null && !Array.isArray( obj[ key ] ) ) 
		{
			Object.assign( acc, flatten_changes( obj[ key ], path ) );
		}

		else 
		{
			acc[ path ] = obj[ key ];
		}

		return acc;
	}, { } );
};

/**
 * capitalizes the first letter of a string.
 **/
export const capitalize = ( str: string ): string => 
{
	if ( !str ) 
	{
		return str;
	}

	return str.charAt( 0 ).toUpperCase( ) + str.slice( 1 );
};
