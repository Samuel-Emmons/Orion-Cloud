'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from "next/navigation"
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import filesImage from "@/assets/images/files-2.png";

interface Props{
    fullName: string;
    avatar: string;
    email: string
}

const Sidebar=({fullName, avatar, email}: Props)=>{
    const pathname = usePathname();
    const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
    const displayName = fullName?.trim() || "Orion user";
    const initials = displayName.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

    return(
        <aside className="sidebar hidden h-full w-24 shrink-0 flex-col gap-4 overflow-hidden bg-gray-50 px-3 py-4 md:flex lg:w-64 lg:px-4">
            <Link href="/" className="sidebar-logo flex h-16 shrink-0 items-center justify-center lg:justify-start">
                <Image src="/assets/icons/logo-full-brand.svg" alt="Orion Cloud" width={220} height={150} className='hidden h-auto w-full max-w-56 lg:block'>

                </Image>

                <Image src="/assets/icons/logo-brand.svg" alt="logo" width={52} height={52} className="lg:hidden"
                ></Image>
            </Link>

            <nav className="sidebar-nav shrink-0">
                <ul className="flex flex-col gap-3">
                    {navItems.map(({url, name, icon})=>(
                        <li key={name}>
                            <Link href={url} aria-label={name} aria-current={pathname === url ? "page" : undefined} className={cn("sidebar-nav-item", pathname === url && "shad-active")}>
                                <Image src={icon} alt={name} width={24} height={24} className={cn('nav-icon', pathname === url && "nav-icon-active")}/>
                                <p className="hidden lg:block">{name}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <Image src={filesImage} alt="Files illustration" className="sidebar-illustration mx-auto mt-4 block h-36 min-h-0 w-16 shrink object-contain lg:w-36"/>

            <div className="mt-auto shrink-0 pt-2">
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-gray-100 p-2.5 shadow-sm lg:justify-start lg:p-3" title={`${displayName} — ${email}`}>
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/15 font-semibold text-gray-900 ring-2 ring-brand/30">
                  {avatar && failedAvatar !== avatar ? (
                    <Image src={avatar} alt="" width={44} height={44} unoptimized onError={() => setFailedAvatar(avatar)} className="size-11 object-cover" />
                  ) : initials}
                </div>
                <div className="hidden min-w-0 lg:block">
                    <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-600">{email}</p>
                </div>
              </div>
            </div>
        </aside>
    )
}

export default Sidebar
