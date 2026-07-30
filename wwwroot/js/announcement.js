(function () {
    var ANNOUNCEMENT_STORAGE_KEY = "bantay-dagat-announcements";
    var PASSWORD = "bantay";
    var STORAGE_KEY = "bantay-dagat-authenticated";

    // Containers
    var loginScreen = document.getElementById("loginScreen");
    var dashboardShell = document.getElementById("dashboardShell");

    // Forms & Authentication
    var loginForm = document.getElementById("loginForm");
    var passwordInput = document.getElementById("password");
    var loginError = document.getElementById("loginError");
    var logoutButton = document.getElementById("logoutButton");

    // DOM Elements
    var announcementForm = document.getElementById("announcementForm");
    var announcementTemplate = document.getElementById("announcementTemplate");
    var recipientGroup = document.getElementById("recipientGroup");
    var announcementLocation = document.getElementById("announcementLocation");
    var announcementEffectiveDate = document.getElementById("announcementEffectiveDate");
    var announcementOfficer = document.getElementById("announcementOfficer");
    var announcementPenalty = document.getElementById("announcementPenalty");
    var announcementReference = document.getElementById("announcementReference");
    var announcementDetails = document.getElementById("announcementDetails");
    var officerWrapper = document.getElementById("officerWrapper");
    var penaltyWrapper = document.getElementById("penaltyWrapper");
    var referenceWrapper = document.getElementById("referenceWrapper");
    var announcementPreview = document.getElementById("announcementPreview");
    var announcementLog = document.getElementById("announcementLog");
    var announcementCount = document.getElementById("announcementCount");
    var currentDateDisplay = document.getElementById("currentDateDisplay");
    
    var tabCompose = document.getElementById("tabCompose");
    var tabHistory = document.getElementById("tabHistory");
    var historyTabCount = document.getElementById("historyTabCount");
    var composeSection = document.getElementById("composeSection");
    var historySection = document.getElementById("historySection");

    var clearFormBtn = document.getElementById("clearFormBtn");
    var logFilterTabs = document.getElementById("logFilterTabs");
    var searchInput = document.getElementById("announcementSearch");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            renderAnnouncements();
        });
    }
    // Template Messages
    var templates = {
        "ordinance": "Bantay Dagat Notice: Please follow municipal fishing ordinances within Bantayan waters and the 15 km coastal operating area.",
        "no-fishing": "Bantay Dagat Notice: Entry into the identified no-fishing zone is prohibited until further notice from Bantay Dagat staff.",
        "seasonal": "Bantay Dagat Notice: Seasonal restrictions are now in effect. Please observe the seasonal guidelines for fishing.",
        "general": "Bantay Dagat Notice: An event/meeting is scheduled. Please see details for more information.",
        "custom": ""
    };
    var templateLabels = {
        "ordinance": "Ordinance/Resolution",
        "no-fishing": "No Fishing Zone Notice",
        "seasonal": "Seasonal Notice",
        "general": "General Events (Meeting, IEC, Workshops, Training)",
        "custom": "Custom Announcement"
    };
    var recipientLabels = {
        "all": "All registered fisherfolk (1,248)",
        "north": "Barangay Sulangan (312)",
        "south": "Barangay Patao (284)",
        "licensed": "Barangay Guiwanon (652)"
    };
    // Default seed announcements
    var seedAnnouncements = [
        {
            id: "ann-001",
            template: "ordinance",
            recipientGroup: "all",
            location: "Bantayan municipal waters",
            effectiveDate: "May 4, 2026",
            officer: "Officer Juan Dela Cruz",
            penalty: "Fines & warning",
            referenceNo: "Ordinance No. 2024-07",
            details: "Observe only legal fishing methods and avoid restricted areas.",
            message: "Bantay Dagat Notice: Please follow municipal fishing ordinances within Bantayan waters and the 15 km coastal operating area. Ref: Ordinance No. 2024-07. Area: Bantayan municipal waters. Effective: May 4, 2026. Penalty: Fines & warning. Issued by: Officer Juan Dela Cruz. Details: Observe only legal fishing methods and avoid restricted areas.",
            status: "Delivered",
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
            deliveredCount: 1248,
            archived: false
        },
        {
            id: "ann-002",
            template: "no-fishing",
            recipientGroup: "north",
            location: "Barangay Kabac shoreline",
            effectiveDate: "Until further notice",
            officer: "Officer Elpidio Reyes",
            penalty: "Confiscation of fishing gear",
            referenceNo: "Notice No. 2026-05",
            details: "Restricted zone remains active near the protected coastal section.",
            message: "Bantay Dagat Notice: Entry into the identified no-fishing zone is prohibited until further notice from Bantay Dagat staff. Ref: Notice No. 2026-05. Area: Barangay Kabac shoreline. Effective: Until further notice. Penalty: Confiscation of fishing gear. Issued by: Officer Elpidio Reyes. Details: Restricted zone remains active near the protected coastal section.",
            status: "Delivered",
            createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), // 5 hours ago
            deliveredCount: 312,
            archived: false
        }
    ];
    // Current filter state
    var currentFilter = "all";
    // Set header date display
    function setHeaderDate() {
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var today = new Date();
        if (currentDateDisplay) {
            currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);
        }
    }
    // Read local database
    function readAnnouncements() {
        var stored = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(seedAnnouncements));
            return seedAnnouncements.slice();
        }
        try {
            return JSON.parse(stored) || [];
        } catch (error) {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(seedAnnouncements));
            return seedAnnouncements.slice();
        }
    }
    // Save to local database
    function saveAnnouncements(items) {
        localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(items));
    }
    // Escape HTML utilities
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    // Calculate relative time
    function getRelativeTime(dateString) {
        var seconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
        if (seconds >= 86400) {
            var days = Math.floor(seconds / 86400);
            return days + (days === 1 ? " day ago" : " days ago");
        }
        if (seconds >= 3600) {
            var hours = Math.floor(seconds / 3600);
            return hours + (hours === 1 ? " hour ago" : " hours ago");
        }
        if (seconds >= 60) {
            var minutes = Math.floor(seconds / 60);
            return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
        }
        return "Just now";
    }
    // Build the dynamic preview SMS
    function buildMessage() {
        var baseTemplate = templates[announcementTemplate.value] || "";
        var finalMessage = baseTemplate;
        var referenceNo = announcementReference.value.trim();
        var locationText = announcementLocation.value.trim();
        var effectiveDate = announcementEffectiveDate.value.trim();
        var penaltyText = announcementPenalty.value.trim();
        var officerName = announcementOfficer.value.trim();
        var detailsText = announcementDetails.value.trim();
        if (referenceNo) {
            finalMessage += " Ref: " + referenceNo + ".";
        }
        if (locationText) {
            finalMessage += " Area: " + locationText + ".";
        }
        if (effectiveDate) {
            finalMessage += " Effective: " + effectiveDate + ".";
        }
        if (penaltyText) {
            finalMessage += " Penalty: " + penaltyText + ".";
        }
        if (officerName) {
            finalMessage += " Issued by: " + officerName + ".";
        }
        if (detailsText) {
            finalMessage += " Details: " + detailsText;
        }
        return finalMessage.trim() || "Compose an announcement to preview the outgoing SMS.";
    }
    function updatePreview() {
        if (announcementPreview) {
            announcementPreview.textContent = buildMessage();
        }
    }
    // Reset categories inputs
    function applyTemplate() {
        if (announcementTemplate.value === "meeting") {
            if (officerWrapper) officerWrapper.style.display = "none";
            if (penaltyWrapper) penaltyWrapper.style.display = "none";
            if (referenceWrapper) referenceWrapper.style.display = "none";
        } else {
            if (officerWrapper) officerWrapper.style.display = "";
            if (penaltyWrapper) penaltyWrapper.style.display = "";
            if (referenceWrapper) referenceWrapper.style.display = "";
        }
        // If template changes, clear manual message or reload preview
        updatePreview();
    }
    // Render counts for tabs
    function updateTabCounts(items) {
        var counts = {
            all: 0,
            ordinance: 0,
            "no-fishing": 0,
            seasonal: 0,
            general: 0,
            other: 0,
            archived: 0
        };
        items.forEach(function (item) {
            if (item.archived) {
                counts.archived += 1;
            } else {
                counts.all += 1;
                if (item.template === "ordinance") counts.ordinance += 1;
                else if (item.template === "no-fishing") counts["no-fishing"] += 1;
                else if (item.template === "seasonal") counts.seasonal += 1;
                else if (item.template === "general") counts.general += 1;
                else counts.other += 1;
            }
        });
        // Set text content for badges
        Object.keys(counts).forEach(function (key) {
            var badge = document.getElementById("count-" + key);
            if (badge) {
                badge.textContent = counts[key];
            }
        });
        
        if (historyTabCount) {
            historyTabCount.textContent = counts.all + counts.archived;
        }
    }
    // Render database log items
    function renderAnnouncements() {
        var items = readAnnouncements();
        // Sort: newest first
        items.sort(function (a, b) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        updateTabCounts(items);
        var searchQuery = searchInput ? searchInput.value.toLowerCase() : "";

        // Filter list based on current selection
        var filteredItems = items.filter(function (item) {
            if (currentFilter === "archived") {
                if (item.archived !== true) return false;
            } else {
                if (item.archived === true) return false;
                if (currentFilter !== "all") {
                    if (currentFilter === "other") {
                        if (["ordinance", "no-fishing", "seasonal", "general"].includes(item.template)) return false;
                    } else if (item.template !== currentFilter) {
                        return false;
                    }
                }
            }

            if (searchQuery) {
                var rawTitle = String(item.message || item.details || templateLabels[item.template] || "Custom").toLowerCase();
                if (rawTitle.indexOf(searchQuery) === -1) return false;
            }
            return true;
        });
        // Sent Today counter
        var today = new Date();
        var sentToday = items.filter(function (item) {
            var itemDate = new Date(item.createdAt);
            return (
                !item.archived &&
                itemDate.getFullYear() === today.getFullYear() &&
                itemDate.getMonth() === today.getMonth() &&
                itemDate.getDate() === today.getDate()
            );
        }).length;
        announcementCount.textContent = sentToday + (sentToday === 1 ? " SENT TODAY" : " SENT TODAY");
        var tbody = document.getElementById('announcementTableBody');
        if (!tbody) return;

        if (filteredItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="padding: 16px; text-align: center; color: #6b7280;">No announcements found for this filter.</td></tr>';
            return;
        }

        var rowsHtml = filteredItems.map(function (item, index) {
            var templateName = templateLabels[item.template] || "Custom Announcement";
            var rawTitle = String(item.message || item.details || templateName).split('.').filter(Boolean)[0] || String(item.message || item.details || templateName);
            var titleText = rawTitle.trim();
            if (titleText.length > 40) titleText = titleText.slice(0, 37) + '...';
            
            var recipientText = recipientLabels[item.recipientGroup] || item.recipientGroup;
            var dateObj = new Date(item.createdAt);
            var dateSent = (dateObj.getMonth()+1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear().toString().slice(-2);
            
            var isProcessing = item.status === "Processing";
            var statusColor = isProcessing ? "#d97706" : "#059669";
            var statusBg = isProcessing ? "#fef3c7" : "#d1fae5";
            var statusText = isProcessing ? "PENDING" : "DELIVERED";

            return [
                '<tr style="border-bottom: 1px solid #e5e7eb; transition: background 0.15s ease;" onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'none\'" data-id="' + item.id + '">',
                '  <td style="padding: 12px 16px; font-size: 0.9rem; color: #374151;">' + dateSent + '</td>',
                '  <td style="padding: 12px 16px; font-size: 0.9rem; color: #374151;">' + escapeHtml(templateName) + '</td>',
                '  <td style="padding: 12px 16px; font-size: 0.9rem; color: #374151;">' + escapeHtml(recipientText) + '</td>',
                '  <td style="padding: 12px 16px; font-size: 0.9rem; color: #374151;">' + escapeHtml(titleText) + '</td>',
                '  <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600;"><span style="background: ' + statusBg + '; color: ' + statusColor + '; padding: 2px 8px; border-radius: 9999px;">' + statusText + '</span></td>',
                '  <td style="padding: 12px 16px;">',
                '    <button class="btn-text-action js-view-btn" style="color: #2563eb; font-weight: 500; font-size: 0.9rem; border: none; background: none; cursor: pointer;">[View]</button>',
                '  </td>',
                '</tr>'
            ].join("");
        });
        tbody.innerHTML = rowsHtml.join("\n");

        var viewButtons = document.querySelectorAll('.js-view-btn');
        viewButtons.forEach(function (btn) {
            btn.removeEventListener('click', btn._viewHandler);
            var handler = function () {
                var row = btn.closest('tr');
                var id = row.getAttribute('data-id');
                openAnnouncementModal(id);
            };
            btn._viewHandler = handler;
            btn.addEventListener('click', handler);
        });
    }

    // Modal elements
    var modalIdLabel = document.getElementById('modalIdLabel');
    var modalCategory = document.getElementById('modalCategory');
    var modalRecipients = document.getElementById('modalRecipients');
    var modalLocation = document.getElementById('modalLocation');
    var modalEffective = document.getElementById('modalEffective');
    var modalOfficer = document.getElementById('modalOfficer');
    var modalPenalty = document.getElementById('modalPenalty');
    var modalReference = document.getElementById('modalReference');
    var modalDetails = document.getElementById('modalDetails');
    var modalProcessed = document.getElementById('modalProcessed');
    var modalResendBtn = document.getElementById('modalResendBtn');
    
    var modalOfficerRow = document.getElementById('modalOfficerRow');
    var modalPenaltyRow = document.getElementById('modalPenaltyRow');
    var modalReferenceRow = document.getElementById('modalReferenceRow');
    
    var modalStatus = document.getElementById('modalStatus');
    var modalTime = document.getElementById('modalTime');
    var modalArchiveBtn = document.getElementById('modalArchiveBtn');
    var modalDeleteBtn = document.getElementById('modalDeleteBtn');

    function openAnnouncementModal(id) {
        var items = readAnnouncements();
        var item = items.find(function (it) { return it.id === id; });
        if (!item || !annModal) return;
        
        var templateName = templateLabels[item.template] || "Custom Announcement";
        
        if (modalIdLabel) modalIdLabel.textContent = "ANNOUNCEMENT " + (id.split('-')[1] || id);
        if (modalStatus) {
            modalStatus.textContent = item.status === "Processing" ? "PENDING" : "DELIVERED";
            modalStatus.style.color = item.status === "Processing" ? "#d97706" : "#059669";
        }
        if (modalTime) modalTime.textContent = getRelativeTime(item.createdAt);
        
        if (modalCategory) modalCategory.textContent = templateName;
        if (modalRecipients) modalRecipients.textContent = recipientLabels[item.recipientGroup] || item.recipientGroup;
        if (modalLocation) modalLocation.textContent = item.location || "N/A";
        if (modalEffective) modalEffective.textContent = item.effectiveDate || "N/A";
        if (modalOfficer) modalOfficer.textContent = item.officer || "N/A";
        if (modalPenalty) modalPenalty.textContent = item.penalty || "N/A";
        if (modalReference) modalReference.textContent = item.referenceNo || "N/A";
        if (modalDetails) modalDetails.textContent = item.details || item.message || "N/A";
        if (modalProcessed) modalProcessed.textContent = (item.deliveredCount || 0).toLocaleString();

        if (item.template === 'meeting') {
            if (modalOfficerRow) modalOfficerRow.style.display = 'none';
            if (modalPenaltyRow) modalPenaltyRow.style.display = 'none';
            if (modalReferenceRow) modalReferenceRow.style.display = 'none';
        } else {
            if (modalOfficerRow) modalOfficerRow.style.display = 'flex';
            if (modalPenaltyRow) modalPenaltyRow.style.display = 'flex';
            if (modalReferenceRow) modalReferenceRow.style.display = 'flex';
        }

        if (modalArchiveBtn) {
            modalArchiveBtn.textContent = item.archived ? 'Restore' : 'Archive';
            modalArchiveBtn.onclick = function () {
                var all = readAnnouncements().map(function (itm) { if (itm.id === id) itm.archived = !itm.archived; return itm; });
                saveAnnouncements(all);
                closeModal();
                renderAnnouncements();
            };
        }
        
        if (modalDeleteBtn) {
            modalDeleteBtn.onclick = function () {
                if (!confirm('Permanently delete this announcement?')) return;
                var remaining = readAnnouncements().filter(function (itm) { return itm.id !== id; });
                saveAnnouncements(remaining);
                closeModal();
                renderAnnouncements();
            };
        }

        if (modalResendBtn) {
            modalResendBtn.onclick = function () {
                closeModal();
                // Switch to compose tab
                if (tabCompose) tabCompose.click();
                
                // Populate fields
                if (announcementTemplate) announcementTemplate.value = item.template;
                if (recipientGroup) recipientGroup.value = item.recipientGroup;
                if (announcementLocation) announcementLocation.value = item.location || "";
                if (announcementEffectiveDate) announcementEffectiveDate.value = item.effectiveDate || "";
                if (announcementOfficer) announcementOfficer.value = item.officer || "";
                if (announcementPenalty) announcementPenalty.value = item.penalty || "";
                if (announcementReference) announcementReference.value = item.referenceNo || "";
                if (announcementDetails) announcementDetails.value = item.details || "";
                
                applyTemplate();
            };
        }

        annModal.style.display = 'flex';
    }

    function closeModal() {
        if (annModal) annModal.style.display = 'none';
    }

    if (annModalClose) {
        annModalClose.addEventListener('click', closeModal);
    }
    if (annModal) {
        annModal.addEventListener('click', function (e) {
            if (e.target === annModal) closeModal();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && annModal && annModal.style.display === 'flex') closeModal();
    });
    // Reset compose inputs
    clearFormBtn.addEventListener("click", function () {
        announcementForm.reset();
        updatePreview();
    });

    // Tab switching logic
    if (tabCompose && tabHistory && composeSection && historySection) {
        tabCompose.addEventListener("click", function () {
            tabCompose.classList.add("active");
            tabHistory.classList.remove("active");
            
            tabCompose.style.color = "#1d4ed8";
            tabCompose.style.borderBottomColor = "#3b82f6";
            tabHistory.style.color = "#6b7280";
            tabHistory.style.borderBottomColor = "transparent";
            
            composeSection.style.display = "block";
            historySection.style.display = "none";
        });
        
        tabHistory.addEventListener("click", function () {
            tabHistory.classList.add("active");
            tabCompose.classList.remove("active");
            
            tabHistory.style.color = "#1d4ed8";
            tabHistory.style.borderBottomColor = "#3b82f6";
            tabCompose.style.color = "#6b7280";
            tabCompose.style.borderBottomColor = "transparent";
            
            historySection.style.display = "block";
            composeSection.style.display = "none";
        });
    }

    // Filter logs tabs trigger
    logFilterTabs.addEventListener("click", function (event) {
        var btn = event.target.closest("button");
        if (!btn) return;
        logFilterTabs.querySelectorAll("button").forEach(function (el) {
            el.classList.remove("active");
        });
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        renderAnnouncements();
    });
    // Form inputs triggers
    announcementTemplate.addEventListener("change", applyTemplate);
    announcementLocation.addEventListener("input", updatePreview);
    announcementEffectiveDate.addEventListener("input", updatePreview);
    announcementOfficer.addEventListener("input", updatePreview);
    announcementPenalty.addEventListener("input", updatePreview);
    announcementReference.addEventListener("input", updatePreview);
    announcementDetails.addEventListener("input", updatePreview);
    
    // Form submit
    announcementForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var finalMessage = buildMessage();
        var items = readAnnouncements();
        var selectedGroup = recipientGroup.value;
        // Recipient count resolver
        var recipientCount = 1248;
        if (selectedGroup === "north") recipientCount = 312;
        else if (selectedGroup === "south") recipientCount = 284;
        else if (selectedGroup === "licensed") recipientCount = 652;
        var newItem = {
            id: "ann-" + Date.now(),
            template: announcementTemplate.value,
            recipientGroup: selectedGroup,
            location: announcementLocation.value.trim(),
            effectiveDate: announcementEffectiveDate.value.trim(),
            officer: announcementOfficer.value.trim(),
            penalty: announcementPenalty.value.trim(),
            referenceNo: announcementReference.value.trim(),
            details: announcementDetails.value.trim(),
            message: finalMessage,
            status: "Processing",
            createdAt: new Date().toISOString(),
            deliveredCount: recipientCount,
            archived: false
        };
        items.push(newItem);
        saveAnnouncements(items);
        renderAnnouncements();
        // Clear input form fields
        announcementLocation.value = "";
        announcementEffectiveDate.value = "";
        announcementOfficer.value = "";
        announcementPenalty.value = "";
        announcementReference.value = "";
        announcementDetails.value = "";
        
        updatePreview();
        // Transition processing to delivered simulation
        setTimeout(function () {
            var currentItems = readAnnouncements().map(function (itm) {
                if (itm.id === newItem.id) {
                    itm.status = "Delivered";
                }
                return itm;
            });
            saveAnnouncements(currentItems);
            renderAnnouncements();
            // Automatically switch to history tab to see the new announcement
            if (tabHistory) {
                tabHistory.click();
            }
        }, 1400);
    });
    // Print functionality
    document.getElementById("printLogBtn").addEventListener("click", function () {
        window.print();
    });
    // Export CSV functionality
    document.getElementById("exportLogBtn").addEventListener("click", function () {
        var items = readAnnouncements();
        if (items.length === 0) {
            alert("No records to export.");
            return;
        }
        var csvRows = [];
        csvRows.push("ID,Template,RecipientGroup,Location,EffectiveDate,Officer,Penalty,ReferenceNo,Message,Status,DeliveredCount,CreatedAt,Archived");
        items.forEach(function (itm) {
            var row = [
                itm.id,
                itm.template,
                itm.recipientGroup,
                '"' + String(itm.location || "").replace(/"/g, '""') + '"',
                '"' + String(itm.effectiveDate || "").replace(/"/g, '""') + '"',
                '"' + String(itm.officer || "").replace(/"/g, '""') + '"',
                '"' + String(itm.penalty || "").replace(/"/g, '""') + '"',
                '"' + String(itm.referenceNo || "").replace(/"/g, '""') + '"',
                '"' + String(itm.message || "").replace(/"/g, '""') + '"',
                itm.status,
                itm.deliveredCount,
                itm.createdAt,
                itm.archived
            ];
            csvRows.push(row.join(","));
        });
        var csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bantay_dagat_announcements_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    // Authentication View routing (defensive)
    function showDashboard() {
        if (loginScreen) loginScreen.classList.add("hidden");
        if (dashboardShell) dashboardShell.classList.remove("hidden");
        if (loginError) loginError.textContent = "";
        setHeaderDate();
        renderAnnouncements();
        updatePreview();
    }
    function showLogin() {
        if (dashboardShell) dashboardShell.classList.add("hidden");
        if (loginScreen) loginScreen.classList.remove("hidden");
        if (passwordInput) passwordInput.value = "";
        if (loginError) loginError.textContent = "";
        if (passwordInput) passwordInput.focus();
    }

    var authEnabled = true;
    if (!loginForm || !loginScreen || !passwordInput || !loginError) {
        authEnabled = false;
        if (dashboardShell) dashboardShell.classList.remove("hidden");
        setHeaderDate();
        renderAnnouncements();
        updatePreview();
    }

    if (authEnabled) {
        // Event Listeners setup
        if (localStorage.getItem(STORAGE_KEY) === "true") {
            showDashboard();
        } else {
            showLogin();
        }

        if (loginForm) {
            loginForm.addEventListener("submit", function (event) {
                event.preventDefault();
                if (passwordInput.value === PASSWORD) {
                    localStorage.setItem(STORAGE_KEY, "true");
                    showDashboard();
                    return;
                }
                loginError.textContent = "Incorrect password. Please try again.";
                passwordInput.select();
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                localStorage.removeItem(STORAGE_KEY);
                showLogin();
            });
        }
    }
    // Auto-update relative timestamps every 30 seconds
    setInterval(function () {
        if (localStorage.getItem(STORAGE_KEY) === "true") {
            renderAnnouncements();
        }
    }, 30000);
})();
