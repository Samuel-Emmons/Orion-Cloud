import React from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNavigation from '@/components/MobileNavigation'
import Header from '@/components/Header'
import {getCurrentUser} from "@/lib/actions/user.actions"
import {redirect} from 'next/navigation'
import { Toaster } from "@/components/ui/toast"


const Layout = async (
    { children }: {children: React.ReactNode}
) => {
    const currentUser = await getCurrentUser();

    if(!currentUser) return redirect("/sign-in")

    return <main className = "flex h-dvh overflow-hidden bg-gray-50">
        <Sidebar {...currentUser}/>

        <section className="flex h-full min-w-0 flex-1 flex-col">
            <MobileNavigation
                ownerId={currentUser.$id}
                accountId={currentUser.accountId}
                fullName={currentUser.fullName}
                avatar={currentUser.avatar}
                email={currentUser.email}
            />
            <Header ownerId={currentUser.$id} accountId={currentUser.accountId}/>

            <div className="main-content">
                {children}
            </div>
        </section>
        <Toaster/>
    </main>
}


export default Layout
