import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselProps {
  children: React.ReactNode
  className?: string
}

const Carousel: React.FC<CarouselProps> = ({ children, className }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const childrenArray = React.Children.toArray(children)

  const prev = () => setCurrentIndex((i) => (i === 0 ? childrenArray.length - 1 : i - 1))
  const next = () => setCurrentIndex((i) => (i === childrenArray.length - 1 ? 0 : i + 1))

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {childrenArray.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>
      {childrenArray.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {childrenArray.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index === currentIndex ? "bg-slate-900" : "bg-slate-300"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
Carousel.displayName = "Carousel"

const CarouselItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn("w-full", className)}>{children}</div>
}
CarouselItem.displayName = "CarouselItem"

export { Carousel, CarouselItem }