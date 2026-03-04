"use client"

import { useEffect } from 'react'

/**
 * Hook to prevent layout shift when modals/dialogs open by compensating for scrollbar width
 * This fixes the issue where content jumps when overflow:hidden is applied to body
 */
export function useScrollbarCompensation() {
  useEffect(() => {
    // Calculate scrollbar width
    const getScrollbarWidth = () => {
      const outer = document.createElement('div')
      outer.style.visibility = 'hidden'
      outer.style.overflow = 'scroll'
      document.body.appendChild(outer)
      
      const inner = document.createElement('div')
      outer.appendChild(inner)
      
      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
      outer.parentNode?.removeChild(outer)
      
      return scrollbarWidth
    }

    const scrollbarWidth = getScrollbarWidth()
    
    // Observer to watch for style changes on body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const body = document.body
          const hasOverflowHidden = body.style.overflow === 'hidden' || 
                                    body.style.overflowY === 'hidden'
          
          if (hasOverflowHidden && scrollbarWidth > 0) {
            // Add padding to compensate for removed scrollbar
            body.style.paddingRight = `${scrollbarWidth}px`
          } else if (!hasOverflowHidden && body.style.paddingRight) {
            // Remove padding when scrollbar is back
            body.style.paddingRight = ''
          }
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    })

    return () => {
      observer.disconnect()
    }
  }, [])
}
