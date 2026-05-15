# Graph Report - Task_Management  (2026-05-16)

## Corpus Check
- 25 files · ~6,127 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 124 nodes · 135 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04cab894`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 6 edges
2. `Config` - 4 edges
3. `Badge()` - 4 edges
4. `Expanding the ESLint configuration` - 4 edges
5. `Skeleton()` - 3 edges
6. `Task Management Project` - 3 edges
7. `React + TypeScript + Vite` - 3 edges
8. `React + Vite` - 3 edges
9. `DevConfig` - 2 edges
10. `ProdConfig` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Carousel()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/carousel.tsx → frontend/src/lib/utils.ts
- `CarouselItem()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/carousel.tsx → frontend/src/lib/utils.ts
- `Skeleton()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/skeleton.tsx → frontend/src/lib/utils.ts
- `ToastCard()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/toast.tsx → frontend/src/lib/utils.ts
- `Badge()` --calls--> `cn()`  [INFERRED]
  frontend/src/components/ui/badge.tsx → frontend/src/lib/utils.ts

## Communities (19 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (17): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, InputProps (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (9): SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetProps, SheetTitle (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (8): cn(), Badge(), BadgeProps, badgeVariants, Carousel(), CarouselItem(), CarouselProps, ToastCard()

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (8): DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogProps, DialogTitle, DialogTrigger

### Community 4 - "Community 4"
Cohesion: 0.2
Nodes (8): Form, FormControl, FormDescription, FormFieldProps, FormItem, FormLabel, FormMessage, FormProps

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (6): DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuProps, DropdownMenuSeparator, DropdownMenuTrigger

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (6): Toast, ToastContext, ToastContextType, ToastProvider(), useToast(), useToastHook()

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (6): code:js (export default defineConfig([), code:js (// eslint.config.js), Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite, React + Vite

### Community 9 - "Community 9"
Cohesion: 0.7
Nodes (4): Config, DevConfig, ProdConfig, TestConfig

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (3): Button, ButtonProps, buttonVariants

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (3): Getting Started, Task Management Project, Tech Stack

## Knowledge Gaps
- **55 isolated node(s):** `BadgeProps`, `buttonVariants`, `ButtonProps`, `CardFooter`, `CarouselProps` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Skeleton()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `cn()` (e.g. with `Badge()` and `Carousel()`) actually correct?**
  _`cn()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BadgeProps`, `buttonVariants`, `ButtonProps` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._