"use client"

import * as React from "react"
import { X } from "lucide-react"

// Dialog context and state management
interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | null>(null);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  }, [isControlled, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => {
  const context = React.useContext(DialogContext);
  
  if (!context) {
    throw new Error('DialogTrigger must be used within a Dialog');
  }

  return (
    <div onClick={() => context.setOpen(true)}>
      {children}
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ className = "", children, ...props }) => {
  const context = React.useContext(DialogContext);
  
  if (!context) {
    throw new Error('DialogContent must be used within a Dialog');
  }

  if (!context.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={() => context.setOpen(false)}
      />
      <div 
        className={`relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg rounded-lg ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = "", 
  ...props 
}) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
    {...props}
  />
);

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = "", 
  ...props 
}) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    {...props}
  />
);

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ 
  className = "", 
  ...props 
}) => (
  <h2
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
);

const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ 
  className = "", 
  ...props 
}) => (
  <p
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  />
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};