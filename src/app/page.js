"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import GrapesEditor from "./components/GrapesEditor";

export default function Home() {
  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Basic templates
  const templates = [
    {
      id: 'blank',
      name: 'Blank Section',
      preview: '/blank-template.png',
      html: '<section style="padding:50px; text-align:center;">New Section</section>',
      css: ''
    },
    {
      id: 'hero',
      name: 'Hero Banner',
      preview: '/hero-template.png',
      html: `<section style="padding:80px 20px; text-align:center; background-color:#f8fafc;">
        <h1 style="font-size:48px; margin-bottom:20px;">Welcome</h1>
        <p style="font-size:20px; color:#64748b; margin-bottom:30px;">Start creating your amazing section</p>
        <button style="padding:12px 24px; background-color:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer;">Get Started</button>
      </section>`,
      css: ''
    },
    {
      id: 'features',
      name: 'Features Grid',
      preview: '/features-template.png',
      html: `<section style="padding:60px 20px; background-color:white;">
        <div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(3, 1fr); gap:30px;">
          <div style="text-align:center; padding:20px;">
            <div style="font-size:24px; margin-bottom:10px;">⚡</div>
            <h3 style="margin-bottom:10px;">Feature 1</h3>
            <p style="color:#64748b;">Description goes here</p>
          </div>
          <div style="text-align:center; padding:20px;">
            <div style="font-size:24px; margin-bottom:10px;">🎯</div>
            <h3 style="margin-bottom:10px;">Feature 2</h3>
            <p style="color:#64748b;">Description goes here</p>
          </div>
          <div style="text-align:center; padding:20px;">
            <div style="font-size:24px; margin-bottom:10px;">💡</div>
            <h3 style="margin-bottom:10px;">Feature 3</h3>
            <p style="color:#64748b;">Description goes here</p>
          </div>
        </div>
      </section>`,
      css: ''
    }
  ];

  const editorRef = useRef(null);

  // Form state
  const [sectionName, setSectionName] = useState("");
  const [componentKey, setComponentKey] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [activeTab, setActiveTab] = useState("sections"); // 'sections' or 'editor'

  // API state
  const [sectionId, setSectionId] = useState(null);
  const [apiEndpoint] = useState("http://10.80.5.76:3000/api/v1/sections");
  const [saving, setSaving] = useState(false);
  const [loadingSectionId, setLoadingSectionId] = useState("");
  const [allSections, setAllSections] = useState([]);
  const [loadingAllSections, setLoadingAllSections] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter sections based on search
  const filteredSections = allSections.filter(
    (section) =>
      section.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.component_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.id.toString().includes(searchTerm)
  );

  // API handling functions
  const handleApiResponse = async (response, actionType) => {
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `${actionType} failed: ${response.status}`;
      } catch {
        errorMessage = `${actionType} failed: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    return response.json();
  };

  // Show notification
  const showNotification = (message, type = "info") => {
    // You can replace this with a toast library
    alert(message);
  };

  // Save to API
  const saveToAPI = useCallback(async (combinedPayload) => {
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

      setAllSections(prev => {
        if (sectionId) {
          return prev.map(section => 
            section.id === sectionId ? { ...section, ...combinedPayload } : section
          );
        } else {
          return [...prev, result];
        }
      });

      showNotification(`Section ${actionType.toLowerCase()}d successfully!`, "success");
      return result;

    } catch (error) {
      showNotification(error.message, "error");
      throw error;
    } finally {
      setSaving(false);
    }
  }, [sectionId, apiEndpoint]);
    // Fetch all sections
  const fetchAllSections = useCallback(async () => {
    setLoadingAllSections(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

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

  // Delete section
  const handleDeleteSection = useCallback(async (id, e) => {
    e?.stopPropagation();
    
    const sectionToDelete = allSections.find(s => s.id === id);
    if (!confirm(`Are you sure you want to delete section "${sectionToDelete?.name || id}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      setAllSections(prev => prev.filter(section => section.id !== id));

      if (sectionId === id) {
        handleNewSection();
      }

      showNotification("Section deleted successfully!", "success");

    } catch (error) {
      showNotification(error.message, "error");
    }
  }, [apiEndpoint, sectionId, allSections]);

  // Load section
  const handleLoadSection = useCallback(async (id) => {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      showNotification("Please enter a valid section ID", "error");
      return;
    }

    try {
      const response = await fetch(`${apiEndpoint}/${parsedId}`);
      const section = await handleApiResponse(response, "Load section");

      setSectionId(parsedId);
      setSectionName(section.name || "");
      setComponentKey(section.component_key || "");
      setThumbnailUrl(section.thumbnail_url || "");
      setShowCreateForm(true);
      setActiveTab("editor");

      if (section.template_html && editorRef.current) {
        editorRef.current.setComponents(section.template_html);
        editorRef.current.setStyle(section.template_css || "");
      }

    } catch (error) {
      showNotification(error.message, "error");
    }
  }, [apiEndpoint]);

  // Create new section
  const handleNewSection = useCallback(() => {
    setSectionId(null);
    setSectionName("");
    setComponentKey("");
    setThumbnailUrl("");
    setShowCreateForm(true);
    setShowTemplates(true);
    if (editorRef.current) {
      editorRef.current.setComponents('<section style="padding:50px; text-align:center;">New Section</section>');
      editorRef.current.setStyle('');
    }
  }, []);

  // Handle GrapesEditor save
  const handleGrapesEditorSave = useCallback(async (editorPayload) => {
    if (!sectionName || !componentKey) {
      showNotification("Please fill in Section Name and Component Key", "error");
      return;
    }

    const fieldsPayload = {
      name: sectionName.trim(),
      component_key: componentKey.trim(),
      thumbnail_url: thumbnailUrl.trim(),
    };

    const combinedPayload = {
      ...fieldsPayload,
      ...editorPayload,
    };

    try {
      await saveToAPI(combinedPayload);
    } catch (error) {
      console.error("Save failed:", error);
    }
  }, [sectionName, componentKey, thumbnailUrl, saveToAPI]);

  // Load sections on mount
  useEffect(() => {
    fetchAllSections();
  }, [fetchAllSections]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Choose a Template</h2>
              <button 
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map(template => (
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
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="bg-gray-100 h-32 rounded flex items-center justify-center mb-2">
                    Preview
                  </div>
                  <div className="font-medium">{template.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Section Manager</h1>
          <button
            onClick={handleNewSection}
            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create New Section
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loadingAllSections ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            filteredSections.map((section) => (
              <div
                key={section.id}
                onClick={() => handleLoadSection(section.id)}
                className={`mb-2 p-3 rounded-lg cursor-pointer ${
                  sectionId === section.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-sm text-gray-500">
                      ID: {section.id} • {section.component_key}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSection(section.id, e)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showCreateForm && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter section name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Component Key *
                </label>
                <input
                  type="text"
                  value={componentKey}
                  onChange={(e) => setComponentKey(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter component key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter thumbnail URL"
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