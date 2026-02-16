import { cn } from "@/lib/utils"
import React from "react"

export function H1({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (<h1 className={cn("text-2xl md:text-3xl font-semibold tracking-tight", className)} {...props}> {children} </h1>)
}

export function H2({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (<h2 className={cn("text-xl md:text-2xl font-semibold tracking-tight", className)} {...props}> {children} </h2>)
}

export function H3({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (<h3 className={cn("text-lg md:text-xl font-semibold tracking-tight", className)} {...props}> {children} </h3>)
}

export function H4({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (<h4 className={cn("text-md md:text-lg font-semibold tracking-tight", className)} {...props}> {children} </h4>)
}

export function H5({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (<h5 className={cn("text-sm md:text-md font-semibold tracking-tight", className)} {...props}> {children} </h5>)
}

export function H6({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (<h6 className={cn("text-xs md:text-sm font-semibold tracking-tight", className)} {...props}> {children} </h6>)
}

export function TextMD({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (<div className={cn("text-md leading-7", className)} {...props}> {children} </div>)
}

export function TextSM({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (<div className={cn("text-sm leading-7", className)} {...props}> {children} </div>)
}

export function TextXS({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (<small className={cn("text-xs leading-7", className)} {...props}> {children} </small>)
}