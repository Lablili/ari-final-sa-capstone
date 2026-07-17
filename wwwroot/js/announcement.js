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
    var announcementPreview = document.getElementById("announcementPreview");
    var announcementLog = document.getElementById("announcementLog");
    var announcementCount = document.getElementById("announcementCount");
    var currentDateDisplay = document.getElementById("currentDateDisplay");
    
    var clearFormBtn = document.getElementById("clearFormBtn");
    var logFilterTabs = document.getElementById("logFilterTabs");
    // Template Messages
    var templates = {
        "ordinance": "Bantay Dagat Notice: Please follow municipal fishing ordinances within Bantayan waters and the 15 km coastal operating area.",
        "no-fishing": "Bantay Dagat Notice: Entry into the identified no-fishing zone is prohibited until further notice from Bantay Dagat staff.",
        "patrol": "Bantay Dagat Notice: Coastal patrol operations are active. Please keep fishing permits and boat identification ready for verification.",
        "custom": ""
    };
    var templateLabels = {
        "ordinance": "Ordinance Reminder",
        "no-fishing": "No-Fishing Zone Notice",
        "patrol": "Patrol Advisory",
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
        // If template changes, clear manual message or reload preview
        updatePreview();
    }
    // Render counts for tabs
    function updateTabCounts(items) {
        var counts = {
            all: 0,
            ordinance: 0,
            "no-fishing": 0,
            patrol: 0,
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
                else if (item.template === "patrol") counts.patrol += 1;
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
    }
    // Render database log items
    function renderAnnouncements() {
        var items = readAnnouncements();
        // Sort: newest first
        items.sort(function (a, b) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        updateTabCounts(items);
        // Filter list based on current selection
        var filteredItems = items.filter(function (item) {
            if (currentFilter === "archived") {
                return item.archived === true;
            }
            // Active tabs should not show archived items
            if (item.archived === true) {
                return false;
            }
            if (currentFilter === "all") {
                return true;
            }
            if (currentFilter === "other") {
                return item.template === "custom" || !["ordinance", "no-fishing", "patrol"].includes(item.template);
            }
            return item.template === currentFilter;
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
        if (filteredItems.length === 0) {
            var colOrdinance = document.getElementById('col-ordinance');
            var colNoFishing = document.getElementById('col-no-fishing');
            var colOther = document.getElementById('col-other');
            var empty = '<div class="empty-log-state"><p>No announcements found for this filter.</p></div>';
            if (colOrdinance) colOrdinance.innerHTML = empty;
            if (colNoFishing) colNoFishing.innerHTML = '';
            if (colOther) colOther.innerHTML = '';
            return;
        }
        // Build columns
        var colOrdinance = document.getElementById('col-ordinance');
        var colNoFishing = document.getElementById('col-no-fishing');
        var colOther = document.getElementById('col-other');
        function renderCard(item) {
            var templateName = templateLabels[item.template] || "Custom Announcement";
            var rawTitle = String(item.message || item.details || templateName).split('.').filter(Boolean)[0] || String(item.message || item.details || templateName);
            var titleText = rawTitle.trim();
            if (titleText.length > 60) titleText = titleText.slice(0, 57) + '...';
            var recipientText = recipientLabels[item.recipientGroup] || item.recipientGroup;
            var relativeTime = getRelativeTime(item.createdAt);
            var isProcessing = item.status === "Processing";
            var statusClass = isProcessing ? "processing" : "delivered";
            var statusText = isProcessing ? "Processing" : "Delivered";
            var archiveBtnText = item.archived ? "Restore" : "Archive";
            return [
                '<article class="log-card" data-id="' + item.id + '">',
                '  <div class="log-card-header">',
                '    <div class="log-card-title-group">',
                '      <h4 class="log-card-title">' + escapeHtml(titleText) + '</h4>',
                '    </div>',
                '    <span class="log-card-status ' + statusClass + '">' + statusText + '</span>',
                '  </div>',
                '  <div class="log-card-body">',
                '    <div class="log-detail-row">',
                '      <span class="log-detail-label">Recipients:</span>',
                '      <span class="log-detail-value">' + escapeHtml(recipientText) + '</span>',
                '    </div>',
                '    <div class="log-message-box-wrapper">',
                '      <div class="log-message-box-header">',
                '        <span class="log-detail-label">SMS Message:</span>',
                '        <button class="btn-copy-small js-copy-btn" data-text="' + escapeHtml(item.message) + '">Copy message</button>',
                '      </div>',
                '      <div class="log-message-box">' + escapeHtml(item.message) + '</div>',
                '    </div>',
                '  </div>',
                '  <div class="log-card-footer">',
                '    <div class="log-meta-text">',
                '      GSM Delivery: ' + escapeHtml(String(item.deliveredCount)) + ' recipients processed &bull; ' + relativeTime,
                '    </div>',
                '    <div class="log-card-actions">',
                '      <button class="btn-text-action js-archive-btn"><span>' + archiveBtnText + '</span></button>',
                '      <button class="btn-text-action delete-action js-delete-btn"><span>Delete</span></button>',
                '    </div>',
                '  </div>',
                '</article>'
            ].join("\n");
        }

        // Fill columns
        colOrdinance.innerHTML = filteredItems.filter(function (it) { return it.template === 'ordinance'; }).map(renderCard).join('\n');
        colNoFishing.innerHTML = filteredItems.filter(function (it) { return it.template === 'no-fishing'; }).map(renderCard).join('\n');
        colOther.innerHTML = filteredItems.filter(function (it) { return !(['ordinance','no-fishing'].includes(it.template)); }).map(renderCard).join('\n');

        // Update column counts
        var elCountOrd = document.getElementById('col-count-ordinance'); if (elCountOrd) elCountOrd.textContent = colOrdinance.querySelectorAll('.log-card').length;
        var elCountNo = document.getElementById('col-count-no-fishing'); if (elCountNo) elCountNo.textContent = colNoFishing.querySelectorAll('.log-card').length;
        var elCountOther = document.getElementById('col-count-other'); if (elCountOther) elCountOther.textContent = colOther.querySelectorAll('.log-card').length;

        // Wire event listeners on rendered buttons (global)
        var copyButtons = document.querySelectorAll(".js-copy-btn");
        copyButtons.forEach(function (btn) {
            btn.removeEventListener('click', btn._copHandler);
            var handler = function () {
                var text = this.getAttribute("data-text");
                navigator.clipboard.writeText(text).then(function () {
                    var original = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.style.backgroundColor = "#dcfce7";
                    btn.style.borderColor = "#86efac";
                    btn.style.color = "#15803d";
                    setTimeout(function () {
                        btn.textContent = original;
                        btn.style.backgroundColor = "";
                        btn.style.borderColor = "";
                        btn.style.color = "";
                    }, 1200);
                });
            };
            btn._copHandler = handler;
            btn.addEventListener('click', handler);
        });

        var archiveButtons = document.querySelectorAll(".js-archive-btn");
        archiveButtons.forEach(function (btn) {
            btn.removeEventListener('click', btn._archHandler);
            var handler = function () {
                var card = btn.closest('.log-card');
                var id = card.getAttribute('data-id');
                var items = readAnnouncements();
                items = items.map(function (item) { if (item.id === id) item.archived = !item.archived; return item; });
                saveAnnouncements(items);
                renderAnnouncements();
            };
            btn._archHandler = handler;
            btn.addEventListener('click', handler);
        });

        var deleteButtons = document.querySelectorAll('.js-delete-btn');
        deleteButtons.forEach(function (btn) {
            btn.removeEventListener('click', btn._delHandler);
            var handler = function () {
                var card = btn.closest('.log-card');
                var id = card.getAttribute('data-id');
                if (confirm('Are you sure you want to permanently delete this announcement log?')) {
                    var items = readAnnouncements().filter(function (item) { return item.id !== id; });
                    saveAnnouncements(items);
                    renderAnnouncements();
                }
            };
            btn._delHandler = handler;
            btn.addEventListener('click', handler);
        });

        // Card click opens modal with details (ignore clicks on buttons)
        var cards = document.querySelectorAll('.log-card');
        cards.forEach(function (card) {
            card.removeEventListener('click', card._cardHandler);
            var handler = function (e) {
                var ignore = e.target.closest('.btn-text-action') || e.target.closest('.btn-copy-small') || e.target.closest('.js-delete-btn') || e.target.closest('.js-archive-btn');
                if (ignore) return;
                var id = card.getAttribute('data-id');
                openAnnouncementModal(id);
            };
            card._cardHandler = handler;
            card.addEventListener('click', handler);
        });
    }

    // Modal elements
    var annModal = document.getElementById('annModal');
    var annModalClose = document.getElementById('annModalClose');
    var modalTitle = document.getElementById('modalTitle');
    var modalRecipients = document.getElementById('modalRecipients');
    var modalStatus = document.getElementById('modalStatus');
    var modalTime = document.getElementById('modalTime');
    var modalMessage = document.getElementById('modalMessage');
    var modalArchiveBtn = document.getElementById('modalArchiveBtn');
    var modalDeleteBtn = document.getElementById('modalDeleteBtn');

    function openAnnouncementModal(id) {
        var items = readAnnouncements();
        var item = items.find(function (it) { return it.id === id; });
        if (!item) return;
        // If modal markup was removed, fall back to a simple alert with details
        if (!annModal) {
            var textParts = [];
            textParts.push((item.details && item.details.length > 0) ? item.details : (item.referenceNo || 'Announcement'));
            textParts.push('\nRecipients: ' + (recipientLabels[item.recipientGroup] || item.recipientGroup));
            textParts.push('\nStatus: ' + (item.status || ''));
            textParts.push('\nSent: ' + new Date(item.createdAt).toLocaleString());
            textParts.push('\n\n' + (item.message || ''));
            alert(textParts.join(''));
            return;
        }
        modalTitle.textContent = (item.details && item.details.length > 0) ? item.details : (item.referenceNo || 'Announcement');
        modalRecipients.textContent = recipientLabels[item.recipientGroup] || item.recipientGroup;
        modalStatus.textContent = item.status || '';
        modalTime.textContent = new Date(item.createdAt).toLocaleString();
        modalMessage.textContent = item.message || '';
        modalArchiveBtn.textContent = item.archived ? 'Restore' : 'Archive';
        modalArchiveBtn.onclick = function () {
            var all = readAnnouncements().map(function (itm) { if (itm.id === id) itm.archived = !itm.archived; return itm; });
            saveAnnouncements(all);
            closeModal();
            renderAnnouncements();
        };
        modalDeleteBtn.onclick = function () {
            if (!confirm('Permanently delete this announcement?')) return;
            var remaining = readAnnouncements().filter(function (itm) { return itm.id !== id; });
            saveAnnouncements(remaining);
            closeModal();
            renderAnnouncements();
        };
        annModal.classList.remove('hidden');
    }

    function closeModal() {
        if (annModal) annModal.classList.add('hidden');
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
        if (e.key === 'Escape' && annModal && !annModal.classList.contains('hidden')) closeModal();
    });
    // Reset compose inputs
    clearFormBtn.addEventListener("click", function () {
        announcementForm.reset();
        updatePreview();
    });
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
