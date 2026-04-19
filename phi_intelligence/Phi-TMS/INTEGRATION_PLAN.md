# Phi-TMS: Complete Feature Gap Analysis and Integration Plan

**Purpose:** Identify every feature that exists in phi-hub/plane but is missing or incomplete in backend/frontend, and define exactly what to copy and how to integrate into the main application (backend + frontend only).  
**Rule:** Only `backend/` and `frontend/` are modified. `plane/` and `phi-hub/` are read-only references.

---

## Part A: Feature Inventory and Gap Matrix

### A.1 Authentication and users

| Feature | Backend | Phi-hub / Plane | Gap? | Action |
|--------|---------|------------------|------|--------|
| Login / JWT | Yes (auth) | Plane has different auth | No | — |
| Register (admin) | Yes | — | No | — |
| Change password, /me | Yes | — | No | — |
| Logout | Yes | — | No | — |

**Verdict:** No integration needed.

---

### A.2 Employees

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| List employees | Yes (`GET /api/employees`) | Yes (per workspace) | Partial | Backend uses no workspace; keep as-is unless you add multi-tenant workspace_id. |
| Get/Put employee, profile | Yes | Yes | No | — |
| Employee directory with employment_status filter | Partial (list exists) | Yes (filter by status) | Optional | Add optional query param `?status=ACTIVE` if desired. |
| **My profile (GET/PATCH /me)** | No dedicated `/employees/me` | Yes `GET/PATCH /employees/{ws}/me/` | **Yes** | Add `GET /api/employees/me` and `PATCH /api/employees/me` that use current user; optional: allow employee to edit own profile (limited fields). Copy idea from phi-hub `MyProfileView`. |
| **Employee attendance summary** (days present, late, total hours for month) | No | Yes `GET /employees/{ws}/{pk}/attendance-summary/` | **Yes** | Add `GET /api/employees/{id}/attendance-summary?month=&year=`; compute from existing Attendance (and breaks if you add them). Copy logic from phi-hub `EmployeeAttendanceSummaryView`. |
| Phi-hub EmployeeProfile fields (job_roles, phihub_role, manager, timezone) | Partial (designation, department, location) | job_roles, manager, timezone | Optional | Extend EmployeeProfile model/schema if you need manager, timezone, or multiple job_roles; otherwise skip. |

**Verdict:** Add: (1) `/api/employees/me` GET/PATCH, (2) `/api/employees/{id}/attendance-summary`. Optionally: employee list filter by status, extend profile fields.

---

### A.3 Attendance

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| Clock-in / clock-out | Yes | Yes | No | — |
| Break start / break end | Yes (single break in model) | Yes (multiple breaks in AttendanceBreak table) | Partial | Backend has single `break_start`/`break_end`; phi-hub has multiple breaks and `total_break_minutes`. Either keep current behavior or add AttendanceBreak model and service logic (copy from phi-hub attendance models/views). |
| Today status / daily status | Yes (`GET /daily-status`) | Yes (`/today/`) | No | — |
| My attendance history | Yes | Yes | No | — |
| Admin: employee attendance, report, roster | Yes (report, roster, employee) | Yes (admin/today, admin/report) | No | — |
| **Attendance policy** (expected start, grace, late threshold, working days) | No | Yes (AttendancePolicy model + GET/POST/PATCH) | **Yes** | Add model `AttendancePolicy` (e.g. per “workspace” or global: expected_start_time, grace_period_minutes, late_threshold_minutes, working_days JSON). Add `GET/POST/PUT /api/attendance/policy` (admin). Copy from phi-hub `AttendancePolicy`, `AttendancePolicyView`. |
| **Is_late flag and total_work_minutes** | No (no is_late; total_hours exists) | Yes (per session) | **Yes** | On clock-out (and in report), compute work minutes from clock_in/out and breaks; set `is_late` from policy if clock_in > expected+grace. Add `is_late` to Attendance model (migration) and populate in service. |
| **Attendance correction** (employee requests correction, admin approves) | No | Yes (CorrectionCreate, CorrectionList, CorrectionReview) | **Yes** | Add model `AttendanceCorrection` (attendance_id, user_id, requested_clock_in, requested_clock_out, reason, status, reviewed_by, reviewed_at). Add endpoints: `POST /api/attendance/correction`, `GET /api/attendance/corrections` (admin), `PATCH /api/attendance/corrections/{id}` (approve/reject). On approve, update Attendance row. Copy from phi-hub `AttendanceCorrection*` views. |

**Verdict:** Add: (1) AttendancePolicy model + API, (2) is_late and total_work_minutes logic, (3) AttendanceCorrection model + create/list/review API. Optionally: multiple breaks (AttendanceBreak table) if you need more than one break per day.

---

### A.4 Leave

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| Leave types CRUD | Yes (admin) | Yes | No | — |
| Leave balance, request, my-requests | Yes | Yes | No | — |
| Admin list, approve/reject | Yes | Yes | No | — |
| Calendar, holidays | Yes | Yes | No | — |
| **LeaveType: code, color, notice_days, requires_attachment** | No (name, region, days_allowed, etc.) | Yes | Optional | Add columns to LeaveType if you want: code, color, notice_days, requires_attachment; add validation for notice_days on request. Copy from phi-hub LeaveType model. |
| **LeaveBalance: pending_days** (requested but not yet approved) | No (remaining_days only) | Yes (allocated, used, pending) | Optional | Add `pending_days` to LeaveBalance; when request created add to pending_days; on approve move to used_days, on reject subtract from pending_days. Copy phi-hub balance update logic. |
| **LeaveRequest: admin_notes, attachment** | Partial (rejection_reason) | admin_notes, attachment | Optional | Add admin_notes; add attachment upload if needed. |

**Verdict:** Core leave is complete. Optional enhancements: LeaveType (code, color, notice_days), LeaveBalance (pending_days), LeaveRequest (admin_notes, attachment).

---

### A.5 Projects and tasks

| Feature | Backend | Phi-hub / Plane | Gap? | Action |
|--------|---------|------------------|------|--------|
| Projects CRUD, members, status, metrics, timeline | Yes | Plane has Issues/Projects | No | — |
| Tasks CRUD, status, assign, dependencies, comments | Yes | Plane Issues | No | — |
| Task reorder, my-tasks | Yes | — | No | — |

**Verdict:** No integration needed for core PM. Plane cycles/modules/views are out of scope.

---

### A.6 Time logs

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| Create, list, update, delete timelog | Yes | Reporter applies “log_time” to Plane activity | No | — |
| Approve/reject, timesheet, project report | Yes | — | No | — |

**Verdict:** No integration needed. AI reporter will “apply” log_time to your existing TimeLog API.

---

### A.7 Daily reports (no AI)

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| **Daily report entity** (user, date, raw content, status) | No | Yes (DailyReport model) | **Yes** | Add model `DailyReport`: user_id, date, raw_content, status (draft/submitted/processed/confirmed), optional ai_session_id. Add `POST /api/reports` (upsert), `GET /api/reports/mine`, `GET /api/reports` (admin, filter by user/date). Copy from phi-hub reports models and MyReportsView, AdminReportsView. |

**Verdict:** Add DailyReport model and reports API so employees can submit daily reports; later AI can link to same record.

---

### A.8 AI (planner and reporter)

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| **AI config (e.g. Gemini API key)** | No | ai-service config | **Yes** | Add GEMINI_API_KEY to backend config; optional, AI routes no-op or return clear error if unset. |
| **Gemini client** (call model, return JSON) | No | ai-service/services/gemini.py | **Yes** | Add `backend/app/services/ai/gemini_client.py`; port Gemini setup and ask_gemini(prompt, system_prompt). Use google-generativeai. |
| **Planner** (markdown → phases/tasks JSON) | No | ai-service/services/planner.py | **Yes** | Add `backend/app/services/ai/planner.py`; copy system prompt and analyze_plan(); call gemini_client. |
| **Reporter** (daily report text → actions JSON) | No | ai-service/services/reporter.py | **Yes** | Add `backend/app/services/ai/reporter.py`; copy system prompt and process_report(); call gemini_client. |
| **Apply planner** (create tasks from plan) | No | phihub ai_agent/plane_integration.apply_planner_actions | **Yes** | Add `backend/app/services/ai/apply_actions.py`: given plan output + project_id + user_id, call existing create_task_service for each task; map planner fields to Task. |
| **Apply reporter** (update status, add comment, log time, create task) | No | plane_integration.apply_reporter_actions | **Yes** | In apply_actions.py: for each action type (update_status, add_comment, log_time, create_task), resolve task_id and call existing task_service (update status, add_comment), timelog_service (create), create_task_service. Map AI status strings to TaskStatus enum. |
| **AI API routes** | No | phihub ai_agent views + ai-service | **Yes** | Add `backend/app/api/v1/ai.py`: POST /api/ai/plan/analyze, POST /api/ai/plan/apply, POST /api/ai/report/process, POST /api/ai/report/confirm. Register in main.py. |
| **AISession / AIAction / AIAuditLog** (optional) | No | phihub ai_agent models | Optional | Add SQLAlchemy models; store each analyze/process run and pending actions; apply endpoint updates status and writes audit. Copy from phi-hub ai_agent/models.py. |

**Verdict:** Add full AI stack in backend: config, gemini_client, planner, reporter, apply_actions, ai.py routes. Optionally add session/action/audit models for traceability.

---

### A.9 Analytics

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| **Attendance analytics** (daily summary, per-employee stats, late/missed) | No | Yes (analytics/AttendanceAnalyticsView) | **Yes** | Add `GET /api/analytics/attendance?days=30`; aggregate from Attendance (and policy for late). Return daily summary and per-user summary. Copy logic from phi-hub AttendanceAnalyticsView. |
| **Leave analytics** (by type, by employee, pending count) | No | Yes (LeaveAnalyticsView) | **Yes** | Add `GET /api/analytics/leave?year=2025`; group by leave_type and by user; include pending_approvals count. Copy from phi-hub LeaveAnalyticsView. |
| **Workload analytics** (tasks per assignee, open, overdue) | No | Yes (WorkloadAnalyticsView, uses Plane Issue) | **Yes** | Add `GET /api/analytics/workload`; from Task model: group by assignee_id, count total/open/overdue (open = not DONE, overdue = due_date < today and not DONE). Copy idea from phi-hub WorkloadAnalyticsView but use your Task model. |

**Verdict:** Add analytics API: attendance, leave, workload. New file `backend/app/api/v1/analytics.py` and optional `backend/app/services/analytics_service.py`.

---

### A.10 Payroll and notifications (backend-only)

| Feature | Backend | Phi-hub | Gap? | Action |
|--------|---------|---------|------|--------|
| **Payroll** (cycles, entries, adjustments, reports) | Models only, no API | — | **Yes** | Add `backend/app/api/v1/payroll.py`: CRUD for cycles, run payroll, list entries, adjustments, reports. Use existing payroll models. No copy from phi-hub. |
| **Notifications** (list, mark read) | Model only, no API | — | **Yes** | Add `GET /api/notifications`, `PUT /api/notifications/{id}/read` (or mark-all-read). Use existing Notification model. No copy from phi-hub. |

**Verdict:** Add payroll API and notifications API when you need them; no reference in phi-hub.

---

### A.11 Frontend

| Feature | Frontend | Gap? | Action |
|--------|----------|------|--------|
| **Broken imports** (LeaveRequest, LeaveBalance as pages) | Yes (App.tsx imports non-existent pages) | **Yes** | Remove LeaveRequest and LeaveBalance imports; remove any routes that use them. All leave under Leaves.tsx. |
| **AI: Plan analyze/apply UI** | No | **Yes** | Add page or modal: markdown input, “Analyze”, show plan summary, “Apply” with project selector. Call POST /api/ai/plan/analyze and /api/ai/plan/apply. |
| **AI: Daily report process/confirm UI** | No | **Yes** | Add page/section: daily report textarea, “Process”, show summary and actions, “Confirm” with selection. Call /api/ai/report/process and /api/ai/report/confirm. |
| **Reports: My reports / Admin reports list** | No | Optional | If you add DailyReport API: add “My reports” and “Admin reports” pages. |
| **Attendance: Policy settings, corrections** | No | Optional | If you add policy/correction API: add settings page for policy; “Request correction” and admin “Review corrections” UI. |
| **Employees: My profile, Attendance summary** | No | Optional | If you add /employees/me and attendance-summary: add profile edit page and attendance summary on employee detail. |
| **Analytics dashboard** | No | Optional | If you add analytics API: add dashboard with attendance/leave/workload charts. |
| **Payroll / Notifications UI** | No | Optional | When backend has APIs: add payroll screens and notification bell. |

**Verdict:** Fix App.tsx first. Add AI plan and AI report UI. Optionally add UI for reports, attendance corrections, employees/me and summary, analytics, payroll, notifications.

---

## Part B: Reference Sources (copy from, never edit)

| Feature to integrate | Primary source (file paths) |
|----------------------|-----------------------------|
| Employees: /me, attendance-summary | phi-hub/phi-hub/apps/api/plane/phihub/employees/views.py |
| Attendance: policy, correction, is_late | phi-hub/phi-hub/apps/api/plane/phihub/attendance/models.py, views.py |
| Leave: notice_days, pending_days, admin_notes | phi-hub/phi-hub/apps/api/plane/phihub/leave/models.py, views.py |
| Daily reports | phi-hub/phi-hub/apps/api/plane/phihub/reports/models.py, views.py, urls.py |
| AI: Gemini, planner, reporter | phi-hub/phi-hub/apps/ai-service/core/config.py, services/gemini.py, services/planner.py, services/reporter.py |
| AI: apply to Plane (→ adapt to Task/TimeLog) | phi-hub/phi-hub/apps/api/plane/phihub/ai_agent/plane_integration.py, views.py, urls.py |
| AI: session/action/audit models | phi-hub/phi-hub/apps/api/plane/phihub/ai_agent/models.py |
| Analytics | phi-hub/phi-hub/apps/api/plane/phihub/analytics/views.py |

---

## Part C: Implementation Order (detailed)

### Phase 1: Fix and stabilize (no copy)

1. **Frontend:** In `frontend/src/App.tsx`, remove imports of `LeaveRequest` and `LeaveBalance`; remove any route that renders them. Ensure all leave flows use existing Leaves, LeaveHistory, LeaveCalendar, AdminLeaveRequests.
2. **Verify:** Backend starts; frontend builds and connects; login, one project, one task, clock-in, leave request work.

### Phase 2: AI in backend (copy from phi-hub ai-service + ai_agent)

3. **Config:** Add `GEMINI_API_KEY` to `backend/app/config.py`.
4. **Gemini:** Create `backend/app/services/ai/gemini_client.py` from phi-hub `apps/ai-service/services/gemini.py` (and config). Add `google-generativeai` to backend requirements.
5. **Planner:** Create `backend/app/services/ai/planner.py` from phi-hub `services/planner.py` (prompt + analyze_plan).
6. **Reporter:** Create `backend/app/services/ai/reporter.py` from phi-hub `services/reporter.py` (prompt + process_report).
7. **Apply layer:** Create `backend/app/services/ai/apply_actions.py`: apply_planner (create Task per plan task via task_service), apply_reporter (update task status, add_comment, create timelog, create task from new_tasks). Map AI status names to TaskStatus; use existing task_service and timelog_service. Reference phi-hub `plane_integration.py` for flow, not Django/Plane code.
8. **AI routes:** Create `backend/app/api/v1/ai.py`: POST /plan/analyze, /plan/apply, /report/process, /report/confirm. Register in main.py under prefix /api/ai. Auth: existing JWT; restrict plan/apply to ADMIN/PROJECT_LEAD.
9. **Optional:** Add AISession, AIAction, AIAuditLog models (from phi-hub ai_agent/models.py), migration, and wire into AI routes for session id and audit.

### Phase 3: Daily reports in backend

10. **Model:** Add `DailyReport` (user_id, date, raw_content, status, optional ai_session_id) and migration. Reference phi-hub reports/models.py.
11. **API:** Add `POST /api/reports`, `GET /api/reports/mine`, `GET /api/reports` (admin). Optionally link report to AI in /api/ai/report/process.

### Phase 4: Attendance enhancements (copy from phi-hub attendance)

12. **Policy:** Add `AttendancePolicy` model (expected_start_time, grace_period_minutes, late_threshold_minutes, working_days, etc.). Add GET/POST/PUT /api/attendance/policy (admin). Reference phi-hub attendance policy.
13. **Is_late and work minutes:** Add `is_late` to Attendance (migration). In clock_out and report logic, compute total_work_minutes (and total_hours) and set is_late from policy.
14. **Correction:** Add `AttendanceCorrection` model and POST /api/attendance/correction, GET /api/attendance/corrections, PATCH /api/attendance/corrections/{id}. On approve, update Attendance. Reference phi-hub attendance correction views.

### Phase 5: Employee enhancements (copy from phi-hub employees)

15. **Me:** Add GET and PATCH /api/employees/me (current user profile; PATCH may restrict editable fields).
16. **Attendance summary:** Add GET /api/employees/{id}/attendance-summary?month=&year= (days present, late, total hours). Reference phi-hub EmployeeAttendanceSummaryView.

### Phase 6: Analytics (copy from phi-hub analytics)

17. **Analytics service:** Create `backend/app/services/analytics_service.py`: attendance_analytics(days), leave_analytics(year), workload_analytics(). Use existing Attendance, LeaveRequest, Task models.
18. **Analytics API:** Create `backend/app/api/v1/analytics.py`: GET /attendance, /leave, /workload. Register under /api/analytics. Reference phi-hub analytics/views.py.

### Phase 7: Optional leave/payroll/notifications

19. **Leave (optional):** Add to LeaveType: code, color, notice_days; to LeaveBalance: pending_days; to LeaveRequest: admin_notes. Update leave service and admin endpoints.
20. **Payroll API:** Add payroll router and endpoints for cycles, entries, run, adjustments, reports (using existing payroll models).
21. **Notifications API:** Add GET /api/notifications, PUT /api/notifications/{id}/read (and optionally mark-all-read).

### Phase 8: Frontend

22. **AI Plan:** New page or modal: markdown, Analyze button → POST /api/ai/plan/analyze; show summary; Apply → POST /api/ai/plan/apply with project_id.
23. **AI Report:** New page or section: daily report text, Process → POST /api/ai/report/process; show actions; Confirm → POST /api/ai/report/confirm with approved_action_ids.
24. **Navigation:** Add “AI Plan” and “Daily Report” (or “AI”) to Layout for appropriate roles.
25. **Optional frontend:** Reports list, attendance policy/corrections UI, employees/me and attendance summary, analytics dashboard, payroll, notifications bell.

---

## Part D: File Checklist (new or modified, all under backend or frontend)

### Backend – new files

- `app/services/ai/__init__.py`
- `app/services/ai/gemini_client.py`
- `app/services/ai/planner.py`
- `app/services/ai/reporter.py`
- `app/services/ai/apply_actions.py`
- `app/api/v1/ai.py`
- `app/models/ai_session.py` (optional)
- `app/models/daily_report.py`
- `app/models/attendance_policy.py` (or add to attendance.py)
- `app/models/attendance_correction.py` (or add to attendance.py)
- `app/api/v1/reports.py`
- `app/api/v1/analytics.py`
- `app/services/analytics_service.py` (optional)
- `app/api/v1/payroll.py` (when needed)
- `app/api/v1/notifications.py` (when needed)

### Backend – modified files

- `app/config.py` (GEMINI_API_KEY)
- `app/main.py` (include ai, reports, analytics, payroll, notifications routers)
- `app/models/__init__.py` (export new models)
- `app/models/attendance.py` (is_late; or policy/correction in same file)
- `app/schemas/*` (new request/response schemas as needed)
- Alembic migrations for: DailyReport, AttendancePolicy, AttendanceCorrection, is_late, optional AISession/AIAction/Audit, optional LeaveType/LeaveBalance/LeaveRequest columns

### Frontend – modified files

- `src/App.tsx` (fix imports and routes)
- `src/components/Layout.tsx` (AI nav items)
- New: `src/pages/ai/*` or similar for plan and report UI
- New: `src/services/aiApi.ts` or extend api.ts for /api/ai/* and /api/reports, /api/analytics

---

## Summary

- **Must fix:** App.tsx LeaveRequest/LeaveBalance imports and routes.
- **Must add (core):** AI (config, Gemini, planner, reporter, apply_actions, ai routes), DailyReport + reports API, then frontend AI plan/report UI.
- **Should add (from phi-hub):** Attendance policy + is_late + corrections; employees/me + attendance-summary; analytics (attendance, leave, workload).
- **Optional:** AISession/AIAction/Audit; leave enhancements (notice_days, pending_days, admin_notes); payroll and notifications API + UI; multiple attendance breaks; analytics/payroll/notifications frontend.

All of the above are integrated into the **backend** (and frontend) only; phi-hub and plane are used purely as reference to copy from.
