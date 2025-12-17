# GoodBoard

**Your Blackboard, but better.**

GoodBoard extension transforms the legacy Blackboard experience into a modern, high-performance productivity hub for UVM students. Built with React and Vite, it launches a dedicated Dashboard page featuring a drag-and-drop Kanban board for assignment tracking, interactive Gantt charts for timeline visualization, and real-time grade analytics. It seamlessly integrates with the existing backend while providing a superior, dark-mode-enabled user interface.

## Key Features

- **Modern Dashboard**: A clean and friendly interface built with React.
- **Data Visualization**: Interactive charts (using Recharts) to visualize academic performance and grade distribution.
- **Kanban Board**: Organize tasks and submissions in customizable columns (To Do, In Progress, Done) with drag-and-drop functionality.
- **Gantt Chart**: Visualize submissions on a timeline to better plan the semester.
- **Task Management**: Organize submissions and pending items efficiently.
- **Seamless Integration**: Injects directly into Blackboard for a smooth experience.

## How Scraping Works

GoodBoard works by injecting a content script (`content.js`) directly into Blackboard pages. This script performs the following actions:

1.  **DOM Analysis**: Uses specific selectors to locate HTML elements containing relevant information (course names, grades, due dates, etc.).
2.  **Data Extraction**: Iterates over these elements to extract text and necessary attributes, cleaning and formatting the information.
3.  **Local Storage**: Saves extracted data to `chrome.storage.local` so it can be accessed by the React interface.
4.  **Real-time Update**: Detects page changes to keep information updated without manual reloading.

## Technologies Used

This project is built with modern web technologies:

- **[React](https://reactjs.org/)**: Library for building user interfaces.
- **[Vite](https://vitejs.dev/)**: Fast development environment.
- **[Tailwind CSS](https://tailwindcss.com/)**: CSS framework for rapid and responsive design.
- **[Recharts](https://recharts.org/)**: Charting library for React.
- **[dnd-kit](https://dndkit.com/)**: Library for drag-and-drop functionality in the Kanban board.
- **[Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)**: The latest standard for Chrome extensions.

## Installation and Development

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm

### Project Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/Dexterpol-A21/goodBoard.git
    cd goodBoard
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Build the project:
    ```bash
    npm run build
    ```

### Load in Chrome (Developer Mode)

1.  Open Google Chrome and go to `chrome://extensions/`.
2.  Enable **"Developer mode"** in the top right corner.
3.  Click on **"Load unpacked"**.
4.  Select the `dist` folder generated in the build step.

Done! The extension should be active when you visit Blackboard.

## Contribution

Contributions are welcome. Please open an issue or pull request to suggest changes or improvements.

## Author

**Dexterpol-A21**
- GitHub: [@Dexterpol-A21](https://github.com/Dexterpol-A21)
- Portfolio: [dexterpol-a21.github.io](https://dexterpol-a21.github.io)

---
*This project is not officially affiliated with Blackboard or UVM.*
