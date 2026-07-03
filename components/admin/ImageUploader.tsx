"use client"

import React, { useCallback, useRef, useState } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { createSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ImageUploaderProps {
  bucket: string
  folder?: string
  currentUrl?: string | null
  onUploadComplete: (url: string, path: string) => void
  onRemove?: () => void
  className?: string
  accept?: string
  maxSizeMB?: number
  aspectHint?: string
}

export function ImageUploader({
  bucket,
  folder = "",
  currentUrl,
  onUploadComplete,
  onRemove,
  className,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 10,
  aspectHint,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`)
        return
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = folder ? `${folder}/${fileName}` : fileName

      setIsUploading(true)
      setProgress(10)

      const supabase = createSupabaseClient()

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setProgress(40)

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        toast.error(`Upload failed: ${error.message}`)
        setPreview(currentUrl ?? null)
        setIsUploading(false)
        setProgress(0)
        return
      }

      setProgress(90)

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      setProgress(100)

      onUploadComplete(urlData.publicUrl, path)
      toast.success("Image uploaded successfully")

      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
      }, 600)
    },
    [bucket, folder, currentUrl, maxSizeMB, onUploadComplete]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      upload(files[0])
    },
    [upload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleRemove = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
    onRemove?.()
  }

  return (
    <div className={cn("space-y-3", className)}>
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto block"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-3.5 w-3.5" />
              Replace
            </Button>
            {onRemove && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <div className="w-48">
                <Progress value={progress} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center cursor-pointer transition-colors",
            "hover:border-amber-400 hover:bg-amber-50/50",
            isDragging && "border-amber-400 bg-amber-50",
            isUploading && "pointer-events-none"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              <div className="w-48">
                <Progress value={progress} />
              </div>
              <p className="text-sm text-gray-500">Uploading…</p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
                <ImageIcon className="h-7 w-7 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Drop image here or{" "}
                  <span className="text-amber-500 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WebP · Max {maxSizeMB}MB
                  {aspectHint && ` · ${aspectHint}`}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
