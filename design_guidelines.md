# Design Guidelines: Instagram Automation Platform

## Design Approach

**Selected Approach:** Reference-Based with Productivity Focus

Drawing inspiration from leading social media scheduling platforms (Buffer, Later, Hootsuite) while maintaining clean productivity tool principles. This app bridges social media creativity with workflow efficiency, requiring both visual appeal for content preview and utilitarian clarity for scheduling management.

**Key Design Principles:**
1. Content-first visualization (posts are visual, not abstract)
2. Calendar-driven workflow clarity
3. Efficient multi-post management
4. Clear scheduling feedback and status indicators

---

## Core Design Elements

### A. Typography

**Font Families:**
- Primary: Inter (via Google Fonts) - Clean, modern, excellent readability
- Monospace: JetBrains Mono - For time displays and technical data

**Type Scale:**
- Display/Hero: text-4xl to text-5xl, font-semibold
- Page Titles: text-3xl, font-semibold
- Section Headers: text-2xl, font-semibold
- Card Headers: text-xl, font-semibold
- Body Text: text-base, font-normal
- Supporting Text: text-sm, font-medium
- Captions/Meta: text-xs, font-medium

---

### B. Layout System

**Spacing Primitives:** Standardize on Tailwind units of **2, 4, 6, 8, 12, 16**
- Micro spacing: p-2, gap-2 (element padding)
- Component spacing: p-4, gap-4 (cards, buttons)
- Section spacing: p-6, gap-6 (within containers)
- Major spacing: p-8, gap-8, py-12 (between sections)
- Page margins: px-12, py-16 (page containers)

**Grid System:**
- Dashboard: 12-column grid (grid-cols-12) for flexible layouts
- Post Queue: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Sidebar: Fixed 280px width on desktop, full-width drawer on mobile

**Container Widths:**
- Full dashboard: max-w-screen-2xl
- Content sections: max-w-7xl
- Modals/Forms: max-w-2xl

---

### C. Component Library

#### Navigation
**Sidebar Navigation (Desktop):**
- Fixed left sidebar (280px width)
- Icon + label navigation items
- Active state with subtle background
- Collapsed state option (icon-only, 72px width)

**Top Bar:**
- Search functionality (w-full max-w-md)
- User profile dropdown (right-aligned)
- Notification bell with badge indicator
- "Create Post" primary action button (prominent placement)

#### Dashboard Components

**Post Card:**
- Aspect ratio 1:1 for Instagram preview
- Image thumbnail with overlay gradient at bottom
- Caption preview (2 lines, truncated)
- Scheduled date/time badge (top-right)
- Status indicator (Scheduled/Pending/Posted)
- Quick action menu (3-dot icon)
- Hover state: Lift with shadow (shadow-lg)

**Calendar View:**
- Full monthly calendar grid
- Day cells with post count indicators
- Mini post thumbnails in date cells
- Current day highlighted
- Date selection interaction
- Week view toggle option

**Analytics Cards:**
- Icon + metric + label pattern
- Large number display (text-3xl)
- Percentage change indicators with trend arrows
- Sparkline graphs for trend visualization
- Grid layout (4 cards across on desktop)

#### Forms & Input

**Post Creation Form:**
- Large image upload area (drag-and-drop zone, min-h-96)
- Caption textarea with character counter
- Hashtag suggestions chips
- Date/time picker (custom calendar popup + time dropdown)
- Frequency selector (radio buttons: Once, Daily, Weekly, Custom)
- Custom schedule builder (time slots with add/remove)

**Profile Analysis Input:**
- URL input field with Instagram icon prefix
- Validation feedback (real-time URL check UI)
- "Analyze" button (loading state during analysis)
- Results display: Grid of content type cards with percentages

**Schedule Configuration:**
- Time slot builder (add/remove time blocks)
- Day of week checkboxes (visual pill toggles)
- Post frequency slider (1-10 posts per day)
- Preview summary box (shows generated schedule)

#### Data Display

**Post Queue List:**
- Timeline view with date markers
- Post cards with reorder drag handles
- Bulk selection checkboxes
- Filter bar (Status, Date range, Content type)
- Infinite scroll or pagination

**Recent Activity Feed:**
- Chronological list with timestamps
- Activity type icons (Posted, Scheduled, Failed, Edited)
- Compact card design (h-16 each)
- Real-time updates indicator

#### Modals & Overlays

**Post Preview Modal:**
- Instagram UI mockup preview
- Full image display
- Complete caption with hashtags
- Engagement prediction metrics
- Edit/Delete/Reschedule actions

**Confirmation Dialogs:**
- Centered overlay (max-w-md)
- Clear heading and description
- Destructive action warning pattern (for delete operations)
- Primary/Secondary button pairing

---

### D. Animations

**Essential Only:**
- Modal fade-in/out (200ms)
- Dropdown slide-down (150ms)
- Toast notifications slide-in from top (300ms)
- Skeleton loading for post cards
- NO scroll animations, parallax, or decorative motion

---

## Images

**Hero Section:** None - This is a dashboard application, not a marketing page. Launch directly into the functional interface.

**In-App Images:**
- **Post Thumbnails:** User-uploaded Instagram content (square aspect ratio)
- **Empty States:** Illustrative graphics for empty post queue ("No scheduled posts yet" with calendar illustration)
- **Profile Analysis Results:** Sample Instagram post thumbnails from analyzed profiles
- **Tutorial/Onboarding:** Optional screenshot guides for first-time setup

**Placeholder Strategy:** Use Instagram-style gradient placeholders during image loading (purple-to-orange gradient)

---

## Key Screens Layout

**Dashboard (Home):**
- Top bar with search and actions
- Left sidebar navigation
- Main content area: 3-column layout
  - Left: Analytics cards (4 metrics) + Calendar widget
  - Center: Upcoming posts queue (scrollable list)
  - Right: Recent activity feed + Quick actions

**Schedule Manager:**
- Full calendar view (dominant center area)
- Side panel for selected day details
- Bottom sheet for bulk scheduling tools

**Post Creator:**
- Split view: Left (form/inputs), Right (live Instagram preview)
- Sticky preview that updates as user types
- Bottom action bar (Save Draft, Schedule, Post Now buttons)

**Profile Analyzer:**
- URL input at top (centered, max-w-2xl)
- Results grid below (content type distribution cards)
- Suggested content examples (3-column masonry grid)

---

## Responsive Behavior

**Desktop (lg:):** Full sidebar, 3-column dashboard
**Tablet (md:):** Collapsible sidebar, 2-column layouts
**Mobile (base):** 
- Hidden sidebar (hamburger menu)
- Single column stacking
- Bottom tab navigation (Home, Schedule, Create, Profile)
- Floating action button for "Create Post"