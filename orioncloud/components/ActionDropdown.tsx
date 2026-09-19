"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { actionsDropdownItems } from "@/constants";
import { useState } from "react";
import type { CardFile } from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { renameFile } from "@/lib/actions/file.actions";
import { toast } from "@/components/ui/toast";

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

  const path = usePathname();

  //cancel action
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    //setEmails([]);
  }

  const handleAction = async() => {
    if(!action || isLoading) return;
    if (action.value !== "rename") {
      toast.add({ title: "Not available yet", description: "This action still needs to be implemented." });
      return;
    }
    setIsLoading(true);
    try {
      const updatedFile = await renameFile({ fileId: file.$id, name, extension: file.extension, path });
      if (!updatedFile) throw new Error("Rename failed");
      toast.add({ title: "File renamed", type: "success" });
      closeAllModals();
    } catch {
      toast.add({ title: "Rename failed", description: "Could not rename the file. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      if (!open) closeAllModals();
      else setIsModalOpen(true);
    }}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus" disabled={isLoading} aria-label={isLoading ? "Renaming file" : "File actions"}>
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
                disabled={isLoading}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
            {['rename', 'delete', 'share'].includes(action.value) && (
              <DialogFooter className="flex flex-col gap-3 md:flex-row">
                <Button type="button" variant="outline" onClick={closeAllModals} className="modal-cancel-button">
                  {isLoading ? "Close" : "Cancel"}
                </Button>
                <Button type="button" disabled={isLoading} aria-busy={isLoading}
                  onClick={handleAction} className="modal-submit-button">
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
