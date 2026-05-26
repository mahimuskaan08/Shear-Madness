<?php
/**
 * Plugin Name: Shear Site Images V6
 * Plugin URI:  https://shearmadnesshoboken.com
 * Description: Manage site images for Shear Madness Hoboken via a dedicated admin page and REST API.
 * Version:     6.0.0
 * Author:      Shear Madness Hoboken
 * License:     GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ─── Constants ────────────────────────────────────────────────────────────────

define( 'SSI_OPTION_KEY', 'shear_site_images' );
define( 'SSI_REST_NAMESPACE', 'shear/v1' );
define( 'SSI_REST_ROUTE', 'site-images' );
define( 'SSI_NONCE_ACTION', 'ssi_save_images' );
define( 'SSI_NONCE_NAME', 'ssi_nonce' );

// ─── Field definitions ────────────────────────────────────────────────────────

function ssi_get_single_fields() {
    return [
        'hero_background_image'    => 'Hero Background Image',
        'about_background_image'   => 'About Background Image',
        'artist_background_image'  => 'Artist Background Image',
        'oscar_artist_image'       => 'Oscar Artist Image',
        'george_artist_image'      => 'George Artist Image',
        'booking_background_image' => 'Booking Background Image',
        'join_background_image'    => 'Join Background Image',
        'gallery_background_image' => 'Gallery Background Image',
        'contact_background_image' => 'Contact Background Image',
        'credits_background_image' => 'Credits Background Image',
    ];
}

function ssi_get_gallery_fields() {
    return [
        'about_us_images' => 'About Us Images',
        'gallery_images'  => 'Gallery Images',
    ];
}

// ─── Admin menu ───────────────────────────────────────────────────────────────

add_action( 'admin_menu', 'ssi_add_menu_page' );

function ssi_add_menu_page() {
    add_menu_page(
        'Site Images',
        'Site Images',
        'manage_options',
        'shear-site-images',
        'ssi_render_admin_page',
        'dashicons-format-image',
        80
    );
}

// ─── Enqueue admin assets ─────────────────────────────────────────────────────

add_action( 'admin_enqueue_scripts', 'ssi_enqueue_assets' );

function ssi_enqueue_assets( $hook ) {
    if ( $hook !== 'toplevel_page_shear-site-images' ) {
        return;
    }
    wp_enqueue_media();
    wp_enqueue_style(
        'ssi-admin',
        plugin_dir_url( __FILE__ ) . 'admin.css',
        [],
        '6.0.0'
    );
    wp_enqueue_script(
        'ssi-admin',
        plugin_dir_url( __FILE__ ) . 'admin.js',
        [ 'jquery', 'media-upload' ],
        '6.0.0',
        true
    );
}

// ─── Save handler ─────────────────────────────────────────────────────────────

add_action( 'admin_post_ssi_save', 'ssi_handle_save' );

function ssi_handle_save() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorised', 403 );
    }

    check_admin_referer( SSI_NONCE_ACTION, SSI_NONCE_NAME );

    $stored = get_option( SSI_OPTION_KEY, [] );
    if ( ! is_array( $stored ) ) {
        $stored = [];
    }

    foreach ( ssi_get_single_fields() as $key => $label ) {
        if ( isset( $_POST[ $key ] ) && $_POST[ $key ] !== '' ) {
            $id = absint( $_POST[ $key ] );
            $stored[ $key ] = $id > 0 ? $id : null;
        } else {
            $stored[ $key ] = null;
        }
    }

    foreach ( ssi_get_gallery_fields() as $key => $label ) {
        if ( ! empty( $_POST[ $key ] ) && is_array( $_POST[ $key ] ) ) {
            $stored[ $key ] = array_map( 'absint', $_POST[ $key ] );
            $stored[ $key ] = array_values( array_filter( $stored[ $key ] ) );
        } else {
            $stored[ $key ] = [];
        }
    }

    update_option( SSI_OPTION_KEY, $stored );

    wp_safe_redirect( add_query_arg( [ 'page' => 'shear-site-images', 'saved' => '1' ], admin_url( 'admin.php' ) ) );
    exit;
}

// ─── Admin page HTML ──────────────────────────────────────────────────────────

function ssi_render_admin_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorised' );
    }

    $stored = get_option( SSI_OPTION_KEY, [] );
    if ( ! is_array( $stored ) ) {
        $stored = [];
    }

    $saved = isset( $_GET['saved'] ) && $_GET['saved'] === '1';
    ?>
    <div class="wrap ssi-wrap">
        <h1>Site Images</h1>
        <p class="description">Upload or replace images used on the public website. Click <strong>Save Site Images</strong> when done.</p>

        <?php if ( $saved ) : ?>
            <div class="notice notice-success is-dismissible"><p>Images saved successfully.</p></div>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
            <?php wp_nonce_field( SSI_NONCE_ACTION, SSI_NONCE_NAME ); ?>
            <input type="hidden" name="action" value="ssi_save">

            <h2>Single Images</h2>
            <div class="ssi-grid">
                <?php foreach ( ssi_get_single_fields() as $key => $label ) :
                    $attachment_id = ! empty( $stored[ $key ] ) ? absint( $stored[ $key ] ) : 0;
                    $thumb = $attachment_id ? wp_get_attachment_image_url( $attachment_id, 'thumbnail' ) : '';
                    ?>
                    <div class="ssi-field" id="ssi-field-<?php echo esc_attr( $key ); ?>">
                        <label class="ssi-label"><?php echo esc_html( $label ); ?></label>
                        <input type="hidden"
                               name="<?php echo esc_attr( $key ); ?>"
                               value="<?php echo esc_attr( $attachment_id ?: '' ); ?>"
                               class="ssi-id-input">
                        <div class="ssi-preview">
                            <?php if ( $thumb ) : ?>
                                <img src="<?php echo esc_url( $thumb ); ?>" alt="">
                            <?php endif; ?>
                        </div>
                        <div class="ssi-buttons">
                            <button type="button" class="button ssi-upload-btn" data-field="<?php echo esc_attr( $key ); ?>">
                                <?php echo $attachment_id ? 'Replace Image' : 'Upload / Select Image'; ?>
                            </button>
                            <button type="button"
                                    class="button ssi-remove-btn"
                                    data-field="<?php echo esc_attr( $key ); ?>"
                                    style="<?php echo $attachment_id ? '' : 'display:none'; ?>">
                                Remove
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <h2>Gallery / Multiple Images</h2>
            <?php foreach ( ssi_get_gallery_fields() as $key => $label ) :
                $ids = ! empty( $stored[ $key ] ) && is_array( $stored[ $key ] ) ? $stored[ $key ] : [];
                ?>
                <div class="ssi-gallery-field" id="ssi-gallery-<?php echo esc_attr( $key ); ?>">
                    <h3><?php echo esc_html( $label ); ?></h3>
                    <div class="ssi-gallery-ids">
                        <?php foreach ( $ids as $id ) : ?>
                            <input type="hidden" name="<?php echo esc_attr( $key ); ?>[]" value="<?php echo esc_attr( absint( $id ) ); ?>">
                        <?php endforeach; ?>
                    </div>
                    <div class="ssi-gallery-thumbs">
                        <?php foreach ( $ids as $id ) :
                            $thumb = wp_get_attachment_image_url( absint( $id ), 'thumbnail' );
                            if ( $thumb ) :
                                ?>
                                <div class="ssi-thumb-wrap" data-id="<?php echo esc_attr( absint( $id ) ); ?>">
                                    <img src="<?php echo esc_url( $thumb ); ?>" alt="">
                                    <button type="button" class="ssi-remove-thumb" title="Remove">&times;</button>
                                </div>
                            <?php endif;
                        endforeach; ?>
                    </div>
                    <div class="ssi-buttons">
                        <button type="button" class="button ssi-gallery-btn" data-field="<?php echo esc_attr( $key ); ?>">
                            Select / Add Images
                        </button>
                        <button type="button" class="button ssi-gallery-clear" data-field="<?php echo esc_attr( $key ); ?>">
                            Clear All
                        </button>
                    </div>
                </div>
            <?php endforeach; ?>

            <p class="ssi-save-row">
                <button type="submit" class="button button-primary button-large">Save Site Images</button>
            </p>
        </form>
    </div>

    <style>
    .ssi-wrap h1 { margin-bottom: 8px; }
    .ssi-wrap .description { margin-bottom: 20px; color: #555; }
    .ssi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .ssi-field { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 16px; }
    .ssi-label { display: block; font-weight: 600; margin-bottom: 10px; }
    .ssi-preview img { max-width: 100%; max-height: 140px; border-radius: 4px; margin-bottom: 10px; display: block; }
    .ssi-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
    .ssi-gallery-field { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 20px; margin-bottom: 24px; }
    .ssi-gallery-field h3 { margin: 0 0 12px; }
    .ssi-gallery-thumbs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
    .ssi-thumb-wrap { position: relative; }
    .ssi-thumb-wrap img { width: 90px; height: 90px; object-fit: cover; border-radius: 4px; display: block; }
    .ssi-remove-thumb { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 14px; line-height: 18px; text-align: center; cursor: pointer; padding: 0; }
    .ssi-save-row { margin-top: 24px; }
    </style>

    <script>
    (function($){
        // Single image uploader
        $(document).on('click', '.ssi-upload-btn', function(){
            var field = $(this).data('field');
            var container = $('#ssi-field-' + field);
            var frame = wp.media({
                title: 'Select Image',
                multiple: false,
                library: { type: 'image' },
                button: { text: 'Use This Image' }
            });
            frame.on('select', function(){
                var attachment = frame.state().get('selection').first().toJSON();
                container.find('.ssi-id-input').val(attachment.id);
                var thumb = attachment.sizes && attachment.sizes.thumbnail
                    ? attachment.sizes.thumbnail.url
                    : attachment.url;
                container.find('.ssi-preview').html('<img src="' + thumb + '" alt="">');
                container.find('.ssi-upload-btn').text('Replace Image');
                container.find('.ssi-remove-btn').show();
            });
            frame.open();
        });

        $(document).on('click', '.ssi-remove-btn', function(){
            var field = $(this).data('field');
            var container = $('#ssi-field-' + field);
            container.find('.ssi-id-input').val('');
            container.find('.ssi-preview').html('');
            container.find('.ssi-upload-btn').text('Upload / Select Image');
            $(this).hide();
        });

        // Gallery uploader
        $(document).on('click', '.ssi-gallery-btn', function(){
            var field = $(this).data('field');
            var container = $('#ssi-gallery-' + field);
            var frame = wp.media({
                title: 'Select Images',
                multiple: 'add',
                library: { type: 'image' },
                button: { text: 'Add Selected Images' }
            });
            frame.on('select', function(){
                frame.state().get('selection').each(function(attachment){
                    var id = attachment.toJSON().id;
                    // avoid duplicates
                    if ( container.find('.ssi-gallery-ids input[value="' + id + '"]').length ) return;
                    container.find('.ssi-gallery-ids').append('<input type="hidden" name="' + field + '[]" value="' + id + '">');
                    var a = attachment.toJSON();
                    var thumb = a.sizes && a.sizes.thumbnail ? a.sizes.thumbnail.url : a.url;
                    container.find('.ssi-gallery-thumbs').append(
                        '<div class="ssi-thumb-wrap" data-id="' + id + '">' +
                        '<img src="' + thumb + '" alt="">' +
                        '<button type="button" class="ssi-remove-thumb" title="Remove">&times;</button>' +
                        '</div>'
                    );
                });
            });
            frame.open();
        });

        $(document).on('click', '.ssi-remove-thumb', function(){
            var wrap = $(this).closest('.ssi-thumb-wrap');
            var id = wrap.data('id');
            var container = wrap.closest('.ssi-gallery-field');
            container.find('.ssi-gallery-ids input[value="' + id + '"]').remove();
            wrap.remove();
        });

        $(document).on('click', '.ssi-gallery-clear', function(){
            var field = $(this).data('field');
            var container = $('#ssi-gallery-' + field);
            container.find('.ssi-gallery-ids').html('');
            container.find('.ssi-gallery-thumbs').html('');
        });
    })(jQuery);
    </script>
    <?php
}

// ─── REST API ─────────────────────────────────────────────────────────────────

add_action( 'rest_api_init', 'ssi_register_rest_route' );

function ssi_register_rest_route() {
    register_rest_route(
        SSI_REST_NAMESPACE,
        '/' . SSI_REST_ROUTE,
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'ssi_rest_response',
            'permission_callback' => '__return_true',
        ]
    );
}

function ssi_rest_response() {
    $stored = get_option( SSI_OPTION_KEY, [] );
    if ( ! is_array( $stored ) ) {
        $stored = [];
    }

    $response = [];

    foreach ( ssi_get_single_fields() as $key => $label ) {
        $id  = ! empty( $stored[ $key ] ) ? absint( $stored[ $key ] ) : 0;
        $url = $id ? wp_get_attachment_url( $id ) : null;
        $response[ $key ] = $url ?: null;
    }

    foreach ( ssi_get_gallery_fields() as $key => $label ) {
        $ids = ! empty( $stored[ $key ] ) && is_array( $stored[ $key ] ) ? $stored[ $key ] : [];
        $urls = [];
        foreach ( $ids as $id ) {
            $url = wp_get_attachment_url( absint( $id ) );
            if ( $url ) {
                $urls[] = $url;
            }
        }
        $response[ $key ] = $urls;
    }

    return rest_ensure_response( $response );
}
