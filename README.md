# GrapeJS Section Editor & Page Builder

A comprehensive, modern **Section Builder** and **Page Builder** application built with GrapeJS, Next.js 15, and React. This tool provides a complete visual solution for creating reusable sections and composing full web pages through an intuitive drag-and-drop interface with real-time preview capabilities.

## 🎯 Overview

This application consists of two powerful, integrated components:

1. **Section Editor** - Create and manage reusable sections with a visual GrapesJS editor
2. **Page Builder** - Compose complete pages by combining sections with drag-and-drop functionality

## ✨ Features

### 🏗️ Section Editor (GrapesJS)

- **Visual Drag-and-Drop Builder** - Intuitive WYSIWYG editor powered by GrapesJS
- **Pre-built Components**
  - Layout: Container, 2/3-column grids, Flex containers
  - Basic: Text, Images, Buttons, Divs
  - Typography: Headings, Paragraphs, Lists
  - Components: Cards with images and content
- **Real-time Preview** - See changes instantly
- **Code Editor** - View and edit HTML/CSS directly with syntax formatting
- **Responsive Design Tools** - Test on Desktop, Tablet, and Mobile views
- **Style Manager** - Visual controls for typography, spacing, colors, borders, backgrounds
- **Layer Manager** - Hierarchical component tree view
- **Block Manager** - Reusable saved sections as draggable blocks
- **Code Beautification** - Format HTML/CSS with one click
- **Export Options** - Copy or download code

### 📄 Page Builder

- **Drag & Drop Interface** - Combine sections to build complete pages
- **Live Section Preview** - See HTML/CSS rendered in real-time
- **Full CRUD Operations** - Create, Read, Update, Delete pages
- **Section Library** - Browse and search all available sections
- **Page Management**
  - Create new pages from templates
  - Load and edit existing pages
  - Delete pages with cascade cleanup
  - Search and filter pages
- **View Modes**
  - Compact Mode: List view with expandable previews
  - Full Mode: Large preview cards
  - Preview Mode: Full-page rendered view
- **Section Reordering** - Drag to rearrange sections on your page
- **Collapsible Sidebar** - Maximize workspace
- **Auto-save States** - Track unsaved changes
- **Combined Output** - Merged HTML/CSS from all sections

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/ramitgupta195/grape-js-editor.git

# Navigate to project directory
cd grape-js-editor

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for Section Editor  
Open [http://localhost:3000/page-builder](http://localhost:3000/page-builder) for Page Builder

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "15.5.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "grapesjs": "^0.21.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "@dnd-kit/utilities": "^3.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

## 📁 Project Structure

```
grape-js-editor/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── GrapesEditor.jsx      # Section editor component (GrapesJS)
│   │   │   └── PageBuilder.jsx       # Page builder component (Drag & Drop)
│   │   ├── page.js                   # Section Editor page (Home)
│   │   ├── page-builder/
│   │   │   └── page.js               # Page Builder page
│   │   ├── globals.css               # Global styles & theming
│   │   └── layout.js
│   └── ...
├── public/
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔌 API Integration

The application integrates with three RESTful API endpoints:

### 1. Sections API

Manages individual reusable sections.

```javascript
// Base URL
const sectionsAPI = "http://10.80.5.79:3000/api/v1/sections";

// Endpoints
GET    /api/v1/sections           // List all sections
GET    /api/v1/sections/:id       // Get single section
POST   /api/v1/sections           // Create new section
PATCH  /api/v1/sections/:id       // Update section
DELETE /api/v1/sections/:id       // Delete section

// Request/Response Format
{
  "id": 1,
  "name": "Hero Banner",
  "component_key": "hero_banner",
  "thumbnail_url": "https://...",
  "template_html": "<div>...</div>",
  "template_css": ".hero { ... }"
}
```

### 2. Pages API

Manages page metadata.

```javascript
// Base URL
const pagesAPI = "http://10.80.5.79:3000/api/v1/pages";

// Endpoints
GET    /api/v1/pages              // List all pages
GET    /api/v1/pages/:id          // Get single page
POST   /api/v1/pages              // Create new page
PUT    /api/v1/pages/:id          // Update page
DELETE /api/v1/pages/:id          // Delete page

// Request Format
{
  "page": {
    "title": "About Us",
    "slug": "about-us",
    "meta_description": "Learn more about us"
  }
}

// Response Format
{
  "id": 1,
  "title": "About Us",
  "slug": "about-us",
  "meta_description": "Learn more about us",
  "created_at": "2025-01-07T...",
  "updated_at": "2025-01-07T..."
}
```

### 3. PageSections API (Join Table)

Manages the relationship between pages and sections with ordering.

```javascript
// Base URL
const pageSectionsAPI = "http://10.80.5.79:3000/api/v1/page_sections";

// Endpoints
GET    /api/v1/page_sections      // List all page-section relationships
POST   /api/v1/page_sections      // Create relationship
DELETE /api/v1/page_sections/:id  // Delete relationship

// Request Format
{
  "page_section": {
    "page_id": 1,
    "section_id": 5,
    "sort_order": 1
  }
}

// Response Format
{
  "id": 10,
  "page_id": 1,
  "section_id": 5,
  "sort_order": 1
}
```

## 💻 Usage Examples

### Section Editor Component

```javascript
import GrapesEditor from "./components/GrapesEditor";

export default function SectionEditorPage() {
  const handleSave = async (editorPayload) => {
    console.log("Section saved:", editorPayload);
    // editorPayload contains: { template_html, template_css }
  };

  return (
    <GrapesEditor
      sectionId={null} // null for new section, number for editing
      apiEndpoint="http://10.80.5.79:3000/api/v1/sections"
      onSave={handleSave}
      onApiError={(error) => console.error("API Error:", error)}
    />
  );
}
```

**Component Props:**

| Prop          | Type              | Required | Description                             |
| ------------- | ----------------- | -------- | --------------------------------------- |
| `sectionId`   | `number \| null`  | Yes      | ID of section to edit (null for new)    |
| `apiEndpoint` | `string`          | Yes      | API base URL for sections               |
| `onSave`      | `function`        | Yes      | Callback when section is saved          |
| `onApiError`  | `function`        | No       | Callback for API errors                 |
| `ref`         | `React.RefObject` | No       | Access editor methods (getHtml, getCss) |

**Exposed Methods (via ref):**

```javascript
const editorRef = useRef(null);

// Access editor methods
editorRef.current.getHtml(); // Get current HTML
editorRef.current.getCss(); // Get current CSS
editorRef.current.setComponents(html); // Set HTML content
editorRef.current.setStyle(css); // Set CSS styles
editorRef.current.editor; // Access GrapesJS instance
```

### Page Builder Component

```javascript
import PageBuilder from "./components/PageBuilder";

export default function PageBuilderPage() {
  return <PageBuilder />;
}
```

The Page Builder is a standalone component with internal state management. No props required.

## 🎨 Styling & Theming

Uses Tailwind CSS with custom CSS variables for consistent theming:

```css
:root {
  /* Colors */
  --background: #ffffff;
  --background-secondary: #fafbfc;
  --foreground: #1e293b;
  --foreground-muted: #64748b;
  --border-color: #e2e8f0;
  --border-color-hover: #cbd5e1;

  /* Brand Colors */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-light: #eff6ff;
  --success: #10b981;
  --error: #ef4444;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

**Custom Component Classes:**

- `.editor-btn`, `.editor-btn-primary`, `.editor-btn-secondary`
- `.editor-input`, `.editor-select`, `.editor-textarea`
- `.editor-panel`, `.section-list-item`
- `.code-panel`, `.code-panel-header`, `.code-panel-tab`

## 🔧 Configuration

### API Endpoint Configuration

Update API endpoints in the components:

```javascript
// In GrapesEditor.jsx
const apiEndpoint = "http://your-api-server:3000/api/v1/sections";

// In PageBuilder.jsx
const sectionsApiEndpoint = "http://your-api-server:3000/api/v1/sections";
const pagesApiEndpoint = "http://your-api-server:3000/api/v1/pages";
const pageSectionsApiEndpoint =
  "http://your-api-server:3000/api/v1/page_sections";
```

### Tailwind Configuration

Ensure `globals.css` is imported in your root layout:

```javascript
// src/app/layout.js
import "./globals.css";
```

## ⚠️ Known Issues & Workarounds

### Backend PageSections API Bug

**Issue:** The `POST /api/v1/page_sections` endpoint returns a 500 error with message `"undefined method 'page_section_url'"`, but the record is still created successfully in the database.

**Workaround Implemented:** The frontend detects this specific error, waits 300ms for database settlement, then verifies the record was created by fetching all page_sections and checking for the new entry.

```javascript
// Automatic workaround in PageBuilder.jsx - Line ~700
if (response.status === 500 && errorText.includes("page_section_url")) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const verifyResponse = await fetch(pageSectionsApiEndpoint);
  const allPageSections = await verifyResponse.json();
  const justCreated = allPageSections.find(
    (ps) =>
      ps.page_id === currentPageId &&
      ps.section_id === section.id &&
      ps.sort_order === i + 1
  );
  if (justCreated) {
    // Success - continue
  }
}
```

**Status:** ✅ Fully handled on frontend. No backend changes required.

## 🛠️ Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn or pnpm
- Backend API running at configured endpoint
- Basic knowledge of React/Next.js
- Understanding of GrapeJS (for Section Editor customization)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Adding Custom Blocks to Section Editor

```javascript
// In GrapesEditor.jsx - BLOCK_COMPONENTS object
CUSTOM_BLOCK: {
  id: "custom-block",
  label: "Custom Block",
  category: BLOCK_CATEGORIES.COMPONENTS,
  content: `
    <div class="custom-component">
      Your HTML here
    </div>
  `,
},
```

### Adding Templates to Page Builder

```javascript
// In PageBuilder.jsx (Home component) - templates array
{
  id: "custom-template",
  name: "Custom Template",
  preview: "/custom-template.png",
  html: `<section>Your template HTML</section>`,
  css: "/* Your template CSS */",
}
```

## 🐛 Debugging

The application includes comprehensive console logging:

- ✅ **Green checkmark** - Successful operations
- ❌ **Red X** - Errors
- 📄 **Document** - API calls
- 🔄 **Loop** - Loading states
- ➕ **Plus** - Adding items
- ➖ **Minus** - Removing items
- 💾 **Floppy disk** - Save operations

Open browser DevTools (F12) to see detailed logs during development.

## 🚦 Workflows

### Creating a New Page

1. Click "Create New Section" (if needed) to build sections first
2. Navigate to Page Builder
3. Click "New Page"
4. Fill in: Page Title, URL Slug, Meta Description
5. Drag sections from the library to the canvas
6. Reorder sections as needed
7. Click "Create Page"
8. Page and all page-section relationships are saved

### Editing an Existing Page

1. Click "Browse Pages"
2. Click "Edit" on desired page
3. Page metadata and sections load into the editor
4. Modify sections (add, remove, reorder)
5. Click "Update Page"
6. Changes are saved with updated order

### Building a Reusable Section

1. Go to Section Editor (Home page)
2. Click "New Section" or "Browse Pages" to load existing
3. Fill in Section Name, Component Key, Thumbnail URL
4. Design your section using drag-and-drop components
5. Style using the Style Manager panel
6. Preview across different devices
7. Save the section
8. Section becomes available in Page Builder's section library

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Update README if adding new features
- Test thoroughly before submitting PR
- Include console logs for debugging (using emoji conventions)

## 📋 Roadmap

### Completed ✅

- [x] Visual section editor with GrapesJS
- [x] Drag & drop page builder
- [x] Full CRUD for sections and pages
- [x] Real-time preview
- [x] Code editor with formatting
- [x] Responsive design testing
- [x] Search and filter functionality
- [x] Template system
- [x] Backend error workarounds
- [x] Section reordering
- [x] Multiple view modes

### Planned 🔮

- [ ] Duplicate page/section functionality
- [ ] Undo/Redo history
- [ ] Toast notifications (replace alerts)
- [ ] Section categories/tags
- [ ] Bulk operations (delete multiple)
- [ ] Export page to HTML file
- [ ] Import sections from file
- [ ] Drag & drop file uploads for images
- [ ] Version history for pages
- [ ] Collaborative editing (real-time)
- [ ] Dark mode toggle (manual override)
- [ ] Advanced search filters
- [ ] Section usage analytics (which pages use which sections)

## 📸 Screenshots

_Add screenshots here showing:_

- Section Editor interface
- Page Builder with sidebar and canvas
- Template selection modal
- Preview mode
- Code editor panel

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GrapeJS](https://grapesjs.com/) - Powerful web page builder framework
- [Next.js](https://nextjs.org/) - React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [@dnd-kit](https://dndkit.com/) - Modern drag-and-drop toolkit for React
- [Prettier](https://prettier.io/) - Code formatting

## 📞 Support

For issues, questions, or contributions:

- **Issues:** [GitHub Issues](https://github.com/ramitgupta195/grape-js-editor/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ramitgupta195/grape-js-editor/discussions)
- **Pull Requests:** [GitHub PRs](https://github.com/ramitgupta195/grape-js-editor/pulls)

---

**Built with ❤️ using Next.js, React, and GrapeJS**

**Current Version:** 2.0.0  
**Last Updated:** January 2025

---

### Quick Links

- 🏠 [Home (Section Editor)](http://localhost:3000)
- 📄 [Page Builder](http://localhost:3000/page-builder)
- 📚 [GrapeJS Documentation](https://grapesjs.com/docs/)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)
-
