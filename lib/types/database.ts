export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      backgrounds: {
        Row: {
          id: string
          section: string
          image_url: string | null
          image_path: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          section: string
          image_url?: string | null
          image_path?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          section?: string
          image_url?: string | null
          image_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          id: string
          url: string
          path: string
          thumbnail_url: string | null
          thumbnail_path: string | null
          multiangle_url: string | null
          multiangle_path: string | null
          alt: string
          title: string
          category: "women" | "men" | "both"
          featured: boolean
          display_order: number
          multi_angle_images: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          path: string
          thumbnail_url?: string | null
          thumbnail_path?: string | null
          multiangle_url?: string | null
          multiangle_path?: string | null
          alt?: string
          title?: string
          category: "women" | "men" | "both"
          featured?: boolean
          display_order?: number
          multi_angle_images?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          path?: string
          thumbnail_url?: string | null
          thumbnail_path?: string | null
          multiangle_url?: string | null
          multiangle_path?: string | null
          alt?: string
          title?: string
          category?: "women" | "men" | "both"
          featured?: boolean
          display_order?: number
          multi_angle_images?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          price: string
          category: "womens" | "mens" | "treatments" | "bridal"
          display_order: number
          is_visible: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: string
          category: "womens" | "mens" | "treatments" | "bridal"
          display_order?: number
          is_visible?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: string
          category?: "womens" | "mens" | "treatments" | "bridal"
          display_order?: number
          is_visible?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          name: string
          position: string
          bio: string
          image_url: string | null
          image_path: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          bio?: string
          image_url?: string | null
          image_path?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          bio?: string
          image_url?: string | null
          image_path?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          customer_name: string
          customer_photo_url: string | null
          customer_photo_path: string | null
          review: string
          rating: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_photo_url?: string | null
          customer_photo_path?: string | null
          review: string
          rating: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_photo_url?: string | null
          customer_photo_path?: string | null
          review?: string
          rating?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      before_after_gallery: {
        Row: {
          id: string
          title: string
          before_image_url: string
          before_image_path: string
          after_image_url: string
          after_image_path: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          before_image_url: string
          before_image_path: string
          after_image_url: string
          after_image_path: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          before_image_url?: string
          before_image_path?: string
          after_image_url?: string
          after_image_path?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          id: string
          question: string
          answer: string
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      opening_hours: {
        Row: {
          id: string
          day: string
          open_time: string | null
          close_time: string | null
          is_closed: boolean
          display_order: number
          updated_at: string
        }
        Insert: {
          id?: string
          day: string
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
          display_order?: number
          updated_at?: string
        }
        Update: {
          id?: string
          day?: string
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
          display_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      holiday_hours: {
        Row: {
          id: string
          name: string
          date: string
          is_closed: boolean
          custom_open_time: string | null
          custom_close_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          is_closed?: boolean
          custom_open_time?: string | null
          custom_close_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          is_closed?: boolean
          custom_open_time?: string | null
          custom_close_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          id: string
          business_name: string
          phone: string
          email: string
          address_line_1: string
          city_state_zip: string
          google_maps_url: string
          booking_url: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name?: string
          phone?: string
          email?: string
          address_line_1?: string
          city_state_zip?: string
          google_maps_url?: string
          booking_url?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          phone?: string
          email?: string
          address_line_1?: string
          city_state_zip?: string
          google_maps_url?: string
          booking_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media: {
        Row: {
          id: string
          platform: string
          url: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          url?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          url?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
