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

const GrapesEditor = forwardRef(
  (
    {
      sectionId = null,
      apiEndpoint = "http://10.80.5.76:3000/api/v1/sections",
      onSave,
      onApiError,
    },
    ref
  ) => {
    const editorInstance = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Expose editor methods to parent
    useImperativeHandle(ref, () => ({
      getHtml: () => editorInstance.current?.getHtml() || "",
      getCss: () => editorInstance.current?.getCss() || "",
      setComponents: (html) => editorInstance.current?.setComponents(html),
      setStyle: (css) => editorInstance.current?.setStyle(css),
      editor: editorInstance.current,
    }));

    const handleSave = () => {
      if (!editorInstance.current) return;

      const html = editorInstance.current.getHtml();
      const css = editorInstance.current.getCss();

      if (onSave) {
        onSave({
          template_html: html,
          template_css: css,
        });
      }
      setIsDirty(false);
    };

    // Initialize editor
    useEffect(() => {
      if (!editorInstance.current) {
        const editor = grapesjs.init({
          container: "#gjs",
          height: "100%",
          width: "auto",
          storageManager: false,
          // Add custom styles to make components more visible
          style: `
          .gjs-dashed *[data-gjs-type="wrapper"] {
            padding: 10px;
            min-height: 50px;
          }
          .gjs-dashed *[data-gjs-type="text"] {
            padding: 10px;
            min-height: 30px;
            border: 1px dashed #666;
          }
          .gjs-dashed *[data-gjs-type="div"] {
            padding: 10px;
            min-height: 50px;
            border: 1px dashed #666;
          }
          /* Make empty elements visible */
          .gjs-dashed *[data-gjs-type]:empty {
            min-height: 30px;
            background-color: rgba(0,0,0,0.1);
          }
        `,
          blockManager: {
            appendTo: "#blocks",
            blocks: [
              {
                id: "section",
                label: "Section",
                category: "Basic",
                content: `
                <section class="section">
                  <h2>Section Heading</h2>
                  <p>Section content goes here</p>
                </section>
              `,
                attributes: { class: "gjs-block-section" },
              },
              {
                id: "text",
                label: "Text",
                category: "Basic",
                content: {
                  type: "text",
                  content: "Insert your text here",
                  style: { padding: "10px" },
                },
                attributes: { class: "gjs-block-text" },
              },
              {
                id: "div",
                label: "Container",
                category: "Basic",
                content: {
                  type: "div",
                  content: "Container content",
                  style: {
                    padding: "20px",
                    minHeight: "50px",
                    backgroundColor: "#f5f5f5",
                  },
                },
                attributes: { class: "gjs-block-div" },
              },
              // ... other blocks
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
                  "border",
                  "border-radius",
                  "box-shadow",
                ],
              },
            ],
          },
          layerManager: {
            appendTo: "#layers",
          },
          // Add custom panels
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
                    id: "save",
                    className: "btn-save",
                    label: "Save",
                    command: "save-db",
                  },
                ],
              },
            ],
          },
        });

        // Track changes
        editor.on("component:update", () => setIsDirty(true));
        editor.on("style:update", () => setIsDirty(true));

        // Save command
        editor.Commands.add("save-db", {
          run: handleSave,
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

    return (
      <div className="h-full flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
              onClick={() => editorInstance.current?.runCommand("preview")}
            >
              Preview
            </button>
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
              onClick={() =>
                editorInstance.current?.runCommand("sw-visibility")
              }
            >
              Toggle Borders
            </button>
          </div>
          <button
            className={`px-6 py-2 rounded font-semibold ${
              isDirty ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"
            }`}
            onClick={handleSave}
            disabled={!isDirty}
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

          {/* Left Sidebar - Blocks & Layers */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">Blocks</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4" id="blocks" />

            <div className="p-4 border-t border-gray-200">
              <h2 className="font-semibold text-lg">Layers</h2>
            </div>
            <div className="h-64 overflow-y-auto p-4" id="layers" />
          </div>

          {/* Editor Canvas */}
          <div className="flex-1" id="gjs" />

          {/* Right Sidebar - Styles */}
          <div className="w-64 bg-white border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">Styles</h2>
            </div>
            <div className="overflow-y-auto h-full" id="styles" />
          </div>
        </div>
      </div>
    );
  }
);

GrapesEditor.displayName = "GrapesEditor";

export default GrapesEditor;
