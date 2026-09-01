(function () {
    var ANNOUNCEMENT_STORAGE_KEY = "bantay-dagat-announcements";
    var PASSWORD = "bantay";
    var STORAGE_KEY = "bantay-dagat-authenticated";

    // SignalR Connection
    var connection = new signalR.HubConnectionBuilder()
        .withUrl("/smsprogress")
        .build();

    connection.on("ReceiveProgress", function (data) {
        var progressDiv = document.getElementById("liveProgress-" + data.announcementId);
        if (progressDiv) {
            progressDiv.innerHTML = `
                <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:16px; border-radius:8px; margin-top:20px;">
                    <h4 style="margin:0 0 8px 0; color:#1e40af;">Live Send Progress</h4>
                    <p style="margin:0 0 4px 0; font-weight:bold;">Progress: ${data.delivered + data.failed}/${data.total} (${data.percent}%)</p>
                    <p style="margin:0; font-size:0.9rem; color:#4b5563;">Delivered: <span style="color:#059669">${data.delivered}</span> | Sending: <span style="color:#2563eb">${data.sending}</span> | Pending: <span style="color:#d97706">${data.pending}</span> | Failed: <span style="color:#dc2626">${data.failed}</span></p>
                </div>
            `;
        }

        // Fix: Update local browser memory so the table says DELIVERED!
        if (data.percent === 100) {
            var items = readAnnouncements();
            var index = items.findIndex(i => i.id === "ann-" + data.announcementId);
            if (index !== -1 && items[index].status !== "Delivered") {
                items[index].status = "Delivered";
                saveAnnouncements(items);
                renderAnnouncements();
            }
        }
    });

    connection.start().catch(function (err) {
        console.error(err.toString());
    });

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
    
    // Form fields
    var recipientGroup = document.getElementById("recipientGroup");
    var announcementReference = document.getElementById("announcementReference");
    var announcementTitle = document.getElementById("announcementTitle");
    var announcementEffectiveDate = document.getElementById("announcementEffectiveDate");
    var announcementLocation = document.getElementById("announcementLocation");
    var announcementPenalty = document.getElementById("announcementPenalty");
    var announcementDetails = document.getElementById("announcementDetails");
    
    var meetingTitle = document.getElementById("meetingTitle");
    var meetingDate = document.getElementById("meetingDate");
    var meetingLocation = document.getElementById("meetingLocation");
    var meetingContact = document.getElementById("meetingContact");
    
    var ordinanceFields = document.getElementById("ordinanceFields");
    var meetingFields = document.getElementById("meetingFields");

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
        "ordinance": "[ORDINANCE]",
        "meeting": "[EVENT]"
    };
    var templateLabels = {
        "ordinance": "Ordinance/Resolution",
        "meeting": "Meeting/Events"
    };
    var recipientLabels = {
        "all": "All registered fisherfolk",
        "north": "Barangay Sulangan",
        "south": "Barangay Patao",
        "licensed": "Barangay Guiwanon"
    };
    // Default seed announcements
    var seedAnnouncements = [
        {
            id: "ann-001",
            template: "ordinance",
            recipientGroup: "all",
            title: "New Fishing Guidelines",
            location: "Bantayan municipal waters",
            effectiveDate: "May 4, 2026",
            penalty: "Fines & warning",
            referenceNo: "Ordinance No. 2024-07",
            details: "Observe only legal fishing methods and avoid restricted areas.",
            message: "Bantay Dagat Notice: Ordinance/Resolution - New Fishing Guidelines. Ref: Ordinance No. 2024-07. Area: Bantayan municipal waters. Effective: May 4, 2026. Penalty: Fines & warning. Details: Observe only legal fishing methods and avoid restricted areas.",
            status: "Delivered",
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
            deliveredCount: 0,
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
    // Sync with real database on load
    fetch('/api/announcementapi/history')
        .then(r => r.json())
        .then(data => {
            if (data && Array.isArray(data)) {
                // Merge real db with local state, or just replace
                localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(data));
                renderAnnouncements();
            }
        })
        .catch(err => console.error("Could not sync history", err));

    function autoArchiveAnnouncements(items) {
        var modified = false;
        var sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        items.forEach(function(item) {
            if (!item.archived && item.createdAt) {
                var createdDate = new Date(item.createdAt);
                if (createdDate < sixMonthsAgo) {
                    item.archived = true;
                    modified = true;
                }
            }
        });

        if (modified) {
            saveAnnouncements(items);
        }
        return items;
    }

    // Read local database
    function readAnnouncements() {
        var stored = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(seedAnnouncements));
            return autoArchiveAnnouncements(seedAnnouncements.slice());
        }
        try {
            var items = JSON.parse(stored) || [];
            return autoArchiveAnnouncements(items);
        } catch (error) {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(seedAnnouncements));
            return autoArchiveAnnouncements(seedAnnouncements.slice());
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
        if (!dateString) return "N/A";
        var date = new Date(dateString);
        var now = new Date();
        var diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return diffInSeconds + "s ago";
        if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + "m ago";
        if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + "h ago";
        if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 86400) + "d ago";
        return "Just now";
    }
    // Build the dynamic preview SMS
    function getSelectedCategory() {
        var radio = document.querySelector('input[name="template"]:checked');
        return radio ? radio.value : '';
    }

    function buildMessage() {
        var category = getSelectedCategory();
        var baseTemplate = templates[category] || "";
        var finalMessage = baseTemplate;
        
        var detailsText = announcementDetails.value.trim();

        if (category === 'ordinance') {
            var title = announcementTitle.value.trim();
            var referenceNo = announcementReference.value.trim();
            var locationText = announcementLocation.value.trim();
            var effectiveDate = announcementEffectiveDate.value.trim();
            var penaltyText = announcementPenalty.value.trim();

            if (title) finalMessage += " " + title + ".";
            if (referenceNo) finalMessage += " Ref:" + referenceNo + ".";
            if (locationText) finalMessage += " Loc:" + locationText + ".";
            if (effectiveDate) finalMessage += " Date:" + effectiveDate + ".";
            if (penaltyText) finalMessage += " Pen:" + penaltyText + ".";
        } else {
            var title = meetingTitle.value.trim();
            var eventDate = meetingDate.value.trim();
            var locationText = meetingLocation.value.trim();
            var contactText = meetingContact.value.trim();

            if (title) finalMessage += " " + title + ".";
            if (eventDate) finalMessage += " Date:" + eventDate + ".";
            if (locationText) finalMessage += " Loc:" + locationText + ".";
            if (contactText) finalMessage += " Call:" + contactText + ".";
        }

        if (detailsText) {
            finalMessage += " Msg: " + detailsText;
        }
        var finalString = finalMessage.trim() || "Compose an announcement to preview the outgoing SMS.";
        return finalString;
    }

    var charCountElement = document.getElementById("charCount");
    var charCountContainer = document.getElementById("charCountContainer");

    function updatePreview() {
        if (announcementPreview) {
            var msg = buildMessage();
            announcementPreview.textContent = msg;
            
            if (msg !== "Compose an announcement to preview the outgoing SMS.") {
                // The C# backend adds "BANTAY DAGAT: " (14 chars)
                var totalLength = msg.length + 14; 
                if (charCountElement) {
                    charCountElement.textContent = totalLength;
                    if (totalLength > 160) {
                        charCountElement.style.color = "#dc2626"; // Red
                        charCountContainer.innerHTML = "<span id='charCount' style='color:#dc2626;'>" + totalLength + "</span> / 160 characters <br><small style='color:#dc2626; font-weight:normal;'>Warning: Over 160 chars will be sent as 2 SMS messages.</small>";
                    } else {
                        charCountElement.style.color = "#16a34a"; // Green
                        charCountContainer.innerHTML = "<span id='charCount' style='color:#16a34a;'>" + totalLength + "</span> / 160 characters";
                    }
                }
            } else {
                if (charCountContainer) {
                    charCountContainer.innerHTML = "<span id='charCount'>0</span> / 160 characters";
                }
            }
        }
    }
    // Reset categories inputs
    function applyTemplate() {
        var category = getSelectedCategory();
        if (category === "meeting") {
            if(ordinanceFields) ordinanceFields.style.display = "none";
            if(meetingFields) meetingFields.style.display = "grid";
        } else if (category === "ordinance") {
            if(ordinanceFields) ordinanceFields.style.display = "grid";
            if(meetingFields) meetingFields.style.display = "none";
        } else {
            if(ordinanceFields) ordinanceFields.style.display = "none";
            if(meetingFields) meetingFields.style.display = "none";
        }
        // If template changes, clear manual message or reload preview
        updatePreview();
    }
    
    var clearCategoryBtn = document.getElementById('clearCategoryBtn');
    if (clearCategoryBtn) {
        clearCategoryBtn.addEventListener('click', function() {
            var templateRadios = document.querySelectorAll('input[name="template"]');
            templateRadios.forEach(function(r) { r.checked = false; });
            applyTemplate();
        });
    }
    // Render counts for tabs
    function updateTabCounts(items) {
        var counts = {
            all: 0,
            ordinance: 0,
            meeting: 0,
            archived: 0
        };
        items.forEach(function (item) {
            if (item.archived) {
                counts.archived += 1;
            } else {
                counts.all += 1;
                if (item.template === "ordinance") counts.ordinance += 1;
                else if (item.template === "meeting") counts.meeting += 1;
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
                    if (item.template !== currentFilter) {
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
            var rawTitle = String(item.title || item.message || item.details || templateName);
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
    var modalTitle = document.getElementById('modalTitle');
    var modalCategory = document.getElementById('modalCategory');
    var modalRecipients = document.getElementById('modalRecipients');
    var modalLocation = document.getElementById('modalLocation');
    var modalEffective = document.getElementById('modalEffective');
    var modalEventDate = document.getElementById('modalEventDate');
    var modalContact = document.getElementById('modalContact');
    var modalPenalty = document.getElementById('modalPenalty');
    var modalReference = document.getElementById('modalReference');
    var modalDetails = document.getElementById('modalDetails');
    var modalAttachment = document.getElementById('modalAttachment');
    var modalProcessed = document.getElementById('modalProcessed');
    var modalResendBtn = document.getElementById('modalResendBtn');
    
    var modalTitleRow = document.getElementById('modalTitleRow');
    var modalLocationRow = document.getElementById('modalLocationRow');
    var modalEffectiveRow = document.getElementById('modalEffectiveRow');
    var modalEventDateRow = document.getElementById('modalEventDateRow');
    var modalContactRow = document.getElementById('modalContactRow');
    var modalPenaltyRow = document.getElementById('modalPenaltyRow');
    var modalReferenceRow = document.getElementById('modalReferenceRow');
    var modalAttachmentRow = document.getElementById('modalAttachmentRow');
    
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
        if (modalTitle) modalTitle.textContent = item.title || "N/A";
        if (modalRecipients) modalRecipients.textContent = recipientLabels[item.recipientGroup] || item.recipientGroup;
        if (modalLocation) modalLocation.textContent = item.location || "N/A";
        if (modalEffective) modalEffective.textContent = item.effectiveDate || "N/A";
        if (modalEventDate) modalEventDate.textContent = item.eventDate || "N/A";
        if (modalContact) modalContact.textContent = item.contactPerson || "N/A";
        if (modalPenalty) modalPenalty.textContent = item.penalty || "N/A";
        if (modalReference) modalReference.textContent = item.referenceNo || "N/A";
        if (modalDetails) modalDetails.textContent = item.message || "N/A";
        if (modalAttachment) {
            if (item.attachmentPath) {
                modalAttachment.innerHTML = '<a href="' + item.attachmentPath + '" target="_blank" style="color: #2563eb; text-decoration: underline;">View Attachment</a>';
            } else {
                modalAttachment.textContent = "No attachment";
            }
        }
        if (modalProcessed) modalProcessed.textContent = (item.deliveredCount || 0).toLocaleString();

        if (item.template === 'meeting') {
            if (modalEffectiveRow) modalEffectiveRow.style.display = 'none';
            if (modalPenaltyRow) modalPenaltyRow.style.display = 'none';
            if (modalReferenceRow) modalReferenceRow.style.display = 'none';
            if (modalEventDateRow) modalEventDateRow.style.display = 'flex';
            if (modalContactRow) modalContactRow.style.display = 'flex';
        } else {
            if (modalEffectiveRow) modalEffectiveRow.style.display = 'flex';
            if (modalPenaltyRow) modalPenaltyRow.style.display = 'flex';
            if (modalReferenceRow) modalReferenceRow.style.display = 'flex';
            if (modalEventDateRow) modalEventDateRow.style.display = 'none';
            if (modalContactRow) modalContactRow.style.display = 'none';
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
                var radio = document.querySelector('input[name="template"][value="' + item.template + '"]');
                if(radio) radio.checked = true;
                if (recipientGroup) recipientGroup.value = item.recipientGroup;
                
                if (item.template === 'ordinance') {
                    if (announcementTitle) announcementTitle.value = item.title || "";
                    if (announcementLocation) announcementLocation.value = item.location || "";
                    if (announcementEffectiveDate) announcementEffectiveDate.value = item.effectiveDate || "";
                    if (announcementPenalty) announcementPenalty.value = item.penalty || "";
                    if (announcementReference) announcementReference.value = item.referenceNo || "";
                } else {
                    if (meetingTitle) meetingTitle.value = item.title || "";
                    if (meetingLocation) meetingLocation.value = item.location || "";
                    if (meetingDate) meetingDate.value = item.eventDate || "";
                    if (meetingContact) meetingContact.value = item.contactPerson || "";
                }
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
    var templateRadios = document.querySelectorAll('input[name="template"]');
    templateRadios.forEach(r => r.addEventListener("change", applyTemplate));
    
    [announcementLocation, announcementEffectiveDate, announcementPenalty, announcementReference, announcementTitle, meetingTitle, meetingDate, meetingLocation, meetingContact, announcementDetails].forEach(function(el) {
        if(el) el.addEventListener("input", updatePreview);
    });
    
    // Form submit
    announcementForm.addEventListener("submit", function (event) {
        event.preventDefault();
        
        var category = getSelectedCategory();
        if (!category) {
            alert("Please select a Category (Ordinance/Resolution or Meeting/Events).");
            return;
        }

        var title = category === 'ordinance' ? announcementTitle.value.trim() : meetingTitle.value.trim();
        var locationText = category === 'ordinance' ? announcementLocation.value.trim() : meetingLocation.value.trim();
        var detailsText = announcementDetails.value.trim();

        if (!title || !locationText || !detailsText) {
            alert("Please fill in the Title, Location, and Additional Details before sending.");
            return;
        }

        if (!confirm("Are you sure you want to send this announcement? This action cannot be undone and will send SMS messages to the selected fisherfolk.")) {
            return;
        }

        var finalMessage = buildMessage();
        var items = readAnnouncements();
        var selectedGroup = recipientGroup.value;

        // We will get the real count from the API response
        var recipientCount = 0;
        var newItem = {
            id: "ann-" + Date.now(),
            template: category,
            recipientGroup: selectedGroup,
            title: title,
            location: locationText,
            effectiveDate: category === 'ordinance' ? announcementEffectiveDate.value.trim() : "",
            penalty: category === 'ordinance' ? announcementPenalty.value.trim() : "",
            referenceNo: category === 'ordinance' ? announcementReference.value.trim() : "",
            eventDate: category === 'meeting' ? meetingDate.value.trim() : "",
            contactPerson: category === 'meeting' ? meetingContact.value.trim() : "",
            details: announcementDetails.value.trim(),
            message: finalMessage,
            status: "Processing",
            createdAt: new Date().toISOString(),
            deliveredCount: recipientCount,
            archived: false
        };

        // Create FormData to send inputs
        var formData = new FormData();
        formData.append("Category", newItem.template);
        formData.append("Message", newItem.message);
        formData.append("Title", newItem.title);
        formData.append("RecipientGroup", newItem.recipientGroup);
        formData.append("Location", newItem.location);
        formData.append("EffectiveDate", newItem.effectiveDate);
        formData.append("Penalty", newItem.penalty);
        formData.append("ReferenceNo", newItem.referenceNo);
        if (newItem.eventDate) {
            formData.append("EventDate", newItem.eventDate);
        }
        formData.append("ContactPerson", newItem.contactPerson);

        items.push(newItem);
        saveAnnouncements(items);
        renderAnnouncements();

        // Clear input form fields
        announcementForm.reset();
        applyTemplate();
        updatePreview();
        
        // Call the real API
        fetch('/api/announcementapi/send', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.queueId) {
                // Update the local placeholder with real ID and count
                var currentItems = readAnnouncements();
                var index = currentItems.findIndex(i => i.id === newItem.id);
                if (index !== -1) {
                    currentItems[index].id = "ann-" + data.queueId;
                    currentItems[index].deliveredCount = data.recipients;
                    saveAnnouncements(currentItems);
                    renderAnnouncements();
                }

                // Listen to SignalR updates
                connection.invoke("JoinAnnouncementGroup", data.queueId.toString()).catch(function (err) {
                    console.error(err.toString());
                });

                // Insert a progress UI into the form area
                var existingProgress = document.getElementById("liveProgress-" + data.queueId);
                if (!existingProgress) {
                    var progressContainer = document.createElement("div");
                    progressContainer.id = "liveProgress-" + data.queueId;
                    progressContainer.innerHTML = `
                        <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:16px; border-radius:8px; margin-top:20px;">
                            <h4 style="margin:0 0 8px 0; color:#1e40af;">Live Send Progress</h4>
                            <p style="margin:0 0 4px 0; font-weight:bold;">Initializing Queue...</p>
                        </div>
                    `;
                    announcementForm.appendChild(progressContainer);
                }
            } else {
                throw new Error(data.title || "Server rejected the request.");
            }
        })
        .catch(err => {
            console.error("Error sending announcement:", err);
            
            // REMOVE the fake item from local storage since the server rejected it!
            var currentItems = readAnnouncements();
            currentItems = currentItems.filter(i => i.id !== newItem.id);
            saveAnnouncements(currentItems);
            renderAnnouncements();
            
            alert("Error sending announcement. The server rejected the request. Please make sure you are not missing any fields.");
        });
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

    // Check for view_id in URL to automatically open modal
    var urlParams = new URLSearchParams(window.location.search);
    var viewId = urlParams.get('view_id');
    if (viewId && localStorage.getItem(STORAGE_KEY) === "true") {
        setTimeout(function() {
            var fullId = viewId;
            if (!fullId.startsWith("ann-")) {
                fullId = "ann-" + viewId;
            }
            openAnnouncementModal(fullId);
        }, 500);
    }
})();
