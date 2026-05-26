<?php
/*
 * Plugin Name: Shear Site Images V6
 * Description: Site images and business info. REST endpoint at /wp-json/shear/v1/site-images.
 * Version:     6.1.0
 * Author:      Shear Madness Hoboken
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'SHEAR_V6_OPT', 'shear_site_images' );

// ── ADMIN MENU ────────────────────────────────────────────────────────────────

add_action( 'admin_menu', 'shear_v6_menu' );
function shear_v6_menu() {
    add_menu_page(
        'Site Images', 'Site Images', 'manage_options',
        'shear-site-images', 'shear_v6_page',
        'dashicons-format-gallery', 20
    );
}

// ── SCRIPTS ───────────────────────────────────────────────────────────────────

add_action( 'admin_enqueue_scripts', 'shear_v6_enqueue' );
function shear_v6_enqueue( $hook ) {
    if ( $hook !== 'toplevel_page_shear-site-images' ) return;
    wp_enqueue_media();
}

add_action( 'admin_footer', 'shear_v6_footer_js' );
function shear_v6_footer_js() {
    $screen = get_current_screen();
    if ( ! $screen || $screen->id !== 'toplevel_page_shear-site-images' ) return;
    ?>
<script>
jQuery(function ($) {

    /* ── Single image picker ── */
    $(document).on('click', '.shear-pick', function (e) {
        e.preventDefault();
        var key = $(this).data('key');
        var frame = wp.media({ title: 'Select Image', multiple: false, library: { type: 'image' } });
        frame.on('select', function () {
            var url = frame.state().get('selection').first().toJSON().url;
            $('#shear_url_' + key).val(url);
            $('#shear_prev_' + key).attr('src', url).show();
            $('#shear_rm_' + key).show();
        });
        frame.open();
    });

    $(document).on('click', '.shear-rm', function (e) {
        e.preventDefault();
        var key = $(this).data('key');
        $('#shear_url_' + key).val('');
        $('#shear_prev_' + key).hide();
        $(this).hide();
    });

    /* ── Gallery picker ── */
    $(document).on('click', '.shear-gall-pick', function (e) {
        e.preventDefault();
        var key = $(this).data('key');
        var frame = wp.media({ title: 'Add Images', multiple: true, library: { type: 'image' } });
        frame.on('select', function () {
            frame.state().get('selection').each(function (att) {
                shearGallAdd(key, att.toJSON().url);
            });
            shearGallSync(key);
        });
        frame.open();
    });

    $(document).on('click', '.shear-gall-rm', function (e) {
        e.preventDefault();
        var key = $(this).data('key');
        $(this).closest('.shear-gi').remove();
        shearGallSync(key);
    });

    function shearGallAdd(key, url) {
        var item = $('<div class="shear-gi" style="display:inline-block;margin:4px;position:relative;">' +
            '<img src="' + url + '" style="width:80px;height:80px;object-fit:cover;border:1px solid #ccc;" />' +
            '<button type="button" class="shear-gall-rm" data-key="' + key + '" ' +
            'style="position:absolute;top:0;right:0;background:#cc0000;color:#fff;' +
            'border:none;cursor:pointer;line-height:1;padding:2px 5px;font-size:13px;">&times;</button>' +
            '<input type="hidden" class="shear-gall-url" value="' + url + '" />' +
            '</div>');
        $('#shear_gall_' + key).append(item);
    }

    function shearGallSync(key) {
        var urls = [];
        $('#shear_gall_' + key + ' .shear-gall-url').each(function () {
            urls.push($(this).val());
        });
        $('#shear_gjson_' + key).val(JSON.stringify(urls));
    }
});
</script>
    <?php
}

// ── RENDER HELPERS ────────────────────────────────────────────────────────────

function shear_v6_img_row( $key, $label, $data ) {
    $url = isset( $data[ $key ] ) ? $data[ $key ] : '';
    $has = ! empty( $url );
    ?>
    <tr>
        <th><label for="shear_url_<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
        <td>
            <input type="hidden" id="shear_url_<?php echo esc_attr( $key ); ?>"
                   name="<?php echo esc_attr( $key ); ?>"
                   value="<?php echo esc_attr( $url ); ?>" />
            <img id="shear_prev_<?php echo esc_attr( $key ); ?>"
                 src="<?php echo esc_attr( $url ); ?>"
                 style="display:<?php echo $has ? 'block' : 'none'; ?>;max-width:220px;max-height:130px;margin-bottom:6px;border:1px solid #ddd;" />
            <button type="button" class="button shear-pick" data-key="<?php echo esc_attr( $key ); ?>">Select Image</button>
            <button type="button" id="shear_rm_<?php echo esc_attr( $key ); ?>"
                    class="button shear-rm" data-key="<?php echo esc_attr( $key ); ?>"
                    style="<?php echo $has ? '' : 'display:none;'; ?>">Remove</button>
            <p class="description">Leave empty to use the site default.</p>
        </td>
    </tr>
    <?php
}

function shear_v6_gallery_row( $key, $label, $data ) {
    $urls = isset( $data[ $key ] ) && is_array( $data[ $key ] ) ? $data[ $key ] : array();
    ?>
    <tr>
        <th><?php echo esc_html( $label ); ?></th>
        <td>
            <div id="shear_gall_<?php echo esc_attr( $key ); ?>" style="margin-bottom:8px;">
                <?php foreach ( $urls as $url ) : ?>
                    <div class="shear-gi" style="display:inline-block;margin:4px;position:relative;">
                        <img src="<?php echo esc_attr( $url ); ?>"
                             style="width:80px;height:80px;object-fit:cover;border:1px solid #ccc;" />
                        <button type="button" class="shear-gall-rm" data-key="<?php echo esc_attr( $key ); ?>"
                                style="position:absolute;top:0;right:0;background:#cc0000;color:#fff;
                                       border:none;cursor:pointer;line-height:1;padding:2px 5px;font-size:13px;">&times;</button>
                        <input type="hidden" class="shear-gall-url" value="<?php echo esc_attr( $url ); ?>" />
                    </div>
                <?php endforeach; ?>
            </div>
            <input type="hidden" id="shear_gjson_<?php echo esc_attr( $key ); ?>"
                   name="<?php echo esc_attr( $key ); ?>_json"
                   value="<?php echo esc_attr( json_encode( $urls ) ); ?>" />
            <button type="button" class="button shear-gall-pick" data-key="<?php echo esc_attr( $key ); ?>">Add Images</button>
            <p class="description">Leave empty to use the site default.</p>
        </td>
    </tr>
    <?php
}

function shear_v6_text_row( $key, $label, $data, $type = 'text' ) {
    $val = isset( $data[ $key ] ) ? $data[ $key ] : '';
    ?>
    <tr>
        <th><label for="shear_txt_<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
        <td>
            <input type="<?php echo esc_attr( $type ); ?>"
                   id="shear_txt_<?php echo esc_attr( $key ); ?>"
                   name="<?php echo esc_attr( $key ); ?>"
                   value="<?php echo esc_attr( $val ); ?>"
                   class="regular-text" />
        </td>
    </tr>
    <?php
}

// ── SAVE ─────────────────────────────────────────────────────────────────────

function shear_v6_save() {
    $data = get_option( SHEAR_V6_OPT, array() );
    if ( ! is_array( $data ) ) $data = array();

    // Single image fields
    $single = array(
        'hero_background_image', 'about_background_image', 'artist_background_image',
        'oscar_artist_image', 'george_artist_image', 'booking_background_image',
        'join_background_image', 'gallery_background_image', 'contact_background_image',
        'credits_background_image', 'services_page_background_image',
    );
    foreach ( $single as $key ) {
        if ( isset( $_POST[ $key ] ) ) {
            $url = esc_url_raw( trim( $_POST[ $key ] ) );
            $data[ $key ] = filter_var( $url, FILTER_VALIDATE_URL ) ? $url : '';
        }
    }

    // Gallery fields (read from JSON hidden input)
    foreach ( array( 'about_us_images', 'gallery_images' ) as $key ) {
        $raw  = isset( $_POST[ $key . '_json' ] ) ? wp_unslash( $_POST[ $key . '_json' ] ) : '[]';
        $list = json_decode( $raw, true );
        $clean = array();
        if ( is_array( $list ) ) {
            foreach ( $list as $u ) {
                $u = esc_url_raw( trim( $u ) );
                if ( filter_var( $u, FILTER_VALIDATE_URL ) ) $clean[] = $u;
            }
        }
        $data[ $key ] = $clean;
    }

    // Text fields
    foreach ( array( 'site_phone', 'site_address_line_1', 'site_city_state_zip',
                     'hours_tue_thu', 'hours_fri', 'hours_sat', 'hours_sun_mon' ) as $key ) {
        $data[ $key ] = isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';
    }
    $data['site_email']      = isset( $_POST['site_email'] )      ? sanitize_email( wp_unslash( $_POST['site_email'] ) )            : '';
    $data['google_maps_url'] = isset( $_POST['google_maps_url'] ) ? esc_url_raw( wp_unslash( $_POST['google_maps_url'] ) )          : '';

    update_option( SHEAR_V6_OPT, $data );
}

// ── ADMIN PAGE ────────────────────────────────────────────────────────────────

function shear_v6_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;

    $saved = false;
    if ( isset( $_POST['shear_v6_submit'] ) && check_admin_referer( 'shear_v6_save', 'shear_v6_nonce' ) ) {
        shear_v6_save();
        $saved = true;
    }

    $data = get_option( SHEAR_V6_OPT, array() );
    if ( ! is_array( $data ) ) $data = array();
    ?>
    <div class="wrap">
        <h1>Site Images</h1>
        <?php if ( $saved ) : ?>
            <div class="notice notice-success is-dismissible"><p><strong>Saved.</strong></p></div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field( 'shear_v6_save', 'shear_v6_nonce' ); ?>

            <h2 class="title">Single Images</h2>
            <p>Leave any field empty to keep the current site default image.</p>
            <table class="form-table" role="presentation">
                <?php
                shear_v6_img_row( 'hero_background_image',          'Hero Background',             $data );
                shear_v6_img_row( 'about_background_image',         'About Background',            $data );
                shear_v6_img_row( 'artist_background_image',        'Artist Section Background',   $data );
                shear_v6_img_row( 'oscar_artist_image',             'Oscar Portrait',              $data );
                shear_v6_img_row( 'george_artist_image',            'George Portrait',             $data );
                shear_v6_img_row( 'booking_background_image',       'Booking Page Background',     $data );
                shear_v6_img_row( 'join_background_image',          'Join Us Page Background',     $data );
                shear_v6_img_row( 'gallery_background_image',       'Gallery Page Background',     $data );
                shear_v6_img_row( 'contact_background_image',       'Contact Page Background',     $data );
                shear_v6_img_row( 'credits_background_image',       'Credits Page Background',     $data );
                shear_v6_img_row( 'services_page_background_image', 'Services Page Background',    $data );
                ?>
            </table>

            <h2 class="title">Gallery Images</h2>
            <table class="form-table" role="presentation">
                <?php
                shear_v6_gallery_row( 'about_us_images', 'About Us Carousel', $data );
                shear_v6_gallery_row( 'gallery_images',  'Gallery Images',    $data );
                ?>
            </table>

            <h2 class="title">Business Information</h2>
            <table class="form-table" role="presentation">
                <?php
                shear_v6_text_row( 'site_phone',          'Phone Number',    $data );
                shear_v6_text_row( 'site_email',          'Email Address',   $data, 'email' );
                shear_v6_text_row( 'site_address_line_1', 'Address Line 1',  $data );
                shear_v6_text_row( 'site_city_state_zip', 'City, State ZIP', $data );
                shear_v6_text_row( 'hours_tue_thu',       'Hours Tue-Thu',   $data );
                shear_v6_text_row( 'hours_fri',           'Hours Fri',       $data );
                shear_v6_text_row( 'hours_sat',           'Hours Sat',       $data );
                shear_v6_text_row( 'hours_sun_mon',       'Hours Sun-Mon',   $data );
                shear_v6_text_row( 'google_maps_url',     'Google Maps URL', $data );
                ?>
            </table>

            <p class="submit">
                <button type="submit" name="shear_v6_submit" class="button button-primary button-large">
                    Save Site Images
                </button>
            </p>
        </form>
    </div>
    <?php
}

// ── REST ENDPOINT ─────────────────────────────────────────────────────────────

add_action( 'rest_api_init', 'shear_v6_rest_init' );
function shear_v6_rest_init() {
    register_rest_route( 'shear/v1', '/site-images', array(
        'methods'             => 'GET',
        'callback'            => 'shear_v6_rest',
        'permission_callback' => '__return_true',
    ) );
}

function shear_v6_rest() {
    $data = get_option( SHEAR_V6_OPT, array() );
    if ( ! is_array( $data ) ) $data = array();

    $img = function ( $key ) use ( $data ) {
        $v = isset( $data[ $key ] ) ? $data[ $key ] : '';
        return ( $v && filter_var( $v, FILTER_VALIDATE_URL ) ) ? $v : null;
    };

    // about_us_images returns plain URL strings
    $url_list = function ( $key ) use ( $data ) {
        $v = isset( $data[ $key ] ) && is_array( $data[ $key ] ) ? $data[ $key ] : array();
        return array_values( array_filter( $v, function ( $u ) {
            return $u && filter_var( $u, FILTER_VALIDATE_URL );
        } ) );
    };

    // gallery_images returns {url, alt, title} objects to match frontend CmsGalleryImage type
    $gallery_objs = function ( $key ) use ( $data ) {
        $v   = isset( $data[ $key ] ) && is_array( $data[ $key ] ) ? $data[ $key ] : array();
        $out = array();
        foreach ( $v as $u ) {
            if ( $u && filter_var( $u, FILTER_VALIDATE_URL ) ) {
                $out[] = array( 'url' => $u, 'alt' => '', 'title' => '' );
            }
        }
        return $out;
    };

    $txt = function ( $key ) use ( $data ) {
        return isset( $data[ $key ] ) ? (string) $data[ $key ] : '';
    };

    $body = array(
        'hero_background_image'          => $img( 'hero_background_image' ),
        'about_background_image'         => $img( 'about_background_image' ),
        'artist_background_image'        => $img( 'artist_background_image' ),
        'oscar_artist_image'             => $img( 'oscar_artist_image' ),
        'george_artist_image'            => $img( 'george_artist_image' ),
        'booking_background_image'       => $img( 'booking_background_image' ),
        'join_background_image'          => $img( 'join_background_image' ),
        'gallery_background_image'       => $img( 'gallery_background_image' ),
        'contact_background_image'       => $img( 'contact_background_image' ),
        'credits_background_image'       => $img( 'credits_background_image' ),
        'services_page_background_image' => $img( 'services_page_background_image' ),
        'about_us_images'                => $url_list( 'about_us_images' ),
        'gallery_images'                 => $gallery_objs( 'gallery_images' ),
        'site_phone'                     => $txt( 'site_phone' ),
        'site_email'                     => $txt( 'site_email' ),
        'site_address_line_1'            => $txt( 'site_address_line_1' ),
        'site_city_state_zip'            => $txt( 'site_city_state_zip' ),
        'hours_tue_thu'                  => $txt( 'hours_tue_thu' ),
        'hours_fri'                      => $txt( 'hours_fri' ),
        'hours_sat'                      => $txt( 'hours_sat' ),
        'hours_sun_mon'                  => $txt( 'hours_sun_mon' ),
        'google_maps_url'                => $txt( 'google_maps_url' ),
    );

    $response = new WP_REST_Response( $body, 200 );
    $response->header( 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30' );
    return $response;
}
