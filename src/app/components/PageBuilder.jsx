"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ============================================
// DRAGGABLE SECTION (FROM SIDEBAR)
// ============================================
function DraggableSection({ section }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `available-${section.id}`,
      data: {
        type: "new-section",
        section: section,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group relative bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-move overflow-hidden"
    >
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM7 18a2 2 0 11-4 0 2 2 0 014 0zM17 2a2 2 0 11-4 0 2 2 0 014 0zM17 10a2 2 0 11-4 0 2 2 0 014 0zM17 18a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>

      {section.thumbnail_url ? (
        <div className="aspect-video w-full bg-gray-100">
          <img
            src={section.thumbnail_url}
            alt={section.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-4xl opacity-20">📄</div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {section.name}
            </h3>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {section.component_key}
            </p>
          </div>
          <span className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            #{section.id}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SORTABLE SECTION (IN CANVAS)
// ============================================
function SortableSection({ section, onRemove, viewMode = "compact" }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.pageOrderId,
    data: {
      type: "existing-section",
      section: section,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const [expanded, setExpanded] = useState(false);

  if (viewMode === "compact") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-white rounded-lg border ${
          isDragging ? "border-blue-400 shadow-xl z-50" : "border-gray-200"
        } hover:border-blue-300 hover:shadow-md transition-all duration-200`}
      >
        <div className="flex items-center p-4">
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded cursor-move mr-3"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mr-3">
            <span className="text-lg">🎨</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {section.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {section.component_key}
            </p>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
              title="Preview"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={expanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </button>
            <button
              onClick={() => onRemove(section.pageOrderId)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Remove"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="bg-white rounded border border-gray-200 p-3 max-h-48 overflow-hidden relative">
              <div
                className="text-xs opacity-60 pointer-events-none scale-90 origin-top-left"
                dangerouslySetInnerHTML={{ __html: section.template_html }}
              />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border-2 ${
        isDragging ? "border-blue-400 shadow-2xl" : "border-gray-200"
      } hover:border-blue-300 hover:shadow-lg transition-all duration-200`}
    >
      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 z-10">
        <button
          {...attributes}
          {...listeners}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 cursor-move hover:bg-gray-50 transition-colors"
          title="Drag to reorder"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>
        <button
          onClick={() => onRemove(section.pageOrderId)}
          className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
          title="Remove section"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{section.name}</h3>
            <p className="text-xs text-gray-500">{section.component_key}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-hidden relative">
          <div
            className="text-xs opacity-75 pointer-events-none"
            dangerouslySetInnerHTML={{ __html: section.template_html }}
          />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DROPPABLE AREA
// ============================================
function DroppableArea({ children }) {
  const { setNodeRef } = useDroppable({
    id: "droppable-area",
  });

  return (
    <div ref={setNodeRef} className="min-h-full">
      {children}
    </div>
  );
}

// ============================================
// MAIN PAGE BUILDER COMPONENT
// ============================================
export default function PageBuilder() {
  // State
  const [availableSections, setAvailableSections] = useState([]);
  const [existingPages, setExistingPages] = useState([]);
  const [pageSections, setPageSections] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPagesList, setShowPagesList] = useState(false);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [canvasViewMode, setCanvasViewMode] = useState("compact");

  const [pageId, setPageId] = useState(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageMetaDescription, setPageMetaDescription] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [combinedCSS, setCombinedCSS] = useState("");

  // API Endpoints
  const sectionsApiEndpoint = "http://10.80.5.76:3000/api/v1/sections";
  const pagesApiEndpoint = "http://10.80.5.76:3000/api/v1/pages";
  const pageSectionsApiEndpoint = "http://10.80.5.76:3000/api/v1/page_sections";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initial load
  useEffect(() => {
    fetchSections();
    fetchPages();
  }, []);

  // Update combined CSS
  useEffect(() => {
    const css = pageSections
      .map((section) => section.template_css || "")
      .filter((css) => css.trim())
      .join("\n");
    setCombinedCSS(css);
  }, [pageSections]);

  // ============================================
  // API CALLS
  // ============================================

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch(sectionsApiEndpoint);
      if (!response.ok)
        throw new Error(`Failed to fetch sections: ${response.status}`);

      const data = await response.json();
      console.log("✅ Fetched sections:", data);
      setAvailableSections(data);
    } catch (error) {
      console.error("❌ Error fetching sections:", error);
      alert(`Failed to load sections: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch(pagesApiEndpoint);
      if (!response.ok)
        throw new Error(`Failed to fetch pages: ${response.status}`);

      const data = await response.json();
      console.log("✅ Fetched pages:", data);
      setExistingPages(data);
    } catch (error) {
      console.error("❌ Error fetching pages:", error);
    }
  };

  // ============================================
  // LOAD PAGE (Complete Flow)
  // ============================================
  const loadPage = async (id) => {
    setLoadingPage(true);
    console.log(`🔄 Loading page with ID: ${id}`);

    try {
      const pageResponse = await fetch(`${pagesApiEndpoint}/${id}`);
      if (!pageResponse.ok) {
        throw new Error(`Failed to load page: ${pageResponse.status}`);
      }

      const pageData = await pageResponse.json();
      console.log("✅ Page metadata loaded:", pageData);

      setPageId(pageData.id);
      setPageTitle(pageData.title || "");
      setPageSlug(pageData.slug || "");
      setPageMetaDescription(pageData.meta_description || "");

      const pageSectionsResponse = await fetch(pageSectionsApiEndpoint);
      if (!pageSectionsResponse.ok) {
        throw new Error(
          `Failed to load page sections: ${pageSectionsResponse.status}`
        );
      }

      const allPageSections = await pageSectionsResponse.json();
      console.log("✅ All page_sections loaded:", allPageSections);

      const pageSpecificSections = allPageSections.filter(
        (ps) => ps.page_id === id
      );
      console.log(
        `✅ Filtered page_sections for page ${id}:`,
        pageSpecificSections
      );

      if (pageSpecificSections.length > 0) {
        const sectionsWithDetails = await Promise.all(
          pageSpecificSections.map(async (pageSection) => {
            try {
              const sectionResponse = await fetch(
                `${sectionsApiEndpoint}/${pageSection.section_id}`
              );

              if (!sectionResponse.ok) {
                console.error(
                  `Failed to load section ${pageSection.section_id}`
                );
                return null;
              }

              const fullSectionData = await sectionResponse.json();

              return {
                ...fullSectionData,
                pageOrderId: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sort_order: pageSection.sort_order,
                page_section_id: pageSection.id,
              };
            } catch (error) {
              console.error(
                `Error loading section ${pageSection.section_id}:`,
                error
              );
              return null;
            }
          })
        );

        const validSections = sectionsWithDetails
          .filter((section) => section !== null)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        console.log("✅ Final sections loaded:", validSections);
        setPageSections(validSections);
      } else {
        setPageSections([]);
      }

      setShowPagesList(false);
    } catch (error) {
      console.error("❌ Error loading page:", error);
      alert(`Failed to load page: ${error.message}`);
    } finally {
      setLoadingPage(false);
    }
  };

  // ============================================
  // DELETE PAGE (Complete Flow)
  // ============================================
  const deletePage = async (id) => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }

    try {
      const pageSectionsResponse = await fetch(pageSectionsApiEndpoint);
      const allPageSections = await pageSectionsResponse.json();
      const pageSpecificSections = allPageSections.filter(
        (ps) => ps.page_id === id
      );

      for (const pageSection of pageSpecificSections) {
        await fetch(`${pageSectionsApiEndpoint}/${pageSection.id}`, {
          method: "DELETE",
        });
      }

      const response = await fetch(`${pagesApiEndpoint}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Page deleted successfully!");
        fetchPages();
        if (pageId === id) {
          handleNewPage();
        }
      }
    } catch (error) {
      console.error("❌ Error deleting page:", error);
      alert(`Failed to delete page: ${error.message}`);
    }
  };

  // ============================================
  // SAVE PAGE - WITH BACKEND WORKAROUND
  // ============================================
  const handleSavePage = async () => {
    if (!pageTitle || !pageSlug) {
      alert("Please enter page title and slug");
      return;
    }

    if (pageSections.length === 0) {
      alert("Please add at least one section to the page");
      return;
    }

    setSaving(true);

    try {
      let currentPageId = pageId;

      // STEP 1: CREATE OR UPDATE PAGE
      const pageData = {
        page: {
          title: pageTitle,
          slug: pageSlug,
          meta_description: pageMetaDescription,
        },
      };

      console.log(`📄 Step 1: ${pageId ? "Updating" : "Creating"} page`);

      if (pageId) {
        const pageResponse = await fetch(`${pagesApiEndpoint}/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageData),
        });

        if (!pageResponse.ok) {
          throw new Error(`Failed to update page: ${pageResponse.status}`);
        }

        console.log("✅ Page updated");
      } else {
        const pageResponse = await fetch(pagesApiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pageData),
        });

        if (!pageResponse.ok) {
          throw new Error(`Failed to create page: ${pageResponse.status}`);
        }

        const savedPage = await pageResponse.json();
        currentPageId = savedPage.id;
        setPageId(currentPageId);
        console.log("✅ Page created with ID:", currentPageId);
      }

      // STEP 2: DELETE OLD PAGE_SECTIONS (IF UPDATING)
      if (pageId) {
        console.log(`📄 Step 2: Deleting old page_sections`);

        const existingPageSectionsResponse = await fetch(
          pageSectionsApiEndpoint
        );
        const allPageSections = await existingPageSectionsResponse.json();
        const existingPageSections = allPageSections.filter(
          (ps) => ps.page_id === pageId
        );

        for (const pageSection of existingPageSections) {
          await fetch(`${pageSectionsApiEndpoint}/${pageSection.id}`, {
            method: "DELETE",
          });
        }

        console.log("✅ Old page_sections deleted");
      }

      // STEP 3: CREATE NEW PAGE_SECTIONS (WITH WORKAROUND)
      console.log(
        `📄 Step 3: Creating ${pageSections.length} new page_sections`
      );

      let successCount = 0;

      for (let i = 0; i < pageSections.length; i++) {
        const section = pageSections[i];
        const pageSectionData = {
          page_section: {
            page_id: currentPageId,
            section_id: section.id,
            sort_order: i + 1,
          },
        };

        console.log(
          `  → Creating page_section ${i + 1}/${pageSections.length}`
        );

        try {
          const createResponse = await fetch(pageSectionsApiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pageSectionData),
          });

          console.log(`    Response status: ${createResponse.status}`);

          // ⚠️ WORKAROUND: Backend returns 500 but record is created
          if (createResponse.status === 500) {
            const errorText = await createResponse.text();

            // Check if it's the known backend routing error
            if (errorText.includes("page_section_url")) {
              console.warn(
                "    ⚠️ Backend error (page_section_url) - verifying if record was created..."
              );

              // Wait for DB
              await new Promise((resolve) => setTimeout(resolve, 300));

              // Verify if the page_section was actually created
              const verifyResponse = await fetch(pageSectionsApiEndpoint);
              const allPageSections = await verifyResponse.json();
              const justCreated = allPageSections.find(
                (ps) =>
                  ps.page_id === currentPageId &&
                  ps.section_id === section.id &&
                  ps.sort_order === i + 1
              );

              if (justCreated) {
                console.log("    ✅ Verified: Record created despite error");
                successCount++;
                continue;
              } else {
                console.error("    ❌ Record NOT created");
                throw new Error(
                  "Failed to create page_section (not found in database)"
                );
              }
            }
          }

          if (createResponse.ok) {
            console.log("    ✅ Created successfully");
            successCount++;
          } else {
            const errorText = await createResponse.text();
            throw new Error(`Failed: ${createResponse.status} - ${errorText}`);
          }
        } catch (error) {
          console.error(`    ❌ Error:`, error);
          throw error;
        }
      }

      console.log(
        `✅ Created ${successCount}/${pageSections.length} page_sections`
      );

      if (successCount === pageSections.length) {
        alert(`✅ Page ${pageId ? "updated" : "created"} successfully!`);
        fetchPages();
      } else {
        throw new Error(
          `Only ${successCount} of ${pageSections.length} sections were saved`
        );
      }
    } catch (error) {
      console.error("❌ Error saving page:", error);
      alert(
        `Failed to save page: ${error.message}\n\nCheck console for details.`
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // UI HANDLERS
  // ============================================

  const handleNewPage = () => {
    setPageId(null);
    setPageTitle("");
    setPageSlug("");
    setPageMetaDescription("");
    setPageSections([]);
    setShowPagesList(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id;

    if (activeData?.type === "new-section") {
      const section = activeData.section;
      const newSection = {
        ...section,
        pageOrderId: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      if (overId === "droppable-area") {
        setPageSections((prev) => [...prev, newSection]);
      } else {
        const overIndex = pageSections.findIndex(
          (s) => s.pageOrderId === overId
        );
        if (overIndex !== -1) {
          setPageSections((prev) => {
            const newSections = [...prev];
            newSections.splice(overIndex + 1, 0, newSection);
            return newSections;
          });
        } else {
          setPageSections((prev) => [...prev, newSection]);
        }
      }
    } else if (activeData?.type === "existing-section") {
      const activeId = active.id;
      const overId = over.id;

      if (activeId !== overId && overId !== "droppable-area") {
        setPageSections((items) => {
          const oldIndex = items.findIndex(
            (item) => item.pageOrderId === activeId
          );
          const newIndex = items.findIndex(
            (item) => item.pageOrderId === overId
          );

          if (oldIndex !== -1 && newIndex !== -1) {
            return arrayMove(items, oldIndex, newIndex);
          }
          return items;
        });
      }
    }
  };

  const handleRemoveSection = (pageOrderId) => {
    setPageSections((prev) =>
      prev.filter((s) => s.pageOrderId !== pageOrderId)
    );
  };

  const filteredSections = availableSections.filter(
    (section) =>
      section.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.component_key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPreview = () => {
    const combinedHTML = pageSections.map((s) => s.template_html).join("\n");

    return (
      <div className="w-full h-full bg-white">
        <style dangerouslySetInnerHTML={{ __html: combinedCSS }} />
        <div dangerouslySetInnerHTML={{ __html: combinedHTML }} />
      </div>
    );
  };

  const activeDragItem = activeId
    ? activeId.toString().startsWith("available-")
      ? availableSections.find(
          (s) => s.id.toString() === activeId.replace("available-", "")
        )
      : pageSections.find((s) => s.pageOrderId === activeId)
    : null;

  // ============================================
  // RENDER
  // ============================================

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-50">
        {/* Loading Overlay */}
        {loadingPage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
              <p className="text-gray-700 font-medium">Loading page...</p>
            </div>
          </div>
        )}

        {/* Pages List Modal */}
        {showPagesList && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-5xl max-h-[85vh] overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Pages
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Select a page to edit or create a new one
                  </p>
                </div>
                <button
                  onClick={() => setShowPagesList(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
                {existingPages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-500 text-lg">No pages found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Create your first page to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {existingPages.map((page) => (
                      <div
                        key={page.id}
                        className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                      >
                        <div className="mb-4">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {page.title}
                          </h3>
                          <p className="text-sm text-blue-600 font-mono">
                            /{page.slug}
                          </p>
                          {page.meta_description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {page.meta_description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadPage(page.id)}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePage(page.id)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div
          className={`${collapsedSidebar ? "w-16" : "w-96"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${previewMode ? "hidden" : ""}`}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h1
                className={`text-xl font-bold text-gray-900 ${collapsedSidebar ? "hidden" : ""}`}
              >
                Page Builder
              </h1>
              <button
                onClick={() => setCollapsedSidebar(!collapsedSidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      collapsedSidebar
                        ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                        : "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    }
                  />
                </svg>
              </button>
            </div>

            {!collapsedSidebar && (
              <>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={handleNewPage}
                    className="px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    New Page
                  </button>
                  <button
                    onClick={() => setShowPagesList(true)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    Browse
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Page Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., About Us"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., about-us"
                      value={pageSlug}
                      onChange={(e) =>
                        setPageSlug(
                          e.target.value.toLowerCase().replace(/\s+/g, "-")
                        )
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Meta Description
                    </label>
                    <textarea
                      placeholder="SEO description..."
                      value={pageMetaDescription}
                      onChange={(e) => setPageMetaDescription(e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {!collapsedSidebar && (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search sections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Available Sections
                  </h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {filteredSections.length}
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredSections.map((section) => (
                      <DraggableSection key={section.id} section={section} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {pageId && (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    Editing Page #{pageId}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      previewMode
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {previewMode ? "Edit Mode" : "Preview"}
                  </button>
                  {!previewMode && (
                    <>
                      <div className="h-6 w-px bg-gray-300 mx-1"></div>
                      <button
                        onClick={() =>
                          setCanvasViewMode(
                            canvasViewMode === "compact" ? "full" : "compact"
                          )
                        }
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {canvasViewMode === "compact" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          )}
                        </svg>
                        {canvasViewMode === "compact" ? "Full" : "List"}
                      </button>
                      {pageSections.length > 0 && (
                        <button
                          onClick={() => setPageSections([])}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {pageSections.length}{" "}
                  {pageSections.length === 1 ? "section" : "sections"}
                </span>
                <button
                  onClick={handleSavePage}
                  disabled={
                    saving ||
                    !pageTitle ||
                    !pageSlug ||
                    pageSections.length === 0
                  }
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    saving ||
                    !pageTitle ||
                    !pageSlug ||
                    pageSections.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
                  }`}
                >
                  {saving
                    ? "Saving..."
                    : pageId
                      ? "Update Page"
                      : "Create Page"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50 p-8">
            {previewMode ? (
              <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {renderPreview()}
              </div>
            ) : (
              <SortableContext
                items={pageSections.map((s) => s.pageOrderId)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableArea>
                  <div
                    className={`max-w-5xl mx-auto min-h-full ${
                      pageSections.length === 0
                        ? "border-3 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-white/50 backdrop-blur"
                        : canvasViewMode === "compact"
                          ? "space-y-3"
                          : "space-y-6"
                    }`}
                    style={{ minHeight: "calc(100vh - 200px)" }}
                  >
                    {pageSections.length === 0 ? (
                      <div className="text-center py-20 px-8">
                        <div className="text-7xl mb-6 opacity-20">🎨</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Start Building Your Page
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          Drag and drop sections from the sidebar to start
                          creating your page layout
                        </p>
                      </div>
                    ) : (
                      <>
                        {canvasViewMode === "compact" && (
                          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              Page Structure ({pageSections.length} sections)
                            </h3>
                          </div>
                        )}
                        {pageSections.map((section) => (
                          <SortableSection
                            key={section.pageOrderId}
                            section={section}
                            onRemove={handleRemoveSection}
                            viewMode={canvasViewMode}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </DroppableArea>
              </SortableContext>
            )}
          </div>
        </div>

        {!previewMode && combinedCSS && (
          <style dangerouslySetInnerHTML={{ __html: combinedCSS }} />
        )}
      </div>

      <DragOverlay>
        {activeId && activeDragItem && (
          <div className="bg-white border-2 border-blue-500 rounded-xl p-6 shadow-2xl max-w-sm">
            <div className="font-semibold text-gray-900">
              {activeDragItem.name}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {activeDragItem.component_key}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
