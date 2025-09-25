"use client";

import { useRef, useState } from "react";
import GrapesEditor from "./components/GrapesEditor";

export default function Home() {
  const editorRef = useRef(null);

  // Separate state for the input fields
  const [sectionName, setSectionName] = useState("");
  const [componentKey, setComponentKey] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // Handle GrapesJS canvas save
  const handleEditorSave = () => {
    console.log("🔄 handleEditorSave() called");

    if (!editorRef.current) {
      console.log("❌ handleEditorSave: editorRef.current is null");
      return;
    }

    const editorPayload = {
      template_html: editorRef.current.getHtml(),
      template_css: editorRef.current.getCss(),
    };

    console.log("✅ handleEditorSave: Editor payload generated");
    console.log("🔹 Editor Payload:", JSON.stringify(editorPayload, null, 2));
    return editorPayload;
  };

  // Handle input fields separately
  const handleFieldsSave = () => {
    console.log("🔄 handleFieldsSave() called");

    const fieldsPayload = {
      name: sectionName,
      component_key: componentKey,
      thumbnail_url: thumbnailUrl,
    };

    console.log("✅ handleFieldsSave: Fields payload generated");
    console.log(
      "🔹 Input Fields Payload:",
      JSON.stringify(fieldsPayload, null, 2)
    );
    return fieldsPayload;
  };

  // Combined save
  const handleSaveAll = () => {
    console.log("🚀 handleSaveAll() TRIGGERED");
    console.log("📝 Current form values:", {
      sectionName,
      componentKey,
      thumbnailUrl,
    });

    console.log("🔄 Getting editor payload...");
    const editorPayload = handleEditorSave();

    console.log("🔄 Getting fields payload...");
    const fieldsPayload = handleFieldsSave();

    if (!editorPayload) {
      console.log("❌ handleSaveAll: Editor payload is null, aborting save");
      return;
    }

    const combinedPayload = { ...fieldsPayload, ...editorPayload };
    console.log("✅ handleSaveAll: Combined payload created");
    console.log(
      "🔹 Combined Payload:",
      JSON.stringify(combinedPayload, null, 2)
    );

    console.log("🌐 Sending combinedPayload to API...");
    // send combinedPayload to API
    console.log("✅ handleSaveAll: Process completed");
  };

  // Handler for GrapesEditor's onSave callback
  const handleGrapesEditorSave = (payload) => {
    console.log("🎨 handleGrapesEditorSave() called from GrapesEditor");
    console.log("📦 Payload from GrapesEditor:", payload);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Side panel inputs */}
      <div
        style={{
          width: "300px",
          padding: "20px",
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h2>Section Details</h2>
        <input
          type="text"
          placeholder="Section Name"
          value={sectionName}
          onChange={(e) => {
            console.log("📝 Section Name changed:", e.target.value);
            setSectionName(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Component Key"
          value={componentKey}
          onChange={(e) => {
            console.log("📝 Component Key changed:", e.target.value);
            setComponentKey(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) => {
            console.log("📝 Thumbnail URL changed:", e.target.value);
            setThumbnailUrl(e.target.value);
          }}
        />

        <button
          onClick={() => {
            console.log("🖱️ Save Section button clicked");
            handleSaveAll();
          }}
          style={{
            padding: "10px 20px",
            background: "#16a34a",
            color: "white",
            borderRadius: "5px",
            marginTop: "10px",
          }}
        >
          Save Section
        </button>
      </div>

      {/* GrapesJS Editor */}
      <div style={{ flexGrow: 1 }}>
        <GrapesEditor editorRef={editorRef} onSave={handleGrapesEditorSave} />
      </div>
    </div>
  );
}
