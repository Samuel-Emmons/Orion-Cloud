"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { actionsDropdownItems } from "@/constants";
import { useState } from "react";
import type { CardFile } from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { renameFile, deleteFile } from "@/lib/actions/file.actions";
import { toast } from "@/components/ui/toast";
import { FileDetails } from "@/components/actionsModalContent";
import { ShareInput } from "@/components/actionsModalContent";
import { updateFileUsers } from "@/lib/actions/file.actions";

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
  const [emails, setEmails] = useState<string[]>([])
  // Existing recipients shown in the dialog; Share adds the new input emails.
  const [sharedEmails, setSharedEmails] = useState<string[]>(file.users ?? []);

  const path = usePathname();

  //cancel action
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    setEmails([]);
    setSharedEmails(file.users ?? []);
  }

  const handleAction = async() => {
    if(!action || isLoading) return;
    if (action.value !== "rename" && action.value !== "share" && action.value !== "delete") {
      toast.add({ title: "Not available yet", description: "This action still needs to be implemented." });
      return;
    }
    setIsLoading(true);
    try {
      // Combine retained recipients with new input, normalize, and remove duplicates.
      // The server validates these again because browser input cannot be trusted.
      const recipients = [...new Set([...sharedEmails, ...emails]
        .map(email => email.trim().toLowerCase()).filter(Boolean))];
      const updatedFile = action.value === "rename"
        ? await renameFile({ fileId: file.$id, name, extension: file.extension, path })
        : action.value === "share"
          ? await updateFileUsers({ fileId: file.$id, emails: recipients, path })
          : await deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path });
      if (!updatedFile) throw new Error("Update failed");
      toast.add({ title: action.value === "delete" ? "File deleted" : action.value === "rename" ? "File renamed" : "Sharing updated", type: "success" });
      closeAllModals();
    } catch {
      toast.add({ title: action.value === "delete" ? "Delete failed" : "Update failed", description: "Could not complete this action. Make sure you own the file and try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (isLoading) return;
    // Keep the other saved recipients; do not save unsent input emails here.
    const updatedEmails = sharedEmails.filter((item) => item !== email);
    setIsLoading(true);
    try {
      const updatedFile = await updateFileUsers({
        fileId: file.$id,
        emails: updatedEmails,
        path,
      });
      if (!updatedFile) throw new Error("Removal failed");
      toast.add({ title: "Recipient removed", type: "success" });
      closeAllModals();
    } catch {
      toast.add({ title: "Removal failed", description: "Could not remove this recipient. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      if (!open) closeAllModals();
      else setIsModalOpen(true);
    }}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus" disabled={isLoading} aria-label={isLoading ? "Saving changes" : "File actions"}>
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
                    setEmails([]);
                    setSharedEmails(file.users ?? []);
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
          {action.value === "details" && <FileDetails file={file} />}
          {/* Add the form or details for the selected action here. */}
          {action.value === "share" && (
            <fieldset disabled={isLoading} className="min-w-0">
              <ShareInput file={{ ...file, users: sharedEmails }} onInputChange={setEmails} onRemove={handleRemoveUser}/>
              <p className="mt-2 text-xs text-gray-500">Press Share to add recipients. Removing a recipient saves immediately.</p>
            </fieldset>
          )}
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
          {action.value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete {' '}
              <span className="delete-file-name">{file.name}</span>?
            </p>

          )}
            {['rename', 'delete', 'share'].includes(action.value) && (
              <DialogFooter className="flex flex-col gap-3 md:flex-row">
                <Button type="button" variant="outline" onClick={closeAllModals} className="modal-cancel-button">
                  {isLoading ? "Close" : "Cancel"}
                </Button>
                <Button type="button" disabled={isLoading} aria-busy={isLoading}
                  onClick={handleAction} className="modal-submit-button">
                  <span className="capitalize">{isLoading ? "Saving..." : action.value}</span>
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
