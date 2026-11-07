document.addEventListener("DOMContentLoaded", function () {
    const chatWidget = document.getElementById("admin-chat-widget");
    if (!chatWidget) return;

    // Elements
    const chatHeader = document.getElementById("chat-header");
    const chatBody = chatWidget.querySelector(".chat-body");
    const chatToggleIcon = document.getElementById("chat-toggle-icon");
    const chatToggleBtn = document.getElementById("chat-toggle-btn");
    const chatUnreadBadge = document.getElementById("chat-unread-badge");
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("chat-message-input");
    const sendBtn = document.getElementById("chat-send-btn");
    const typingIndicator = document.getElementById("chat-typing-indicator");
    const searchInput = document.getElementById("chat-search-input");
    const searchClearBtn = document.getElementById("chat-search-clear");
    const alertToggle = document.getElementById("chat-alert-toggle");
    
    // Online Panel Elements
    const onlineSectionToggle = document.getElementById("online-section-toggle");
    const onlineIndicator = document.getElementById("chat-online-indicator");
    const onlineUsersWrapper = document.getElementById("online-users-wrapper");
    const onlineUsersList = document.getElementById("online-users-list");
    const onlineCountText = document.getElementById("chat-online-count-text");
    const onlineUsersCountTag = document.getElementById("online-users-count-tag");
    const onlineListChevron = document.getElementById("online-list-chevron");

    // Attachment Modal Elements
    const attachBtn = document.getElementById("chat-attach-btn");
    const attachModal = document.getElementById("chat-attachment-modal");
    const attachCloseBtn = document.getElementById("chat-attachment-close");
    const attachList = document.getElementById("chat-attachment-list");
    const attachTypeSelect = document.getElementById("chat-attachment-type");
    const attachSearchInput = document.getElementById("chat-attachment-search");
    const attachPreview = document.getElementById("chat-attachment-preview");
    const attachNameSpan = document.getElementById("chat-attachment-name");
    const attachTypeBadge = document.getElementById("chat-attachment-type-badge");
    const attachIconSpan = document.getElementById("chat-attachment-icon");
    const attachClearBtn = document.getElementById("chat-attachment-clear");

    // State Variables
    let isChatOpen = false;
    let isOnlinePanelOpen = true;
    let unreadCount = 0;
    let currentUserId = chatWidget.dataset.currentUserId || "";
    let currentUserName = chatWidget.dataset.currentUserName || "Admin";
    let currentUserRole = chatWidget.dataset.currentUserRole || "Admin";
    let selectedAttachment = null;
    let onlineUsersMap = new Map(); // Key: userId -> { userId, userName, role }
    let rawMessagesHistory = [];

    // 1. Fetch current user info if not populated from Razor
    if (!currentUserId) {
        fetch('/api/AdminChat/currentUser')
            .then(res => res.ok ? res.json() : null)
            .then(user => {
                if (user) {
                    currentUserId = user.userId || "";
                    currentUserName = user.userName || currentUserName;
                    currentUserRole = user.role || currentUserRole;
                }
            })
            .catch(() => {});
    }

    // 2. Setup SignalR Connection
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/adminChatHub")
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

    // 3. Connect to SignalR
    connection.start().then(() => {
        loadHistory();
        getUnreadCount();
        fetchOnlineUsersFallback();
        try {
            connection.invoke("RequestOnlineUsers").catch(() => {});
        } catch(e) {}
    }).catch(err => {
        console.warn("SignalR Connection Warning:", err);
        // Fallback: still load messages and online users via REST
        loadHistory();
        getUnreadCount();
        fetchOnlineUsersFallback();
    });

    // Handle full online users list from server
    connection.on("OnlineUsersList", function (usersList) {
        if (Array.isArray(usersList)) {
            onlineUsersMap.clear();
            usersList.forEach(u => {
                if (u && u.userId) {
                    onlineUsersMap.set(u.userId, {
                        userId: u.userId,
                        userName: u.userName || "Admin",
                        role: u.role || "Admin"
                    });
                }
            });
            ensureCurrentUserInOnlineMap();
            renderOnlineUsers();
        }
    });

    // Handle single user coming online
    connection.on("UserOnline", function (userId, userName, role) {
        if (userId) {
            onlineUsersMap.set(userId, {
                userId: userId,
                userName: userName || "Admin",
                role: role || "Admin"
            });
            renderOnlineUsers();
        }
    });

    // Handle user disconnecting
    connection.on("UserOffline", function (userId) {
        if (userId && onlineUsersMap.has(userId)) {
            // If it's not the current user in another tab
            if (userId !== currentUserId) {
                onlineUsersMap.delete(userId);
            }
            renderOnlineUsers();
        }
    });

    function ensureCurrentUserInOnlineMap() {
        if (currentUserId && !onlineUsersMap.has(currentUserId)) {
            onlineUsersMap.set(currentUserId, {
                userId: currentUserId,
                userName: currentUserName,
                role: currentUserRole
            });
        }
    }

    function fetchOnlineUsersFallback() {
        fetch('/api/AdminChat/onlineUsers')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(u => {
                        if (u && u.userId) {
                            onlineUsersMap.set(u.userId, {
                                userId: u.userId,
                                userName: u.userName || "Admin",
                                role: u.role || "Admin"
                            });
                        }
                    });
                }
                ensureCurrentUserInOnlineMap();
                renderOnlineUsers();
            })
            .catch(() => {
                ensureCurrentUserInOnlineMap();
                renderOnlineUsers();
            });
    }

    // Render Who's Online list
    function renderOnlineUsers() {
        ensureCurrentUserInOnlineMap();
        const users = Array.from(onlineUsersMap.values());
        const count = users.length;

        if (onlineCountText) onlineCountText.textContent = `${count} Online`;
        if (onlineUsersCountTag) onlineUsersCountTag.textContent = count;

        if (!onlineUsersList) return;
        onlineUsersList.innerHTML = '';

        if (count === 0) {
            onlineUsersList.innerHTML = `
                <div style="font-size: 11px; color: #94a3b8; text-align: center; padding: 10px;">
                    No other administrators currently online
                </div>
            `;
            return;
        }

        // Sort so current user is at the top
        users.sort((a, b) => {
            if (a.userId === currentUserId) return -1;
            if (b.userId === currentUserId) return 1;
            return (a.userName || "").localeCompare(b.userName || "");
        });

        users.forEach(u => {
            const isMe = (u.userId === currentUserId);
            const displayRole = formatRoleName(u.role);

            const item = document.createElement("div");
            item.className = "online-user-item";
            item.innerHTML = `
                <div class="online-user-name">
                    <span class="online-dot"></span>
                    <span>${escapeHtml(u.userName)}</span>
                    ${isMe ? '<span class="you-tag">You</span>' : ''}
                </div>
                <span class="role-tag">${escapeHtml(displayRole)}</span>
            `;
            onlineUsersList.appendChild(item);
        });
    }

    function formatRoleName(role) {
        if (!role) return "Admin";
        if (role === "SuperAdmin") return "Super Admin";
        if (role === "BantayDagatAdmin") return "Bantay Dagat Admin";
        if (role === "FisheriesAdmin") return "Fisheries (MAO) Admin";
        return role;
    }

    // Toggle Online Users Panel
    function toggleOnlinePanel(forceState) {
        if (typeof forceState === "boolean") {
            isOnlinePanelOpen = forceState;
        } else {
            isOnlinePanelOpen = !isOnlinePanelOpen;
        }

        if (onlineUsersWrapper) {
            onlineUsersWrapper.style.display = isOnlinePanelOpen ? "block" : "none";
        }
        if (onlineListChevron) {
            onlineListChevron.style.transform = isOnlinePanelOpen ? "rotate(0deg)" : "rotate(180deg)";
        }
    }

    if (onlineSectionToggle) {
        onlineSectionToggle.addEventListener("click", () => toggleOnlinePanel());
    }
    if (onlineIndicator) {
        onlineIndicator.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isChatOpen) {
                openChat();
            }
            toggleOnlinePanel(true);
        });
    }

    // 4. Handle Incoming Messages
    connection.on("ReceiveMessage", function (msg) {
        rawMessagesHistory.push(msg);
        appendMessage(msg);

        const isSelf = (msg.senderId === currentUserId) || 
                       (currentUserName && msg.senderName === currentUserName);

        if (!isChatOpen && !isSelf) {
            unreadCount++;
            updateUnreadBadge();
            playNotificationChime();
            showBrowserNotification(msg.senderName, msg.content || "Sent an attachment");
        } else if (isChatOpen) {
            markMessagesAsRead();
        }
    });

    // 5. Open / Toggle Chat Widget
    function openChat() {
        isChatOpen = true;
        chatWidget.classList.remove("collapsed");
        chatBody.style.display = "flex";
        if (chatToggleIcon) {
            chatToggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>`;
        }
        unreadCount = 0;
        updateUnreadBadge();
        markMessagesAsRead();
        scrollToBottom();
        if (messageInput) messageInput.focus();
    }

    function closeChat() {
        isChatOpen = false;
        chatWidget.classList.add("collapsed");
        chatBody.style.display = "none";
        if (chatToggleIcon) {
            chatToggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path>`;
        }
    }

    chatHeader.addEventListener("click", function (e) {
        // Prevent toggle if clicking on pill button directly
        if (e.target.closest("#chat-online-pill-btn")) return;
        if (isChatOpen) {
            closeChat();
        } else {
            openChat();
        }
    });

    window.toggleAdminChat = function() {
        if (isChatOpen) closeChat();
        else openChat();
    };

    // 6. Send Message Logic
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);

    if (messageInput) {
        messageInput.addEventListener("keydown", function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text && !selectedAttachment) return;

        const type = (alertToggle && alertToggle.checked) ? "ALERT" : "TEXT";

        let rId = null, rType = null, rTitle = null;
        if (selectedAttachment) {
            rId = parseInt(selectedAttachment.id, 10);
            rType = selectedAttachment.type;
            rTitle = selectedAttachment.title;
        }

        connection.invoke("SendMessage", text, type, rId, rType, rTitle)
            .catch(err => {
                console.error("Error sending message via SignalR:", err);
            });

        messageInput.value = "";
        if (alertToggle) alertToggle.checked = false;
        clearAttachment();
        messageInput.focus();
    }

    // 7. Render Message in Thread
    function appendMessage(msg) {
        const isSelf = (msg.senderId === currentUserId) || 
                       (currentUserName && msg.senderName === currentUserName);
        const isAlert = (msg.type === "ALERT");

        const row = document.createElement("div");
        row.className = `message-row ${isSelf ? 'sent' : 'received'}`;

        let attachmentsHtml = '';
        if (msg.attachments && msg.attachments.length > 0) {
            attachmentsHtml = msg.attachments.map(a => {
                const type = (a.resourceType || a.ResourceType || "").toUpperCase();
                const id = a.resourceId || a.resourceID || a.ResourceID;
                const title = a.resourceTitle || a.ResourceTitle || "Attached Resource";

                let badgeText = "RESOURCE";
                if (type === "INCIDENT") {
                    badgeText = "INCIDENT #" + (id || '');
                }
                else if (type === "ANNOUNCEMENT") {
                    badgeText = "ANNOUNCEMENT #" + (id || '');
                }
                else if (type === "FISHERFOLK") {
                    badgeText = "FISHERFOLK #" + (id || '');
                }

                return `
                    <div class="chat-resource-card" onclick="window.openAttachedResource('${type}', '${id}'); return false;" title="Click to open report">
                        <span class="chat-badge-pill">${badgeText}</span>
                        <div class="chat-card-headline">${escapeHtml(title)}</div>
                    </div>
                `;
            }).join('');
        }

        let contentHtml = '';
        if (msg.content) {
            contentHtml = escapeHtml(msg.content);
            // Linkify URLs
            const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            contentHtml = contentHtml.replace(urlRegex, function (url) {
                return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
            });
        }

        const timeStr = msg.timestamp ? formatMessageTime(msg.timestamp) : "";

        let senderHeader = '';
        if (!isSelf) {
            const roleShort = formatRoleName(msg.senderRole);
            senderHeader = `
                <div class="message-sender">
                    ${escapeHtml(msg.senderName)} <span style="font-weight:400; color:#64748b; font-size:10px;">(${escapeHtml(roleShort)})</span>
                </div>
            `;
        }

        let alertTag = '';
        if (isAlert) {
            alertTag = `
                <div class="alert-heading">High Priority Alert</div>
            `;
        }

        const isAttachmentOnly = attachmentsHtml && !contentHtml && !isAlert;

        row.innerHTML = `
            ${senderHeader}
            <div class="message-bubble ${isAlert ? 'alert-bubble' : ''} ${isAttachmentOnly ? 'attachment-only-bubble' : ''}">
                ${alertTag}
                ${contentHtml ? `<div style="margin-bottom: ${attachmentsHtml ? '8px' : '0'};">${contentHtml}</div>` : ''}
                ${attachmentsHtml}
            </div>
            <div class="message-time">${timeStr}</div>
        `;

        chatMessages.appendChild(row);
        scrollToBottom();
    }

    function formatMessageTime(dateInput) {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // 8. Open Attached Resource link
    window.openAttachedResource = function (type, id) {
        const t = (type || "").toUpperCase();
        if (t === 'ANNOUNCEMENT') {
            window.open('/Home/Announcement?view_id=' + id, '_blank');
        } else if (t === 'INCIDENT') {
            // Direct to the official Blotter Report form (not the edit form)
            if (typeof window.openBlotterPaperById === 'function') {
                window.openBlotterPaperById(id);
            } else {
                window.open('/BlotterReport?open_id=' + id, '_blank');
            }
        } else if (t === 'FISHERFOLK') {
            window.open('/Home/FisherfolkInfo?view_id=' + id, '_blank');
        } else {
            alert('Opening ' + t + ': #' + id);
        }
    };

    // 9. Load History & Search
    function loadHistory(query = "") {
        fetch('/api/AdminChat/history?query=' + encodeURIComponent(query))
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                rawMessagesHistory = data;
                renderHistoryMessages(data);
            })
            .catch(err => console.error("Error loading history:", err));
    }

    function renderHistoryMessages(messages) {
        if (!chatMessages) return;
        chatMessages.innerHTML = '';
        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div style="text-align: center; color: #94a3b8; font-size: 12px; margin: auto; padding: 20px;">
                    No messages found. Start the conversation!
                </div>
            `;
            return;
        }
        messages.forEach(msg => appendMessage(msg));
        scrollToBottom();
    }

    let searchTimer;
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const val = this.value.trim();
            if (searchClearBtn) searchClearBtn.style.display = val ? "flex" : "none";

            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                loadHistory(val);
            }, 300);
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener("click", function () {
            searchInput.value = "";
            searchClearBtn.style.display = "none";
            loadHistory("");
            searchInput.focus();
        });
    }

    // 10. Attachment Picker Logic
    let allFetchedResources = [];

    function fetchResources(type = "ALL", search = "") {
        if (!attachList) return;
        attachList.innerHTML = `<div style="padding: 16px; text-align: center; color: #64748b; font-size: 12px;">Loading system records...</div>`;

        fetch(`/api/AdminChat/resources?type=${encodeURIComponent(type)}&search=${encodeURIComponent(search)}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                allFetchedResources = data;
                renderResourceItems(data);
            })
            .catch(() => {
                attachList.innerHTML = `<div style="padding: 16px; text-align: center; color: #ef4444; font-size: 12px;">Unable to load resources.</div>`;
            });
    }

    function renderResourceItems(items) {
        if (!attachList) return;
        attachList.innerHTML = '';

        if (!items || items.length === 0) {
            attachList.innerHTML = `<div style="padding: 16px; text-align: center; color: #64748b; font-size: 12px;">No matching records found.</div>`;
            return;
        }

        items.forEach(r => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "chat-res-item";

            let typeIcon = "📎";
            let typeColor = "#0284c7";
            if (r.type === "INCIDENT") { typeIcon = "📋"; typeColor = "#dc2626"; }
            else if (r.type === "ANNOUNCEMENT") { typeIcon = "📢"; typeColor = "#2563eb"; }
            else if (r.type === "FISHERFOLK") { typeIcon = "🎣"; typeColor = "#059669"; }

            itemDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2px;">
                    <span style="font-size:10px; font-weight:700; color:${typeColor}; text-transform:uppercase;">
                        ${typeIcon} ${r.type} #${r.id || ''}
                    </span>
                    <span style="font-size:10px; color:#94a3b8;">${r.date ? new Date(r.date).toLocaleDateString() : ''}</span>
                </div>
                <div style="font-weight:600; font-size:12px; color:#1e293b;">${escapeHtml(r.title || 'Untitled')}</div>
                ${r.body ? `<div style="font-size:11px; color:#64748b; margin-top:2px; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(r.body)}</div>` : ''}
            `;

            itemDiv.onclick = () => {
                selectedAttachment = r;
                if (attachNameSpan) attachNameSpan.textContent = r.title || "Attached Item";
                if (attachTypeBadge) attachTypeBadge.textContent = r.type || "RESOURCE";
                if (attachIconSpan) attachIconSpan.textContent = typeIcon;
                if (attachPreview) attachPreview.style.display = "flex";
                if (attachModal) attachModal.style.display = "none";
                if (messageInput) messageInput.focus();
            };

            attachList.appendChild(itemDiv);
        });
    }

    if (attachBtn) {
        attachBtn.addEventListener("click", function () {
            if (attachModal) attachModal.style.display = "flex";
            if (attachTypeSelect) attachTypeSelect.value = "ALL";
            if (attachSearchInput) attachSearchInput.value = "";
            fetchResources("ALL", "");
        });
    }

    if (attachCloseBtn) {
        attachCloseBtn.addEventListener("click", () => {
            if (attachModal) attachModal.style.display = "none";
        });
    }

    if (attachClearBtn) {
        attachClearBtn.addEventListener("click", clearAttachment);
    }

    if (attachTypeSelect) {
        attachTypeSelect.addEventListener("change", function () {
            fetchResources(this.value, attachSearchInput ? attachSearchInput.value : "");
        });
    }

    if (attachSearchInput) {
        let attachSearchTimer;
        attachSearchInput.addEventListener("input", function () {
            clearTimeout(attachSearchTimer);
            attachSearchTimer = setTimeout(() => {
                fetchResources(attachTypeSelect ? attachTypeSelect.value : "ALL", this.value.trim());
            }, 300);
        });
    }

    function clearAttachment() {
        selectedAttachment = null;
        if (attachPreview) attachPreview.style.display = "none";
    }

    // 11. Read Status & Badges
    function markMessagesAsRead() {
        fetch('/api/AdminChat/markRead', { method: 'POST' }).catch(() => {});
    }

    function getUnreadCount() {
        fetch('/api/AdminChat/unreadCount')
            .then(res => res.ok ? res.json() : { count: 0 })
            .then(data => {
                unreadCount = data.count || 0;
                updateUnreadBadge();
            })
            .catch(() => {});
    }

    function updateUnreadBadge() {
        if (!chatUnreadBadge) return;
        if (unreadCount > 0) {
            chatUnreadBadge.textContent = unreadCount > 99 ? "99+" : unreadCount;
            chatUnreadBadge.style.display = "inline-block";
        } else {
            chatUnreadBadge.style.display = "none";
        }
    }

    // 12. Audio Synthesis Chime (Reliable, zero external file dependency!)
    function playNotificationChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // Tone 1: Gentle pleasant ding (587.33 Hz - D5)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(587.33, now);
            gain1.gain.setValueAtTime(0.15, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.3);

            // Tone 2: Ascending chime (880 Hz - A5)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(880, now + 0.12);
            gain2.gain.setValueAtTime(0.18, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.45);
        } catch (e) {
            // Audio context blocked or unsupported
        }
    }

    function showBrowserNotification(title, body) {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
            try {
                new Notification(`Admin Chat: ${title}`, {
                    body: body,
                    icon: '/logo-bantaydagat.jpg'
                });
            } catch(e) {}
        }
    }

    if ("Notification" in window && Notification.permission !== "denied" && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    function scrollToBottom() {
        const container = document.getElementById("chat-messages-container");
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return "";
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 13. Typing Indicator
    let typingTimer;
    let isTyping = false;
    if (messageInput) {
        messageInput.addEventListener("input", function () {
            if (!isTyping) {
                isTyping = true;
                connection.invoke("SendTypingIndicator").catch(() => {});
            }
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                isTyping = false;
            }, 2500);
        });
    }

    let hideTypingTimer;
    connection.on("UserTyping", function (userId, userName, role) {
        if (isChatOpen && userId !== currentUserId && typingIndicator) {
            const typingText = document.getElementById("typing-text");
            if (typingText) {
                typingText.textContent = `${userName || role || 'Admin'} is typing...`;
            }
            typingIndicator.style.display = "flex";
            scrollToBottom();

            clearTimeout(hideTypingTimer);
            hideTypingTimer = setTimeout(() => {
                typingIndicator.style.display = "none";
            }, 3000);
        }
    });
});
