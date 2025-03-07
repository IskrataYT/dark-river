export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-2 animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-24 bg-zinc-800 rounded"></div>
              <div className="h-3 w-16 bg-zinc-800 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-zinc-800 rounded"></div>
              <div className="h-4 w-1/2 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

