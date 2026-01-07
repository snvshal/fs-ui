# Local File Explorer

A modern, browser-based file explorer and code editor built with React, TypeScript, and the File System Access API. This application allows users to interact directly with their local file system, providing a seamless development experience within the browser.

![Application Screenshot](image-placeholder)

## Features

- **Local File System Access**: Securely view and manage local directories and files directly from the browser.
- **Advanced Code Editor**: Integrated Monaco Editor provides syntax highlighting for multiple languages including TypeScript, JavaScript, Python, Rust, and more.
- **Markdown Preview**: Real-time rendering of Markdown files with support for GitHub Flavored Markdown.
- **Media Preview**: Native support for viewing images and video files.
- **File Operations**: Create, rename, delete, and save files and directories.
- **Persistent Access**: Remembers the last accessed directory across sessions using IndexedDB.
- **Responsive Design**: Precise layout with a collapsible sidebar and breadcrumb navigation.

## Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **State Management**: React Context API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/snvshal/fs-ui.git
   ```

2. Navigate to the project directory:
   ```bash
   cd fs-ui
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build:

```bash
npm run build
```

The artifacts will be generated in the `dist` directory.

## Usage

1. Click "Open Folder" to select a directory from your local machine.
2. Grant the necessary permissions when prompted by the browser.
3. Use the sidebar to navigate through folders.
4. Click on a file to view or edit it in the main panel.
5. Use `Ctrl+S` (or `Cmd+S`) to save changes to files.
6. Use `Ctrl+O` (or `Cmd+O`) to open a new directory.

## License

MIT License
