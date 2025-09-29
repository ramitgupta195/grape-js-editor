"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import prettier from "prettier/standalone";
import parserHTML from "prettier/parser-html";
import parserCSS from "prettier/parser-postcss";
// Block Categories and Components
const BLOCK_CATEGORIES = {
  LAYOUT: "Layout",
  BASIC: "Basic Elements",
  COMPONENTS: "Components",
  TYPOGRAPHY: "Typography",
  MEDIA: "Media",
};

const BLOCK_COMPONENTS = {
  // Layout Blocks
  CONTAINER: {
    id: "container",
    label: "Container",
    category: BLOCK_CATEGORIES.LAYOUT,
    content: `
      <div class="container mx-auto px-4" data-gjs-droppable="true" data-gjs-custom-name="Container">
        <div class="p-4" data-gjs-droppable="true">
          Drop elements here
        </div>
      </div>
    `,
  },
  GRID_2: {
    id: "grid-2",
    label: "2 Columns",
    category: BLOCK_CATEGORIES.LAYOUT,
    content: `
      <div class="grid grid-cols-2 gap-4" data-gjs-droppable="true" data-gjs-custom-name="2-Column Grid">
        <div class="col p-4" data-gjs-droppable="true">Column 1</div>
        <div class="col p-4" data-gjs-droppable="true">Column 2</div>
      </div>
    `,
  },
  GRID_3: {
    id: "grid-3",
    label: "3 Columns",
    category: BLOCK_CATEGORIES.LAYOUT,
    content: `
      <div class="grid grid-cols-3 gap-4" data-gjs-droppable="true" data-gjs-custom-name="3-Column Grid">
        <div class="col p-4" data-gjs-droppable="true">Column 1</div>
        <div class="col p-4" data-gjs-droppable="true">Column 2</div>
        <div class="col p-4" data-gjs-droppable="true">Column 3</div>
      </div>
    `,
  },
  FLEX_ROW: {
    id: "flex-row",
    label: "Flex Row",
    category: BLOCK_CATEGORIES.LAYOUT,
    content: `
      <div class="flex flex-row gap-4" data-gjs-droppable="true" data-gjs-custom-name="Flex Row">
        <div class="flex-1 p-4" data-gjs-droppable="true">Item 1</div>
        <div class="flex-1 p-4" data-gjs-droppable="true">Item 2</div>
      </div>
    `,
  },
  FLEX_COLUMN: {
    id: "flex-column",
    label: "Flex Column",
    category: BLOCK_CATEGORIES.LAYOUT,
    content: `
      <div class="flex flex-col gap-4" data-gjs-droppable="true" data-gjs-custom-name="Flex Column">
        <div class="p-4" data-gjs-droppable="true">Item 1</div>
        <div class="p-4" data-gjs-droppable="true">Item 2</div>
      </div>
    `,
  },
  // Typography
  HEADING: {
    id: "heading",
    label: "Heading",
    category: BLOCK_CATEGORIES.TYPOGRAPHY,
    content: `
      <h2 class="text-3xl font-bold mb-4" data-gjs-custom-name="Heading">
        Heading
      </h2>
    `,
  },
  PARAGRAPH: {
    id: "paragraph",
    label: "Paragraph",
    category: BLOCK_CATEGORIES.TYPOGRAPHY,
    content: `
      <p class="mb-4" data-gjs-custom-name="Paragraph">
        Insert your text here
      </p>
    `,
  },
  LIST: {
    id: "list",
    label: "List",
    category: BLOCK_CATEGORIES.TYPOGRAPHY,
    content: `
      <ul class="list-disc pl-5 mb-4" data-gjs-custom-name="List">
        <li>List item 1</li>
        <li>List item 2</li>
        <li>List item 3</li>
      </ul>
    `,
  },

  // Components
  CARD: {
    id: "card",
    label: "Card",
    category: BLOCK_CATEGORIES.COMPONENTS,
    content: `
      <div class="bg-white rounded-lg shadow-md overflow-hidden" data-gjs-custom-name="Card">
        <img src="https://via.placeholder.com/400x200" alt="Card image" class="w-full h-48 object-cover">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">Card Title</h3>
          <p class="text-gray-600 mb-4">Card description goes here</p>
          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    `,
  },
};

const GrapesEditor = forwardRef(
  (
    {
      sectionId = null,
      apiEndpoint = "http://127.0.0.1:3000/api/v1/sections",
      onSave,
      onApiError,
    },
    ref
  ) => {
    const editorInstance = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("html");
    const [codeEditorContent, setCodeEditorContent] = useState({
      html: "",
      css: "",
    });

    // Expose editor methods to parent
    useImperativeHandle(ref, () => ({
      getHtml: () => editorInstance.current?.getHtml() || "",
      getCss: () => editorInstance.current?.getCss() || "",
      setComponents: (html) => editorInstance.current?.setComponents(html),
      setStyle: (css) => editorInstance.current?.setStyle(css),
      editor: editorInstance.current,
    }));

    const updateCodeEditor = () => {
      if (!editorInstance.current) return;

      setCodeEditorContent({
        html: editorInstance.current.getHtml(),
        css: editorInstance.current.getCss(),
      });
    };

    const handleCodeChange = (type, value) => {
      setCodeEditorContent((prev) => ({
        ...prev,
        [type]: value,
      }));

      if (type === "html") {
        editorInstance.current?.setComponents(value);
      } else if (type === "css") {
        editorInstance.current?.setStyle(value);
      }
      setIsDirty(true);
    };

    const toggleCodeEditor = () => {
      if (!isCodeEditorOpen) {
        updateCodeEditor();
      }
      setIsCodeEditorOpen(!isCodeEditorOpen);
    };
    const handleSave = () => {
      if (!editorInstance.current) return;

      const html = editorInstance.current.getHtml();
      const css = editorInstance.current.getCss();
      console.log("Saving...", { html, css });
      if (onSave) {
        onSave({
          template_html: html,
          template_css: css,
        });
        setIsDirty(false);
      }
    };

    const togglePreview = () => {
      if (!editorInstance.current) return;

      const editor = editorInstance.current;

      if (!isPreview) {
        // Enter preview mode
        editor.stopCommand("sw-visibility");
        document.body.classList.add("gjs-preview-mode");

        // Hide panels using classes instead of direct style manipulation
        const panels = document.querySelectorAll(".gjs-pn-panel");
        panels.forEach((panel) => {
          if (panel.classList.contains("gjs-pn-commands")) return;
          panel.classList.add("gjs-hidden");
        });

        // Update editor state
        editor.refresh();
        setIsPreview(true);
      } else {
        // Exit preview mode
        editor.runCommand("sw-visibility");
        document.body.classList.remove("gjs-preview-mode");

        // Show panels
        const panels = document.querySelectorAll(".gjs-pn-panel");
        panels.forEach((panel) => {
          panel.classList.remove("gjs-hidden");
        });

        // Update editor state
        editor.refresh();
        setIsPreview(false);
      }
    };

    // beautify code
    const beautifyCode = (code, type) => {
      if (type === "html") {
        try {
          // Improved HTML formatting
          let indentLevel = 0;
          const lines = code
            .replace(/>\s*</g, ">\n<") // Add newline between tags
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line); // Remove empty lines

          return lines
            .map((line) => {
              let indent = indentLevel;

              // Decrease indent for closing tags
              if (line.match(/^<\//)) {
                indent = Math.max(0, indentLevel - 1);
              }

              // Add proper indentation
              const indentedLine = "  ".repeat(Math.max(0, indent)) + line;

              // Increase indent for opening tags
              if (line.match(/^<[^/].*[^/]>$/)) {
                indentLevel++;
              }
              // Decrease indent for closing tags
              if (line.match(/^<\//)) {
                indentLevel = Math.max(0, indentLevel - 1);
              }

              return indentedLine;
            })
            .join("\n");
        } catch (error) {
          console.error("HTML formatting error:", error);
          return code; // Return original code if formatting fails
        }
      } else if (type === "css") {
        try {
          // Improved CSS formatting
          let formatted = code
            .replace(/\s+/g, " ") // Normalize whitespace
            .replace(/{\s*/g, " {\n") // Format opening braces
            .replace(/;\s*/g, ";\n") // Format semicolons
            .replace(/}\s*/g, "}\n") // Format closing braces
            .replace(/,\s*/g, ", ") // Format commas
            .replace(/>\s*/g, " > ") // Format child selectors
            .replace(/\s*{\s*/g, " {\n") // Clean up before brackets
            .replace(/\s*}\s*/g, "\n}\n") // Clean up after brackets
            .replace(/;\s*/g, ";\n") // Clean up after semicolons
            .replace(/\n\s*\n/g, "\n") // Remove empty lines
            .trim();

          // Add indentation
          const lines = formatted.split("\n");
          let indent = 0;

          return lines
            .map((line) => {
              line = line.trim();
              if (line.includes("}")) {
                indent = Math.max(0, indent - 1);
              }
              const indentedLine = "  ".repeat(Math.max(0, indent)) + line;
              if (line.includes("{")) {
                indent++;
              }
              return indentedLine;
            })
            .join("\n");
        } catch (error) {
          console.error("CSS formatting error:", error);
          return code; // Return original code if formatting fails
        }
      }
      return code;
    };

    const handleBeautifyCode = () => {
      try {
        const currentCode = codeEditorContent[activeTab];
        const beautifiedCode = beautifyCode(currentCode, activeTab);
        handleCodeChange(activeTab, beautifiedCode);
      } catch (error) {
        console.error("Beautification error:", error);
        // Optionally show an error message to the user
      }
    };

    const handleCopyCode = () => {
      const currentCode = codeEditorContent[activeTab];
      navigator.clipboard
        .writeText(currentCode)
        .then(() => {
          // You could add a toast notification here
          console.log("Code copied to clipboard");
        })
        .catch((err) => console.error("Failed to copy code:", err));
    };

    const handleDownloadCode = () => {
      const currentCode = codeEditorContent[activeTab];
      const blob = new Blob([currentCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code.${activeTab}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Initialize editor
    useEffect(() => {
      if (!editorInstance.current) {
        const editor = grapesjs.init({
          container: "#gjs",
          height: "100%",
          width: "auto",
          storageManager: false,
          deviceManager: {
            devices: [
              {
                name: "Desktop",
                width: "",
              },
              {
                name: "Tablet",
                width: "768px",
                widthMedia: "768px",
              },
              {
                name: "Mobile",
                width: "320px",
                widthMedia: "320px",
              },
            ],
          },
          blockManager: {
            appendTo: "#blocks",
            blocks: [
              {
                id: "section",
                label: "Section",
                category: BLOCK_CATEGORIES.BASIC,
                content: {
                  type: "section",
                  content: `
                    <div class="container mx-auto px-4 py-8">
                      <h2>New Section</h2>
                      <p>Add your content here</p>
                    </div>
                  `,
                  style: { "min-height": "100px" },
                },
                attributes: { class: "gjs-block-section" },
              },
              {
                id: "text",
                label: "Text",
                category: BLOCK_CATEGORIES.BASIC,
                content: {
                  type: "text",
                  content: "Insert your text here",
                  style: { padding: "10px" },
                },
                attributes: { class: "gjs-block-text" },
              },
              {
                id: "image",
                label: "Image",
                category: BLOCK_CATEGORIES.MEDIA,
                content: {
                  type: "image",
                  style: { padding: "10px" },
                  attributes: { src: "https://via.placeholder.com/150" },
                },
                attributes: { class: "gjs-block-image" },
              },
              {
                id: "button",
                label: "Button",
                category: BLOCK_CATEGORIES.COMPONENTS,
                content: {
                  type: "button",
                  content: "Click me",
                  style: {
                    padding: "10px 20px",
                    "background-color": "#3b82f6",
                    color: "white",
                    border: "none",
                    "border-radius": "4px",
                    cursor: "pointer",
                  },
                },
                attributes: { class: "gjs-block-button" },
              },
              // Add all new blocks
              ...Object.values(BLOCK_COMPONENTS),
            ],
          },
          styleManager: {
            appendTo: "#styles",
            sectors: [
              {
                name: "Dimension",
                open: true,
                buildProps: [
                  "width",
                  "height",
                  "min-height",
                  "padding",
                  "margin",
                ],
                properties: [
                  {
                    name: "Width",
                    property: "width",
                    type: "slider",
                    units: ["px", "%", "vw"],
                    defaults: "auto",
                    min: 0,
                    max: 1920,
                    step: 1,
                  },
                  {
                    name: "Height",
                    property: "height",
                    type: "slider",
                    units: ["px", "%", "vh"],
                    defaults: "auto",
                    min: 0,
                    max: 1080,
                    step: 1,
                  },
                ],
              },
              {
                name: "Typography",
                open: true,
                buildProps: [
                  "font-family",
                  "font-size",
                  "font-weight",
                  "letter-spacing",
                  "color",
                  "line-height",
                  "text-align",
                  "text-decoration",
                ],
              },
              {
                name: "Decorations",
                open: true,
                buildProps: [
                  "background-color",
                  "border-radius",
                  "border",
                  "box-shadow",
                  "opacity",
                ],
              },
              {
                name: "Extra",
                open: true,
                buildProps: ["transition", "transform"],
              },
            ],
          },
          layerManager: {
            appendTo: "#layers",
          },
          panels: {
            defaults: [
              {
                id: "basic-actions",
                el: ".panel__basic-actions",
                buttons: [
                  {
                    id: "visibility",
                    active: true,
                    className: "btn-toggle-borders",
                    label: "Borders",
                    command: "sw-visibility",
                  },
                  {
                    id: "preview",
                    className: "btn-preview",
                    label: "Preview",
                    command: "preview",
                  },
                  {
                    id: "code",
                    className: "btn-code",
                    label: "Code",
                    command: {
                      run: toggleCodeEditor,
                      stop: toggleCodeEditor,
                    },
                  },
                ],
              },
            ],
          },
          canvas: {
            styles: [
              "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css",
            ],
          },
          // Add traits
          traits: {
            types: [
              {
                type: "class_select",
                name: "align",
                label: "Align",
                options: [
                  { value: "left", name: "Left" },
                  { value: "center", name: "Center" },
                  { value: "right", name: "Right" },
                ],
              },
              {
                type: "class_select",
                name: "spacing",
                label: "Spacing",
                options: [
                  { value: "p-0", name: "None" },
                  { value: "p-4", name: "Small" },
                  { value: "p-8", name: "Medium" },
                  { value: "p-12", name: "Large" },
                ],
              },
            ],
          },
        });

        // Add component type definitions
        editor.DomComponents.addType("grid-item", {
          isComponent: (el) => el.classList && el.classList.contains("col"),
          model: {
            defaults: {
              draggable: true,
              droppable: true,
              traits: [
                {
                  type: "class_select",
                  name: "col-span",
                  label: "Column Span",
                  options: [
                    { value: "col-span-1", name: "1" },
                    { value: "col-span-2", name: "2" },
                    { value: "col-span-3", name: "3" },
                    { value: "col-span-4", name: "4" },
                  ],
                },
              ],
            },
          },
        });

        // Track changes
        editor.on("component:update", () => {
          setIsDirty(true);
          updateCodeEditor();
        });
        editor.on("style:update", () => {
          setIsDirty(true);
          updateCodeEditor();
        });

        // Add commands
        editor.Commands.add("preview", {
          run: togglePreview,
          stop: togglePreview,
        });

        // Add keyboard shortcuts
        editor.Commands.add("save-shortcut", {
          run: handleSave,
          options: {
            keys: "ctrl+s, command+s",
          },
        });

        editorInstance.current = editor;
      }

      return () => {
        if (editorInstance.current) {
          editorInstance.current.destroy();
          editorInstance.current = null;
        }
      };
    }, []);
    // Load section data
    useEffect(() => {
      const loadSectionData = async () => {
        if (!sectionId || !editorInstance.current) return;

        setLoading(true);
        try {
          const response = await fetch(`${apiEndpoint}/${sectionId}`);
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

          const data = await response.json();

          if (data.template_html) {
            editorInstance.current.setComponents(data.template_html);
          }
          if (data.template_css) {
            editorInstance.current.setStyle(data.template_css);
          }
        } catch (error) {
          console.error("Error loading section:", error);
          onApiError?.(error);
        } finally {
          setLoading(false);
        }
      };

      loadSectionData();
    }, [sectionId, apiEndpoint]);

    return (
      <div className="h-full flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <select
              onChange={(e) =>
                editorInstance.current?.setDevice(e.target.value)
              }
              className="editor-select"
            >
              <option value="">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
            <button
              onClick={togglePreview}
              className={`editor-btn ${
                isPreview ? "editor-btn-primary" : "editor-btn-secondary"
              }`}
            >
              {isPreview ? "Exit Preview" : "Preview"}
            </button>
            <button
              onClick={() =>
                editorInstance.current?.runCommand("sw-visibility")
              }
              className="editor-btn editor-btn-secondary"
            >
              Borders
            </button>
            <button
              onClick={toggleCodeEditor}
              className={`editor-btn ${
                isCodeEditorOpen ? "editor-btn-primary" : "editor-btn-secondary"
              }`}
            >
              Code
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`editor-btn ${
              isDirty ? "editor-btn-primary" : "editor-btn-secondary"
            }`}
          >
            {isDirty ? "Save Changes" : "Saved"}
          </button>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg">Loading...</div>
            </div>
          )}

          {/* Left Sidebar */}
          <div
            className={`w-64 bg-background border-r border-border flex flex-col ${
              isPreview ? "hidden" : ""
            }`}
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg">Blocks</h2>
            </div>
            <div className="flex-1 overflow-y-auto" id="blocks" />

            <div className="p-4 border-t border-border">
              <h2 className="font-semibold text-lg">Layers</h2>
            </div>
            <div className="h-64 overflow-y-auto" id="layers" />
          </div>

          {/* Editor Canvas */}
          <div
            className={`flex-1 bg-gray-50 ${isPreview ? "w-full" : ""}`}
            id="gjs"
          />

          {/* Right Sidebar */}
          <div
            className={`w-64 bg-background border-l border-border ${
              isPreview ? "hidden" : ""
            }`}
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg">Styles</h2>
            </div>
            <div className="overflow-y-auto h-full" id="styles" />
          </div>
        </div>

        {/* Code Editor Panel */}
        {/* Code Editor Panel */}
        <div className={`code-panel ${isCodeEditorOpen ? "" : "hidden"}`}>
          <div className="code-panel-header">
            <div className="flex items-center space-x-2">
              <button
                className={`code-panel-tab ${activeTab === "html" ? "active" : ""}`}
                onClick={() => setActiveTab("html")}
              >
                HTML
              </button>
              <button
                className={`code-panel-tab ${activeTab === "css" ? "active" : ""}`}
                onClick={() => setActiveTab("css")}
              >
                CSS
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBeautifyCode}
                className="editor-btn editor-btn-secondary text-sm"
                title="Beautify Code"
              >
                <span className="material-icons">format_align_left</span>
              </button>
              <button
                onClick={handleCopyCode}
                className="editor-btn editor-btn-secondary text-sm"
                title="Copy Code"
              >
                <span className="material-icons">content_copy</span>
              </button>
              <button
                onClick={handleDownloadCode}
                className="editor-btn editor-btn-secondary text-sm"
                title="Download Code"
              >
                <span className="material-icons">download</span>
              </button>
              <button
                onClick={toggleCodeEditor}
                className="editor-btn editor-btn-secondary text-sm"
                title="Close"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
          </div>
          <div className="code-panel-content">
            <div className="code-panel-editor">
              <textarea
                value={codeEditorContent[activeTab]}
                onChange={(e) => handleCodeChange(activeTab, e.target.value)}
                placeholder={`Enter your ${activeTab.toUpperCase()} code here...`}
                className="code-editor-textarea"
                spellCheck="false"
                wrap="off"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GrapesEditor.displayName = "GrapesEditor";

export default GrapesEditor;
