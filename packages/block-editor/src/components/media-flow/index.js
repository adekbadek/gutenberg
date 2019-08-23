/**
 * Internal dependencies
 */
import BlockControls from '../block-controls';
import { default as MediaPlaceholder } from '../media-placeholder';
import BlockIcon from '../block-icon';
import { default as MediaUpload } from '../media-upload';
import { default as MediaUploadCheck } from '../media-upload/check';

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
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import LinkEditor from '../url-popover/link-editor';

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
				<LinkEditor
					className=""
					value={ mediaURLValue }
					isFullWidth={ true }
					onChangeInputValue={ ( url ) => ( setMediaURLValue( url ) ) }
					onSubmit={ ( event ) => {
						event.preventDefault();
						selectURL( mediaURLValue );
						setURLinput( ! URLinput );
					} }
				/>
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
								className={ 'media-flow_toolbar' }
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
