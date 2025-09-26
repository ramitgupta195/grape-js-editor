
# GrapeJS Section Editor

A modern section builder and editor built with GrapeJS and Next.js 14. This tool provides a visual drag-and-drop interface for creating and managing reusable sections with real-time preview capabilities.

## Features

### 🎯 Core Features

- Visual drag-and-drop section builder
- Real-time preview
- Section management (Create, Edit, Delete)
- Responsive design tools
- Code view for HTML/CSS

### 🧱 Components

- **Layout Components**
  - Container
  - Grid systems (2 and 3 columns)
  - Flex containers (Row and Column)
- **Basic Elements**
  - Text blocks
  - Images
  - Buttons
  - Divs
- **Typography**
  - Headings
  - Paragraphs
  - Lists

### 🎨 Styling

- Visual style editor
- Typography management
- Spacing controls
- Color selection
- Border customization
- Background settings

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/ramitgupta195/grape-js-editor.git
```

2. Install dependencies:

```bash
cd grape-js-editor
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
grape-js-editor/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── GrapesEditor.jsx
│   │   ├── page.js
│   │   └── globals.css
│   └── ...
├── package.json
└── README.md
```

## API Integration

The editor integrates with a RESTful API with the following endpoints:

```javascript
GET /api/v1/sections        // Fetch all sections
GET /api/v1/sections/:id    // Fetch specific section
POST /api/v1/sections       // Create new section
PATCH /api/v1/sections/:id  // Update section
DELETE /api/v1/sections/:id // Delete section
```

## Usage

### Basic Implementation

```javascript
import GrapesEditor from "./components/GrapesEditor";

export default function Home() {
  return (
    <GrapesEditor
      sectionId={null}
      apiEndpoint="http://your-api-endpoint/api/v1/sections"
      onSave={(data) => console.log("Saved:", data)}
      onApiError={(error) => console.error("Error:", error)}
    />
  );
}
```

### Component Props

| Prop        | Type           | Description                    |
| ----------- | -------------- | ------------------------------ |
| sectionId   | number \| null | ID of section to edit          |
| apiEndpoint | string         | API endpoint for sections      |
| onSave      | function       | Callback when section is saved |
| onApiError  | function       | Callback for API errors        |

## Styling

The project uses Tailwind CSS along with custom CSS variables for consistent theming:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --border-color: #e5e7eb;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --success: #16a34a;
  --error: #ef4444;
}
```

## Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Basic knowledge of React/Next.js
- Understanding of GrapeJS

### Local Development

1. Start the development server:

```bash
npm run dev
```

2. Make your changes
3. Test thoroughly
4. Create a pull request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Known Issues

- Preview mode might need a refresh in some cases
- Some style sliders may not be visible properly in dark mode

## Future Improvements

- [x] Add more component templates
- [ ] Improve dark mode support
- [x] Add undo/redo functionality
- [ ] Enhance mobile responsiveness
- [x] Add more layout components

## License

This project is licensed under the MIT License.

## Acknowledgments

- [GrapeJS](https://grapesjs.com/) for the core editor functionality
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

For more information or issues, please visit [the repository](https://github.com/ramitgupta195/grape-js-editor/issues).
