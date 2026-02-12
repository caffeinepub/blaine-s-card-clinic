import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import type { Ticket } from '@/backend';

interface FullTicketMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  email: string;
}

export function FullTicketMessageModal({ open, onOpenChange, ticket, email }: FullTicketMessageModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Full Message</DialogTitle>
          <DialogDescription>
            From {ticket.formData.name} ({email})
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer Name</h4>
              <p className="text-sm">{ticket.formData.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Email Address</h4>
              <p className="text-sm">{email}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Category</h4>
              <p className="text-sm">{ticket.category}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Message</h4>
              <div className="text-sm whitespace-pre-wrap break-words bg-muted/50 p-4 rounded-md">
                {ticket.formData.message}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogClose asChild>
          <Button variant="outline" className="mt-4">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
