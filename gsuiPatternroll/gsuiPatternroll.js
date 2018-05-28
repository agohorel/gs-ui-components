"use strict";

class gsuiPatternroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPatternroll.template.cloneNode( true );

		super( root );
		this.uiBlc.row = ( el, rowIncr ) => {
			this.uiBlc.track( el, this.data[ el.dataset.id ].key - rowIncr );
		};
		this.uiBlc.track = ( el, trackId ) => {
			this._getRowByTrackId( trackId ).firstChild.append( el );
		};

		this._uiTracklist = new gsuiTracklist();
		this._uiTracklist.onchange = tracks => this.onchange( { tracks } );
		this._uiTracklist.ontrackadded = uiTrk => {
			const row = uiTrk.rowElement;

			this._rowsByTrackId[ row.dataset.track ] = row;
			this.__rowsContainer.append( row );
		};

		this.data = this._proxyCreate();
		this._idMax = 1;
		this._rowsByTrackId = {};
		this.__sideContent.append( this._uiTracklist.rootElement );
		this.__rowsContainer.onmousedown = this.__mousedown.bind( this );
	}

	empty() {
		const blcs = this.data.blocks;

		Object.keys( blcs ).forEach( k => delete blcs[ k ] );
		this._uiTracklist.empty();
	}
	resized() {
		this.__resized();
		this.__gridPanelResized();
	}
	attached() {
		this.__attached();
	}

	// Blocks manager callback
	// ........................................................................
	blcsManagerCallback( status, blcsMap, valA, valB ) {
		const obj = {},
			data = this.data;

		switch ( status ) {
			case "selecting":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						selected = !d.selected;

					obj[ id ] = { selected };
					d.selected = selected;
				} );
				break;
			case "moving":
				valA = Math.abs( valA ) > .000001 ? valA : 0;
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						o = {};

					obj[ id ] = o;
					if ( valA ) {
						o.when =
						d.when += valA;
					}
					if ( valB ) {
						o.key =
						d.key -= valB;
					}
				} );
				break;
			case "cropping-b":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						duration = d.duration + valA;

					obj[ id ] = { duration };
					d.duration = duration;
				} );
				break;
			case "deleting":
				blcsMap.forEach( ( _, id ) => {
					obj[ id ] = null;
					delete data[ id ];
				} );
				this._unselectKeys( obj );
				break;
		}
		this.onchange( obj );
	}

	// Private small getters
	// ........................................................................
	_getData() { return this.data.blocks; }
	_getRowByTrackId( id ) { return this._rowsByTrackId[ id ]; }

	// Mouse and keyboard events
	// ........................................................................
	_onkeydown( e ) { this.__keydown( e ); }
	_mousemove( e ) { this.__mousemove( e ); }
	_mouseup( e ) { this.__mouseup( e ); }

	// Key's functions
	// ........................................................................
	_deleteBlock( id ) {
		this.__blcs.get( id ).remove();
		this.__blcs.delete( id );
		this.__blcsSelected.delete( id );
	}
	_setBlock( id, obj ) {
		const blc = gsuiPatternroll.blockTemplate.cloneNode( true );

		blc.dataset.id = id;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		obj.selected
			? this.__blcsSelected.set( id, blc )
			: this.__blcsSelected.delete( id );
		this.__blcs.set( id, blc );
		this.uiBlc.when( blc, obj.when );
		this.uiBlc.track( blc, obj.track );
		this.uiBlc.duration( blc, obj.duration );
		this.uiBlc.selected( blc, obj.selected );
	}
	_setBlockProp( id, prop, val ) {
		const uiFn = this.uiBlc[ prop ];

		if ( uiFn ) {
			const blc = this.__blcs.get( id );

			uiFn( blc, val );
			if ( prop === "selected" ) {
				val
					? this.__blcsSelected.set( id, blc )
					: this.__blcsSelected.delete( id );
			}
		}
	}
	_unselectKeys( obj ) {
		this.__blcsSelected.forEach( ( blc, id ) => {
			if ( !( id in obj ) ) {
				this.data[ id ].selected = false;
				obj[ id ] = { selected: false };
			}
		} );
		return obj;
	}

	// Data proxy
	// ........................................................................
	_proxyCreate() {
		return Object.freeze( {
			tracks: this._uiTracklist.data,
			blocks: new Proxy( {}, {
				set: this._proxySetBlocks.bind( this ),
				deleteProperty: this._proxyDeleteBlocks.bind( this )
			} )
		} );
	}
	_proxyDeleteBlocks( tar, id ) {
		if ( id in tar ) {
			this._deleteBlock( id );
			delete tar[ id ];
		} else {
			console.warn( `gsuiPatternroll: proxy useless deletion of block [${ id }]` );
		}
		return true;
	}
	_proxySetBlocks( tar, id, obj ) {
		if ( id in tar || !obj ) {
			this._proxyDeleteBlocks( tar, id );
			if ( obj ) {
				console.warn( `gsuiPatternroll: reassignation of block [${ id }]` );
			}
		}
		if ( obj ) {
			const prox = new Proxy( Object.seal( Object.assign( {
					when: 0,
					offset: 0,
					duration: 1,
					selected: false
				}, obj ) ), {
					set: this._proxySetBlockProp.bind( this, id )
				} );

			tar[ id ] = prox;
			this._idMax = Math.max( this._idMax, id );
			this._setBlock( id, prox );
		}
		return true;
	}
	_proxySetBlockProp( id, tar, prop, val ) {
		tar[ prop ] = val;
		this._setBlockProp( id, prop, val );
		return true;
	}
}

gsuiPatternroll.template = document.querySelector( "#gsuiPatternroll-template" );
gsuiPatternroll.template.remove();
gsuiPatternroll.template.removeAttribute( "id" );
gsuiPatternroll.blockTemplate = document.querySelector( "#gsuiPatternroll-block-template" );
gsuiPatternroll.blockTemplate.remove();
gsuiPatternroll.blockTemplate.removeAttribute( "id" );