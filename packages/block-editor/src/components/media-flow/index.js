/**
 * Internal dependencies
 */
import BlockControls from '../block-controls';
import { default as MediaPlaceholder } from '../media-placeholder';
import BlockIcon from '../block-icon';
import { default as MediaUpload } from '../media-upload';
import { default as MediaUploadCheck } from '../media-upload/check';
import { default as URLInput } from '../url-input';

/**
 * WordPress dependencies
 */
import { Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	FormFileUpload,
	MenuItem,
	Toolbar,
	withNotices,
	withFilters,
	IconButton,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

const MediaFlow = ( { mediaUpload, className, value, mediaURL, accepts, allowedTypes, onSelect, onSelectURL, notices, children, noticeOperations, name = __( 'Replace' ), multiple = false } ) => {
	const [ URLinput, setURLinput ] = useState( false );
	const [ mediaURLValue, setMediaURLValue ] = useState( '' );

	const selectMedia = ( media ) => {
		onSelect( media );
	};

	const selectURL = ( URL ) => {
		onSelectURL( URL );
	};

	const onCancel = () => {
	};

	const onUploadError = ( message ) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	};

	const uploadFiles = ( event ) => {
		const files = event.target.files;
		let setMedia;
		if ( multiple ) {
			setMedia = selectMedia;
		} else {
			setMedia = ( [ media ] ) => selectMedia( media );
		}
		mediaUpload( {
			allowedTypes,
			filesList: files,
			onFileChange: setMedia,
			onUploadError,
		} );
	};

	const fileUploadButton = (
		<FormFileUpload
			onChange={ uploadFiles }
			accept={ allowedTypes }
			multiple={ multiple }
			render={ ( { openFileDialog } ) => {
				return (
					<MenuItem
						icon="upload"
						onClick={ openFileDialog }
					>
						{ __( 'Upload' ) }
					</MenuItem>
				);
			} }
		/>
	);

	const URLButton = (
		<>
			<MenuItem
				icon="admin-links"
				onClick={ () => ( setURLinput( ! URLinput ) ) }
			>
				<div> { __( 'Insert from URL' ) } </div>
			</MenuItem>
			{ URLinput && <div className="media-flow-url-input__menu">
				<URLInput
					className=""
					value={ mediaURLValue }
					isFullWidth={ true }
					onChange={ ( url ) => ( setMediaURLValue( url ) ) }
				/>
				<IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
			</div> }
		</>
	);

	const editMediaButton = (
		<BlockControls>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ ( media ) => selectMedia( media ) }
					allowedTypes={ allowedTypes }
					render={ ( { open } ) => (
						<>
							<Toolbar
								isCollapsed={ true }
								icon={ false }
								label={ name }
								controls={ [] }
								showLabel={ true }
							>
								{ () => (
									<>
										<MenuItem
											icon="admin-media"
											onClick={ open }
										>
											{ __( 'Open Media Library' ) }
										</MenuItem>
										{ fileUploadButton }
										{ URLButton }
									</>
								) }
							</Toolbar>
						</>
					) }
				/>
			</MediaUploadCheck>
		</BlockControls>
	);

	const mediaPlaceholder = (
		<MediaPlaceholder
			icon={ <BlockIcon icon={ 'edit' } /> }
			onCancel={ mediaURL && onCancel }
			onSelect={ selectMedia }
			onSelectMedia={ selectMedia }
			onSelectURL={ selectURL }
			accept={ accepts }
			allowedTypes={ allowedTypes }
			className={ className }
			mediaURL={ mediaURL }
			accepts={ allowedTypes }
			value={ value }
			notices={ notices }
			onError={ onUploadError }
		/>
	);

	return (
		<Fragment>
			{ mediaURL && editMediaButton }
			{ mediaURL && children }
			{ ! mediaURL && mediaPlaceholder }
		</Fragment>
	);
};

const applyWithSelect = withSelect( ( select ) => {
	const { getSettings } = select( 'core/block-editor' );

	return {
		mediaUpload: getSettings().__experimentalMediaUpload,
	};
} );

/**
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/block-editor/src/components/media-placeholder/README.md
 */
export default compose(
	applyWithSelect,
	withFilters( 'editor.MediaPlaceholder' ),
	withNotices,
)( MediaFlow );