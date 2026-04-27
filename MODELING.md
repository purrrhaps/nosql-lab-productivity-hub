# Schema Design — Personal Productivity Hub

> Fill in every section below. Keep answers concise.

---

## 1. Collections Overview

Briefly describe each collection (1–2 sentences each):

- **users** — Stores application users and handles authentication via unique emails and passwords.
- **projects** — Represents individual workspaces that are exclusively owned by a single user.
- **tasks** — Work items that belong to specific projects, containing their own statuses, priorities, and embedded arrays.
- **notes** — Free-form text documents that can either be tied to a specific project or exist completely independently.

---

## 2. Document Shapes

For each collection, write the document shape (field name + type + required/optional):

### users
```text
{
  _id: ObjectId,
  email: string (required, unique),
  passwordHash: string (required),
  name: string (required),
  createdAt: Date (required)
}
```

### projects
```text
{
  _id: ObjectId,
  userId: ObjectId (required, reference),
  name: string (required),
  isArchived: boolean (required)
}
```

### tasks
### tasks
```text
{
  _id: ObjectId,
  ownerId: ObjectId (required, reference),
  projectId: ObjectId (required, reference),
  title: string (required),
  status: string (required),
  priority: number (required),
  tags: Array of strings (optional),
  subtasks: Array of objects {title: string, done: boolean} (optional),
  dueDate: Date (optional)
}
```

### notes
```text
{
  _id: ObjectId,
  projectId: ObjectId (optional, reference),
  content: string (required),
  tags: Array of strings (optional)
}
```

---

## 3. Embed vs Reference — Decisions

For each relationship, state whether you embedded or referenced, and **why** (one sentence):

| Relationship                       | Embed or Reference? | Why? |
|------------------------------------|---------------------|------|
| Subtasks inside a task             | Embed               | Subtasks are strictly owned by the parent task and are always read together as a single unit. |
| Tags on a task                     | Embed               | Tags are small pieces of data owned by the parent task and fetched together in one read. |
| Project → Task ownership           | Reference           | The project is a standalone entity referenced by many tasks, and tasks are queried independently. |
| Note → optional Project link       | Reference           | The project is an independent, shared document that exists outside the scope of the note. |

---

## 4. Schema Flexibility Example

Name one field that exists on **some** documents but not **all** in the same collection. Explain why this is acceptable (or even useful) in MongoDB.

> **Field:** `dueDate` on the `tasks` collection. 

> **Explanation:** Not every task requires a strict deadline. In MongoDB, tasks without a deadline simply omit the `dueDate` field entirely, rather than forcing the schema to hold a NULL value as a rigid SQL table would.