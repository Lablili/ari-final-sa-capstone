document.addEventListener("DOMContentLoaded", function () {
    const chatWidget = document.getElementById("admin-chat-widget");
    if (!chatWidget) return;

    const chatHeader = document.getElementById("chat-header");
    const chatBody = chatWidget.querySelector(".chat-body");
    const chatToggleIcon = document.getElementById("chat-toggle-icon");
    const chatUnreadBadge = document.getElementById("chat-unread-badge");
    const chatMessages = document.getElementById("chat-messages");
    const onlineUsersList = document.getElementById("online-users-list");
    const messageInput = document.getElementById("chat-message-input");
    const sendBtn = document.getElementById("chat-send-btn");
    const typingIndicator = document.getElementById("chat-typing-indicator");
    const searchInput = document.getElementById("chat-search-input");
    const alertToggle = document.getElementById("chat-alert-toggle");
    const attachBtn = document.getElementById("chat-attach-btn");
    const attachModal = document.getElementById("chat-attachment-modal");
    const attachCloseBtn = document.getElementById("chat-attachment-close");
    const attachList = document.getElementById("chat-attachment-list");
    const attachPreview = document.getElementById("chat-attachment-preview");
    const attachNameSpan = document.getElementById("chat-attachment-name");
    const attachClearBtn = document.getElementById("chat-attachment-clear");

    let isChatOpen = false;
    let unreadCount = 0;
    let currentUserId = ""; 
    let selectedAttachment = null;

    // Setup SignalR Connection
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/adminChatHub")
        .withAutomaticReconnect()
        .build();

    // Sound alert
    const notificationSound = new Audio('/sounds/notification.mp3'); // May 404 if not present, but good practice

    // Connect
    connection.start().then(() => {
        loadHistory();
        getUnreadCount();
    }).catch(err => console.error("SignalR Connection Error: ", err));

    function getUnreadCount() {
        fetch('/api/AdminChat/unreadCount')
            .then(res => res.json())
            .then(data => {
                unreadCount = data.count || 0;
                updateUnreadBadge();
            })
            .catch(err => console.error("Error fetching unread count:", err));
    }

    // Handle Incoming Message
    connection.on("ReceiveMessage", function (msg) {
        appendMessage(msg);
        
        if (!isChatOpen && msg.senderId !== currentUserId) {
            unreadCount++;
            updateUnreadBadge();
            playNotification();
            showBrowserNotification(msg.senderName, msg.content);
        } else if (isChatOpen) {
            markMessagesAsRead();
        }
    });

    connection.on("UserOnline", function (userId, userName, role) {
        if (!document.getElementById(`online-user-${userId}`)) {
            const li = document.createElement("li");
            li.id = `online-user-${userId}`;
            li.innerHTML = `<span class="status-dot online"></span> ${role} - ${userName}`;
            onlineUsersList.appendChild(li);
        }
    });

    connection.on("UserOffline", function (userId) {
        const li = document.getElementById(`online-user-${userId}`);
        if (li) li.remove();
    });

    // Toggle Chat
    chatHeader.addEventListener("click", function () {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatWidget.classList.remove("collapsed");
            chatBody.style.display = "flex";
            chatToggleIcon.innerHTML = `<path d="M19 9l-7 7-7-7"></path>`; // Arrow down
            unreadCount = 0;
            updateUnreadBadge();
            markMessagesAsRead();
            scrollToBottom();
        } else {
            chatWidget.classList.add("collapsed");
            chatBody.style.display = "none";
            chatToggleIcon.innerHTML = `<path d="M5 15l7-7-7-7"></path>`; // Arrow up
        }
    });

    // Send Message
    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text && !selectedAttachment) return;
        
        const type = alertToggle.checked ? "ALERT" : "TEXT";
        
        let rId = null, rType = null, rTitle = null;
        if (selectedAttachment) {
            rId = selectedAttachment.id;
            rType = selectedAttachment.type;
            rTitle = selectedAttachment.title;
        }

        connection.invoke("SendMessage", text, type, rId, rType, rTitle).catch(err => console.error(err));
        
        messageInput.value = "";
        alertToggle.checked = false;
        clearAttachment();
    }

    window.openAttachedResource = function(type, id) {
        if (type === 'ANNOUNCEMENT') {
            window.open('/Home/Announcement?view_id=' + id, '_blank');
        } else if (type === 'INCIDENT') {
            window.open('/BlotterReport/Edit/' + id, '_blank');
        } else if (type === 'FISHERFOLK') {
            window.open('/Home/FisherfolkInfo?view_id=' + id, '_blank');
        } else {
            alert('Opening ' + type + ': ' + id);
        }
    };

    function appendMessage(msg) {
        const isSelf = msg.senderId === currentUserId || (!currentUserId && msg.senderName === "You");
        const row = document.createElement("div");
        row.className = `message-row ${isSelf ? 'sent' : 'received'}`;
        
        let attachmentsHtml = '';
        if (msg.attachments && msg.attachments.length > 0) {
            attachmentsHtml = msg.attachments.map(a => 
                `<div style="margin-top: 5px; font-size: 11px; padding: 4px; background: rgba(0,0,0,0.05); border-radius: 4px; display:inline-block;">
                    📎 <a href="#" onclick="window.openAttachedResource('${a.resourceType}', '${a.resourceId}'); return false;" style="text-decoration:none; color:#2563eb; font-weight:600;">${a.resourceTitle}</a>
                 </div>`
            ).join('');
        }
        
        row.innerHTML = `
            ${!isSelf ? `<div class="message-sender">${msg.senderRole} (${msg.senderName})</div>` : ''}
            <div class="message-bubble">
                ${msg.content ? escapeHtml(msg.content) : ''}
                ${attachmentsHtml}
            </div>
            <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    function loadHistory(query = "") {
        fetch('/api/AdminChat/history?query=' + encodeURIComponent(query))
            .then(res => res.json())
            .then(data => {
                chatMessages.innerHTML = '';
                data.forEach(msg => appendMessage(msg));
                scrollToBottom();
            });
    }

    let searchTimer;
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                loadHistory(this.value.trim());
            }, 500);
        });
    }

    // Attachment Logic
    const attachTypeSelect = document.getElementById("chat-attachment-type");

    function fetchResources(type = "ALL") {
        attachList.innerHTML = `<div style="padding: 10px; text-align: center; color: #64748b;">Loading resources...</div>`;
        fetch('/api/AdminChat/resources?type=' + type)
            .then(res => res.json())
            .then(data => {
                attachList.innerHTML = '';
                if (data.length === 0) {
                    attachList.innerHTML = `<div style="padding: 10px; text-align: center; color: #64748b;">No resources found.</div>`;
                    return;
                }
                data.forEach(r => {
                    const div = document.createElement("div");
                    div.style = "padding: 6px; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: background 0.2s;";
                    div.onmouseover = () => div.style.background = "#f8fafc";
                    div.onmouseout = () => div.style.background = "transparent";
                    div.innerHTML = `<strong style="font-size:10px; color:#94a3b8;">${r.type}</strong><br><span style="color:#334155; font-weight:500;">${r.title}</span>`;
                    div.onclick = () => {
                        selectedAttachment = r;
                        attachNameSpan.textContent = r.title;
                        attachPreview.style.display = "flex";
                        attachModal.style.display = "none";
                    };
                    attachList.appendChild(div);
                });
            })
            .catch(err => {
                attachList.innerHTML = `<div style="padding: 10px; text-align: center; color: red;">Failed to load resources.</div>`;
            });
    }

    if (attachBtn) {
        attachBtn.addEventListener("click", function() {
            attachModal.style.display = "flex";
            if (attachTypeSelect) attachTypeSelect.value = "ALL";
            fetchResources("ALL");
        });
    }

    if (attachTypeSelect) {
        attachTypeSelect.addEventListener("change", function() {
            fetchResources(this.value);
        });
    }

    if (attachCloseBtn) {
        attachCloseBtn.addEventListener("click", () => attachModal.style.display = "none");
    }

    if (attachClearBtn) {
        attachClearBtn.addEventListener("click", clearAttachment);
    }

    function clearAttachment() {
        selectedAttachment = null;
        if (attachPreview) attachPreview.style.display = "none";
    }

    function markMessagesAsRead() {
        fetch('/api/AdminChat/markRead', { method: 'POST' });
    }

    function updateUnreadBadge() {
        if (unreadCount > 0) {
            chatUnreadBadge.textContent = unreadCount;
            chatUnreadBadge.style.display = "inline-block";
        } else {
            chatUnreadBadge.style.display = "none";
        }
    }

    function playNotification() {
        try { notificationSound.play(); } catch(e) {}
    }

    function showBrowserNotification(title, body) {
        if (Notification.permission === "granted") {
            new Notification(`💬 New message from ${title}`, { body: body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(`💬 New message from ${title}`, { body: body });
                }
            });
        }
    }

    function scrollToBottom() {
        const container = document.getElementById("chat-messages-container");
        if (container) container.scrollTop = container.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
    
    // Request notification permissions on load
    if (Notification.permission !== "denied" && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    window.toggleAdminChat = function() {
        chatHeader.click();
    };

    // Typing Indicator Logic
    let typingTimer;
    let isTyping = false;
    messageInput.addEventListener("input", function() {
        if (!isTyping) {
            isTyping = true;
            connection.invoke("SendTypingIndicator").catch(err => console.error(err));
        }
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => { isTyping = false; }, 2000);
    });

    let hideTypingTimer;
    connection.on("UserTyping", function(userId, role) {
        if (isChatOpen) {
            typingIndicator.innerHTML = `<em>${role} is typing...</em>`;
            typingIndicator.style.display = "block";
            scrollToBottom();
            
            clearTimeout(hideTypingTimer);
            hideTypingTimer = setTimeout(() => {
                typingIndicator.style.display = "none";
            }, 3000);
        }
    });
});
