# Table View Implementation Plan: Projects & Tasks

This plan adds **table (list) views** for both **Projects** and **Tasks**, aligned with the reference design (columns for status, priority, due date, assignee/lead, labels, search, and actions).

---

## Current State

| Area | Current UI | Route / Location |
|------|------------|-------------------|
| **Projects** | Card grid + summary cards + filters (search, status, priority, region) | `ProjectList.tsx` → `/projects` |
| **Tasks** | Kanban board (columns by status) + `TaskFilters` + drag-and-drop | `TaskBoard.tsx` → `/projects/:id/tasks` |

Backend already exposes:
- **Projects:** `GET /api/projects/` with filters, pagination, and serialized datetimes.
- **Tasks:** `GET /api/projects/:id/tasks` and `GET /api/tasks/my-tasks`; tasks include `title`, `status`, `priority`, `dueDate`, `assignee`, `labels`, `tags`.

---

## 1. Projects Table View

### 1.1 Goal

Replace (or optionally toggle with) the current **card grid** with a **data table**:

- **Columns:** Name, Project code, Status, Priority, Region, End date, Lead, Actions.
- **Header:** Title “Projects”, search bar, “New Project” (and “Invite” if applicable), keep existing filters or move into table toolbar.
- **Row actions:** Open project, Edit, View tasks (link to task board/table).
- **Empty state:** Same as current (“No projects found”, “Create Project” when allowed).

### 1.2 Implementation Steps

| Step | Task | Details |
|------|------|---------|
| 1.1 | Reuse or add shared table component | Optional: generic `DataTable` (header, sortable columns, row click, loading, empty state). Can start with a plain `<table>` in `ProjectList`. |
| 1.2 | Add Projects table to `ProjectList` | Replace or add a view mode (e.g. “Cards” vs “Table”). Table columns: Name (link to detail), Code, Status (badge), Priority (badge/icon), Region, End date (formatted), Lead (name or “—” ), Actions (View tasks, Edit for admin/PM). |
| 1.3 | Keep summary cards + filters | Keep the four summary cards and the existing filter row (Search, Status, Priority, Region). Table sits below. |
| 1.4 | Responsive behavior | On small screens: either horizontal scroll for table or collapse to a compact list (e.g. one row per project with key fields). |
| 1.5 | Permissions | “New Project” / Edit only for ADMIN and PROJECT_LEAD (or PROJECT_MANAGER per current logic). No backend change. |

### 1.3 Files to Touch

- `frontend/src/pages/projects/ProjectList.tsx` – main changes (table layout, optional view toggle).
- Optionally: `frontend/src/components/ui/DataTable.tsx` (or `projects/ProjectsTable.tsx`) if you want a reusable table component.
- Types: `Project` already has all needed fields (`name`, `projectCode`, `status`, `priority`, `region`, `endDate`, `projectLead`).

### 1.4 API / Backend

- No backend changes required. Use existing `projectApi.getProjects(filters)` and map `project.projectLead` (or lead name) for the Lead column.

---

## 2. Tasks Table View

### 2.1 Goal

Add a **table view** for tasks **alongside** the existing Kanban on the project task page:

- **Columns:** Title, Labels/Tags, Priority, Status, Due date, Assignee, Actions (open detail, log time).
- **Header:** Project name (or “My tasks”), search, “Add task” / “New”, optional “Layout” toggle: **Board** | **Table**.
- **Row behavior:** Click row or “Open” to open `TaskDetailModal`; optional inline “Log time” that opens `TimeLogModal`.
- **Optional:** Checkbox column for “done” (e.g. mark status as DONE) to mirror reference.

### 2.2 Implementation Steps

| Step | Task | Details |
|------|------|---------|
| 2.1 | Add layout toggle on TaskBoard page | State: `viewMode: 'board' | 'table'`. Toggle in header (tabs or buttons). Default can stay “Board”. |
| 2.2 | Create `TaskTable` component | Renders a table: Title (link or click to open detail), Labels (tags from `task.labels` / `task.tags`), Priority (badge/icon), Status (badge), Due date (formatted), Assignee (name or “Unassigned”), Actions (Open, Log time). Reuse `TaskFilters` so filtering works for both board and table. |
| 2.3 | Wire data and modals | Reuse same `tasks` / `filteredTasks` and `selectedTaskId` / `setSelectedTaskId` and `timeLogModalData` so `TaskDetailModal` and `TimeLogModal` work from the table (e.g. “Open” sets `selectedTaskId`, “Log time” sets `timeLogModalData`). |
| 2.4 | Optional: inline status or “done” | If desired, add a small dropdown or checkbox in the table row to change status (e.g. mark DONE) without opening the full modal; call `taskApi.updateTaskStatus(id, status)`. |
| 2.5 | Responsive | On small screens: horizontal scroll or card-like rows (stacked fields) for the task table. |

### 2.3 Files to Touch

- `frontend/src/pages/projects/TaskBoard.tsx` – add view toggle and render either Kanban or `TaskTable`.
- **New:** `frontend/src/components/tasks/TaskTable.tsx` – table of tasks (columns above), receives `tasks`, `projectId`, `onOpenTask`, `onLogTime`, optional `onStatusChange`.
- Reuse: `TaskFilters`, `TaskDetailModal`, `TimeLogModal`, `taskApi`, types in `types/task.ts`.

### 2.4 API / Backend

- No backend changes. Use existing `taskApi.getProjectTasks(projectId)` and `taskApi.getMyTasks()`; tasks already include `assignee`, `labels`, `tags`, `dueDate`, `status`, `priority`.

---

## 3. Suggested Order of Work

1. **Phase 1 – Projects table**  
   - Implement table in `ProjectList` (or new `ProjectsTable`).  
   - Keep cards as default or make table default; optional view toggle.  
   - Ensures shared patterns (table styling, status/priority badges) before tasks.

2. **Phase 2 – Tasks table**  
   - Add `TaskTable` component and view toggle on `TaskBoard`.  
   - Reuse same badge/date patterns as projects table where possible.

3. **Phase 3 (optional)**  
   - Extract a small shared `DataTable` or “table layout” component.  
   - Add sortable column headers (e.g. by due date, status) if needed.

---

## 4. UI Consistency (Reference-Alignment)

- **Status:** Use existing `StatusBadge` or similar; green = Completed/DONE, orange = In progress, yellow = In review, etc., matching your current Kanban/task colors.
- **Priority:** Icons or colored badges (e.g. red = High/Critical, yellow = Medium).
- **Dates:** One format across app (e.g. “Mon DD, YYYY” or “DD MMM YYYY”) via `formatDate` in `utils/formatters`.
- **Labels/Tags:** Render `task.labels` / `task.tags` as small pills (as in reference); if backend returns comma-separated string, split and render.
- **Empty states:** “No projects found” / “No tasks” with primary action (Create project / Add task) when permitted.

---

## 5. Summary

| Deliverable | Description |
|-------------|-------------|
| **Projects table** | Table view on `/projects` with columns: Name, Code, Status, Priority, Region, End date, Lead, Actions; same filters and permissions as today. |
| **Tasks table** | New table view on `/projects/:id/tasks` with Board/Table toggle; columns: Title, Labels, Priority, Status, Due date, Assignee, Actions; same data and modals as Kanban. |
| **Backend** | No API changes; use existing project and task endpoints. |
| **Optional** | Shared `DataTable`, sortable columns, inline status/done in task table. |

This plan keeps existing behavior and APIs and adds the table-based layout for both projects and tasks as in the reference design.
