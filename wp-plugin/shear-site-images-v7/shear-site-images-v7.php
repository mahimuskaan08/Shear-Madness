<?php
/**
 * Plugin Name: Shear Site Images V7
 * Plugin URI:  https://shearmadnesshoboken.com
 * Description: Manage site images and business info for Shear Madness Hoboken via a dedicated admin page and REST API.
 * Version:     7.0.0
 * Author:      Shear Madness Hoboken
 * License:     GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ─── Constants ────────────────────────────────────────────────────────────────

define( 'SSI_OPTION_KEY',   'shear_site_images' );
define( 'SSI_REST_NS',      'shear/v1' );
define( 'SSI_REST_ROUTE',   'site-images' );
define( 'SSI_NONCE_ACTION', 'ssi_save_images' );
define( 'SSI_NONCE_NAME',   'ssi_nonce' );

// ─── Field definitions ────────────────────────────────────────────────────────

function ssi_single_fields() {
    return [
        'hero_background_image'           => 'Hero Background Image',
        'about_background_image'          => 'About Background Image',
        'artist_background_image'         => 'Artist Background Image',
        'oscar_artist_image'              => 'Oscar Artist Image',
        'george_artist_image'             => 'George Artist Image',
        'booking_background_image'        => 'Booking Background Image',
        'join_background_image'           => 'Join Us Background Image',
        'gallery_background_image'        => 'Gallery Background Image',
        'contact_background_image'        => 'Contact Background Image',
        'credits_background_image'        => 'Credits Background Image',
        'services_page_background_image'  => 'Services Page Background Image',
    ];
}

function ssi_gallery_fields() {
    return [
        'about_us_images' => 'About Us Images',
        'gallery_images'  => 'Gallery Images',
    ];
}

function ssi_text_fields() {
    return [
        'site_phone'          => 'Phone Number',
        'site_email'          => 'Email Address',
        'site_address_line_1' => 'Address Line 1',
        'site_city_state_zip' => 'City, State, ZIP',
        'hours_tue_thu'       => 'Hours — Tue – Thu',
        'hours_fri'           => 'Hours — Fri',
        'hours_sat'           => 'Hours — Sat',
        'hours_sun_mon'       => 'Hours — Sun – Mon',
        'google_maps_url'     => 'Google Maps / Directions URL',
    ];
}

// ─── Admin menu ───────────────────────────────────────────────────────────────

add_action( 'admin_menu', 'ssi_add_menu' );

function ssi_add_menu() {
    add_menu_page(
        'Site Images',
        'Site Images',
        'manage_options',
        'shear-site-images',
        'ssi_render_page',
        'dashicons-format-image',
        80
    );
}

// ─── Enqueue assets ───────────────────────────────────────────────────────────

add_action( 'admin_enqueue_scripts', 'ssi_enqueue' );

function ssi_enqueue( $hook ) {
    if ( $hook !== 'toplevel_page_shear-site-images' ) return;
    wp_enqueue_media();
}

// ─── Save handler ─────────────────────────────────────────────────────────────

add_action( 'admin_post_ssi_save', 'ssi_save' );

function ssi_save() {
    if ( ! current_user_can( 'manage_options' ) ) wp_die( 'Unauthorised', 403 );
    check_admin_referer( SSI_NONCE_ACTION, SSI_NONCE_NAME );

    $stored = get_option( SSI_OPTION_KEY, [] );
    if ( ! is_array( $stored ) ) $stored = [];

    // Single images
    foreach ( ssi_single_fields() as $key => $label ) {
        if ( isset( $_POST[ $key ] ) && $_POST[ $key ] !== '' ) {
            $id = absint( $_POST[ $key ] );
            $stored[ $key ] = $id > 0 ? $id : null;
        } else {
            $stored[ $key ] = null;
        }
    }

    // Gallery images
    foreach ( ssi_gallery_fields() as $key => $label ) {
        if ( ! empty( $_POST[ $key ] ) && is_array( $_POST[ $key ] ) ) {
            $stored[ $key ] = array_values( array_filter( array_map( 'absint', $_POST[ $key ] ) ) );
        } else {
            $stored[ $key ] = [];
        }
    }

    // Text fields
    foreach ( ssi_text_fields() as $key => $label ) {
        $raw = isset( $_POST[ $key ] ) ? trim( $_POST[ $key ] ) : '';
        if ( $key === 'site_email' ) {
            $stored[ $key ] = sanitize_email( $raw );
        } elseif ( $key === 'google_maps_url' ) {
            $stored[ $key ] = esc_url_raw( $raw );
        } else {
            $stored[ $key ] = sanitize_text_field( $raw );
        }
    }

    update_option( SSI_OPTION_KEY, $stored );

    wp_safe_redirect( add_query_arg( [ 'page' => 'shear-site-images', 'saved' => '1' ], admin_url( 'admin.php' ) ) );
    exit;
}

// ─── Admin page ───────────────────────────────────────────────────────────────

function ssi_render_page() {
    if ( ! current_user_can( 'manage_options' ) ) wp_die( 'Unauthorised' );

    $s     = get_option( SSI_OPTION_KEY, [] );
    if ( ! is_array( $s ) ) $s = [];
    $saved = ! empty( $_GET['saved'] );
    ?>
    <div class="wrap" style="max-width:1100px">
        <h1 style="margin-bottom:6px">Site Images</h1>
        <p style="color:#555;margin-bottom:20px">Upload or replace website images and update business information. Click <strong>Save Site Images</strong> when done.</p>

        <?php if ( $saved ) : ?>
            <div class="notice notice-success is-dismissible"><p>Saved successfully.</p></div>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
            <?php wp_nonce_field( SSI_NONCE_ACTION, SSI_NONCE_NAME ); ?>
            <input type="hidden" name="action" value="ssi_save">

            <!-- ── SINGLE IMAGES ──────────────────────────────────────── -->
            <h2>Single Images</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin-bottom:32px">
                <?php foreach ( ssi_single_fields() as $key => $label ) :
                    $id    = ! empty( $s[ $key ] ) ? absint( $s[ $key ] ) : 0;
                    $thumb = $id ? wp_get_attachment_image_url( $id, 'thumbnail' ) : '';
                    ?>
                    <div id="ssi-field-<?php echo esc_attr( $key ); ?>" style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:16px">
                        <label style="display:block;font-weight:600;margin-bottom:10px"><?php echo esc_html( $label ); ?></label>
                        <input type="hidden" name="<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $id ?: '' ); ?>" class="ssi-id">
                        <div class="ssi-thumb" style="margin-bottom:10px">
                            <?php if ( $thumb ) : ?><img src="<?php echo esc_url( $thumb ); ?>" style="max-width:100%;max-height:130px;border-radius:4px;display:block" alt=""><?php endif; ?>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap">
                            <button type="button" class="button ssi-pick" data-field="<?php echo esc_attr( $key ); ?>">
                                <?php echo $id ? 'Replace Image' : 'Upload / Select Image'; ?>
                            </button>
                            <button type="button" class="button ssi-rm" data-field="<?php echo esc_attr( $key ); ?>" style="<?php echo $id ? '' : 'display:none'; ?>">Remove</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- ── GALLERY IMAGES ─────────────────────────────────────── -->
            <h2>Gallery / Multiple Images</h2>
            <?php foreach ( ssi_gallery_fields() as $key => $label ) :
                $ids = ! empty( $s[ $key ] ) && is_array( $s[ $key ] ) ? $s[ $key ] : [];
                ?>
                <div id="ssi-g-<?php echo esc_attr( $key ); ?>" style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:20px;margin-bottom:20px">
                    <h3 style="margin:0 0 12px"><?php echo esc_html( $label ); ?></h3>
                    <div class="ssi-gids">
                        <?php foreach ( $ids as $id ) : ?>
                            <input type="hidden" name="<?php echo esc_attr( $key ); ?>[]" value="<?php echo esc_attr( absint( $id ) ); ?>">
                        <?php endforeach; ?>
                    </div>
                    <div class="ssi-gthumbs" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px">
                        <?php foreach ( $ids as $id ) :
                            $t = wp_get_attachment_image_url( absint( $id ), 'thumbnail' );
                            if ( $t ) :
                                ?>
                                <div class="ssi-twrap" data-id="<?php echo esc_attr( absint( $id ) ); ?>" style="position:relative">
                                    <img src="<?php echo esc_url( $t ); ?>" style="width:88px;height:88px;object-fit:cover;border-radius:4px;display:block" alt="">
                                    <button type="button" class="ssi-trm" title="Remove" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:14px;line-height:18px;text-align:center;cursor:pointer;padding:0">&times;</button>
                                </div>
                            <?php endif;
                        endforeach; ?>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                        <button type="button" class="button ssi-gadd" data-field="<?php echo esc_attr( $key ); ?>">Select / Add Images</button>
                        <button type="button" class="button ssi-gclear" data-field="<?php echo esc_attr( $key ); ?>">Clear All</button>
                    </div>
                </div>
            <?php endforeach; ?>

            <!-- ── BUSINESS INFORMATION ───────────────────────────────── -->
            <h2 style="margin-top:32px">Business Information <span style="font-size:.9rem;font-weight:400;color:#888">(Optional — leave blank to keep website defaults)</span></h2>
            <table class="form-table" style="max-width:680px">
                <?php foreach ( ssi_text_fields() as $key => $label ) :
                    $val = isset( $s[ $key ] ) ? $s[ $key ] : '';
                    $type = 'text';
                    if ( $key === 'site_email' ) $type = 'email';
                    if ( $key === 'google_maps_url' ) $type = 'url';
                    if ( $key === 'site_phone' ) $type = 'tel';
                    ?>
                    <tr>
                        <th scope="row"><label for="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
                        <td>
                            <input type="<?php echo esc_attr( $type ); ?>"
                                   id="<?php echo esc_attr( $key ); ?>"
                                   name="<?php echo esc_attr( $key ); ?>"
                                   value="<?php echo esc_attr( $val ); ?>"
                                   class="regular-text">
                            <?php if ( strpos( $key, 'hours_' ) === 0 ) : ?>
                                <p class="description">e.g. 10:00 am – 9:00 pm &nbsp;or&nbsp; Closed</p>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </table>

            <p style="margin-top:24px">
                <button type="submit" class="button button-primary button-large">Save Site Images</button>
            </p>
        </form>
    </div>

    <script>
    (function($){
        // Single image picker
        $(document).on('click', '.ssi-pick', function(){
            var field = $(this).data('field');
            var wrap  = $('#ssi-field-' + field);
            wp.media({ title:'Select Image', multiple:false, library:{type:'image'}, button:{text:'Use This Image'} })
              .on('select', function(){
                  var a = this.state().get('selection').first().toJSON();
                  wrap.find('.ssi-id').val(a.id);
                  var t = (a.sizes && a.sizes.thumbnail) ? a.sizes.thumbnail.url : a.url;
                  wrap.find('.ssi-thumb').html('<img src="'+t+'" style="max-width:100%;max-height:130px;border-radius:4px;display:block" alt="">');
                  wrap.find('.ssi-pick').text('Replace Image');
                  wrap.find('.ssi-rm').show();
              }).open();
        });

        $(document).on('click', '.ssi-rm', function(){
            var wrap = $('#ssi-field-' + $(this).data('field'));
            wrap.find('.ssi-id').val('');
            wrap.find('.ssi-thumb').html('');
            wrap.find('.ssi-pick').text('Upload / Select Image');
            $(this).hide();
        });

        // Gallery picker
        $(document).on('click', '.ssi-gadd', function(){
            var field = $(this).data('field');
            var wrap  = $('#ssi-g-' + field);
            wp.media({ title:'Select Images', multiple:'add', library:{type:'image'}, button:{text:'Add Selected'} })
              .on('select', function(){
                  this.state().get('selection').each(function(a){
                      a = a.toJSON();
                      if (wrap.find('.ssi-gids input[value="'+a.id+'"]').length) return;
                      wrap.find('.ssi-gids').append('<input type="hidden" name="'+field+'[]" value="'+a.id+'">');
                      var t = (a.sizes && a.sizes.thumbnail) ? a.sizes.thumbnail.url : a.url;
                      wrap.find('.ssi-gthumbs').append(
                          '<div class="ssi-twrap" data-id="'+a.id+'" style="position:relative">'
                          +'<img src="'+t+'" style="width:88px;height:88px;object-fit:cover;border-radius:4px;display:block" alt="">'
                          +'<button type="button" class="ssi-trm" title="Remove" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:14px;line-height:18px;text-align:center;cursor:pointer;padding:0">&times;</button>'
                          +'</div>'
                      );
                  });
              }).open();
        });

        $(document).on('click', '.ssi-trm', function(){
            var wrap  = $(this).closest('.ssi-twrap');
            var id    = wrap.data('id');
            var gwrap = wrap.closest('[id^="ssi-g-"]');
            var field = gwrap.attr('id').replace('ssi-g-','');
            gwrap.find('.ssi-gids input[value="'+id+'"]').remove();
            wrap.remove();
        });

        $(document).on('click', '.ssi-gclear', function(){
            var wrap = $('#ssi-g-' + $(this).data('field'));
            wrap.find('.ssi-gids').html('');
            wrap.find('.ssi-gthumbs').html('');
        });
    })(jQuery);
    </script>
    <?php
}

// ─── REST endpoint ────────────────────────────────────────────────────────────

add_action( 'rest_api_init', 'ssi_rest' );

function ssi_rest() {
    register_rest_route( SSI_REST_NS, '/' . SSI_REST_ROUTE, [
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'ssi_response',
        'permission_callback' => '__return_true',
    ] );
}

function ssi_response() {
    $s = get_option( SSI_OPTION_KEY, [] );
    if ( ! is_array( $s ) ) $s = [];

    $out = [];

    // Single image fields → URL or null
    foreach ( ssi_single_fields() as $key => $label ) {
        $id      = ! empty( $s[ $key ] ) ? absint( $s[ $key ] ) : 0;
        $url     = $id ? wp_get_attachment_url( $id ) : false;
        $out[ $key ] = ( $url && is_string( $url ) ) ? $url : null;
    }

    // Gallery fields → array of URLs
    foreach ( ssi_gallery_fields() as $key => $label ) {
        $ids  = ! empty( $s[ $key ] ) && is_array( $s[ $key ] ) ? $s[ $key ] : [];
        $urls = [];
        foreach ( $ids as $id ) {
            $url = wp_get_attachment_url( absint( $id ) );
            if ( $url ) $urls[] = $url;
        }
        $out[ $key ] = $urls;
    }

    // Text fields → string or ''
    foreach ( ssi_text_fields() as $key => $label ) {
        $val = isset( $s[ $key ] ) ? (string) $s[ $key ] : '';
        $out[ $key ] = $val;
    }

    return rest_ensure_response( $out );
}
