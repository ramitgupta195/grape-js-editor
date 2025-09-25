"use client";

import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

export default function GrapesEditor({
  initialHtml = "",
  initialCss = "",
  onSave,
}) {
  const editorRef = useRef(null);

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

      // Load existing content
      if (initialHtml) editor.setComponents(initialHtml);
      if (initialCss) editor.setStyle(initialCss);

      editorRef.current = editor;
    }
    return () => editorRef.current?.destroy();
  }, [initialHtml, initialCss]);

  const handleSave = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    console.log("🔹 GrapesJS Save:", { html, css }); // debug
    onSave(html, css);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        id="blocks"
        style={{ width: "250px", borderRight: "1px solid #ccc" }}
      />
      <div id="gjs" style={{ flexGrow: 1 }} />
      <div
        id="styles"
        style={{ width: "300px", borderLeft: "1px solid #ccc" }}
      />
      <button
        onClick={handleSave}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          background: "#16a34a",
          color: "white",
          borderRadius: "5px",
        }}
      >
        Save Section
      </button>
    </div>
  );
}
