# How to Run Phi-TMS

## Prerequisites

- **Backend:** Python 3.10+, virtualenv recommended
- **Frontend:** Node 18+, npm
- **Optional:** Set `GEMINI_API_KEY` in backend `.env` for AI (Plan / Report) features

---

## Database setup and login

### Option A: Run backend first, then seed (recommended)

1. **Start the backend once** (see “Backend” below). On first start it creates the SQLite DB and all tables.
2. **Seed the database** (in a new terminal, same `backend` directory, venv active):

   ```bash
   cd backend
   source venv/bin/activate   # or venv\Scripts\activate on Windows
   python3 -m app.scripts.seed
   ```

3. Use the **default login credentials** below.

### Option B: Seed only (no server running)

From the `backend` directory with venv active:

```bash
cd backend
source venv/bin/activate
python3 -m app.scripts.seed
```

The seed script creates the DB file, all tables, and then inserts admin, sample employees, leave types, and holidays. Then start the backend and use the credentials below.

### Default login credentials (after seed)

| Role        | Email                   | Password     |
|------------|--------------------------|--------------|
| **Admin**  | `admin@phi-tms.com`      | `Admin@123`  |
| Developer | `sreeharipc@phiintelligence.com` | `Phi_Tmspass` |
| Developer | `melbinproy@phiintelligence.com` | `Phi_Tmspass` |

Seeded projects (**Phi-TMS**, **4OR**, **E-commerce**) use **admin** as project lead; both developers are added as members.

- **Registration:** Only an **Admin** can create new users (via the app or API). Use the admin account above to log in first, then add more users from the app if needed.

---

## 1. Backend

```bash
cd backend

# Create and activate virtualenv (recommended)
python3 -m venv venv
source venv/bin/activate   # Linux/macOS
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Ensure .env exists (copy from .env.example if needed)
# Required: DATABASE_URL, JWT_SECRET. Optional: GEMINI_API_KEY for AI.

# Run the API (creates DB + tables on first start)
# Use port 6000 when running alongside Phi Intelligence (Express uses 5000 by default).
# Set phi_intelligence TMS_API_URL=http://127.0.0.1:6000 (or match your PORT below).
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 6000 --reload
```

- API: http://localhost:5000  
- Health: http://localhost:5000/health  
- Docs: http://localhost:5000/docs  

Default DB: SQLite at `backend/phi_tms.db` (created on first run).

## 2. Frontend

```bash
cd frontend

# Install dependencies (first time)
npm install

# Ensure .env has:
# VITE_API_URL=http://localhost:5000/api

# Run dev server
npm run dev
```

- App: http://localhost:5173  

Login with a user created via the backend (e.g. Admin registration or seed).

## 3. Quick check

1. Backend: `curl http://localhost:5000/health` → `{"status":"healthy",...}`
2. Frontend: open http://localhost:5173 and log in.
3. AI (if `GEMINI_API_KEY` is set): use **AI Plan** and **Daily Report** from the nav.

## Fixes applied before run

- **Backend:** `Attendance` model missing `Integer` import → added.
- **Backend:** `employees` API used non-existent `get_employee_service` → switched to `get_all_employees_service`, `get_employee_by_id_service`, `get_employee_profile_service`, `update_employee_service`, `update_employee_profile_service`.
- **Frontend:** AI pages now use named import `{ api }` from `services/api` (default export also added for compatibility).

## Notes

- **Database:** If you change models, you may need to delete `phi_tms.db` and restart the backend so tables are recreated, or add Alembic migrations.
- **TypeScript:** `npm run build` may still report TS errors (unused vars, role types). Dev server (`npm run dev`) runs and the app is usable.
- **AI:** Without `GEMINI_API_KEY`, plan/report endpoints return an error; other features work.

## Troubleshooting

- **Seed fails (bcrypt/passlib error):** Run the seed **inside the backend virtualenv** (`source venv/bin/activate` then `python3 -m app.scripts.seed`). If you still see bcrypt errors, try `pip install "passlib[bcrypt]==1.7.4" "bcrypt==4.0.1"` in the venv.
- **No users / can't log in:** Run the seed script (see “Database setup and login” above). Use the admin credentials to log in first.
- **Registration is “Admin only”:** New users can only be created by an admin. Log in as `admin@phi-tms.com` first, then create employees from the app or via the API.
