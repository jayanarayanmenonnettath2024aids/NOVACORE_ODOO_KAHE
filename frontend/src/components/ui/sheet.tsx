import * as React from 'react';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Context ──────────────────────────────────────────────────────────────────
interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  onOpenChange: () => {},
});

// ─── Root ─────────────────────────────────────────────────────────────────────
interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

function Sheet({ open = false, onOpenChange = () => {}, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

// ─── Trigger ──────────────────────────────────────────────────────────────────
function SheetTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(SheetContext);
  return (
    <button type="button" onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}

// ─── Close ────────────────────────────────────────────────────────────────────
function SheetClose({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(SheetContext);
  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={cn('absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100 transition-colors', className)}
      {...props}
    >
      {children ?? <XIcon className="w-4 h-4" />}
    </button>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────
interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  showClose?: boolean;
}

function SheetContent({
  className,
  children,
  side = 'right',
  showClose = true,
  ...props
}: SheetContentProps) {
  const { open, onOpenChange } = React.useContext(SheetContext);

  // Trap focus / close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  const sideClasses: Record<string, string> = {
    right: `inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l translate-x-full data-[open]:translate-x-0`,
    left:  `inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r -translate-x-full data-[open]:translate-x-0`,
    top:   `inset-x-0 top-0 h-auto border-b -translate-y-full data-[open]:translate-y-0`,
    bottom:`inset-x-0 bottom-0 h-auto border-t translate-y-full data-[open]:translate-y-0`,
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Panel */}
      <div
        data-open={open ? '' : undefined}
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-white shadow-xl transition-transform duration-300 ease-in-out',
          sideClasses[side],
          className
        )}
        {...props}
      >
        {showClose && <SheetClose />}
        {children}
      </div>
    </>
  );
}

// ─── Header / Footer / Title / Description ────────────────────────────────────
function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1 p-4 border-b bg-gray-50/30', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-auto flex flex-col gap-2 p-4 border-t bg-gray-50/30', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('font-semibold text-gray-900', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
