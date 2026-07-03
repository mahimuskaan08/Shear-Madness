"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Save, Phone, Mail, MapPin, Globe, Link as LinkIcon, Building2 } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

type ContactInfo = {
  id: string
  business_name: string
  phone: string
  email: string
  address_line_1: string
  city_state_zip: string
  google_maps_url: string
  booking_url: string
}

type ContactForm = Omit<ContactInfo, "id"> & { id?: string }

const EMPTY_FORM: ContactForm = {
  business_name: "",
  phone: "",
  email: "",
  address_line_1: "",
  city_state_zip: "",
  google_maps_url: "",
  booking_url: "",
}

const FIELDS: {
  key: keyof ContactForm
  label: string
  placeholder: string
  type: string
  icon: React.ElementType
  hint?: string
}[] = [
  {
    key: "business_name",
    label: "Business Name",
    placeholder: "e.g. Shear Madness",
    type: "text",
    icon: Building2,
  },
  {
    key: "phone",
    label: "Phone",
    placeholder: "e.g. (555) 123-4567",
    type: "tel",
    icon: Phone,
  },
  {
    key: "email",
    label: "Email",
    placeholder: "e.g. hello@shearmadness.com",
    type: "email",
    icon: Mail,
  },
  {
    key: "address_line_1",
    label: "Address Line 1",
    placeholder: "e.g. 123 Main Street",
    type: "text",
    icon: MapPin,
  },
  {
    key: "city_state_zip",
    label: "City, State & ZIP",
    placeholder: "e.g. Springfield, IL 62701",
    type: "text",
    icon: MapPin,
  },
  {
    key: "google_maps_url",
    label: "Google Maps URL",
    placeholder: "https://maps.google.com/...",
    type: "url",
    icon: Globe,
    hint: "Paste the share link from Google Maps",
  },
  {
    key: "booking_url",
    label: "Booking URL",
    placeholder: "https://booksy.com/...",
    type: "url",
    icon: LinkIcon,
    hint: "Link to your online booking page",
  },
]

export default function ContactPage() {
  const supabase = createSupabaseClient()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<ContactForm>(EMPTY_FORM)

  const { data: contact, isLoading } = useQuery<ContactInfo | null>({
    queryKey: ["contact"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data ?? null
    },
  })

  // Sync form when data loads
  useEffect(() => {
    if (contact) {
      setForm({
        id: contact.id,
        business_name: contact.business_name ?? "",
        phone: contact.phone ?? "",
        email: contact.email ?? "",
        address_line_1: contact.address_line_1 ?? "",
        city_state_zip: contact.city_state_zip ?? "",
        google_maps_url: contact.google_maps_url ?? "",
        booking_url: contact.booking_url ?? "",
      })
    }
  }, [contact])

  const saveMutation = useMutation({
    mutationFn: async (values: ContactForm) => {
      if (values.id) {
        // Update existing row
        const { error } = await supabase
          .from("contact_info")
          .update({
            business_name: values.business_name,
            phone: values.phone,
            email: values.email,
            address_line_1: values.address_line_1,
            city_state_zip: values.city_state_zip,
            google_maps_url: values.google_maps_url,
            booking_url: values.booking_url,
          })
          .eq("id", values.id)
        if (error) throw error
      } else {
        // Insert new row
        const { data, error } = await supabase
          .from("contact_info")
          .insert({
            business_name: values.business_name,
            phone: values.phone,
            email: values.email,
            address_line_1: values.address_line_1,
            city_state_zip: values.city_state_zip,
            google_maps_url: values.google_maps_url,
            booking_url: values.booking_url,
          })
          .select("id")
          .single()
        if (error) throw error
        // Store the new id so future saves update rather than insert
        setForm((f) => ({ ...f, id: data.id }))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] })
      toast.success("Contact info saved")
    },
    onError: () => toast.error("Failed to save contact info"),
  })

  function handleChange(key: keyof ContactForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  return (
    <div>
      <PageHeader
        title="Contact Info"
        description="Update your business contact details shown on the website."
      />

      {isLoading ? (
        <div className="space-y-5 max-w-2xl">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-9 w-full bg-zinc-800 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
            {FIELDS.map(({ key, label, placeholder, type, icon: Icon, hint }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`contact-${key}`} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-zinc-500" />
                  {label}
                </Label>
                <Input
                  id={`contact-${key}`}
                  type={type}
                  value={form[key] as string}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
                {hint && (
                  <p className="text-xs text-zinc-500">{hint}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
