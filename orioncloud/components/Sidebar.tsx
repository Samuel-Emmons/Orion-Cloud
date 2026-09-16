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
        <aside className="sidebar hidden h-full w-24 shrink-0 flex-col gap-6 overflow-y-auto border-r border-gray-200 bg-gray-50 px-3 py-6 md:flex lg:w-72 lg:px-5">
            <Link href="/">
                <Image src="/assets/icons/logo-full-brand.svg" alt="logo" width={160} height={150} className='hidden h-auto lg:block'>

                </Image>

                <Image src="/assets/icons/logo-brand.svg" alt="logo" width={52} height={52} className="lg:hidden"
                ></Image>
            </Link>

            <nav className="sidebar-nav">
                <ul className="flex flex-1 flex-col gap-6">
                    {navItems.map(({url, name, icon})=>(
                        <Link key={name} href={url} className="lg:w-full">
                            <li className={cn("sidebar-nav-item", pathname === url && "shad-active")}>
                                <Image src={icon} alt={name} width={24} height={24} className={cn('nav-icon', pathname === url && "nav-icon-active")}/>
                                <p className="hidden lg:block">{name}</p>
                            </li>
                        </Link>
                    ))}
                </ul>
            </nav>
            <Image src={filesImage} alt="Files illustration" className="mx-auto mt-16 hidden h-auto w-32 max-w-full lg:block"/>

            <div className="mt-auto pt-6">
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
