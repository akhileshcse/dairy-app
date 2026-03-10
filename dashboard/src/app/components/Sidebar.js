"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
    LayoutDashboard,
    Droplets,
    Wheat,
    Wallet,
    Settings,
    Activity,
    LogOut,
    Menu,
    X
} from "lucide-react"

const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Milk Operations", href: "/milk", icon: Droplets },
    { name: "Livestock", href: "/livestock", icon: Activity },
    { name: "Inventory", href: "/inventory", icon: Wheat },
    { name: "Financials", href: "/financials", icon: Wallet },
    { name: "Team & Roles", href: "/team", icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-white border-b border-surface-200 px-4 py-3 shrink-0">
                <Link href="/" className="flex items-center focus:outline-none">
                    <Image
                        src="/logo.png"
                        alt="Jamindar Dairy"
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </Link>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -mr-2 text-surface-500 hover:text-surface-900 focus:outline-none"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-surface-900/80 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Desktop & Mobile Flyout */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full`}>
                <div className="flex items-center justify-between h-20 shrink-0 border-b border-surface-100 px-6">
                    <Link href="/" className="flex items-center focus:outline-none" onClick={() => setIsOpen(false)}>
                        <Image
                            src="/logo.png"
                            alt="Jamindar Dairy"
                            width={160}
                            height={52}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-2 text-surface-400 hover:text-surface-600 focus:outline-none"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary-50 text-primary-700 font-semibold"
                                    : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                                    }`}
                            >
                                <item.icon
                                    className={`h-5 w-5 shrink-0 ${isActive ? "text-primary-600" : "text-surface-400"
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* User profile mocked */}
                <div className="border-t border-surface-200 p-4 shrink-0 bg-surface-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 shadow-sm">
                                AD
                            </div>
                            <div>
                                <p className="text-sm font-bold text-surface-900">Admin</p>
                                <p className="text-xs text-surface-500 font-medium tracking-wide uppercase">Farm Manager</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Log Out">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
