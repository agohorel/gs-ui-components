// Creation of the whole demo's HTML
var k, tpl = Handlebars.templates,
	demoTpl = Handlebars.compile( document.querySelector( "#demo-tpl" ).innerHTML );

for ( k in tpl ) {
	Handlebars.registerPartial( k, tpl[ k ] );
}
document.querySelector( "#demo" ).innerHTML = demoTpl();

// gsuiToggle
var toggles = [],
	elToggles = Array.from( document.querySelectorAll( ".gsuiToggle" ) ),
	togglesData = {
		onchange: function( b ) {
			lg( "onchange", b );
		}
	};

elToggles.forEach( function( el, i ) {
	var toggle = new gsuiToggle( el, togglesData );

	toggles.push( toggle );
	if ( i > 0 ) {
		toggle.groupWith( toggles[ 0 ] );
	}
} );
toggles[ 0 ].toggle( true );


// gsuiSpanEditable
var span = document.querySelector( ".gsuiSpanEditable" ),
	spanEditable = new gsuiSpanEditable( span, {
		onchange: function( val ) {
			lg( "onchange", val );
		}
	} );

spanEditable.setPlaceholder( "Placeholder..." );

// An AudioContext for testing
var wactx = new AudioContext();

// gsuiWaveform
var elWaveform = document.querySelector( ".gsuiWaveform" ),
	waveformRect = elWaveform.getBoundingClientRect(),
	waveform = new gsuiWaveform( elWaveform, {} );

fetch( "src-demo/120bpm-4s.wav" )
	.then( function( res ) {
		res.arrayBuffer().then( function( arraybuf ) {
			wactx.decodeAudioData( arraybuf, function( wabuf ) {
				
				var n = Math.PI / 2;
					dur = wabuf.duration,
					dur2 = dur / 2;

				waveform.setBuffer( wabuf );
				waveform.setResolution( waveformRect.width, waveformRect.height );
				waveform.draw();

				requestAnimationFrame( frame );
				function frame() {
					var sin = ( 1 + Math.sin( n ) ) / 2;

					waveform.draw(
						dur2 - dur2 * sin,
						dur * sin );
					n += .005;
					requestAnimationFrame( frame );
				}

			} );
		} );
	} );
