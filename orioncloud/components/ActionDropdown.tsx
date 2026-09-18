"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { actionsDropdownItems } from "@/constants";
import { useState } from "react";
import type { CardFile } from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setIsModalOpen(open);
      if (!open) setIsLoading(false);
    }}>
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
                    setIsLoading(false);
                    setName(file.name);
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


      {/*Popup modal for the action*/}
      {action && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action.value === "rename" ? "Rename file" : action.label}</DialogTitle>
            <DialogDescription>{file.name}</DialogDescription>
          </DialogHeader>
          {/* Add the form or details for the selected action here. */}
          {action.value === "rename" && (
            <label className="grid gap-2 text-sm font-medium">
              File name
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
            {['rename', 'delete', 'share'].includes(action.value) && (
              <DialogFooter className="flex flex-col gap-3 md:flex-row">
                <Button type="button" variant="outline" onClick={() => {
                  setIsModalOpen(false);
                  setIsLoading(false);
                }}>
                  Cancel
                </Button>
                {/* Connect this button to the selected action's save handler. */}
                <Button type="button" disabled={isLoading} aria-busy={isLoading}
                  onClick={() => {
                    // When the rename request is added, reset loading in its finally block.
                    if (action.value === "rename") setIsLoading(true);
                  }}>
                  <span className="capitalize">{isLoading ? "Renaming..." : action.value}</span>
                  {isLoading && (
                    <Loader2 className="size-5 animate-spin text-brand motion-reduce:animate-none" aria-hidden="true" />
                  )}
                </Button>
              </DialogFooter>
            )}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default ActionDropdown;
