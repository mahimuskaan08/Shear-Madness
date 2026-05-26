<?php
/*
 * Plugin Name: Shear Site Images V3
 * Description: Public REST endpoint returning ACF image fields from post ID 169.
 * Version:     3.0.0
 * Author:      Shear Madness Hoboken
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', 'shear_v3_register_route' );

function shear_v3_register_route() {
    register_rest_route( 'shear/v1', '/site-images', array(
        'methods'             => 'GET',
        'callback'            => 'shear_v3_handler',
        'permission_callback' => '__return_true',
    ) );
}

function shear_v3_resolve_image_url( $v ) {
    if ( empty( $v ) ) return null;
    // URL string
    if ( is_string( $v ) && filter_var( $v, FILTER_VALIDATE_URL ) ) {
        return esc_url_raw( $v );
    }
    // Attachment ID (integer or numeric string)
    if ( is_numeric( $v ) ) {
        $url = wp_get_attachment_url( (int) $v );
        return $url ? esc_url_raw( $url ) : null;
    }
    // Array with 'url' key
    if ( is_array( $v ) && ! empty( $v['url'] ) && filter_var( $v['url'], FILTER_VALIDATE_URL ) ) {
        return esc_url_raw( $v['url'] );
    }
    // Array with 'ID' key (attachment object as array)
    if ( is_array( $v ) && ! empty( $v['ID'] ) && is_numeric( $v['ID'] ) ) {
        $url = wp_get_attachment_url( (int) $v['ID'] );
        return $url ? esc_url_raw( $url ) : null;
    }
    return null;
}

function shear_v3_resolve_gallery_urls( $items ) {
    if ( empty( $items ) || ! is_array( $items ) ) return array();
    $urls = array();
    foreach ( $items as $item ) {
        $url = shear_v3_resolve_image_url( $item );
        if ( $url ) {
            $urls[] = $url;
        }
    }
    return $urls;
}

function shear_v3_handler() {
    $id = 169;

    $img = function ( $name ) use ( $id ) {
        return shear_v3_resolve_image_url( get_field( $name, $id ) );
    };

    $gallery = function ( $name ) use ( $id ) {
        return shear_v3_resolve_gallery_urls( get_field( $name, $id ) );
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
