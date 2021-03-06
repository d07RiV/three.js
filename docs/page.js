if ( !window.frameElement && window.location.protocol !== 'file:' ) {

	// If the page is not yet displayed as an iframe of the index page (navigation panel/working links),
	// redirect to the index page (using the current URL without extension as the new fragment).
	// If this URL itself has a fragment, append it with a dot (since '#' in an URL fragment is not allowed).

	var href = window.location.href;
	var splitIndex = href.lastIndexOf( '/docs/' ) + 6;
	var docsBaseURL = href.substr( 0, splitIndex );

	var hash = window.location.hash;

	if ( hash !== '' ) {

		href = href.replace( hash, '' );
		hash = hash.replace( '#', '.' );

	}

	var pathSnippet = href.slice( splitIndex, -5 );

	window.location.replace( docsBaseURL + '#' + pathSnippet + hash );

}

function createLink( pageName, title, attributes ) {

	attributes = attributes || {};

	if ( pageName.match( /^(null|this|Boolean|Object|Array|Number|String|Integer|Float|TypedArray|ArrayBuffer)$/i ) ) {

		// do not create links to primitive types
		return "<span class=\"param\">" + title + "</span>";

	}

	var url = window.parent.getPageUrl( pageName );
	if ( url ) {

		attributes.href = url;

	}

	var code = "";
	for ( var key in attributes ) {

		if ( attributes.hasOwnProperty( key ) ) {

			code += " " + key + "=\"" + attributes[ key ] + "\"";

		}

	}

	return "<a onclick=\"window.parent.setUrlFragment('" + pageName + "', event)\" " + code + ">" + title + "</a>";

}

function onDocumentLoad( event ) {

	var path;
	var pathname = window.location.pathname;
	var section = /\/(manual|api|examples)\//.exec( pathname )[ 1 ].toString().split( '.html' )[ 0 ];
	var name = /[\-A-z0-9]+\.html/.exec( pathname ).toString().split( '.html' )[ 0 ];

	switch ( section ) {

		case 'api':
			path = /\/api\/[A-z0-9\/]+/.exec( pathname ).toString().substr( 5 );
			break;

		case 'examples':
			path = /\/examples\/[A-z0-9\/]+/.exec( pathname ).toString().substr( 10 );
			break;

		case 'manual':
			name = name.replace( /\-/g, ' ' );

			path = pathname.replace( /\ /g, '-' );
			path = /\/manual\/[-A-z0-9\/]+/.exec( path ).toString().substr( 8 );
			break;

	}

	var text = document.body.innerHTML;

	text = text.replace( /\[name\]/gi, name );
	text = text.replace( /\[path\]/gi, path );
	text = text.replace( /\[page:([\w\.]+)\]/gi, "[page:$1 $1]" ); // [page:name] to [page:name title]
	text = text.replace( /\[page:\.([\w\.]+) ([\w\.\s]+)\]/gi, "[page:" + name + ".$1 $2]" ); // [page:.member title] to [page:name.member title]
	text = text.replace( /\[page:([\w\.]+) ([\w\.\s]+)\]/gi, function ( match, pageName, title ) {

		return createLink( pageName, title, { title: pageName } );

	} ); // [page:name title]
	// text = text.replace( /\[member:.([\w]+) ([\w\.\s]+)\]/gi, "<a onclick=\"window.parent.setUrlFragment('" + name + ".$1')\" title=\"$1\">$2</a>" );

	text = text.replace( /\[(member|property|method|param):([\w]+)\]/gi, "[$1:$2 $2]" ); // [member:name] to [member:name title]
	text = text.replace( /\[(?:member|property|method):([\w]+) ([\w\.\s]+)\]\s*(\(.*\))?/gi, function ( match, typeName, pageName, argList ) {

		var permalink = createLink( name + "." + pageName, "#", { target: "_parent", title: name + "." + pageName, class: "permalink" } );
		var pageLink = createLink( name + "." + pageName, pageName, { id: pageName } );
		var typeLink = createLink( typeName, typeName, { class: "param" } );
		return permalink + " ." + pageLink + " " + ( argList || "" ) + " : " + typeLink;

	} );
	text = text.replace( /\[param:([\w\.]+) ([\w\.\s]+)\]/gi, function ( match, pageName, title ) {

		return title + " : " + createLink( pageName, pageName, { class: "param" } );

	} ); // [param:name title]

	text = text.replace( /\[link:([\w|\:|\/|\.|\-|\_]+)\]/gi, "[link:$1 $1]" ); // [link:url] to [link:url title]
	text = text.replace( /\[link:([\w|\:|\/|\.|\-|\_|\(|\)|\#|\=]+) ([\w|\:|\/|\.|\-|\_|\s]+)\]/gi, "<a href=\"$1\"  target=\"_blank\">$2</a>" ); // [link:url title]
	text = text.replace( /\*([\w|\d|\"|\-|\(][\w|\d|\ |\-|\/|\+|\-|\(|\)|\=|\,|\.\"]*[\w|\d|\"|\)]|\w)\*/gi, "<strong>$1</strong>" ); // *

	text = text.replace( /\[example:([\w\_]+)\]/gi, "[example:$1 $1]" ); // [example:name] to [example:name title]
	text = text.replace( /\[example:([\w\_]+) ([\w\:\/\.\-\_ \s]+)\]/gi, "<a href=\"../examples/#$1\"  target=\"_blank\">$2</a>" ); // [example:name title]

	document.body.innerHTML = text;

	// handle code snippets formatting

	var elements = document.getElementsByTagName( 'code' );

	for ( var i = 0; i < elements.length; i ++ ) {

		var element = elements[ i ];

		text = element.textContent.trim();
		text = text.replace( /^\t\t/gm, '' );

		element.textContent = text;

	}

	// Edit button

	var button = document.createElement( 'div' );
	button.id = 'button';
	button.textContent = 'Edit';

	button.addEventListener( 'click', function ( event ) {

		window.open( 'https://github.com/mrdoob/three.js/blob/dev/docs/' + section + '/' + path + '.html' );

	}, false );

	document.body.appendChild( button );

	// Syntax highlighting

	var styleBase = document.createElement( 'link' );
	styleBase.href = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/prettify.css';
	styleBase.rel = 'stylesheet';

	var styleCustom = document.createElement( 'link' );
	styleCustom.href = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/threejs.css';
	styleCustom.rel = 'stylesheet';

	document.head.appendChild( styleBase );
	document.head.appendChild( styleCustom );

	var prettify = document.createElement( 'script' );
	prettify.src = pathname.substring( 0, pathname.indexOf( 'docs' ) + 4 ) + '/prettify/prettify.js';

	prettify.onload = function () {

		var elements = document.getElementsByTagName( 'code' );

		for ( var i = 0; i < elements.length; i ++ ) {

			var e = elements[ i ];
			e.className += ' prettyprint';

		}

		prettyPrint();

	};

	document.head.appendChild( prettify );

};

document.addEventListener( 'DOMContentLoaded', onDocumentLoad, false );
