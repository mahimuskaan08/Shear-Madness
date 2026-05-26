<?php
/*
 * Plugin Name: Shear Site Images Fixed
 * Description: Public REST endpoint returning ACF image fields from the homepage.
 * Version:     1.0.0
 * Author:      Shear Madness Hoboken
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', 'shear_smf_register_route' );

function shear_smf_register_route() {
    register_rest_route( 'shear/v1', '/site-images', array(
        'methods'             => 'GET',
        'callback'            => 'shear_smf_handler',
        'permission_callback' => '__return_true',
    ) );
}

function shear_smf_handler() {
    $page_id = (int) get_option( 'page_on_front' );
    if ( ! $page_id ) {
        $p = get_page_by_path( 'home', OBJECT, 'page' );
        $page_id = $p ? (int) $p->ID : 0;
    }

    $img = function ( $name ) use ( $page_id ) {
        $v = get_field( $name, $page_id );
        if ( empty( $v ) ) return null;
        if ( is_string( $v ) ) {
            return filter_var( $v, FILTER_VALIDATE_URL ) ? esc_url_raw( $v ) : null;
        }
        if ( is_array( $v ) && ! empty( $v['url'] ) ) {
            return filter_var( $v['url'], FILTER_VALIDATE_URL ) ? esc_url_raw( $v['url'] ) : null;
        }
        return null;
    };

    $gallery = function ( $name ) use ( $page_id ) {
        $items = get_field( $name, $page_id );
        if ( empty( $items ) || ! is_array( $items ) ) return array();
        $urls = array();
        foreach ( $items as $item ) {
            if ( is_string( $item ) && filter_var( $item, FILTER_VALIDATE_URL ) ) {
                $urls[] = esc_url_raw( $item );
            } elseif ( is_array( $item ) && ! empty( $item['url'] ) && filter_var( $item['url'], FILTER_VALIDATE_URL ) ) {
                $urls[] = esc_url_raw( $item['url'] );
            }
        }
        return $urls;
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
