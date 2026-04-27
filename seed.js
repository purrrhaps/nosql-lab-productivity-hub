// seed.js
// =============================================================================
//  Seed the database with realistic test data.
//  Run with: npm run seed
// =============================================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear existing data so re-seeding is idempotent
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  console.log('Database cleared. Beginning seed process...');

  try {
    // =========================================================================
    // 1. Seed Users
    // =========================================================================
    const hash1 = await bcrypt.hash('password123', 10);
    const hash2 = await bcrypt.hash('securepass456', 10);

    const userResult = await db.collection('users').insertMany([
      { email: "student1@itu.edu.pk", passwordHash: hash1, name: "Alice", createdAt: new Date() },
      { email: "student2@itu.edu.pk", passwordHash: hash2, name: "Bob", createdAt: new Date() }
    ]);
    
    // Extract the generated ObjectIds
    const [u1, u2] = Object.values(userResult.insertedIds);
    console.log(`Inserted 2 users.`);

    // =========================================================================
    // 2. Seed Projects
    // =========================================================================
    const projectResult = await db.collection('projects').insertMany([
      { userId: u1, name: "Advanced DB Lab", isArchived: false },
      { userId: u1, name: "Habit Stacking Tracker", isArchived: false },
      { userId: u2, name: "x86 Assembly Study Guide", isArchived: false },
      { userId: u2, name: "Archived Project", isArchived: true }
    ]);
    
    const [p1, p2, p3, p4] = Object.values(projectResult.insertedIds);
    console.log(`Inserted 4 projects.`);

    // =========================================================================
    // 3. Seed Tasks
    // =========================================================================
    await db.collection('tasks').insertMany([
      // Task 1: Standard task for User 1
      { 
        ownerId: u1, projectId: p1, title: "Design NoSQL Schema", status: "done", priority: 1, 
        tags: ["mongodb", "urgent"], subtasks: [{ title: "Users & Projects", done: true }, { title: "Tasks & Notes", done: true }], 
        createdAt: new Date() 
      },
      // Task 2: Demonstrates schema flexibility with 'dueDate' added
      { 
        ownerId: u1, projectId: p1, title: "Write Seed Script", status: "in-progress", priority: 2, 
        tags: ["nodejs"], subtasks: [{ title: "Hash passwords", done: true }], 
        createdAt: new Date(), dueDate: new Date('2026-05-01') 
      },
      // Task 3: Another task for User 1
      { 
        ownerId: u1, projectId: p2, title: "Morning bar hangs", status: "todo", priority: 3, 
        tags: ["health", "daily"], subtasks: [], 
        createdAt: new Date() 
      },
      // Task 4: Task for User 2, also using 'dueDate'
      { 
        ownerId: u2, projectId: p3, title: "Read Chapter 6 entirely", status: "todo", priority: 1, 
        tags: ["study", "low-level"], subtasks: [{ title: "Understand DOS interrupts", done: false }], 
        createdAt: new Date(), dueDate: new Date('2026-05-10') 
      },
      // Task 5: Task for User 2 in archived project
      { 
        ownerId: u2, projectId: p4, title: "Update visual ledger", status: "todo", priority: 2, 
        tags: [], subtasks: [], 
        createdAt: new Date() 
      }
    ]);
    console.log(`Inserted 5 tasks.`);

    // =========================================================================
    // 4. Seed Notes
    // =========================================================================
    await db.collection('notes').insertMany([
      { projectId: p1, content: "Remember to use $lookup for NoSQL joins in queries 14 and 15.", tags: ["reminder"] },
      { projectId: p3, content: "Registers DL, AH, and AL are crucial for debugging the snippets.", tags: ["assembly", "tips"] },
      { projectId: p2, content: "Do the exercises while waiting for the morning coffee to warm up.", tags: ["routine"] },
      // Standalone note (no projectId) demonstrating schema flexibility
      { content: "Buy groceries after the lab.", tags: ["personal", "errand"] },
      { content: "Review objective self-examination questions later tonight.", tags: ["personal"] }
    ]);
    console.log(`Inserted 5 notes.`);

    console.log('Seeding successfully completed!');
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit(0);
  }
})();