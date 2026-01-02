import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium CTA variants
        cta: "bg-accent text-accent-foreground font-bold shadow-[0_8px_32px_-4px_hsl(43_75%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(43_75%_55%_/_0.2)] hover:-translate-y-0.5 active:translate-y-0",
        ctaOutline: "border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-accent-foreground",
        hero: "bg-accent text-foreground font-bold text-base py-4 px-8 rounded-xl shadow-[0_8px_32px_-4px_hsl(43_75%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(43_75%_55%_/_0.2)] hover:-translate-y-1 active:translate-y-0",
        heroSecondary: "border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50",
        premium: "bg-gradient-to-r from-[hsl(40,80%,45%)] via-[hsl(43,75%,55%)] to-[hsl(45,70%,70%)] text-foreground font-bold shadow-[0_8px_32px_-4px_hsl(43_75%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(43_75%_55%_/_0.2)] hover:-translate-y-1",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
