"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Toaster } from "sonner"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-72 shrink-0 flex-col">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-80 h-full">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-20 border-b border-gray-200 bg-white flex items-center px-4 lg:px-8 shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors mr-2"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors px-4 py-2 rounded-lg hover:bg-amber-50 border border-gray-200 hover:border-amber-200"
            >
              View Website ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10">{children}</div>
        </main>
      </div>

      <Toaster
        position="top-right"
        theme="light"
        toastOptions={{
          style: {
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            color: "#111827",
          },
        }}
      />
    </div>
  )
}
