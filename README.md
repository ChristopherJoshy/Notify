# 📝 Notify

<div align="center">

![Notify Logo](client/public/apple-touch-icon.png)

[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**A powerful, modern note-taking application built with React, TypeScript, and MongoDB**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Usage](#usage) • [API Documentation](#api-documentation) • [Roadmap](#roadmap) • [Contributing](#contributing) • [License](#license)

</div>

## ✨ Features

- 📝 **Modern Note Editor**: Rich text editing capabilities
- 🗃️ **Organize by Subjects**: Create subjects with custom icons and colors
- 🔍 **Powerful Search**: Find notes by title, content, or tags
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔄 **Real-time Syncing**: Changes are instantly saved to MongoDB
- 🏷️ **Tagging System**: Categorize notes with tags for better organization
- 🎨 **Customizable UI**: Personalize your note-taking experience
- 🌐 **Web-based**: Access your notes from anywhere

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="33%">
      <strong>Frontend</strong><br />
      • React 18<br />
      • TypeScript<br />
      • Tailwind CSS<br />
      • React Query<br />
      • React Hook Form<br />
      • Vite
    </td>
    <td align="center" width="33%">
      <strong>Backend</strong><br />
      • Express.js<br />
      • Node.js<br />
      • MongoDB<br />
      • TypeScript<br />
    </td>
    <td align="center" width="33%">
      <strong>Tools</strong><br />
      • RESTful API<br />
      • MongoDB Atlas<br />
      • Git<br />
      • Zod Validation<br />
    </td>
  </tr>
</table>

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/ChristopherJoshy/Notify.git
cd Notify
```

2. **Install dependencies**

```bash
# Install server and client dependencies
npm install
```

3. **Set up MongoDB**

```bash
# Initialize the database with required collections and indexes
npm run db:init
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📊 Project Structure

```
Notify/
├── client/               # Frontend React application
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and helpers
│       └── pages/        # Page components
├── server/               # Backend Express server
│   ├── routes.ts         # API routes
│   └── storage.ts        # MongoDB database implementation
└── shared/               # Shared TypeScript types and schemas
```

## 🖥️ Usage

### Creating a New Subject

```typescript
// Example API call to create a new subject
const createSubject = async (subject) => {
  const response = await fetch('/api/subjects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subject),
  });
  return await response.json();
};
```

### Adding a New Note

```typescript
// Example API call to create a new note
const createNote = async (note) => {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  return await response.json();
};
```

## 📡 API Documentation

### Subjects API

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/subjects` | `GET` | Get all subjects | - |
| `/api/subjects/:id` | `GET` | Get a subject by ID | `id`: Subject ID |
| `/api/subjects` | `POST` | Create a subject | `name`, `icon`, `color` |
| `/api/subjects/:id` | `PUT` | Update a subject | `id`: Subject ID |
| `/api/subjects/:id` | `DELETE` | Delete a subject | `id`: Subject ID |

### Notes API

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/notes` | `GET` | Get all notes | - |
| `/api/notes/:id` | `GET` | Get a note by ID | `id`: Note ID |
| `/api/notes/subject/:id` | `GET` | Get notes by subject ID | `id`: Subject ID |
| `/api/notes` | `POST` | Create a note | `title`, `content`, `subjectId`, `tags` |
| `/api/notes/:id` | `PUT` | Update a note | `id`: Note ID |
| `/api/notes/:id` | `DELETE` | Delete a note | `id`: Note ID |
| `/api/notes/search` | `GET` | Search notes | `q`: Search query |

## 🔍 MongoDB Integration

Notify uses MongoDB for data storage with the following collections:

- `subjects`: Store subject information
- `notes`: Store note content and metadata
- `counters`: Track ID sequences for auto-increment

```javascript
// MongoDB Connection
const MONGODB_URI = "mongodb+srv://username:password@cluster.mongodb.net/";
```

## 🛣️ Roadmap

- [ ] User authentication and individual note collections
- [ ] Collaborative editing features
- [ ] Note templates and formats
- [ ] Mobile application development
- [ ] Offline support with local storage
- [ ] Export/import functionality for notes
- [ ] Dark mode support

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'Add some amazing feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Christopher Joshy](https://github.com/ChristopherJoshy)

</div> 