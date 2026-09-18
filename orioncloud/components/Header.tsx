import React from 'react'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Search from "@/components/Search"
import FileUploader from "@/components/FileUploader"
import { signOutUser } from "@/lib/actions/user.actions";
import Thumbnail from "@/components/Thumbnail"

const Header =({ ownerId, accountId }: { ownerId: string; accountId: string })=>{
    return <header className="header">
        <Search />

        <div className="header-wrapper">
            <FileUploader ownerId={ownerId} accountId={accountId}/>

            <form action={async () => {
                'use server';

                await signOutUser();
            }}>
                <Button type="submit" variant="outline" aria-label="Sign out" className="size-10 shrink-0 border-gray-300 bg-gray-200 p-2 text-gray-900 hover:bg-gray-300">
                    <Image 
                    src="/assets/icons/logout.svg" 
                    alt="" 
                    width={24} 
                    height={24} 
                    className="w-6"></Image>
                </Button>
            </form>
        </div>
    </header>
}

export default Header
