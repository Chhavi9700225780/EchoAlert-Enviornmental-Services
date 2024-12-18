"use client"

import { useState, useEffect } from "react"
import { Inter } from 'next/font/google'

import HeaderOrg from "@/components/HeaderOrg"
import Sidebar from "@/components/Sidebar"
import 'leaflet/dist/leaflet.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
 
  
  return (
    
     <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <HeaderOrg onMenuClick={() => setSidebarOpen(!sidebarOpen)}  />
          <div className="flex flex-1">
            <Sidebar open={sidebarOpen} />
            <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
     </>
  )
}
