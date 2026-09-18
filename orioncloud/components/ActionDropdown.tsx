"use client";

import Image from "next/image"
import {useState} from "react";
import type { CardFile } from "@/components/Card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ActionDropdown = ({ file }: { file: CardFile }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


    return (<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
  <DropdownMenuTrigger className="shad-no-focus">
    <Image src="/assets/icons/dots.svg" alt="dots" width={34} height={34}/>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuLabel>{file.name}</DropdownMenuLabel>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Billing</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>Team</DropdownMenuItem>
      <DropdownMenuItem>Subscription</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
</Dialog>);
}

export default ActionDropdown;
