'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';

interface PropsType {
  reportData: { [key: string]: any };
  submitHandler: (reportId: string, reqBy: string) => Promise<void>;
}
const DeleteButton: React.FC<PropsType> = props => {
  const { data: session } = useSession();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" size="icon">
            <Trash2 size={18} />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently
              delete this report from the server?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0 px-4 py-2">
            <Button
              type="submit"
              onClick={() => {
                props.submitHandler(
                  props.reportData?._id,
                  session?.user.real_name || '',
                );
              }}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              Confirm
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteButton;
