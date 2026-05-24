<?php
/**
 * Plugin Name:  Shear Madness – Site Settings
 * Description:  ACF Options Page for global business information (name, hours,
 *               contact, social links). Exposes all fields via a public REST
 *               endpoint at /wp-json/shear/v1/settings for the Next.js frontend.
 * Version:      1.0.0
 * Author:       Shear Madness
 * License:      GPL-2.0-or-later
 *
 * SAFE TO INSTALL: This plugin only adds an admin page and a read-only REST
 * route. It does not modify any existing pages, posts, forms, settings, DNS,
 * or theme files. Deactivating it removes everything it adds with no side effects.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ── Guard: do nothing if ACF Pro is not active ────────────────────────────────
// All hooks are wrapped inside the 'acf/init' action so they only fire when
// ACF has fully loaded. If ACF is ever deactivated this plugin is silent.

add_action( 'acf/init', 'shear_register_options_page' );
add_action( 'acf/init', 'shear_register_settings_fields' );
add_action( 'rest_api_init', 'shear_register_rest_route' );


// ── 1. Options Page ───────────────────────────────────────────────────────────

function shear_register_options_page() {
    if ( ! function_exists( 'acf_add_options_page' ) ) return;

    acf_add_options_page( [
        'page_title' => 'Site Settings',
        'menu_title' => 'Site Settings',
        'menu_slug'  => 'shear-site-settings',
        'capability' => 'manage_options',   // admin-only
        'redirect'   => false,
        'icon_url'   => 'dashicons-admin-settings',
        'position'   => 2,                  // near top of WP admin sidebar
    ] );
}


// ── 2. ACF Field Group (defined in code — no JSON import needed) ──────────────

function shear_register_settings_fields() {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    acf_add_local_field_group( [
        'key'    => 'group_shear_site_settings',
        'title'  => 'Site Settings',
        'active' => true,

        // Attach to the options page we registered above
        'location' => [ [ [
            'param'    => 'options_page',
            'operator' => '==',
            'value'    => 'shear-site-settings',
        ] ] ],

        'fields' => [

            // ── Tab: Business Info ────────────────────────────────────────────
            [
                'key'   => 'field_tab_business',
                'label' => 'Business Info',
                'name'  => '',
                'type'  => 'tab',
            ],
            [
                'key'          => 'field_business_name',
                'label'        => 'Business Name',
                'name'         => 'business_name',
                'type'         => 'text',
                'instructions' => 'e.g. Shear Madness',
                'required'     => 0,
            ],
            [
                'key'          => 'field_business_tagline',
                'label'        => 'Business Tagline',
                'name'         => 'business_tagline',
                'type'         => 'text',
                'instructions' => 'e.g. Where Style Meets Balance',
                'required'     => 0,
            ],

            // ── Tab: Contact ──────────────────────────────────────────────────
            [
                'key'   => 'field_tab_contact',
                'label' => 'Contact',
                'name'  => '',
                'type'  => 'tab',
            ],
            [
                'key'          => 'field_phone_number',
                'label'        => 'Phone Number',
                'name'         => 'phone_number',
                'type'         => 'text',
                'instructions' => 'e.g. (201) 222-2102',
                'required'     => 0,
            ],
            [
                'key'          => 'field_email_address',
                'label'        => 'Email Address',
                'name'         => 'email_address',
                'type'         => 'email',
                'instructions' => 'e.g. info@shearmadnesshoboken.com',
                'required'     => 0,
            ],
            [
                'key'          => 'field_street_address',
                'label'        => 'Street Address',
                'name'         => 'street_address',
                'type'         => 'text',
                'instructions' => 'e.g. 80 Park Ave',
                'required'     => 0,
            ],
            [
                'key'          => 'field_city_state_zip',
                'label'        => 'City, State ZIP',
                'name'         => 'city_state_zip',
                'type'         => 'text',
                'instructions' => 'e.g. Hoboken, NJ 07030',
                'required'     => 0,
            ],
            [
                'key'          => 'field_google_maps_embed_url',
                'label'        => 'Google Maps Embed URL',
                'name'         => 'google_maps_embed_url',
                'type'         => 'url',
                'instructions' => 'Paste the full src URL from Google Maps → Share → Embed a map.',
                'required'     => 0,
            ],

            // ── Tab: Social ───────────────────────────────────────────────────
            [
                'key'   => 'field_tab_social',
                'label' => 'Social',
                'name'  => '',
                'type'  => 'tab',
            ],
            [
                'key'          => 'field_instagram_url',
                'label'        => 'Instagram URL',
                'name'         => 'instagram_url',
                'type'         => 'url',
                'instructions' => 'e.g. https://www.instagram.com/shearmadnesshoboken/',
                'required'     => 0,
            ],
            [
                'key'          => 'field_facebook_url',
                'label'        => 'Facebook URL',
                'name'         => 'facebook_url',
                'type'         => 'url',
                'instructions' => 'e.g. https://www.facebook.com/ShearMadnessHobokenNJ/',
                'required'     => 0,
            ],

            // ── Tab: Hours ────────────────────────────────────────────────────
            [
                'key'   => 'field_tab_hours',
                'label' => 'Hours',
                'name'  => '',
                'type'  => 'tab',
            ],
            [
                'key'          => 'field_monday_hours',
                'label'        => 'Monday',
                'name'         => 'monday_hours',
                'type'         => 'text',
                'instructions' => 'e.g. 10:00 AM – 9:00 PM   or   Closed',
                'placeholder'  => 'Closed',
                'required'     => 0,
            ],
            [
                'key'          => 'field_tuesday_hours',
                'label'        => 'Tuesday',
                'name'         => 'tuesday_hours',
                'type'         => 'text',
                'instructions' => 'e.g. 10:00 AM – 9:00 PM   or   Closed',
                'placeholder'  => 'Closed',
                'required'     => 0,
            ],
            [
                'key'          => 'field_wednesday_hours',
                'label'        => 'Wednesday',
                'name'         => 'wednesday_hours',
                'type'         => 'text',
                'instructions' => 'e.g. 10:00 AM – 9:00 PM   or   Closed',
                'placeholder'  => 'Closed',
                'required'     => 0,
            ],
            [
                'key'          => 'field_thursday_hours',
                'label'        => 'Thursday',
                'name'         => 'thursday_hours',
                'type'         => 'text',
                'instructions' => 'e.g. 10:00 AM – 9:00 PM   or   Closed',
                'placeholder'  => 'Closed',
                'required'     => 0,
            ],
            [
                'key'          => 'field_friday_hours',
                'label'        => 'Friday',
                'name'         => 'friday_hours',
                'type'         => 'text',
                'instructions' => 'e.g. 10:00 AM – 8:00 PM   or   Closed',
                'placeholder'  => 'Closed',
                'required'     => 0,
            ],
            [
                'key'          => 'field_saturday_hours',
                'label'        => 'Saturday',
                'name'         => 'saturday_hours',
                'type'         => 'text',
                'instructions' => 'e.g. 10:00 AM – 6:00 PM   or   Closed',
                'placeholder'  => 'Closed',
                'required'     => 0,
            ],
            [
                'key'          => 'field_sunday_hours',
                'label'        => 'Sunday',
                'name'         => 'sunday_hours',
                'type'         => 'text',
                'instructions' => 'e.g. Closed',
                'placeholder'  => 'Closed',
                'required'     => 0,
            ],

        ], // end fields
    ] );
}


// ── 3. REST API — GET /wp-json/shear/v1/settings ─────────────────────────────
//
// Public read-only endpoint. Returns all site settings as a single JSON object.
// No authentication required — this is public business information only.
// Used by the Next.js frontend to replace hardcoded strings.

function shear_register_rest_route() {
    register_rest_route( 'shear/v1', '/settings', [
        'methods'             => WP_REST_Server::READABLE,  // GET only
        'callback'            => 'shear_get_settings_response',
        'permission_callback' => '__return_true',           // public
    ] );
}

function shear_get_settings_response() {
    // ACF must be active for get_field() to exist
    if ( ! function_exists( 'get_field' ) ) {
        return new WP_Error(
            'acf_not_active',
            'ACF Pro is not active on this WordPress install.',
            [ 'status' => 500 ]
        );
    }

    // 'option' is the ACF options page context key
    $data = [
        'business_name'         => (string) ( get_field( 'business_name',         'option' ) ?: '' ),
        'business_tagline'      => (string) ( get_field( 'business_tagline',      'option' ) ?: '' ),
        'phone_number'          => (string) ( get_field( 'phone_number',          'option' ) ?: '' ),
        'email_address'         => (string) ( get_field( 'email_address',         'option' ) ?: '' ),
        'street_address'        => (string) ( get_field( 'street_address',        'option' ) ?: '' ),
        'city_state_zip'        => (string) ( get_field( 'city_state_zip',        'option' ) ?: '' ),
        'google_maps_embed_url' => (string) ( get_field( 'google_maps_embed_url', 'option' ) ?: '' ),
        'instagram_url'         => (string) ( get_field( 'instagram_url',         'option' ) ?: '' ),
        'facebook_url'          => (string) ( get_field( 'facebook_url',          'option' ) ?: '' ),
        'hours' => [
            'monday'    => (string) ( get_field( 'monday_hours',    'option' ) ?: '' ),
            'tuesday'   => (string) ( get_field( 'tuesday_hours',   'option' ) ?: '' ),
            'wednesday' => (string) ( get_field( 'wednesday_hours', 'option' ) ?: '' ),
            'thursday'  => (string) ( get_field( 'thursday_hours',  'option' ) ?: '' ),
            'friday'    => (string) ( get_field( 'friday_hours',    'option' ) ?: '' ),
            'saturday'  => (string) ( get_field( 'saturday_hours',  'option' ) ?: '' ),
            'sunday'    => (string) ( get_field( 'sunday_hours',    'option' ) ?: '' ),
        ],
    ];

    return rest_ensure_response( $data );
}
