import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Paginación"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        "flex flex-row flex-wrap items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="pagination-item" className={cn("", className)} {...props} />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<typeof Button>

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      type="button"
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(
        "size-8 min-w-8 p-0 text-slate-200 hover:bg-primary/15 hover:text-white",
        isActive && "border-primary/50 bg-primary/10 text-white",
        className
      )}
      {...props}
    />
  )
}

type PaginationNavButtonProps = React.ComponentProps<typeof Button> & {
  disabled?: boolean
}

function PaginationPrevious({
  className,
  disabled,
  ...props
}: PaginationNavButtonProps) {
  return (
    <Button
      type="button"
      aria-label="Página anterior"
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        "gap-1 border-slate-500/40 bg-transparent pl-2 text-slate-200",
        className
      )}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span className="hidden sm:inline">Anterior</span>
    </Button>
  )
}

function PaginationNext({
  className,
  disabled,
  ...props
}: PaginationNavButtonProps) {
  return (
    <Button
      type="button"
      aria-label="Página siguiente"
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        "gap-1 border-slate-500/40 bg-transparent pr-2 text-slate-200",
        className
      )}
      {...props}
    >
      <span className="hidden sm:inline">Siguiente</span>
      <ChevronRight className="size-4" />
    </Button>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center text-slate-500",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Más páginas</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
