import mysql.connector
from faker import Faker
import random
from datetime import date, timedelta
import sys
sys.stdout.reconfigure(encoding='utf-8')


fake = Faker()

# ---------------- DB CONNECTION ----------------
db = mysql.connector.connect(
    host="localhost",
    user="node_user",
    password="Node@123",
    database="ai_db"
)
cursor = db.cursor()

def done(name, count):
    print(f"✓ {name}: {count} records")

def get_ids(table):
    cursor.execute(f"SELECT id FROM {table}")
    return [row[0] for row in cursor.fetchall()]

print("\nStarting data population...\n")

# ------------------------------------------------
# 1. DEPARTMENTS (1000)
# ------------------------------------------------
departments = [
    (fake.company(), f"DEPT{i:04d}")
    for i in range(1, 1001)
]
cursor.executemany(
    "INSERT INTO departments (name, code) VALUES (%s, %s)",
    departments
)
db.commit()
done("Departments", 1000)

dept_ids = get_ids("departments")

# ------------------------------------------------
# 2. EMPLOYEES (1000)
# ------------------------------------------------
employees = [
    (fake.name(), fake.unique.email(), random.choice(dept_ids))
    for _ in range(1000)
]
cursor.executemany(
    "INSERT INTO employees (name, email, department_id) VALUES (%s, %s, %s)",
    employees
)
db.commit()
done("Employees", 1000)

emp_ids = get_ids("employees")

# ------------------------------------------------
# 3. STUDENTS (1000)
# ------------------------------------------------
students = [
    (fake.name(), fake.unique.email(), random.choice(dept_ids))
    for _ in range(1000)
]
cursor.executemany(
    "INSERT INTO students (name, email, department_id) VALUES (%s, %s, %s)",
    students
)
db.commit()
done("Students", 1000)

student_ids = get_ids("students")

# ------------------------------------------------
# 4. SEMESTERS (14)
# ------------------------------------------------
semesters = [(f"Semester {i}", 2018 + (i % 7)) for i in range(1, 15)]
cursor.executemany(
    "INSERT INTO semesters (name, year) VALUES (%s, %s)",
    semesters
)
db.commit()
done("Semesters", 14)

semester_ids = get_ids("semesters")

# ------------------------------------------------
# 5. COURSES (1000)
# ------------------------------------------------
courses = [
    (f"CS{i:04d}", fake.catch_phrase(), random.choice(dept_ids))
    for i in range(1, 1001)
]
cursor.executemany(
    "INSERT INTO courses (code, name, department_id) VALUES (%s, %s, %s)",
    courses
)
db.commit()
done("Courses", 1000)

course_ids = get_ids("courses")

# ------------------------------------------------
# 6. CLASSROOMS (1000)
# ------------------------------------------------
classrooms = [(f"R{i:03d}", random.randint(30, 120)) for i in range(1, 1001)]
cursor.executemany(
    "INSERT INTO classrooms (room_number, capacity) VALUES (%s, %s)",
    classrooms
)
db.commit()
done("Classrooms", 1000)

classroom_ids = get_ids("classrooms")

# ------------------------------------------------
# 7. SCHEDULES (1000)
# ------------------------------------------------
schedules = []
for _ in range(1000):
    start = fake.time()
    schedules.append((
        random.choice(course_ids),
        random.choice(emp_ids),
        random.choice(classroom_ids),
        random.choice(semester_ids),
        random.choice(["Monday","Tuesday","Wednesday","Thursday","Friday"]),
        start,
        (date.today() + timedelta(hours=1)).strftime("%H:%M:%S")
    ))

cursor.executemany(
    """INSERT INTO schedules
    (course_id, employee_id, classroom_id, semester_id, day_of_week, start_time, end_time)
    VALUES (%s,%s,%s,%s,%s,%s,%s)""",
    schedules
)
db.commit()
done("Schedules", 1000)

schedule_ids = get_ids("schedules")

# ------------------------------------------------
# 8. ENROLLMENTS (1000)
# ------------------------------------------------
enrollments = [
    (random.choice(student_ids), random.choice(course_ids),
     random.choice(semester_ids), date.today())
    for _ in range(1000)
]

cursor.executemany(
    "INSERT INTO enrollments (student_id, course_id, semester_id, enrollment_date) VALUES (%s,%s,%s,%s)",
    enrollments
)
db.commit()
done("Enrollments", 1000)

# ------------------------------------------------
# 9. ATTENDANCE (1000)
# ------------------------------------------------
attendance = [
    (random.choice(student_ids), random.choice(schedule_ids),
     date.today(), "present")
    for _ in range(1000)
]

cursor.executemany(
    "INSERT INTO attendance (student_id, schedule_id, date, status) VALUES (%s,%s,%s,%s)",
    attendance
)
db.commit()
done("Attendance", 1000)

# ---------------- DONE ----------------
cursor.close()
db.close()

print("\n=================================")
print("DATABASE POPULATION COMPLETED")
print("=================================\n")
