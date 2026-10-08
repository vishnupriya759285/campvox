import { PrismaClient, Role, IssueStatus, Priority, Category } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FixMyCampus database seed...');

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@123', salt);
  const studentHash = await bcrypt.hash('Student@123', salt);
  const facultyHash = await bcrypt.hash('Faculty@123', salt);
  const maintHash = await bcrypt.hash('Maint@123', salt);

  // 1. Seed Departments
  const electrical = await prisma.department.upsert({
    where: { name: 'Electrical' },
    update: {},
    create: {
      name: 'Electrical',
      description: 'Power, wiring, fans, lighting, and electrical distribution',
    },
  });

  const itSupport = await prisma.department.upsert({
    where: { name: 'IT Support' },
    update: {},
    create: {
      name: 'IT Support',
      description: 'Campus Wi-Fi, computer labs, projectors, and networking',
    },
  });

  const plumbing = await prisma.department.upsert({
    where: { name: 'Plumbing' },
    update: {},
    create: {
      name: 'Plumbing',
      description: 'Restrooms, water supply, washbasins, and pipeline leaks',
    },
  });

  const housekeeping = await prisma.department.upsert({
    where: { name: 'Housekeeping' },
    update: {},
    create: {
      name: 'Housekeeping',
      description: 'Classroom cleanliness, waste management, and sanitization',
    },
  });

  const maintenance = await prisma.department.upsert({
    where: { name: 'General Maintenance' },
    update: {},
    create: {
      name: 'General Maintenance',
      description: 'Furniture repair, carpentry, civil maintenance, and air conditioning',
    },
  });

  console.log('✅ Departments seeded');

  // 2. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fixmycampus.edu' },
    update: {},
    create: {
      name: 'Admin Operations',
      email: 'admin@fixmycampus.edu',
      passwordHash: adminHash,
      role: Role.ADMIN,
      departmentId: maintenance.id,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@fixmycampus.edu' },
    update: {},
    create: {
      name: 'Vishnupriya M. V.',
      email: 'student@fixmycampus.edu',
      passwordHash: studentHash,
      role: Role.STUDENT,
    },
  });

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@fixmycampus.edu' },
    update: {},
    create: {
      name: 'Dr. Animesh Roy',
      email: 'faculty@fixmycampus.edu',
      passwordHash: facultyHash,
      role: Role.FACULTY,
    },
  });

  const maintStaff = await prisma.user.upsert({
    where: { email: 'maintenance@fixmycampus.edu' },
    update: {},
    create: {
      name: 'Sajeev K.',
      email: 'maintenance@fixmycampus.edu',
      passwordHash: maintHash,
      role: Role.MAINTENANCE,
      departmentId: maintenance.id,
    },
  });

  const workerSeedHash = await bcrypt.hash('Worker@123', salt);

  const collegeWorkersData = [
    // 1. Electrical Section (3 Workers)
    { name: 'Rajesh Kumar', email: 'rajesh.electrician@campvox.edu', deptId: electrical.id },
    { name: 'Suresh Varma', email: 'suresh.electrician@campvox.edu', deptId: electrical.id },
    { name: 'Mohan Das', email: 'mohan.electrician@campvox.edu', deptId: electrical.id },

    // 2. Plumbing Section (3 Workers)
    { name: 'Ramesh Babu', email: 'ramesh.plumber@campvox.edu', deptId: plumbing.id },
    { name: 'K. Venkatesh', email: 'venkatesh.plumber@campvox.edu', deptId: plumbing.id },
    { name: 'Anand Swamy', email: 'anand.plumber@campvox.edu', deptId: plumbing.id },

    // 3. IT & Network Section (3 Workers)
    { name: 'Karthik Reddy', email: 'karthik.it@campvox.edu', deptId: itSupport.id },
    { name: 'Priya Sharma', email: 'priya.it@campvox.edu', deptId: itSupport.id },
    { name: 'Vignesh Nair', email: 'vignesh.it@campvox.edu', deptId: itSupport.id },

    // 4. Facilities & Maintenance Section (3 Workers)
    { name: 'Murugan Selvam', email: 'murugan.facilities@campvox.edu', deptId: maintenance.id },
    { name: 'G. Balaji', email: 'balaji.facilities@campvox.edu', deptId: maintenance.id },
    { name: 'Lakshmi Narayanan', email: 'lakshmi.facilities@campvox.edu', deptId: maintenance.id },
  ];

  for (const worker of collegeWorkersData) {
    await prisma.user.upsert({
      where: { email: worker.email },
      update: { name: worker.name, departmentId: worker.deptId },
      create: {
        name: worker.name,
        email: worker.email,
        passwordHash: workerSeedHash,
        role: Role.MAINTENANCE,
        departmentId: worker.deptId,
      },
    });
  }

  console.log('✅ Users seeded (Admin, Student, Faculty, Maintenance + 12 Registered College Workers)');

  // 3. Seed Sample Issues
  const issueCount = await prisma.issue.count();
  if (issueCount === 0) {
    const issue1 = await prisma.issue.create({
      data: {
        title: 'Broken Classroom Fan',
        description: 'The classroom fan is not working. It makes a slight noise when we try to turn it on.',
        category: Category.EQUIPMENT,
        priority: Priority.HIGH,
        location: 'Block A - Room 204',
        status: IssueStatus.IN_PROGRESS,
        reporterId: student.id,
        assignedDepartmentId: maintenance.id,
        assignedStaffId: maintStaff.id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1594916892694-82ee12389369?auto=format&fit=crop&w=800&q=80',
            },
          ],
        },
        comments: {
          create: [
            {
              userId: maintStaff.id,
              comment: 'Started working on the issue. Will update soon.',
            },
            {
              userId: student.id,
              comment: 'Thank you! Please let me know once it is fixed.',
            },
          ],
        },
        statusHistory: {
          create: [
            {
              oldStatus: null,
              newStatus: IssueStatus.REPORTED,
              changedBy: student.id,
            },
            {
              oldStatus: IssueStatus.REPORTED,
              newStatus: IssueStatus.ASSIGNED,
              changedBy: admin.id,
            },
            {
              oldStatus: IssueStatus.ASSIGNED,
              newStatus: IssueStatus.IN_PROGRESS,
              changedBy: maintStaff.id,
            },
          ],
        },
      },
    });

    await prisma.issue.create({
      data: {
        title: 'Wi-Fi not working in Computer Lab',
        description: 'No internet connectivity in Computer Lab 2 on the third floor.',
        category: Category.WIFI,
        priority: Priority.HIGH,
        location: 'Lab Block - Room 302',
        status: IssueStatus.REPORTED,
        reporterId: student.id,
      },
    });

    await prisma.issue.create({
      data: {
        title: 'Water leakage near Block B',
        description: 'Pipeline valve leaking continuously in ground floor restroom.',
        category: Category.PLUMBING,
        priority: Priority.HIGH,
        location: 'Block B - Restroom 1F',
        status: IssueStatus.REOPENED,
        reporterId: faculty.id,
        assignedDepartmentId: plumbing.id,
      },
    });

    console.log('✅ Sample issues seeded with images, comments, and history');
  }

  console.log('🎉 FixMyCampus database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
