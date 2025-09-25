"use client";

import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

export default function GrapesEditor({ initialSection = {}, onSave }) {
  const editorRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = grapesjs.init({
        container: "#gjs",
        height: "100vh",
        width: "100%",
        fromElement: false,
        storageManager: false,
        blockManager: {
          appendTo: "#blocks",
          blocks: [
            {
              id: "section",
              label: "<b>Section</b>",
              content: `<section style="padding:50px; text-align:center;">Section</section>`,
            },
            {
              id: "text",
              label: "Text",
              content: `<div style="padding:20px;">Insert your text here</div>`,
            },
            {
              id: "image",
              label: "Image",
              content: `<img src="https://via.placeholder.com/150" alt="Image"/>`,
            },
            {
              id: "hero",
              label: "Hero",
              content: `<section style="padding:100px; text-align:center; background:#eee;"><h1>Hero Title</h1><p>Subtitle here</p></section>`,
            },
          ],
        },
        styleManager: {
          appendTo: "#styles",
          sectors: [
            {
              name: "Dimension",
              open: false,
              buildProps: ["width", "height", "padding", "margin"],
            },
            {
              name: "Typography",
              open: false,
              buildProps: [
                "font-family",
                "font-size",
                "color",
                "line-height",
                "text-align",
              ],
            },
            {
              name: "Decorations",
              open: false,
              buildProps: ["background-color", "border", "border-radius"],
            },
          ],
        },
      });

      // Load initial HTML/CSS if any
      editor.setComponents(
        initialSection.template_html ||
          `<section style="padding:50px; text-align:center;">Section</section>`
      );
      editor.setStyle(initialSection.template_css || "");

      editorRef.current = editor;
      setEditorReady(true);
    }

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
      setEditorReady(false);
    };
  }, []); // Fixed: Empty dependency array to prevent re-initialization

  const handleSave = () => {
    if (!editorRef.current || !editorReady) return;

    const payload = {
      template_html: editorRef.current.getHtml(),
      template_css: editorRef.current.getCss(),
    };

    console.log("🔹 Payload for API:", JSON.stringify(payload, null, 2));
    onSave?.(payload);
  };

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      {/* Blocks Panel */}
      <div
        id="blocks"
        style={{ width: "250px", borderRight: "1px solid #ccc" }}
      />

      {/* Editor */}
      <div id="gjs" style={{ flexGrow: 1 }} />

      {/* Style Panel */}
      <div
        id="styles"
        style={{
          width: "300px",
          borderLeft: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
        }}
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!editorReady}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          background: editorReady ? "#16a34a" : "#aaa",
          color: "white",
          borderRadius: "5px",
          zIndex: 1000,
          cursor: editorReady ? "pointer" : "not-allowed",
        }}
      >
        Save Section
      </button>
    </div>
  );
}
