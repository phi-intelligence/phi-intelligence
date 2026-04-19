"""Database seed script - creates tables if needed, then seeds admin, employees, leave types, holidays."""
import asyncio
import sys
from pathlib import Path

# Ensure backend root is on path when run as script
if __name__ == "__main__":
    backend_root = Path(__file__).resolve().parent.parent.parent
    if str(backend_root) not in sys.path:
        sys.path.insert(0, str(backend_root))

from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete as sql_delete

from app.core.database import AsyncSessionLocal, init_db, create_tables
from app.core.security import get_password_hash
import app.models  # Load all models so create_tables() creates every table
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.project import Project, ProjectMember, ProjectDocument
from app.models.leave import LeaveType, LeaveBalance, PublicHoliday
from app.models.task import Task, TaskComment, TaskAttachment
from app.models.enums import Role, Region, ProjectStatus, Priority

EMPLOYEE_SEED_PASSWORD = "Phi_Tmspass"
SREEHARI_EMAIL = "sreeharipc@phiintelligence.com"
MELBIN_EMAIL = "melbinproy@phiintelligence.com"
LEGACY_DEMO_EMPLOYEE_EMAILS = (
    "john.smith@phi-tms.com",
    "priya.sharma@phi-tms.com",
    "sarah.jones@phi-tms.com",
)
SEEDED_PROJECT_CODES = ("PHI-TMS-001", "4OR-001", "ECOMM-001")


async def normalize_seeded_projects_to_admin_and_devs(
    db: AsyncSession, admin: User, dev_user_ids: list[str]
) -> None:
    """Seeded product projects: admin is project lead; both developers are members."""
    if not admin or len(dev_user_ids) < 2:
        return
    for code in SEEDED_PROJECT_CODES:
        result = await db.execute(select(Project).where(Project.project_code == code))
        project = result.scalar_one_or_none()
        if not project:
            continue
        project.project_lead_id = admin.id
        project.created_by_id = admin.id
        for uid in dev_user_ids:
            r2 = await db.execute(
                select(ProjectMember).where(
                    ProjectMember.project_id == project.id,
                    ProjectMember.user_id == uid,
                )
            )
            if r2.scalar_one_or_none():
                continue
            db.add(
                ProjectMember(
                    project_id=project.id,
                    user_id=uid,
                    role="DEVELOPER",
                    allocation_percentage=100,
                )
            )
    await db.commit()


async def seed_database():
    """Seed the database with initial data"""
    print("🌱 Starting database seed...")
    
    try:
        # Initialize database connection and create tables if they don't exist
        await init_db()
        await create_tables()
        print("✅ Database connection OK, tables ready.")
        
        async with AsyncSessionLocal() as session:
            db = session
            # Create admin user
            admin_password = get_password_hash("Admin@123")
            
            result = await db.execute(select(User).where(User.email == "admin@phi-tms.com"))
            admin = result.scalar_one_or_none()
            
            if not admin:
                admin = User(
                    email="admin@phi-tms.com",
                    username="admin",
                    password=admin_password,
                    role=Role.ADMIN.value,
                    is_active=True,
                )
                db.add(admin)
                await db.flush()
                
                # Create admin profile
                admin_profile = EmployeeProfile(
                    user_id=admin.id,
                    first_name="System",
                    last_name="Administrator",
                    phone="+44 20 7946 0958",
                    designation="System Administrator",
                    department="IT",
                    location=Region.UK.value,
                    join_date=datetime(2024, 1, 1),
                )
                db.add(admin_profile)
                await db.commit()
                await db.refresh(admin)
                print("✅ Admin user created:", admin.email)
            else:
                print("ℹ️  Admin user already exists")

            result = await db.execute(select(User).where(User.email == "admin@phi-tms.com"))
            admin = result.scalar_one_or_none()
            
            # Two developers (production) — same portal password; admin owns seeded projects as lead
            employees = [
                {
                    "email": SREEHARI_EMAIL,
                    "username": "sreeharipc",
                    "first_name": "Sreehari",
                    "last_name": "PC",
                    "designation": "Developer",
                    "department": "Engineering",
                    "location": Region.UK.value,
                    "phone": None,
                    "role": Role.EMPLOYEE.value,
                },
                {
                    "email": MELBIN_EMAIL,
                    "username": "melbinproy",
                    "first_name": "Melbin",
                    "last_name": "Proy",
                    "designation": "Developer",
                    "department": "Engineering",
                    "location": Region.UK.value,
                    "phone": None,
                    "role": Role.EMPLOYEE.value,
                },
            ]
            pwd_hash = get_password_hash(EMPLOYEE_SEED_PASSWORD)

            for emp_data in employees:
                result = await db.execute(select(User).where(User.email == emp_data["email"]))
                user = result.scalar_one_or_none()

                if not user:
                    user = User(
                        email=emp_data["email"],
                        username=emp_data["username"],
                        password=pwd_hash,
                        role=emp_data["role"],
                        is_active=True,
                    )
                    db.add(user)
                    await db.flush()

                    profile = EmployeeProfile(
                        user_id=user.id,
                        first_name=emp_data["first_name"],
                        last_name=emp_data["last_name"],
                        phone=emp_data["phone"],
                        designation=emp_data["designation"],
                        department=emp_data["department"],
                        location=emp_data["location"],
                        join_date=datetime(2024, 1, 15),
                    )
                    db.add(profile)
                    await db.commit()
                    await db.refresh(user)
                    print(f"✅ Employee created: {user.email}")
                else:
                    user.password = pwd_hash
                    user.is_active = True
                    user.role = emp_data["role"]
                    result = await db.execute(
                        select(EmployeeProfile).where(EmployeeProfile.user_id == user.id)
                    )
                    prof = result.scalar_one_or_none()
                    if prof:
                        prof.designation = emp_data["designation"]
                    await db.commit()
                    print(f"ℹ️  Employee updated (password, role, profile): {emp_data['email']}")
            
            result = await db.execute(select(User).where(User.email == SREEHARI_EMAIL))
            sreehari_user = result.scalar_one_or_none()
            result = await db.execute(select(User).where(User.email == MELBIN_EMAIL))
            melbin_user = result.scalar_one_or_none()
            dev_ids = (
                [sreehari_user.id, melbin_user.id]
                if sreehari_user and melbin_user
                else []
            )

            result = await db.execute(select(Project).where(Project.project_code == "PHI-TMS-001"))
            existing_project = result.scalar_one_or_none()
            if not existing_project:
                if admin and sreehari_user and melbin_user:
                    project = Project(
                        name="Phi-TMS Platform",
                        description="Internal project and time management system.",
                        client_name="Phi Intelligence",
                        project_code="PHI-TMS-001",
                        status=ProjectStatus.ACTIVE.value,
                        start_date=datetime(2025, 1, 1),
                        end_date=datetime(2025, 12, 31),
                        estimated_hours=500,
                        project_lead_id=admin.id,
                        created_by_id=admin.id,
                        region=Region.UK.value,
                        priority=Priority.HIGH.value,
                    )
                    db.add(project)
                    await db.flush()
                    for uid in dev_ids:
                        db.add(
                            ProjectMember(
                                project_id=project.id,
                                user_id=uid,
                                role="DEVELOPER",
                                allocation_percentage=100,
                            )
                        )
                    await db.commit()
                    print("✅ Sample project created: Phi-TMS Platform")
                else:
                    print("ℹ️  Skipping PHI-TMS project seed: need admin and both developers")
            else:
                print("ℹ️  Sample project already exists")

            # Active client projects: 4OR Car Wash + E-commerce
            business_projects = [
                {
                    "code": "4OR-001",
                    "name": "4OR Car Wash",
                    "description": "4OR car wash product. Repos: phi-intelligence/car_wash_application, car_wash_backend, car_wash_frontend.",
                    "client_name": "4OR",
                },
                {
                    "code": "ECOMM-001",
                    "name": "E-commerce",
                    "description": "E-commerce platform. Repo: phi-intelligence/e-commerce.",
                    "client_name": "E-commerce",
                },
            ]
            if admin and sreehari_user and melbin_user:
                for bp in business_projects:
                    result = await db.execute(select(Project).where(Project.project_code == bp["code"]))
                    if result.scalar_one_or_none():
                        print(f"ℹ️  Project already exists: {bp['code']}")
                        continue
                    proj = Project(
                        name=bp["name"],
                        description=bp["description"],
                        client_name=bp["client_name"],
                        project_code=bp["code"],
                        status=ProjectStatus.ACTIVE.value,
                        start_date=datetime(2025, 1, 1),
                        end_date=datetime(2026, 12, 31),
                        estimated_hours=800,
                        project_lead_id=admin.id,
                        created_by_id=admin.id,
                        region=Region.UK.value,
                        priority=Priority.HIGH.value,
                    )
                    db.add(proj)
                    await db.flush()
                    for uid in dev_ids:
                        db.add(
                            ProjectMember(
                                project_id=proj.id,
                                user_id=uid,
                                role="DEVELOPER",
                                allocation_percentage=100,
                            )
                        )
                    await db.commit()
                    print(f"✅ Project created: {bp['name']} ({bp['code']})")
            else:
                print("ℹ️  Skipping business projects seed: need admin and both developers")

            # Remove legacy @phi-tms.com demo employees (FK-safe), then align seeded projects
            legacy_users: list[User] = []
            for legacy_email in LEGACY_DEMO_EMPLOYEE_EMAILS:
                result = await db.execute(select(User).where(User.email == legacy_email))
                u = result.scalar_one_or_none()
                if u:
                    legacy_users.append(u)
            legacy_ids = [u.id for u in legacy_users]
            john_legacy = next((u for u in legacy_users if u.email == "john.smith@phi-tms.com"), None)

            if john_legacy and sreehari_user and melbin_user:
                result = await db.execute(
                    select(ProjectMember).where(ProjectMember.user_id == john_legacy.id)
                )
                john_project_ids = {pm.project_id for pm in result.scalars().all()}
                await db.execute(sql_delete(ProjectMember).where(ProjectMember.user_id == john_legacy.id))
                await db.commit()
                for pid in john_project_ids:
                    for uid in (sreehari_user.id, melbin_user.id):
                        r2 = await db.execute(
                            select(ProjectMember).where(
                                ProjectMember.project_id == pid,
                                ProjectMember.user_id == uid,
                            )
                        )
                        if r2.scalar_one_or_none():
                            continue
                        db.add(
                            ProjectMember(
                                project_id=pid,
                                user_id=uid,
                                role="DEVELOPER",
                                allocation_percentage=100,
                            )
                        )
                await db.commit()

            if legacy_ids and admin:
                await db.execute(
                    update(Project)
                    .where(Project.project_lead_id.in_(legacy_ids))
                    .values(project_lead_id=admin.id)
                )
                await db.execute(
                    update(Project)
                    .where(Project.created_by_id.in_(legacy_ids))
                    .values(created_by_id=admin.id)
                )
                await db.execute(
                    update(Task).where(Task.assignee_id.in_(legacy_ids)).values(assignee_id=None)
                )
                await db.execute(
                    update(Task).where(Task.reporter_id.in_(legacy_ids)).values(reporter_id=admin.id)
                )
                await db.execute(
                    update(TaskComment)
                    .where(TaskComment.user_id.in_(legacy_ids))
                    .values(user_id=admin.id)
                )
                await db.execute(
                    update(TaskAttachment)
                    .where(TaskAttachment.uploaded_by_id.in_(legacy_ids))
                    .values(uploaded_by_id=admin.id)
                )
                await db.execute(
                    update(ProjectDocument)
                    .where(ProjectDocument.uploaded_by_id.in_(legacy_ids))
                    .values(uploaded_by_id=admin.id)
                )
                await db.commit()

            for u in legacy_users:
                await db.delete(u)
            if legacy_users:
                await db.commit()
                print("🗑️  Removed legacy demo employees (@phi-tms.com)")

            if admin and sreehari_user and melbin_user:
                await normalize_seeded_projects_to_admin_and_devs(db, admin, dev_ids)
            
            # Create leave types for UK
            uk_leave_types = [
                {
                    "name": "Annual Leave",
                    "region": Region.UK.value,
                    "days_allowed": 28,
                    "carry_forward": True,
                    "is_encashable": False,
                    "description": "Annual holiday entitlement including bank holidays",
                },
                {
                    "name": "Sick Leave",
                    "region": Region.UK.value,
                    "days_allowed": 28,
                    "carry_forward": False,
                    "is_encashable": False,
                    "description": "Statutory Sick Pay eligible leave",
                },
                {
                    "name": "Maternity Leave",
                    "region": Region.UK.value,
                    "days_allowed": 365,
                    "carry_forward": False,
                    "is_encashable": False,
                    "description": "Statutory Maternity Leave (52 weeks)",
                },
                {
                    "name": "Paternity Leave",
                    "region": Region.UK.value,
                    "days_allowed": 14,
                    "carry_forward": False,
                    "is_encashable": False,
                    "description": "Statutory Paternity Leave",
                },
            ]
            
            for leave_type_data in uk_leave_types:
                result = await db.execute(
                    select(LeaveType).where(
                        LeaveType.name == leave_type_data["name"],
                        LeaveType.region == leave_type_data["region"]
                    )
                )
                leave_type = result.scalar_one_or_none()
                
                if not leave_type:
                    leave_type = LeaveType(**leave_type_data)
                    db.add(leave_type)
                    await db.commit()
                    print(f"✅ UK leave type created: {leave_type_data['name']}")
            
            # Create leave types for India
            india_leave_types = [
                {
                    "name": "Earned Leave",
                    "region": Region.INDIA.value,
                    "days_allowed": 18,
                    "accrual_rate": 1.5,
                    "carry_forward": True,
                    "is_encashable": True,
                    "description": "Privileged Leave / Earned Leave",
                },
                {
                    "name": "Casual Leave",
                    "region": Region.INDIA.value,
                    "days_allowed": 12,
                    "carry_forward": False,
                    "is_encashable": False,
                    "description": "Casual Leave for unforeseen circumstances",
                },
                {
                    "name": "Sick Leave",
                    "region": Region.INDIA.value,
                    "days_allowed": 15,
                    "carry_forward": True,
                    "is_encashable": False,
                    "description": "Sick Leave with medical certificate",
                },
                {
                    "name": "Maternity Leave",
                    "region": Region.INDIA.value,
                    "days_allowed": 182,
                    "carry_forward": False,
                    "is_encashable": False,
                    "description": "Maternity Benefit Leave (26 weeks)",
                },
                {
                    "name": "Paternity Leave",
                    "region": Region.INDIA.value,
                    "days_allowed": 7,
                    "carry_forward": False,
                    "is_encashable": False,
                    "description": "Paternity Leave",
                },
            ]
            
            for leave_type_data in india_leave_types:
                result = await db.execute(
                    select(LeaveType).where(
                        LeaveType.name == leave_type_data["name"],
                        LeaveType.region == leave_type_data["region"]
                    )
                )
                leave_type = result.scalar_one_or_none()
                
                if not leave_type:
                    leave_type = LeaveType(**leave_type_data)
                    db.add(leave_type)
                    await db.commit()
                    print(f"✅ India leave type created: {leave_type_data['name']}")
            
            # Create UK public holidays for 2024
            uk_holidays = [
                {"name": "New Year's Day", "date": datetime(2024, 1, 1)},
                {"name": "Good Friday", "date": datetime(2024, 3, 29)},
                {"name": "Easter Monday", "date": datetime(2024, 4, 1)},
                {"name": "May Day Bank Holiday", "date": datetime(2024, 5, 6)},
                {"name": "Spring Bank Holiday", "date": datetime(2024, 5, 27)},
                {"name": "Summer Bank Holiday", "date": datetime(2024, 8, 26)},
                {"name": "Christmas Day", "date": datetime(2024, 12, 25)},
                {"name": "Boxing Day", "date": datetime(2024, 12, 26)},
            ]
            
            for holiday_data in uk_holidays:
                result = await db.execute(
                    select(PublicHoliday).where(
                        PublicHoliday.date == holiday_data["date"],
                        PublicHoliday.region == Region.UK.value
                    )
                )
                holiday = result.scalar_one_or_none()
                
                if not holiday:
                    holiday = PublicHoliday(
                        name=holiday_data["name"],
                        date=holiday_data["date"],
                        region=Region.UK.value,
                    )
                    db.add(holiday)
                    await db.commit()
            
            print("✅ UK public holidays created")
            
            # Create India public holidays for 2024
            india_holidays = [
                {"name": "Republic Day", "date": datetime(2024, 1, 26)},
                {"name": "Holi", "date": datetime(2024, 3, 25)},
                {"name": "Good Friday", "date": datetime(2024, 3, 29)},
                {"name": "Eid ul-Fitr", "date": datetime(2024, 4, 11)},
                {"name": "Independence Day", "date": datetime(2024, 8, 15)},
                {"name": "Gandhi Jayanti", "date": datetime(2024, 10, 2)},
                {"name": "Diwali", "date": datetime(2024, 11, 1)},
                {"name": "Christmas Day", "date": datetime(2024, 12, 25)},
            ]
            
            for holiday_data in india_holidays:
                result = await db.execute(
                    select(PublicHoliday).where(
                        PublicHoliday.date == holiday_data["date"],
                        PublicHoliday.region == Region.INDIA.value
                    )
                )
                holiday = result.scalar_one_or_none()
                
                if not holiday:
                    holiday = PublicHoliday(
                        name=holiday_data["name"],
                        date=holiday_data["date"],
                        region=Region.INDIA.value,
                    )
                    db.add(holiday)
                    await db.commit()
            
            print("✅ India public holidays created")
            
            # Initialize leave balances for all users
            result = await db.execute(select(User))
            users = result.scalars().all()
            
            for user in users:
                result = await db.execute(
                    select(EmployeeProfile).where(EmployeeProfile.user_id == user.id)
                )
                profile = result.scalar_one_or_none()
                
                if profile:
                    # Initialize leave balances
                    current_year = datetime.utcnow().year
                    
                    # Get leave types for the user's region
                    result = await db.execute(
                        select(LeaveType).where(
                            (LeaveType.region == profile.location) | (LeaveType.region == "BOTH"),
                            LeaveType.is_active == True
                        )
                    )
                    leave_types = result.scalars().all()
                    
                    # Create leave balances
                    for leave_type in leave_types:
                        result = await db.execute(
                            select(LeaveBalance).where(
                                LeaveBalance.user_id == user.id,
                                LeaveBalance.leave_type_id == leave_type.id,
                                LeaveBalance.year == current_year
                            )
                        )
                        existing_balance = result.scalar_one_or_none()
                        
                        if not existing_balance:
                            leave_balance = LeaveBalance(
                                user_id=user.id,
                                leave_type_id=leave_type.id,
                                year=current_year,
                                total_days=float(leave_type.days_allowed),
                                used_days=0.0,
                                remaining_days=float(leave_type.days_allowed),
                            )
                            db.add(leave_balance)
                            await db.commit()
                    
                    print(f"✅ Leave balances initialized for {user.email}")
            
            print("🎉 Database seeded successfully!")
            print("")
            print("Default credentials:")
            print("  Admin:")
            print("    Email: admin@phi-tms.com")
            print("    Password: Admin@123")
            print("")
            print("  Developers (shared password):")
            print(f"    {SREEHARI_EMAIL}")
            print(f"    {MELBIN_EMAIL}")
            print(f"    Password: {EMPLOYEE_SEED_PASSWORD}")
            print("  (Seeded projects use admin as project lead; both developers are team members.)")
            
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(seed_database())

