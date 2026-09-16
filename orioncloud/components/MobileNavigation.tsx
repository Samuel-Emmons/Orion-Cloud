"use client"
import { signOutUser } from "@/lib/actions/user.actions";
import React from 'react'
import Image from 'next/image'
import Link from "next/link";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {useEffect, useState} from 'react'
import FileUploader from "@/components/FileUploader";
import {usePathname} from'next/navigation'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Props{
    ownerId: string;
    accountId: string;
    fullName: string;
    avatar:string;
    email: string;
}

const MobileNavigation = ({ownerId, accountId, fullName, avatar, email}: Props) =>
{
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 768px)");
        const closeOnDesktop = () => {
            if (desktop.matches) setOpen(false);
        };
        desktop.addEventListener("change", closeOnDesktop);
        return () => desktop.removeEventListener("change", closeOnDesktop);
    }, []);

    return(<header className="mobile-header flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4 md:hidden">
        <Image src="/assets/icons/logo-full-brand.svg" alt="logo" width={120}height={52} className="h-auto"/>

        <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger><Image src="/assets/icons/menu.svg" alt="Search" width={30} height={30}/></SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
            <SheetTitle>
                <div className="header-user">
                    <Image src={avatar} alt="avatar" width={44} height={44} className="header-user-avatar"/>
                    <div className="sm:hidden lg:block">
                        <p className="subtitle-2 capitalize">{fullName}</p>
                        <p className="caption">{email}</p>
                    </div>
                </div>
                <Separator className="mb-4 bg-light-200/20"/>
            </SheetTitle>
            <nav className="mobile-nav">
            <ul className="mobile-nav-list">
                {navItems.map(({url, name, icon})=>(
                        <Link key={name} href={url} className="lg:w-full" onClick={() => setOpen(false)}>
                            <li className={cn("mobile-nav-item", pathname === url && "shad-active")}>
                                <Image src={icon} alt={name} width={24} height={24} className={cn('nav-icon', pathname === url && "nav-icon-active")}/>
                                <p>{name}</p>
                            </li>
                        </Link>
                    ))}
            </ul>
            </nav>
            <Separator className="my-5 big-light-200/20"/>

            <div className="flex flex-col justify-between gap-5 pb-5">

                <FileUploader/>

                <Button type="submit" variant="outline" aria-label="Sign out" className="size-10 shrink-0 border-gray-300 bg-gray-200 p-2 text-gray-900 hover:bg-gray-300"
                onClick={async()=> await signOutUser()}>
                    <Image 
                    src="/assets/icons/logout.svg" 
                    alt="" 
                    width={24} 
                    height={24}
                    ></Image>
                </Button>
            </div>
            <SheetDescription>This action cannot be undone.</SheetDescription>
        </SheetContent>
        </Sheet>
    </header>)
}

export default MobileNavigation
