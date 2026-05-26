<?php
/*
 * Plugin Name: Shear Site Images V5
 * Description: ACF Options Page "Site Images" + public REST endpoint returning image URLs.
 * Version:     5.0.0
 * Author:      Shear Madness Hoboken
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ---------------------------------------------------------------------------
// 1. Register ACF Options Page
// ---------------------------------------------------------------------------
add_action( 'acf/init', 'shear_v5_register_options_page' );

function shear_v5_register_options_page() {
    if ( ! function_exists( 'acf_add_options_page' ) ) return;

    acf_add_options_page( array(
        'page_title' => 'Site Images',
        'menu_title' => 'Site Images',
        'menu_slug'  => 'site-images',
        'capability' => 'edit_posts',
        'redirect'   => false,
    ) );
}

// ---------------------------------------------------------------------------
// 2. REST endpoint
// ---------------------------------------------------------------------------
add_action( 'rest_api_init', 'shear_v5_register_route' );

function shear_v5_register_route() {
    register_rest_route( 'shear/v1', '/site-images', array(
        'methods'             => 'GET',
        'callback'            => 'shear_v5_handler',
        'permission_callback' => '__return_true',
    ) );
}

// ---------------------------------------------------------------------------
// 3. Helpers
// ---------------------------------------------------------------------------
function shear_v5_resolve_url( $v ) {
    if ( empty( $v ) ) return null;

    if ( is_string( $v ) && filter_var( $v, FILTER_VALIDATE_URL ) ) {
        return esc_url_raw( $v );
    }

    if ( is_numeric( $v ) ) {
        $url = wp_get_attachment_url( (int) $v );
        return $url ? esc_url_raw( $url ) : null;
    }

    if ( is_array( $v ) ) {
        if ( ! empty( $v['url'] ) && filter_var( $v['url'], FILTER_VALIDATE_URL ) ) {
            return esc_url_raw( $v['url'] );
        }
        if ( ! empty( $v['ID'] ) && is_numeric( $v['ID'] ) ) {
            $url = wp_get_attachment_url( (int) $v['ID'] );
            return $url ? esc_url_raw( $url ) : null;
        }
    }

    return null;
}

function shear_v5_resolve_gallery( $items ) {
    if ( empty( $items ) || ! is_array( $items ) ) return array();

    $urls = array();
    foreach ( $items as $item ) {
        $url = shear_v5_resolve_url( $item );
        if ( $url ) $urls[] = $url;
    }
    return $urls;
}

// ---------------------------------------------------------------------------
// 4. Handler
// ---------------------------------------------------------------------------
function shear_v5_handler() {
    $img = function ( $name ) {
        return shear_v5_resolve_url( get_field( $name, 'option' ) );
    };

    $gallery = function ( $name ) {
        return shear_v5_resolve_gallery( get_field( $name, 'option' ) );
    };

    $response = new WP_REST_Response( array(
        'hero_background_image'    => $img( 'hero_background_image' ),
        'about_background_image'   => $img( 'about_background_image' ),
        'about_us_images'          => $gallery( 'about_us_images' ),
        'artist_background_image'  => $img( 'artist_background_image' ),
        'oscar_artist_image'       => $img( 'oscar_artist_image' ),
        'george_artist_image'      => $img( 'george_artist_image' ),
        'booking_background_image' => $img( 'booking_background_image' ),
        'join_background_image'    => $img( 'join_background_image' ),
        'gallery_background_image' => $img( 'gallery_background_image' ),
        'contact_background_image' => $img( 'contact_background_image' ),
        'gallery_images'           => $gallery( 'gallery_images' ),
    ), 200 );

    $response->header( 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30' );
    return $response;
}
