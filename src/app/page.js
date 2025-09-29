"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import GrapesEditor from "./components/GrapesEditor";

export default function Home() {
  const editorRef = useRef(null);

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [componentKey, setComponentKey] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sectionId, setSectionId] = useState(null);
  const [apiEndpoint] = useState("http://10.80.5.76:3000/api/v1/sections");
  const [saving, setSaving] = useState(false);
  const [allSections, setAllSections] = useState([]);
  const [loadingAllSections, setLoadingAllSections] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter sections
  const filteredSections = allSections.filter(
    (section) =>
      section.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.component_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.id.toString().includes(searchTerm)
  );

  // Template definitions
  const templates = [
    {
      id: "blank",
      name: "Blank Section",
      preview: "/blank-template.png",
      html: '<section class="editor-component"><p>Start editing your section</p></section>',
      css: "",
    },
    {
      id: "hero",
      name: "Hero Banner",
      preview: "/hero-template.png",
      html: `
        <section class="editor-component hero-section">
          <div class="container mx-auto px-4 py-12">
            <h1 class="text-4xl font-bold mb-4">Welcome to Your Site</h1>
            <p class="text-xl mb-8">Create something amazing today</p>
            <button class="editor-btn editor-btn-primary">Get Started</button>
          </div>
        </section>
      `,
      css: "",
    },
    {
      id: "features",
      name: "Features Grid",
      preview: "/features-template.png",
      html: `
        <section class="editor-component features-section">
          <div class="container mx-auto px-4 py-16">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="feature-card">
                <div class="text-3xl mb-4">⚡</div>
                <h3 class="text-xl font-semibold mb-2">Fast</h3>
                <p>Lightning quick performance</p>
              </div>
              <div class="feature-card">
                <div class="text-3xl mb-4">🛡️</div>
                <h3 class="text-xl font-semibold mb-2">Secure</h3>
                <p>Enterprise-grade security</p>
              </div>
              <div class="feature-card">
                <div class="text-3xl mb-4">🎨</div>
                <h3 class="text-xl font-semibold mb-2">Beautiful</h3>
                <p>Stunning designs</p>
              </div>
            </div>
          </div>
        </section>
      `,
      css: "",
    },
  ];

  // API Functions
  const handleApiResponse = async (response, actionType) => {
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message || `${actionType} failed: ${response.status}`;
      } catch {
        errorMessage = `${actionType} failed: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  };

  const showNotification = (message, type = "info") => {
    // Replace with your preferred notification system
    alert(message);
  };

  // CRUD Operations
  const saveToAPI = useCallback(
    async (combinedPayload) => {
      setSaving(true);
      const actionType = sectionId ? "Update" : "Create";

      try {
        const method = sectionId ? "PATCH" : "POST";
        const url = sectionId ? `${apiEndpoint}/${sectionId}` : apiEndpoint;

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(combinedPayload),
        });

        const result = await handleApiResponse(response, actionType);

        if (!sectionId && result.id) {
          setSectionId(result.id);
          setShowCreateForm(false);
        }

        setAllSections((prev) => {
          if (sectionId) {
            return prev.map((section) =>
              section.id === sectionId
                ? { ...section, ...combinedPayload }
                : section
            );
          }
          return [...prev, result];
        });

        showNotification(
          `Section ${actionType.toLowerCase()}d successfully!`,
          "success"
        );
        return result;
      } catch (error) {
        showNotification(error.message, "error");
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [sectionId, apiEndpoint]
  );

  const fetchAllSections = useCallback(async () => {
    setLoadingAllSections(true);

    try {
      const response = await fetch(apiEndpoint);
      const sections = await handleApiResponse(response, "Fetch sections");
      setAllSections(sections);
      return sections;
    } catch (error) {
      showNotification(error.message, "error");
      return [];
    } finally {
      setLoadingAllSections(false);
    }
  }, [apiEndpoint]);

  // Handler Functions
  const handleDeleteSection = useCallback(
    async (id, e) => {
      e?.stopPropagation();

      const sectionToDelete = allSections.find((s) => s.id === id);
      if (
        !confirm(
          `Are you sure you want to delete "${sectionToDelete?.name || id}"?`
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.status}`);
        }

        setAllSections((prev) => prev.filter((section) => section.id !== id));

        if (sectionId === id) {
          handleNewSection();
        }

        showNotification("Section deleted successfully!", "success");
      } catch (error) {
        showNotification(error.message, "error");
      }
    },
    [apiEndpoint, sectionId]
  );

  const handleLoadSection = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${apiEndpoint}/${id}`);
        const section = await handleApiResponse(response, "Load section");

        setSectionId(id);
        setSectionName(section.name || "");
        setComponentKey(section.component_key || "");
        setThumbnailUrl(section.thumbnail_url || "");
        setShowCreateForm(true);

        if (editorRef.current) {
          editorRef.current.setComponents(section.template_html || "");
          editorRef.current.setStyle(section.template_css || "");
        }
      } catch (error) {
        showNotification(error.message, "error");
      }
    },
    [apiEndpoint]
  );

  const handleNewSection = useCallback(() => {
    setSectionId(null);
    setSectionName("");
    setComponentKey("");
    setThumbnailUrl("");
    setShowCreateForm(true);
    setShowTemplates(true);
  }, []);

  const handleGrapesEditorSave = useCallback(
    async (editorPayload) => {
      if (!sectionName || !componentKey) {
        showNotification(
          "Please fill in Section Name and Component Key",
          "error"
        );
        return;
      }

      const fieldsPayload = {
        name: sectionName.trim(),
        component_key: componentKey.trim(),
        thumbnail_url: thumbnailUrl.trim(),
      };

      try {
        await saveToAPI({ ...fieldsPayload, ...editorPayload });
      } catch (error) {
        console.error("Save failed:", error);
      }
    },
    [sectionName, componentKey, thumbnailUrl, saveToAPI]
  );

  // Load sections on mount
  useEffect(() => {
    fetchAllSections();
  }, [fetchAllSections]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-[90%] max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Choose a Template</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowTemplates(false);
                    if (editorRef.current) {
                      editorRef.current.setComponents(template.html);
                      editorRef.current.setStyle(template.css);
                    }
                  }}
                  className="editor-panel hover:border-primary cursor-pointer transition-all"
                >
                  <div className="bg-gray-100 h-32 rounded flex items-center justify-center mb-3">
                    {template.name}
                  </div>
                  <div className="font-medium text-center">{template.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 bg-background border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold mb-4">Section Manager</h1>
          <button
            onClick={handleNewSection}
            className="editor-btn editor-btn-primary w-full"
          >
            Create New Section
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="editor-input"
          />
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-500">
              ALL SECTIONS ({filteredSections.length})
            </h2>
            <button
              onClick={fetchAllSections}
              disabled={loadingAllSections}
              className="editor-btn editor-btn-secondary text-sm"
            >
              {loadingAllSections ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loadingAllSections ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-2">
              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => handleLoadSection(section.id)}
                  className={`section-list-item ${
                    sectionId === section.id ? "active" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium mb-1">{section.name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {section.id} • {section.component_key}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSection(section.id, e)}
                      className="editor-btn editor-btn-secondary text-sm text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        {showCreateForm && (
          <div className="border-t border-border p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-4 text-black">
              {sectionId ? `Edit Section #${sectionId}` : "New Section"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="editor-input"
                  placeholder="e.g., Hero Banner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component Key *
                </label>
                <input
                  type="text"
                  value={componentKey}
                  onChange={(e) => setComponentKey(e.target.value)}
                  className="editor-input"
                  placeholder="e.g., hero_banner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="editor-input"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1">
        <GrapesEditor
          ref={editorRef}
          sectionId={sectionId}
          apiEndpoint={apiEndpoint}
          onSave={handleGrapesEditorSave}
          onApiError={(error) => showNotification(error.message, "error")}
        />
      </div>
    </div>
  );
}
