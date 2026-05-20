(function () {
  function normalizePath(pathname) {
    if (!pathname) {
      return "";
    }
    return pathname.split("/").pop().toLowerCase();
  }

  function setActiveLink(sidebarRoot) {
    var links = sidebarRoot.querySelectorAll("a[data-sidebar-link]");
    var current = normalizePath(window.location.pathname) || "index.html";

    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var linkPath = normalizePath(
        new URL(href, window.location.href).pathname,
      );
      if (linkPath === current) {
        link.classList.add("sidebar-active");
      } else {
        link.classList.remove("sidebar-active");
      }
    });

    // যেকোনো dropdown এ active link থাকলে সেটি open করা হবে
    // এতে Reports-এর যেকোনো sub-page খুললে dropdown automatically open থাকবে
    sidebarRoot
      .querySelectorAll("details.sidebar-dropdown")
      .forEach(function (dropdown) {
        var hasActive = dropdown.querySelector(".sidebar-active");
        if (hasActive) {
          dropdown.setAttribute("open", "");
        }
      });
  }

  function ensureOverlay() {
    var overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }
    overlay.addEventListener("click", function () {
      closeSidebar();
    });
  }

  function ensureToggle() {
    var toggle = document.querySelector(".sidebar-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "sidebar-toggle";
      toggle.setAttribute("aria-label", "Toggle sidebar");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<span class="material-symbols-outlined">menu</span>';
      document.body.appendChild(toggle);
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("sidebar-open");
      toggle.setAttribute(
        "aria-expanded",
        document.body.classList.contains("sidebar-open") ? "true" : "false",
      );
    });
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
    var toggle = document.querySelector(".sidebar-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  function applyLayoutClasses() {
    document.body.classList.add("sidebar-ready", "sidebar-shell");

    var mainElement = document.querySelector("main");
    if (!mainElement) {
      mainElement = Array.prototype.find.call(
        document.body.children,
        function (child) {
          return (
            child.id !== "sidebar-root" &&
            child.id !== "header-root" &&
            !child.classList.contains("sidebar-overlay") &&
            !child.classList.contains("sidebar-toggle") &&
            child.tagName !== "SCRIPT"
          );
        },
      );
    }

    if (mainElement) {
      mainElement.classList.add("app-main");
    }

    var offsetClasses = [
      "ml-[260px]",
      "md:ml-[260px]",
      "lg:ml-[260px]",
      "ml-sidebar-width",
      "md:ml-sidebar-width",
      "lg:ml-sidebar-width",
    ];
    offsetClasses.forEach(function (className) {
      document
        .querySelectorAll("." + className.replace(/[:\[\]]/g, "\\$&"))
        .forEach(function (el) {
          el.classList.remove(className);
        });
    });
  }

  function ensureSidebarRoot() {
    var sidebarRoot = document.getElementById("sidebar-root");
    if (!sidebarRoot) {
      sidebarRoot = document.createElement("div");
      sidebarRoot.id = "sidebar-root";
      document.body.insertBefore(sidebarRoot, document.body.firstChild);
    }
    return sidebarRoot;
  }

  function removeLegacySidebars() {
    var legacySelectors = [
      "nav.w-\\[260px\\].fixed",
      "aside.w-\\[260px\\].fixed",
      "nav[class*='w-[260px]'][class*='fixed']",
      "aside[class*='w-[260px]'][class*='fixed']",
    ];

    legacySelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        node.parentNode.removeChild(node);
      });
    });
  }

  function injectSidebar(sidebarRoot) {
    return fetch("./components/sidebar.html", { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Sidebar load failed");
        }
        return response.text();
      })
      .then(function (html) {
        sidebarRoot.innerHTML = html;
        setActiveLink(sidebarRoot);

        injectSidebarStyles();

        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      })
      .catch(function () {
        sidebarRoot.innerHTML = "";
      });
  }

  function injectHeader() {
    var headerRoot = document.getElementById("header-root");
    if (!headerRoot) return Promise.resolve();

    var main = document.querySelector("main");
    if (main && headerRoot.parentNode !== main) {
      main.insertBefore(headerRoot, main.firstChild);
    }

    return fetch("./components/header.html", { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("Header load failed");
        return response.text();
      })
      .then(function (html) {
        headerRoot.outerHTML = html;
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      })
      .catch(function (e) {
        console.error("Failed to load header", e);
      });
  }

  function injectSidebarStyles() {
    if (document.getElementById("sidebar-extra-styles")) return;

    var style = document.createElement("style");
    style.id = "sidebar-extra-styles";
    style.textContent = [
      /* Sidebar কে flex column করা */
      ".sidebar-component {",
      "  display: flex !important;",
      "  flex-direction: column !important;",
      "}",

      /* Nav flex-grow করবে */
      ".sidebar-nav {",
      "  flex: 1 1 auto !important;",
      "  overflow-y: auto !important;",
      "}",

      /* Footer সবার নিচে */
      ".sidebar-footer {",
      "  margin-top: auto;",
      "  padding: 10px 12px;",
      "  border-top: 1px solid rgba(0,0,0,0.08);",
      "  flex-shrink: 0;",
      "}",

      /* Logout বাটন */
      ".sidebar-logout {",
      "  width: 100%;",
      "  text-align: left;",
      "  background: none;",
      "  border: none;",
      "  cursor: pointer;",
      "  color: #ef4444 !important;",
      "  font-weight: 500;",
      "}",

      ".sidebar-logout:hover {",
      "  background-color: #fef2f2 !important;",
      "  color: #dc2626 !important;",
      "}",

      /* Sales section label - click করা যাবে না */
      ".sidebar-section-label {",
      "  cursor: default !important;",
      "  pointer-events: none;",
      "  font-weight: 600;",
      "  opacity: 1;",
      "}",

      /* Sales sub-links list */
      ".sidebar-sub-links {",
      "  list-style: none;",
      "  padding: 0;",
      "  margin: 0;",
      "}",

      /* ── Active link highlight ── */
      /* যেকোনো active link কে highlight করবে */
      "a[data-sidebar-link].sidebar-active {",
      "  background-color: rgba(59, 130, 246, 0.1) !important;",
      "  color: #2563eb !important;",
      "  font-weight: 600;",
      "}",

      /* Active link এর icon কেও highlight করবে */
      "a[data-sidebar-link].sidebar-active .sidebar-icon {",
      "  color: #2563eb !important;",
      "  stroke: #2563eb !important;",
      "}",

      /* Reports dropdown summary — active child থাকলে parent label highlight */
      "details.sidebar-dropdown:has(.sidebar-active) > summary {",
      "  color: #2563eb !important;",
      "  font-weight: 600;",
      "}",

      "details.sidebar-dropdown:has(.sidebar-active) > summary .sidebar-icon {",
      "  color: #2563eb !important;",
      "  stroke: #2563eb !important;",
      "}",

      /* Caret rotation when dropdown is open */
      "details.sidebar-dropdown[open] .sidebar-caret {",
      "  transform: rotate(180deg);",
      "  transition: transform 0.2s ease;",
      "}",

      ".sidebar-caret {",
      "  margin-left: auto;",
      "  transition: transform 0.2s ease;",
      "}",
    ].join("\n");

    document.head.appendChild(style);
  }

  function initSmoothScroll() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href^='#']");
      if (!link) {
        return;
      }
      var href = link.getAttribute("href");
      if (!href || href === "#") {
        return;
      }
      var target = document.getElementById(href.slice(1));
      if (!target) {
        return;
      }
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  function initModals() {
    document.addEventListener("click", function (event) {
      var openTrigger = event.target.closest("[data-modal-open]");
      if (openTrigger) {
        var modalId = openTrigger.getAttribute("data-modal-open");
        var modal = document.querySelector("[data-modal='" + modalId + "']");
        if (modal) {
          modal.classList.remove("hidden");
          modal.setAttribute("aria-hidden", "false");
        }
        return;
      }

      var modalOverlay = event.target.closest("[data-modal]");
      if (modalOverlay && event.target === modalOverlay) {
        modalOverlay.classList.add("hidden");
        modalOverlay.setAttribute("aria-hidden", "true");
        return;
      }

      var closeTrigger = event.target.closest("[data-modal-close]");
      if (closeTrigger) {
        var modalRoot = closeTrigger.closest("[data-modal]");
        if (modalRoot) {
          modalRoot.classList.add("hidden");
          modalRoot.setAttribute("aria-hidden", "true");
        }
        var message = closeTrigger.getAttribute("data-success-message");
        if (message) {
          window.alert(message);
        }
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }
      var openModal = document.querySelector("[data-modal]:not(.hidden)");
      if (openModal) {
        openModal.classList.add("hidden");
        openModal.setAttribute("aria-hidden", "true");
      }
    });
  }

  function initTabs() {
    document.querySelectorAll("[data-tab-button]").forEach(function (button) {
      if (button.dataset.tabEnhanced === "true") {
        return;
      }
      button.dataset.tabEnhanced = "true";
      button.addEventListener("click", function () {
        var tabName = button.getAttribute("data-tab");
        var container = button.closest("section") || document;
        container.querySelectorAll("[data-tab-button]").forEach(function (btn) {
          var active = btn.getAttribute("data-tab") === tabName;
          btn.classList.toggle("text-primary", active);
          btn.classList.toggle("border-primary", active);
          btn.classList.toggle("border-b-2", active);
          btn.classList.toggle("text-slate-500", !active);
        });
        container
          .querySelectorAll("[data-tab-panel]")
          .forEach(function (panel) {
            panel.classList.toggle(
              "hidden",
              panel.getAttribute("data-tab-panel") !== tabName,
            );
          });
      });
    });
  }

  function initFormValidation() {
    var errorClasses = ["border-rose-500", "ring-1", "ring-rose-500"];

    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var isValid = true;
        var fields = form.querySelectorAll("input, select, textarea");
        fields.forEach(function (field) {
          if (!field.hasAttribute("required")) {
            return;
          }
          var valid = field.checkValidity();
          field.setAttribute("aria-invalid", valid ? "false" : "true");
          errorClasses.forEach(function (cls) {
            field.classList.toggle(cls, !valid);
          });
          if (!valid) {
            isValid = false;
          }
        });

        if (!isValid) {
          event.preventDefault();
          window.alert("Please fill in the required fields.");
          return;
        }

        event.preventDefault();
        var message = form.getAttribute("data-success-message") || "Saved.";
        window.alert(message);
        form.reset();
      });

      form
        .querySelectorAll("input, select, textarea")
        .forEach(function (field) {
          field.addEventListener("input", function () {
            if (!field.hasAttribute("required")) {
              return;
            }
            var valid = field.checkValidity();
            field.setAttribute("aria-invalid", valid ? "false" : "true");
            errorClasses.forEach(function (cls) {
              field.classList.toggle(cls, !valid);
            });
          });
        });
    });
  }

  // =====================
  // Logout Handler
  // =====================
  window.handleLogout = function () {
    if (confirm("আপনি কি সত্যিই Logout করতে চান?")) {
      window.location.href = "./login.html";
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    removeLegacySidebars();
    var sidebarRoot = ensureSidebarRoot();
    applyLayoutClasses();
    ensureOverlay();
    ensureToggle();
    injectSidebar(sidebarRoot);
    injectHeader();
    initSmoothScroll();
    initModals();
    initTabs();
    initFormValidation();

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSidebar();
      }
    });
  });
})();
