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

// Helper function to merge CSS
const mergeCss = (existingCss, newCss) => {
  const cssRules = {};

  // Parse existing CSS
  existingCss.split("}").forEach((rule) => {
    const trimmedRule = rule.trim();
    if (trimmedRule) {
      const selector = trimmedRule.split("{")[0].trim();
      cssRules[selector] = trimmedRule + "}";
    }
  });

  // Parse and merge new CSS
  newCss.split("}").forEach((rule) => {
    const trimmedRule = rule.trim();
    if (trimmedRule) {
      const selector = trimmedRule.split("{")[0].trim();
      cssRules[selector] = trimmedRule + "}";
    }
  });

  return Object.values(cssRules).join("\n");
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

    // Load sections as blocks function
    const loadSectionsAsBlocks = async () => {
      if (!editorInstance.current) return;

      try {
        const response = await fetch(apiEndpoint);
        const sections = await response.json();

        const blockManager = editorInstance.current.BlockManager;

        sections.forEach((section) => {
          blockManager.remove(`section-${section.id}`);

          blockManager.add(`section-${section.id}`, {
            label: section.name,
            category: "Saved Sections",
            content: {
              type: "wrapper",
              components: section.template_html,
              attributes: {
                "data-gjs-type": "section",
                "data-section-id": section.id,
                "data-section-css": section.template_css,
              },
              style: section.template_css,
            },
            selectable: true,
            draggable: true,
            render: ({ model, className }) => {
              return `
                <div class="${className}" style="position: relative;">
                  <div style="padding: 8px">
                    <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 600;">${section.name}</h4>
                    <p style="margin: 0; font-size: 11px; color: #64748b;">${section.component_key}</p>
                  </div>
                  ${
                    section.thumbnail_url
                      ? `<img src="${section.thumbnail_url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px"/>`
                      : '<div style="width: 100%; height: 100px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 12px;">No Preview</div>'
                  }
                </div>
              `;
            },
          });
        });
      } catch (error) {
        console.error("Error loading sections as blocks:", error);
      }
    };

    // Code beautification function
    const beautifyCode = (code, type) => {
      try {
        if (type === "html") {
          let indentLevel = 0;
          const lines = code
            .replace(/>\s*</g, ">\n<")
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);

          return lines
            .map((line) => {
              let indent = indentLevel;

              if (line.match(/^<\//)) {
                indent = Math.max(0, indentLevel - 1);
              }

              const indentedLine = "  ".repeat(Math.max(0, indent)) + line;

              if (line.match(/^<[^/].*[^/]>$/)) {
                indentLevel++;
              }
              if (line.match(/^<\//)) {
                indentLevel = Math.max(0, indentLevel - 1);
              }

              return indentedLine;
            })
            .join("\n");
        } else if (type === "css") {
          let formatted = code
            .replace(/\s+/g, " ")
            .replace(/{\s*/g, " {\n")
            .replace(/;\s*/g, ";\n")
            .replace(/}\s*/g, "}\n")
            .replace(/,\s*/g, ", ")
            .replace(/>\s*/g, " > ")
            .replace(/\s*{\s*/g, " {\n")
            .replace(/\s*}\s*/g, "\n}\n")
            .replace(/;\s*/g, ";\n")
            .replace(/\n\s*\n/g, "\n")
            .trim();

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
        }
        return code;
      } catch (error) {
        console.error("Beautify error:", error);
        return code;
      }
    };

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

    const handleBeautifyCode = () => {
      try {
        const currentCode = codeEditorContent[activeTab];
        const beautifiedCode = beautifyCode(currentCode, activeTab);
        handleCodeChange(activeTab, beautifiedCode);
      } catch (error) {
        console.error("Beautification error:", error);
      }
    };

    const handleCopyCode = () => {
      const currentCode = codeEditorContent[activeTab];
      navigator.clipboard
        .writeText(currentCode)
        .then(() => {
          alert("Code copied to clipboard!");
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

    const toggleCodeEditor = () => {
      if (!isCodeEditorOpen) {
        updateCodeEditor();
      }
      setIsCodeEditorOpen(!isCodeEditorOpen);
    };

    const handleSave = () => {
      if (!editorInstance.current) return;

      const html = editorInstance.current.getHtml();
      const css = editorInstance.current.getCss({
        keepUnusedStyles: true,
      });

      if (onSave) {
        onSave({
          template_html: html,
          template_css: css,
        })
          .then(() => {
            setIsDirty(false);
            loadSectionsAsBlocks();
          })
          .catch((error) => {
            console.error("Error saving:", error);
          });
      }
    };

    const togglePreview = () => {
      if (!editorInstance.current) return;

      const editor = editorInstance.current;

      if (!isPreview) {
        editor.stopCommand("sw-visibility");
        document.body.classList.add("gjs-preview-mode");

        const panels = document.querySelectorAll(".gjs-pn-panel");
        panels.forEach((panel) => {
          if (panel.classList.contains("gjs-pn-commands")) return;
          panel.classList.add("gjs-hidden");
        });

        editor.refresh();
        setIsPreview(true);
      } else {
        editor.runCommand("sw-visibility");
        document.body.classList.remove("gjs-preview-mode");

        const panels = document.querySelectorAll(".gjs-pn-panel");
        panels.forEach((panel) => {
          panel.classList.remove("gjs-hidden");
        });

        editor.refresh();
        setIsPreview(false);
      }
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
              ...Object.values(BLOCK_COMPONENTS),
            ],
            categories: [
              { id: "Saved Sections", label: "Saved Sections", open: false },
              {
                id: BLOCK_CATEGORIES.LAYOUT,
                label: BLOCK_CATEGORIES.LAYOUT,
                open: false,
              },
              {
                id: BLOCK_CATEGORIES.BASIC,
                label: BLOCK_CATEGORIES.BASIC,
                open: false,
              },
              {
                id: BLOCK_CATEGORIES.COMPONENTS,
                label: BLOCK_CATEGORIES.COMPONENTS,
                open: false,
              },
              {
                id: BLOCK_CATEGORIES.TYPOGRAPHY,
                label: BLOCK_CATEGORIES.TYPOGRAPHY,
                open: false,
              },
              {
                id: BLOCK_CATEGORIES.MEDIA,
                label: BLOCK_CATEGORIES.MEDIA,
                open: false,
              },
            ],
          },
          styleManager: {
            appendTo: "#styles",
            sectors: [
              {
                name: "Dimension",
                open: false, // Changed to false
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
                open: false, // Changed to false
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
                open: false, // Changed to false
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
                open: false, // Changed to false
                buildProps: ["transition", "transform"],
              },
            ],
            multipleStyles: true,
          },
          layerManager: {
            appendTo: "#layers",
            showWrapper: false, // Hide wrapper by default
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
            frameStyle: `
              body { 
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
                min-height: 100vh;
              }
            `,
          },
          dragMode: "translate",
          components: {
            wrapper: {
              removable: false,
              draggable: false,
              droppable: true,
              components: [],
            },
          },
          parser: {
            cssParser: {
              keepUnusedStyles: true,
            },
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

        // Event Listeners
        editor.on("component:selected", (component) => {
          console.log("Selected component:", component);
        });

        editor.on("component:add", (component) => {
          const sectionCss = component.get("attributes")["data-section-css"];
          if (sectionCss) {
            const currentCss = editor.getCss();
            const mergedCss = mergeCss(currentCss, sectionCss);
            editor.setStyle(mergedCss);
          }
          editor.refresh();
        });

        editor.on("component:mount", (component) => {
          console.log("Mounted component:", component);
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

        editor.on("block:drag:stop", function (component) {
          if (component && component.get("content")) {
            setIsDirty(true);
            const sectionCss = component.get("attributes")["data-section-css"];
            if (sectionCss) {
              const currentCss = editor.getCss();
              const mergedCss = mergeCss(currentCss, sectionCss);
              editor.setStyle(mergedCss);
            }
            editor.refresh();
          }
        });

        // Load sections as blocks
        loadSectionsAsBlocks();

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
      <div className="h-full flex flex-col bg-white">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3">
            <select
              onChange={(e) =>
                editorInstance.current?.setDevice(e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">🖥️ Desktop</option>
              <option value="tablet">📱 Tablet</option>
              <option value="mobile">📱 Mobile</option>
            </select>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={togglePreview}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isPreview
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isPreview ? "✏️ Edit" : "👁️ Preview"}
            </button>
            <button
              onClick={() =>
                editorInstance.current?.runCommand("sw-visibility")
              }
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
            >
              🔲 Borders
            </button>
            <button
              onClick={toggleCodeEditor}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isCodeEditorOpen
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              💻 Code
            </button>
            <button
              onClick={loadSectionsAsBlocks}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
            >
              🔄 Refresh
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
              isDirty
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isDirty ? "💾 Save Changes" : "✓ Saved"}
          </button>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-gray-700 font-medium">Loading...</span>
                </div>
              </div>
            </div>
          )}

          {/* Left Sidebar */}
          <div
            className={`w-72 bg-white border-r border-gray-200 flex flex-col ${
              isPreview ? "hidden" : ""
            }`}
          >
            {/* Blocks Section */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                📦 Blocks
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3" id="blocks" />

            {/* Layers Section */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                🗂️ Layers
              </h2>
            </div>
            <div className="h-64 overflow-y-auto" id="layers" />
          </div>

          {/* Editor Canvas */}
          <div
            className={`flex-1 bg-gray-100 ${isPreview ? "w-full" : ""}`}
            id="gjs"
          />

          {/* Right Sidebar - Styles */}
          <div
            className={`w-72 bg-white border-l border-gray-200 ${
              isPreview ? "hidden" : ""
            }`}
          >
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                🎨 Styles
              </h2>
            </div>
            <div className="overflow-y-auto h-full" id="styles" />
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className={`code-panel ${isCodeEditorOpen ? "" : "hidden"}`}>
          <div className="code-panel-header">
            <div className="flex space-x-2">
              <button
                className={`code-panel-tab ${
                  activeTab === "html" ? "active" : ""
                }`}
                onClick={() => setActiveTab("html")}
              >
                HTML
              </button>
              <button
                className={`code-panel-tab ${
                  activeTab === "css" ? "active" : ""
                }`}
                onClick={() => setActiveTab("css")}
              >
                CSS
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBeautifyCode}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-all"
                title="Beautify Code"
              >
                ✨ Format
              </button>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-all"
                title="Copy Code"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownloadCode}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-all"
                title="Download Code"
              >
                💾 Download
              </button>
              <button
                onClick={toggleCodeEditor}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-all"
                title="Close"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <div className="code-panel-content">
            <div className="code-panel-editor">
              {activeTab === "html" && (
                <textarea
                  value={codeEditorContent.html}
                  onChange={(e) => handleCodeChange("html", e.target.value)}
                  placeholder="HTML code..."
                  spellCheck="false"
                  wrap="off"
                  className="w-full h-full font-mono text-sm"
                />
              )}
              {activeTab === "css" && (
                <textarea
                  value={codeEditorContent.css}
                  onChange={(e) => handleCodeChange("css", e.target.value)}
                  placeholder="CSS code..."
                  spellCheck="false"
                  wrap="off"
                  className="w-full h-full font-mono text-sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GrapesEditor.displayName = "GrapesEditor";

export default GrapesEditor;
