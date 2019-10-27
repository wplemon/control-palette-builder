/* globals React */
/* eslint jsx-a11y/label-has-for: off */
import reactCSS from 'reactcss';
import { ChromePicker } from 'react-color';

const PaletteBuilderForm = ( props ) => {

	/**
	 * Get existing value.
	 *
	 * @return {Array}
	 */
	const getVal = () => {
		let value = wp.customize( props.customizerSetting.id ).get();
		if ( 'string' === typeof value ) {
			value = JSON.parse( value.replace( /&#39/g, '"' ) );
		}
		return value;
	}

	/**
	 * Modifies the value of an item.
	 *
	 * @param {Number} i - The index of the item we want to modify inside our array.
	 * @param {Object} val - The value to assign to the selected index. Use `null` to remove the item.
	 * @return {void}
	 */
	const changeItem = ( i, val ) => {
		let value = getVal();

		if ( ! val ) {
			value.splice( i, 1 );
		} else {
			value[ i ] = val;
		}

		props.control.container
			.find( '.palette-picker-hidden-input' )
			.attr( 'value', JSON.stringify( value ).replace( /'/g, '&#39' ).replace( /"/g, '&#39' ) )
			.trigger( 'change' );
		wp.customize( props.customizerSetting.id ).set( value );
	}

	/**
	 *
	 * @param {Object} color - The color object from our colorpicker.
	 * @param {Event} event - The change event.
	 * @return {void}
	 */
	const handleChangeComplete = ( color ) => {
		let value = getVal();
		let currentIndex = parseInt( props.control.container.find( '.palette-picker-inputs-container' ).attr( 'data-index' ) );
		let itemVal = value[ currentIndex ];
		itemVal.color = color.hex;
		changeItem( currentIndex, itemVal );
	};

	/**
	 * Handle clicking on a palette-color.
	 *
	 * @param {Event} e - The event.
	 * @return {void}
	 */
	const previewButtonClick = ( e ) => {
		e.preventDefault();

		let inputsContainer = props.control.container.find( '.palette-picker-inputs-container' );
		let prevIndex = inputsContainer.attr( 'data-index' );
		let currentIndex = e.currentTarget.getAttribute( 'data-index' );

		if ( prevIndex !== currentIndex ) {
			inputsContainer.attr( 'data-index', currentIndex );
			if ( ! inputsContainer.hasClass( 'expanded' ) ) {
				inputsContainer.addClass( 'expanded' );
			}
		} else {
			inputsContainer.toggleClass( 'expanded' );
		}

		if ( inputsContainer.hasClass( 'expanded' ) ) {
			inputsContainer.show();

			inputsContainer.find( '.colorpicker-container' ).hide();
			inputsContainer.find( '.colorpicker-container[data-index="' + currentIndex + '"]' ).show();
			props.control.container.find( '.add-color' ).hide();
		} else {
			inputsContainer.hide();
			props.control.container.find( '.add-color' ).show();
		}

		props.control.renderContent();
	}

	const closePicker = ( e ) => {
		let inputsContainer = props.control.container.find( '.palette-picker-inputs-container' );
		inputsContainer.show();
		inputsContainer.find( '.colorpicker-container' ).hide();
		props.control.container.find( '.add-color' ).hide();
		e.preventDefault();
	};

	/**
	 * Add a row.
	 *
	 * @param {Object} e - The event.
	 * @return {void}
	 */
	const addRow = ( e ) => {
		changeItem( getVal().length, {
			name: 'Custom Color',
			slug: 'custom-color-' + new Date().getTime(),
			color: '#ffffff'
		} );
		e.preventDefault();
	};

	/**
	 * Get the color HEX value from an index.
	 *
	 * @param {Number} i - The index.
	 * @return {string}
	 */
	const getColorFromIndex = ( i ) => {
		let val = getVal();
		i = parseInt( i );
		return ( val[ i ] && val[ i ]['color'] ) ? val[ i ]['color'] : '';
	}

	/**
	 * Removes a row.
	 *
	 * @param {Object} e - The event.
	 * @return {void}
	 */
	const removeItem = ( e ) => {
		let currentIndex = parseInt( props.control.container.find( '.palette-picker-inputs-container' ).attr( 'data-index' ) );
		changeItem( currentIndex, null );
		e.preventDefault();
	};

	let colors = [];
	let pickers = [];
	for ( let i = 0; i < getVal().length; i++ ) {
		let item = getVal()[ i ];
		let rowStyles = reactCSS( {
			default: {
				indicator: {
					background: item.color,
					width: '30px',
					height: '30px',
					'border-radius': '4px',
					border: '1px solid rgba(0, 0, 0, 0.2)',
				},
				bottomButtons: {
					display: 'flex',
					'justify-content': 'space-between',
				},
				removeButton: {
					color: '#dc3232',
					'margin-top': '12px'
				},
				closeButton: {

				}
			}
		} );
		colors.push(
			<button
				style={ rowStyles.indicator }
				onClick={ previewButtonClick }
				data-index={ i }
			/>
		);

		pickers.push(
			<div class="colorpicker-container" data-index={ i }>
				<ChromePicker
					color={ getColorFromIndex( i ) }
					disableAlpha={ true }
					onChangeComplete={ handleChangeComplete }
				/>
				<div style={ rowStyles.bottomButtons }>
					<button class="button button-link" style={ rowStyles.removeButton } onClick={ removeItem }>Remove</button>
					<button class="button button-link" style={ rowStyles.closeButton } onClick={ closePicker }>Close</button>
				</div>
			</div>
		)
	}

	let styles = reactCSS( {
		default: {
			container: {
				padding: '12px',
				background: '#fff',
				'border-radius': '4px',
				border: '1px solid rgba(0, 0, 0, 0.2)',
			},
			colors: {
				display: 'grid',
				'grid-template-columns': 'repeat(auto-fit, minmax(30px,1fr))',
				'margin-bottom': '12px',
				'grid-gap': '6px'
			},
			inputsContainer: {
				display: 'none'
			}
		}
	} );


	return (
		<div>
			<div>
				<label id={ 'label-' + props.customizerSetting.id } className="customize-control-title">{ props.label }</label>
				<span className="description customize-control-description" dangerouslySetInnerHTML={ { __html: props.description } }></span>
				<div className="customize-control-notifications-container" ref={ props.setNotificationContainer }></div>
			</div>

			<div style={ styles.container }>
				<div style={ styles.colors }>{ colors }</div>
				<div class="palette-picker-inputs-container" style={ styles.inputsContainer }>
					{ pickers }
				</div>

				<button class="button add-color" onClick={ addRow }>Add Color</button>

				<input
					class="palette-picker-hidden-input"
					type="hidden"
					data-customize-setting-link={ props.customizerSetting.id }
					value={ JSON.stringify( getVal() ).replace( /'/g, '&#39' ).replace( /"/g, '&#39' ) }
				/>
			</div>
		</div>
	);
};

export default PaletteBuilderForm;
