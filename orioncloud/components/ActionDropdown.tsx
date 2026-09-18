"use client";

import Image from "next/image";
import { actionsDropdownItems } from "@/constants";
import { useState } from "react";
import type { CardFile } from "@/components/Card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActionType = (typeof actionsDropdownItems)[number];

const ActionDropdown = ({ file }: { file: CardFile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{file.name}</DropdownMenuLabel>
            {actionsDropdownItems.map((actionItem) =>
              actionItem.value === "download" ? (
                <DropdownMenuItem
                  key={actionItem.value}
                  className="shad-dropdown-item flex items-center gap-2"
                  render={
                    <a
                      href={`/api/files/${encodeURIComponent(file.$id)}/download`}
                      download={file.name}
                    />
                  }
                >
                  <Image
                    src={actionItem.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span>{actionItem.label}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={actionItem.value}
                  className="shad-dropdown-item flex items-center gap-2"
                  onClick={() => {
                    setAction(actionItem);
                    if (
                      ["rename", "share", "delete", "details"].includes(
                        actionItem.value,
                      )
                    ) {
                      setIsModalOpen(true);
                    }
                  }}
                >
                  <Image
                    src={actionItem.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span>{actionItem.label}</span>
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {action && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action.label}</DialogTitle>
            <DialogDescription>{file.name}</DialogDescription>
          </DialogHeader>
          {/* Add the form or details for the selected action here. */}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default ActionDropdown;
