<?php
/*
 * Plugin Name: Shear Site Images
 * Description: Public REST endpoint that reads ACF image fields from the homepage.
 * Version:     1.1.0
 * Author:      Shear Madness Hoboken
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', 'shear_register_site_images_route' );

function shear_register_site_images_route() {
    register_rest_route( 'shear/v1', '/site-images', array(
        'methods'             => 'GET',
        'callback'            => 'shear_site_images_handler',
        'permission_callback' => '__return_true',
    ) );
}

function shear_site_images_handler() {
    // Resolve the front page ID dynamically
    $page_id = (int) get_option( 'page_on_front' );
    if ( ! $page_id ) {
        $p = get_page_by_path( 'home', OBJECT, 'page' );
        $page_id = $p ? (int) $p->ID : 0;
    }

    // Single image field: return URL string or null
    $img = function( $name ) use ( $page_id ) {
        $v = get_field( $name, $page_id );
        if ( empty( $v ) ) return null;
        if ( is_string( $v ) ) {
            $url = esc_url_raw( $v );
            return ( filter_var( $url, FILTER_VALIDATE_URL ) ) ? $url : null;
        }
        if ( is_array( $v ) && ! empty( $v['url'] ) ) {
            $url = esc_url_raw( $v['url'] );
            return ( filter_var( $url, FILTER_VALIDATE_URL ) ) ? $url : null;
        }
        return null;
    };

    // Gallery field: return array of {url, alt, title} objects
    $gallery = function( $name ) use ( $page_id ) {
        $items = get_field( $name, $page_id );
        if ( empty( $items ) || ! is_array( $items ) ) return array();
        $out = array();
        foreach ( $items as $item ) {
            if ( is_string( $item ) ) {
                $url = esc_url_raw( $item );
                if ( filter_var( $url, FILTER_VALIDATE_URL ) ) {
                    $out[] = array( 'url' => $url, 'alt' => '', 'title' => '' );
                }
            } elseif ( is_array( $item ) && ! empty( $item['url'] ) ) {
                $url = esc_url_raw( $item['url'] );
                if ( filter_var( $url, FILTER_VALIDATE_URL ) ) {
                    $out[] = array(
                        'url'   => $url,
                        'alt'   => sanitize_text_field( isset( $item['alt'] )   ? $item['alt']   : '' ),
                        'title' => sanitize_text_field( isset( $item['title'] ) ? $item['title'] : '' ),
                    );
                }
            }
        }
        return $out;
    };

    // URL-only gallery (about carousel only needs URLs)
    $gallery_urls = function( $name ) use ( $gallery ) {
        $items = $gallery( $name );
        $urls  = array();
        foreach ( $items as $item ) {
            $urls[] = $item['url'];
        }
        return $urls;
    };

    $data = array(
        'hero_background_image'    => $img( 'hero_background_image' ),
        'about_background_image'   => $img( 'about_background_image' ),
        'about_us_images'          => $gallery_urls( 'about_us_images' ),
        'artist_background_image'  => $img( 'artist_background_image' ),
        'oscar_artist_image'       => $img( 'oscar_artist_image' ),
        'george_artist_image'      => $img( 'george_artist_image' ),
        'booking_background_image' => $img( 'booking_background_image' ),
        'join_background_image'    => $img( 'join_background_image' ),
        'gallery_background_image' => $img( 'gallery_background_image' ),
        'contact_background_image' => $img( 'contact_background_image' ),
        'gallery_images'           => $gallery( 'gallery_images' ),
    );

    $response = new WP_REST_Response( $data, 200 );
    $response->header( 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30' );
    return $response;
}
