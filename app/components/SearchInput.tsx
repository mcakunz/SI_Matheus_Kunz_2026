"use client"

import { useQueryState } from 'nuqs'
import { useState, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function SearchInput() {
  const [isPending, startTransition] = useTransition()
  
  const [urlQuery, setUrlQuery] = useQueryState('q', { 
    shallow: false,
    startTransition 
  })

  const [inputValue, setInputValue] = useState(urlQuery || '')

  const debouncedUrlUpdate = useDebouncedCallback((termo: string) => {
    setUrlQuery(termo || null)
  }, 500)

  return (
    <div className="mb-4 flex items-center gap-3">
      <input
        type="text"
        placeholder="Pesquisar..."
        value={inputValue} 
        onChange={(e) => {
          setInputValue(e.target.value) 
          debouncedUrlUpdate(e.target.value) 
        }}
        className="w-full max-w-sm p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
      />
    </div>
  )
}