"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const LONG_PRESS_DURATION = 500

const HoverCardContext = React.createContext<{
  openLongPress: () => void
  cancelLongPress: () => void
} | null>(null)

function HoverCard({
  children,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  const [open, setOpen] = React.useState(false)

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const openLongPress = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setOpen(true)
      timerRef.current = null
    }, LONG_PRESS_DURATION)
  }, [])

  const cancelLongPress = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <HoverCardContext.Provider
      value={{
        openLongPress,
        cancelLongPress,
      }}
    >
      <HoverCardPrimitive.Root
        data-slot="hover-card"
        open={open}
        onOpenChange={setOpen}
        {...props}
      >
        {children}
      </HoverCardPrimitive.Root>
    </HoverCardContext.Provider>
  )
}

function HoverCardTrigger({
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  const context = React.useContext(HoverCardContext)

  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      onPointerDown={(event) => {
        onPointerDown?.(event)

        if (event.pointerType === "touch") {
          context?.openLongPress()
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)

        if (event.pointerType === "touch") {
          context?.cancelLongPress()
        }
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)

        if (event.pointerType === "touch") {
          context?.cancelLongPress()
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)

        if (event.pointerType === "touch") {
          context?.cancelLongPress()
        }
      }}
      {...props}
    />
  )
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }