"use client"

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
    LogOut
} from "lucide-react"

const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Milk Operations", href: "/milk", icon: Droplets },
    { name: "Livestock", href: "/livestock", icon: Activity },
    { name: "Inventory", href: "/inventory", icon: Wheat },
    { name: "Financials", href: "/financials", icon: Wallet },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex h-full w-64 flex-col border-r border-surface-200 bg-white">
            <div className="flex h-20 shrink-0 items-center justify-center border-b border-surface-100">
                <Link href="/" className="flex items-center focus:outline-none">
                    <Image
                        src="/logo.png"
                        alt="Jamindar Dairy"
                        width={200}
                        height={64}
                        className="h-16 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? "bg-primary-50 text-primary-700"
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
            <div className="border-t border-surface-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-medium text-surface-900">Admin</p>
                            <p className="text-xs text-surface-500">Farm Manager</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-surface-400 hover:text-red-600 transition-colors" title="Log Out">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
