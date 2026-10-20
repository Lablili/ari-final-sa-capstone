// ════ DATA ════
let DATA = [
  {
    id: 1,
    cat: "sos",
    contact: "+63 912 345 6789",
    priority: "Critical",
    flaggedPlace: "Patao",
    time: "2026-05-25 06:14",
    status: "new",
    subject: "Kalit nga pagka-dehado sa makina – Mayday",
    msg: "Mayday! Nabuslot ang makina. Duol mi mga 3 nautical miles sa amihan-sidlakan sa Patao. 4 ka crew, walay kadaut. Palihug padala dayon og tabang. Ang barko naglutaw paingon sa amihanan-kasadpan.",
  },
  {
    id: 2,
    cat: "sos",
    contact: "+63 918 876 5432",
    priority: "Critical",
    flaggedPlace: "Guiwanon",
    time: "2026-05-24 21:45",
    status: "review",
    subject: "Hangyo og Reskyu – Nag-umol ang Bangka",
    msg: "Natumba ang among bangka duol sa baybayon sa Guiwanon. 2 ka mangingisda nagkapilit sa hull. Kinahanglan og dali nga reskyu. Duol sa pulang buoy ang lokasyon.",
  },
  {
    id: 3,
    cat: "incident",
    contact: "+63 917 111 2222",
    priority: "High",
    flaggedPlace: "Sulangan",
    time: "2026-05-25 08:30",
    status: "new",
    subject: "Iligal nga pagpangisda – Paggamit sa dinamita",
    msg: "Nakit-an namo ang usa ka dako nga motorized banca nga naggamit og dinamita sa daplin sa coral reef duol sa Sulangan sa alas 8:00 sa buntag. Wala kiniy marka ug nidagan paingon sa kasadpan.",
  },
  {
    id: 4,
    cat: "incident",
    contact: "+63 923 444 5555",
    priority: "High",
    flaggedPlace: "Patao",
    time: "2026-05-24 14:10",
    status: "resolved",
    subject: "Paglapas sa Protektadong Marine Area",
    msg: "Nakita ang usa ka speedboat nga walay permiso misulod sa marine sanctuary duol sa Patao. Wala makita ang plaka.",
  },
  {
    id: 5,
    cat: "complaint",
    contact: "+63 935 777 8888",
    priority: "Low",
    flaggedPlace: "Guiwanon",
    time: "2026-05-23 16:00",
    status: "review",
    subject: "Walay Bantay Dagat sa among Barangay",
    msg: "Wala mi makakita og Bantay Dagat patrol sa among lugar sulod sa duha ka semana. Daghang iligal nga pagpangisda duol sa Guiwanon. Nangayo og prayoridad alang sa regular patrol.",
  },
  {
    id: 6,
    cat: "complaint",
    contact: "+63 906 321 6547",
    priority: "Low",
    flaggedPlace: "Sulangan",
    time: "2026-05-22 09:15",
    status: "resolved",
    subject: "Panaglalis sa Komersyal nga mga Sakayan",
    msg: "Nag-operate ang dagkong komersyal nga sakayan hapit sa among municipal fishing ground sa Sulangan, nagbalhin sa gamay nga mangingisda. Nangayo kami og dokumentasyon.",
  },
  {
    id: 7,
    cat: "info",
    contact: "+63 945 654 3210",
    priority: "Low",
    flaggedPlace: "Unknown",
    time: "2026-05-21 11:00",
    status: "resolved",
    subject: "Follow-up sa Rehistro sa Bangka BD-0077",
    msg: "Gusto nako mag-follow up sa status sa akong rehistro sa bangka BD-0077. Gisumite nako ang mga requirements sauna nga semana ug wala pa ko madawat nga kumpirmasyon.",
  },
  {
    id: 8,
    cat: "info",
    contact: "+63 956 888 9999",
    priority: "Low",
    flaggedPlace: "Unknown",
    time: "2026-05-20 13:30",
    status: "review",
    subject: "Hangyo sa Patrol Schedule sa Hunyo 2026",
    msg: "Maayong adlaw. Nangayo kami sa schedule sa Bantay Dagat patrol para sa Hunyo 2026 alang sa records sa barangay council. Gusto usab namo magkokoordinar para sa coastal clean-up.",
  },
];

// ════ SELECTORS ════
const dashboardShell = document.getElementById("dashboardShell");

// ════ METADATA ════
const CAT = {
  sos: {
    label: "SOS / Rescue",
    cls: "cat-sos",
    rowCls: "row-sos",
    bannerCls: "sos",
    icon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  },
  incident: {
    label: "Incident Report",
    cls: "cat-inc",
    rowCls: "row-inc",
    bannerCls: "inc",
    icon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  },
  complaint: {
    label: "Complaint",
    cls: "cat-cmp",
    rowCls: "row-cmp",
    bannerCls: "cmp",
    icon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  },
  info: {
    label: "Information",
    cls: "cat-inf",
    rowCls: "row-inf",
    bannerCls: "inf",
    icon: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  },
};
const STAT = {
  new: { cls: "dot-new", label: "New" },
  review: { cls: "dot-review", label: "Review" },
  resolved: { cls: "dot-resolved", label: "Resolved" },
  archived: { cls: "dot-archived", label: "Archived" },
};

// ════ STATE ════
let activeFilter = "all";
let activePriorityFilter = "all";
let activeStatusFilter = "all";
let page = 1;
const PER = 6;
let activeMsg = null;

// ════ UTILITIES ════
function showToast(message) {
  let toast = document.getElementById("feedbackToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "feedbackToast";
    toast.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
      font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.offsetHeight; // trigger reflow
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(-20px)";
  }, 2000);
}

function fmtDate(s, short) {
  const d = new Date(s);
  return short
    ? d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) +
        " " +
        d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
        " at " +
        d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

function filtered() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const res = DATA.filter((m) => {
    const mc = activeFilter === "all" || m.cat === activeFilter;
    const ms =
      activeStatusFilter === "all"
        ? m.status !== "archived"
        : m.status === activeStatusFilter;
    const mp =
      activePriorityFilter === "all" || m.priority === activePriorityFilter;
    const mq =
      !q ||
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.flaggedPlace && m.flaggedPlace.toLowerCase().includes(q)) ||
      (m.msg && m.msg.toLowerCase().includes(q)) ||
      (m.contact && m.contact.toLowerCase().includes(q));
    return mc && ms && mp && mq;
  });
  // Sort chronologically (newest first)
  res.sort((a, b) => new Date(b.time) - new Date(a.time));
  return res;
}

// ════ RENDER FUNCTIONS ════
function renderCounts() {
  document.getElementById("s-total").textContent = DATA.length;
  const nw = DATA.filter((m) => m.status === "new").length;
  const rev = DATA.filter((m) => m.status === "review").length;
  const res = DATA.filter(
    (m) => m.status === "resolved" || m.status === "archived",
  ).length;

  document.getElementById("s-new").textContent = nw;
  document.getElementById("s-review").textContent = rev;
  document.getElementById("s-resolved").textContent = res;
  document.getElementById("newBadge").textContent = nw + " New";

  ["all", "sos", "incident", "complaint", "info"].forEach((f) => {
    const el = document.getElementById("cc-" + f);
    if (el)
      el.textContent =
        f === "all" ? DATA.length : DATA.filter((m) => m.cat === f).length;
  });

  // Render status counts contextually based on selected Category filter
  ["all", "new", "review", "resolved", "archived"].forEach((sf) => {
    const el = document.getElementById("sc-" + sf);
    if (el) {
      const matchingCat = DATA.filter(
        (m) => activeFilter === "all" || m.cat === activeFilter,
      );
      el.textContent =
        sf === "all"
          ? matchingCat.length
          : matchingCat.filter((m) => m.status === sf).length;
    }
  });
}

function renderTable() {
  const rows = filtered();
  const total = rows.length;
  const start = (page - 1) * PER;
  const slice = rows.slice(start, start + PER);
  const tbody = document.getElementById("tbody");
  const empty = document.getElementById("emptyState");
  const totalPages = Math.ceil(total / PER) || 1;

  document.getElementById("recCount").textContent = total + " records";
  document.getElementById("pgInfo").textContent = total
    ? `Showing ${start + 1}–${Math.min(start + PER, total)} of ${total}`
    : "0 records";
  document.getElementById("pgNum").textContent = `Page ${page} / ${totalPages}`;
  document.getElementById("btnPrev").disabled = page === 1;
  document.getElementById("btnNext").disabled = page >= totalPages;
  document.getElementById("btnClear").style.display =
    activeFilter !== "all" ||
    activePriorityFilter !== "all" ||
    activeStatusFilter !== "all" ||
    document.getElementById("searchInput").value
      ? ""
      : "none";

  if (!slice.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = slice
    .map((m, i) => {
      const c = CAT[m.cat],
        s = STAT[m.status];
      const regTag = m.isRegistered
        ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: #fff; color: #000; border: 1px solid #000; border-radius: 12px; font-size: 11px; font-weight: 600; margin-top: 4px; white-space: nowrap;">
           <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Registered
         </span>`
        : `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: #fff; color: #000; border: 1px solid #000; border-radius: 12px; font-size: 11px; font-weight: 600; margin-top: 4px; white-space: nowrap;">
           <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Unregistered
         </span>`;

      const viewedSet = new Set(JSON.parse(localStorage.getItem('viewedMsgIds') || '[]'));
      const isActuallyNew = m.status === 'new' && !viewedSet.has(m.id);
      
      const fw = isActuallyNew ? 'font-weight: 800; color: #000000;' : 'font-weight: 500; color: #64748b;';
      const rowStyle = isActuallyNew ? 'background: #f8fafc;' : 'background: #ffffff;';

      return `<tr class="${c.rowCls}" style="animation-delay:${i * 40}ms; ${rowStyle}" onclick="openDetail(${m.id})">
      <td><span class="cat-badge" style="background:#e2e8f0;color:#0f172a;">${m.priority}</span></td>
      <td><span class="cat-badge ${c.cls}">${c.icon}&nbsp;${c.label}</span></td>
      <td><div class="sender-name" style="${fw}">${m.contact}<br>${regTag}</div><div class="sender-sub" style="margin-top: 6px; ${fw}">${m.flaggedPlace}</div></td>
      <td><div style="${fw} font-size: 15px;">${m.subject}</div><div class="msg-preview" style="${fw}">${m.msg}</div></td>
      <td><span class="status-dot" style="${fw}"><span class="dot ${s.cls}"></span>${s.label}</span></td>
      <td class="time-cell" style="${fw}">${fmtDate(m.time, true)}</td>
      <td style="text-align: right; padding-right: 20px; white-space: nowrap;">
        <button class="btn-view" onclick="event.stopPropagation();openDetail(${m.id})">View <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>
      </td>
    </tr>`;
    })
    .join("");
}

// 🔄 Auto-Refresh every 5 seconds
setInterval(loadFeedbackFromDb, 5000);

// ════ PAGINATION ════
function goPage(d) {
  const t = Math.ceil(filtered().length / PER) || 1;
  page = Math.max(1, Math.min(page + d, t));
  renderTable();
}

// ════ FILTER & SEARCH ════
function clearFilters() {
  activeFilter = "all";
  activePriorityFilter = "all";
  activeStatusFilter = "all";
  document.getElementById("searchInput").value = "";
  const typeDrop = document.getElementById("typeFilter");
  const prioDrop = document.getElementById("priorityFilter");
  const statusDrop = document.getElementById("statusFilter");
  if (typeDrop) typeDrop.value = "all";
  if (prioDrop) prioDrop.value = "all";
  if (statusDrop) statusDrop.value = "all";
  page = 1;
  renderTable();
  renderCounts();
}

function setupFilterHandlers() {
  // Type of Incident dropdown
  const typeDrop = document.getElementById("typeFilter");
  if (typeDrop) {
    typeDrop.addEventListener("change", function () {
      activeFilter = this.value;
      page = 1;
      renderTable();
      renderCounts();
    });
  }

  // Priority dropdown
  const prioDrop = document.getElementById("priorityFilter");
  if (prioDrop) {
    prioDrop.addEventListener("change", function () {
      activePriorityFilter = this.value;
      page = 1;
      renderTable();
    });
  }

  // Status dropdown
  const statusDrop = document.getElementById("statusFilter");
  if (statusDrop) {
    statusDrop.addEventListener("change", function () {
      activeStatusFilter = this.value;
      page = 1;
      renderTable();
      renderCounts();
    });
  }

  document.getElementById("searchInput").addEventListener("input", () => {
    page = 1;
    renderTable();
  });
}

window.filterByCard = function (statusVal) {
  activeStatusFilter = statusVal;
  const statusDrop = document.getElementById("statusFilter");
  if (statusDrop) statusDrop.value = statusVal;
  page = 1;
  renderTable();
  renderCounts();
};

// ════ EXPORT CSV ════
function csvCell(val) {
  return '"' + String(val == null ? "" : val).replace(/"/g, '""') + '"';
}
function exportFeedbackCSV() {
  const rows = filtered();
  if (rows.length === 0) {
    alert("No records to export.");
    return;
  }

  const headers = [
    "Report #",
    "Category / Type of Incident",
    "Status",
    "Date & Time Sent",
    "Contact Number",
    "Barangay",
    "Vessel / Boat",
    "Subject",
    "Full Message / Narrative",
  ];

  const csvRows = [headers.map((h) => csvCell(h)).join(",")];

  rows.forEach((m) => {
    const cat = CAT[m.cat] ? CAT[m.cat].label : m.cat;
    const stat = STAT[m.status] ? STAT[m.status].label : m.status;
    let dateStr = m.time || "";
    try {
      dateStr = new Date(m.time).toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {}
    const row = [
      m.id,
      csvCell(cat),
      csvCell(stat),
      csvCell(dateStr),
      csvCell(m.contact),
      csvCell(m.priority),
      csvCell(m.flaggedPlace),
      csvCell(m.subject),
      csvCell(m.msg),
    ];
    csvRows.push(row.join(","));
  });

  const now = new Date();
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute(
    "download",
    "BantayDagat_Feedback_" + now.toISOString().slice(0, 10) + ".csv",
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ════ DETAIL VIEW ════
function openDetail(id) {
  activeMsg = DATA.find((m) => m.id === id);
  if (!activeMsg) return;

  // Save to localStorage so we remember they looked at it, and re-render to fade the row!
  if (activeMsg.status === 'new') {
    let viewed = JSON.parse(localStorage.getItem('viewedMsgIds') || '[]');
    if (!viewed.includes(id)) {
      viewed.push(id);
      localStorage.setItem('viewedMsgIds', JSON.stringify(viewed));
      renderTable(); // Instantly turns it grey without changing db status
    }
  }

  const c = CAT[activeMsg.cat],
    s = STAT[activeMsg.status];

  document.getElementById("detailModal").classList.remove("hidden");

  let leftActions = "";
  let rightActions = "";

  // Official Blotter Form button is the hero action on the left
  leftActions += `
    <button onclick="closeDetail();openBlotter(${activeMsg.id})" class="btn-tb-primary" style="padding: 7px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #2563eb; border: 1px solid #2563eb; color: #ffffff; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 2px rgba(37,99,235,0.2); white-space: nowrap;" title="Open Official Bantay Dagat Blotter Form">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      View / Print Blotter Paper
    </button>`;

  if (window.UserRole !== "FisheriesAdmin") {
    // Reply SMS
    leftActions += `
      <button onclick="replyToReport(${activeMsg.id})" class="btn-tb-secondary" style="padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;" title="Reply to sender via SMS">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Reply SMS
      </button>`;

    if (activeMsg.status === "pending" || activeMsg.status === "new") {
      if (!activeMsg.isVerified && !activeMsg.isRegistered) {
        leftActions += `
          <button onclick="verifyReport(${activeMsg.id})" class="btn-tb-warning" style="padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #fffbeb; border: 1px solid #fcd34d; color: #b45309; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;" title="Verify report details by call">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Verify by Call
          </button>`;
      } else {
        leftActions += `
          <button onclick="setStatus(${activeMsg.id},'review')" class="btn-tb-secondary" style="padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;" title="Mark report as reviewed">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Mark as Reviewed
          </button>`;
      }
    }

    if (activeMsg.status === "review") {
      leftActions += `
        <button onclick="setStatus(${activeMsg.id},'archived')" class="btn-tb-success" style="padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;" title="Resolve and move to archive">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Resolve &amp; Archive
        </button>`;
    }

    // Right Actions (Moderation & Safety)
    if (activeMsg.status === "resolved" || activeMsg.status === "archived") {
      rightActions += `
        <button onclick="setStatus(${activeMsg.id}, 'new')" class="btn-tb-restore" style="padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #ffffff; border: 1px solid #10b981; color: #059669; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;" title="Restore report to inbox">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Restore
        </button>`;
    } else {
      rightActions += `
        <button onclick="setStatus(${activeMsg.id},'archived')" class="btn-tb-archive" style="padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;" title="Move report to archive">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          Archive
        </button>`;
    }

    // Block Sender button
    rightActions += `
      <button onclick="promptBlockSender('${activeMsg.contact}')" class="btn-tb-danger" style="padding: 7px 12px; border-radius: 8px; font-weight: 600; font-size: 13px; background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;" title="Block abusive contact">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        Block Sender
      </button>`;
  }

  const regTag = activeMsg.isRegistered
    ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: #fff; color: #000; border: 1px solid #000; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px;">
           <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Registered
         </span>`
    : `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: #fff; color: #000; border: 1px solid #000; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px;">
           <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Unregistered
         </span>`;

  document.getElementById("detailBody").innerHTML = `
    <div class="info-grid">
      <div class="info-card"><div class="info-l">Contact</div><div class="info-v">${activeMsg.contact}${regTag}</div></div>
      <div class="info-card"><div class="info-l">Priority Level</div><div class="info-v">${activeMsg.priority}</div></div>
      <div class="info-card"><div class="info-l">Flagged Place</div><div class="info-v">${activeMsg.flaggedPlace}</div></div>
      <div class="info-card"><div class="info-l">Date &amp; Time</div><div class="info-v">${fmtDate(activeMsg.time, false)}</div></div>
      <div class="info-card"><div class="info-l">Status</div><div class="info-v"><span class="status-dot"><span class="dot ${s.cls}"></span>${s.label}</span></div></div>
    </div>

    ${activeMsg.actionedByAdmin ? `<div class="info-card" style="margin-bottom: 15px; background: #f0f9ff; border: 1px solid #bae6fd; padding: 10px;"><div class="info-l" style="color: #0369a1;">Last Actioned By Admin</div><div class="info-v" style="font-weight: bold;">${activeMsg.actionedByAdmin}</div></div>` : ""}

    <div class="section-label">Full Message</div>
    <div class="msg-block">${activeMsg.msg}</div>

    <div class="action-bar-twozone" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <div class="action-bar-left" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
        ${leftActions}
      </div>
      ${rightActions ? `
        <div class="action-bar-right" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-left: auto;">
          <span class="action-bar-divider" style="display: inline-block; width: 1px; height: 26px; background-color: #e2e8f0; margin: 0 4px;"></span>
          ${rightActions}
        </div>
      ` : ""}
    </div>`;

  // Fetch related reports
  const alertContainer = document.getElementById("relatedReportsAlert");
  if (alertContainer) {
    alertContainer.innerHTML = "";
    fetch(`/api/feedback/${id}/related`)
      .then(r => r.ok ? r.json() : [])
      .then(related => {
        if (related && related.length > 0) {
          alertContainer.innerHTML = `
            <div style="margin: 15px 32px 0 32px; padding: 12px 16px; background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; color: #92400e; font-size: 13px;">
              <strong>⚠️ Potential Related Incident:</strong> There are ${related.length} other report(s) for <strong>${activeMsg.flaggedPlace}</strong> near this time.
              <div style="margin-top: 8px;">
                <button onclick="openGroupReview(${activeMsg.id})" style="padding: 6px 14px; background: #f59e0b; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: 600; font-size: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">Review as a Group</button>
              </div>
            </div>
          `;
        }
      })
      .catch(e => console.error("Error fetching related reports:", e));
  }
}

// Global functions so they can be triggered from inline onclick bindings
window.setStatus = setStatus;
window.closeDetail = closeDetail;
window.openBlotter = openBlotter;
window.closeBlotter = closeBlotter;
window.goPage = goPage;
window.clearFilters = clearFilters;

window.deleteReport = async function(id) {
  if (!confirm("Are you sure you want to PERMANENTLY DELETE this report? This cannot be undone.")) return;
  
  try {
    const res = await fetch("/api/feedback/" + id, { method: "DELETE" });
    if (res.ok) {
      showToast("Report permanently deleted.");
      closeDetail();
      loadFeedbackFromDb();
    } else {
      alert("Failed to delete the report.");
    }
  } catch (e) {
    alert("Error deleting report: " + e);
  }
};

window.verifyReport = function (id) {
  const m = DATA.find((x) => x.id === id);
  if (m) {
    m.isVerified = true;
    showToast("Report verified via phone call.");
    openDetail(id); // Re-render modal to show "Mark as Reviewed"
  }
};

window.activeSmsReportId = null;

window.replyToReport = function (id) {
  const m = DATA.find((x) => x.id === id);
  if (!m) return;
  window.activeSmsReportId = id;

  const modal = document.getElementById("smsReplyHistoryModal");
  if (!modal) return;

  const subtitle = document.getElementById("smsModalSubtitle");
  if (subtitle) {
    subtitle.innerHTML = `Recipient: <strong>${m.contact}</strong> (${m.sender || "Report Sender"}) &bull; Incident: <strong>#${m.id} - ${m.flaggedPlace}</strong>`;
  }

  const txt = document.getElementById("smsReplyText");
  if (txt) {
    txt.value = "Bantay Dagat: We received your report and are verifying the details. Stay safe.";
    updateSmsCharCount();
  }

  modal.classList.remove("hidden");
  loadSmsReplies(id);
  setTimeout(() => txt && txt.focus(), 150);
};

window.openSmsHistory = function (id) {
  window.replyToReport(id);
  const hist = document.getElementById("smsHistorySection");
  if (hist) {
    setTimeout(() => hist.scrollIntoView({ behavior: "smooth" }), 200);
  }
};

window.closeSmsModal = function () {
  const modal = document.getElementById("smsReplyHistoryModal");
  if (modal) modal.classList.add("hidden");
  window.activeSmsReportId = null;
};

window.insertSmsTemplate = function (key) {
  const txt = document.getElementById("smsReplyText");
  if (!txt) return;

  if (key === "acknowledged") {
    txt.value = "Bantay Dagat: Your report has been acknowledged. A maritime patrol team has been alerted.";
  } else if (key === "investigating") {
    txt.value = "Bantay Dagat: We are currently investigating your report in the area. Please stand by.";
  } else if (key === "resolved") {
    txt.value = "Bantay Dagat: Thank you for your vigilance. Action has been taken and the incident is resolved.";
  }
  updateSmsCharCount();
  txt.focus();
};

function updateSmsCharCount() {
  const txt = document.getElementById("smsReplyText");
  const countEl = document.getElementById("smsCharCount");
  if (txt && countEl) {
    const len = txt.value.length;
    countEl.innerText = `${len} / 160`;
    countEl.style.color = len >= 150 ? "#ef4444" : "#64748b";
  }
}

// Bind live counter once DOM is loaded or input events occur
document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "smsReplyText") {
    updateSmsCharCount();
  }
});

window.loadSmsReplies = async function (id) {
  const listEl = document.getElementById("smsHistoryList");
  const badgeEl = document.getElementById("smsHistoryCountBadge");
  if (!listEl) return;

  listEl.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 13px; padding: 15px;">Loading message history...</div>';

  try {
    const res = await fetch(`/api/feedback/${id}/replies`);
    if (!res.ok) throw new Error("Failed to load replies");
    const replies = await res.json();

    if (badgeEl) {
      badgeEl.innerText = `${replies.length} Sent`;
    }

    if (!replies || replies.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: #94a3b8; font-size: 13px; padding: 24px; background: #fff; border: 1px dashed #cbd5e1; border-radius: 8px;">
          No SMS replies sent yet for this report.
        </div>`;
      return;
    }

    listEl.innerHTML = replies
      .map(
        (r) => `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 700; font-size: 12px; color: #1e293b;">${r.sentBy || "Admin"}</span>
              <span style="font-size: 10px; font-weight: 600; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 10px; padding: 1px 7px;">SENT</span>
            </div>
            <span style="font-size: 11px; color: #64748b;">${r.sentAt || ""}</span>
          </div>
          <div style="font-size: 13px; color: #334155; line-height: 1.5; background: #f8fafc; border-left: 3px solid #2563eb; padding: 8px 12px; border-radius: 4px;">
            ${r.message}
          </div>
        </div>
      `,
      )
      .join("");
  } catch (e) {
    console.error("Error loading replies:", e);
    listEl.innerHTML = '<div style="text-align: center; color: #ef4444; font-size: 13px; padding: 15px;">Failed to load history.</div>';
  }
};

window.submitSmsReply = async function () {
  if (!window.activeSmsReportId) return;

  const txt = document.getElementById("smsReplyText");
  const msg = txt ? txt.value.trim() : "";
  if (!msg) {
    alert("Please enter a reply message.");
    return;
  }

  const btn = document.getElementById("btnSendSmsReply");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Sending...";
  }

  try {
    const res = await fetch(`/api/feedback/${window.activeSmsReportId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    if (!res.ok) throw new Error("Failed to send reply");

    showToast("SMS reply sent & logged to history.");
    if (txt) {
      txt.value = "";
      updateSmsCharCount();
    }
    loadSmsReplies(window.activeSmsReportId);
  } catch (err) {
    console.error("Error sending SMS reply:", err);
    alert("Error sending SMS reply. Please check connection.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Send SMS`;
    }
  }
};

window.allGlobalSmsReplies = [];

window.openGlobalSmsHistoryModal = function () {
  const modal = document.getElementById("globalSmsHistoryModal");
  if (modal) {
    modal.classList.remove("hidden");
    loadGlobalSmsHistory();
    const search = document.getElementById("globalSmsSearchInput");
    if (search) search.value = "";
  }
};

window.closeGlobalSmsHistoryModal = function () {
  const modal = document.getElementById("globalSmsHistoryModal");
  if (modal) modal.classList.add("hidden");
};

window.loadGlobalSmsHistory = async function () {
  const listEl = document.getElementById("globalSmsHistoryList");
  const badgeEl = document.getElementById("globalSmsHistoryCountBadge");
  if (!listEl) return;

  listEl.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 13px; padding: 25px;">Loading SMS reply history...</div>';

  try {
    const res = await fetch("/api/feedback/replies/all");
    if (!res.ok) throw new Error("Failed to load replies");
    window.allGlobalSmsReplies = await res.json();

    if (badgeEl) {
      badgeEl.innerText = `${window.allGlobalSmsReplies.length} Messages`;
    }

    renderGlobalSmsList(window.allGlobalSmsReplies);
  } catch (err) {
    console.error("Error loading global SMS history:", err);
    listEl.innerHTML = '<div style="text-align: center; color: #ef4444; font-size: 13px; padding: 25px;">Failed to load history. Please try again.</div>';
  }
};

window.filterGlobalSmsHistory = function () {
  const input = document.getElementById("globalSmsSearchInput");
  const query = input ? input.value.trim().toLowerCase() : "";

  if (!query) {
    renderGlobalSmsList(window.allGlobalSmsReplies);
    return;
  }

  const filtered = window.allGlobalSmsReplies.filter((r) => {
    return (
      (r.recipient && r.recipient.toLowerCase().includes(query)) ||
      (r.message && r.message.toLowerCase().includes(query)) ||
      (r.sentBy && r.sentBy.toLowerCase().includes(query)) ||
      (r.sentAt && r.sentAt.toLowerCase().includes(query)) ||
      (r.feedbackId && ("#" + r.feedbackId).includes(query))
    );
  });

  renderGlobalSmsList(filtered);
};

window.renderGlobalSmsList = function (list) {
  const listEl = document.getElementById("globalSmsHistoryList");
  const badgeEl = document.getElementById("globalSmsHistoryCountBadge");
  if (!listEl) return;

  if (badgeEl && list) {
    badgeEl.innerText = `${list.length} Messages`;
  }

  if (!list || list.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; color: #94a3b8; font-size: 13px; padding: 30px; background: #fff; border: 1px dashed #cbd5e1; border-radius: 8px;">
        No sent SMS replies found.
      </div>`;
    return;
  }

  listEl.innerHTML = list
    .map(
      (r) => `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; font-size: 13px; color: #0f172a; display: inline-flex; align-items: center; gap: 4px;">
              <svg width="13" height="13" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              ${r.recipient}
            </span>
            <span style="font-size: 11px; font-weight: 600; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 10px; padding: 1px 8px;">Report #${r.feedbackId}</span>
            <span style="font-size: 11px; font-weight: 600; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 10px; padding: 1px 8px;">SENT</span>
          </div>
          <div style="font-size: 12px; color: #64748b;">
            <span>By <strong>${r.sentBy || "Admin"}</strong> &bull; ${r.sentAt || ""}</span>
          </div>
        </div>
        <div style="font-size: 13px; color: #1e293b; line-height: 1.5; background: #f8fafc; border-left: 3px solid #2563eb; padding: 10px 14px; border-radius: 4px;">
          ${r.message}
        </div>
      </div>
    `,
    )
    .join("");
};

window.currentGroupIds = [];

window.openGroupReview = async function (id) {
    try {
      const baseRes = await fetch(`/api/feedback/${id}`);
      if (!baseRes.ok) throw new Error("Failed to load base report");
      const baseReport = await baseRes.json();

      const relRes = await fetch(`/api/feedback/${id}/related`);
      const relatedReports = relRes.ok ? await relRes.json() : [];

      const mappedRelated = relatedReports.map(r => ({
          ...r,
          dateSent: r.time ? r.time.replace(" ", "T") : r.dateSent,
          content: r.msg || r.content
      }));

      const group = [baseReport, ...mappedRelated];
      window.currentGroupIds = group.map(g => g.id);
      window.primaryGroupId = id;
      renderGroupModal(group);
    } catch (e) {
      console.error("Error opening group review:", e);
      alert("Failed to load group review.");
    }
  };

  function renderGroupModal(group) {
    const container = document.getElementById("groupContainer");
    if (!container) return;

    container.innerHTML = group
      .map(
        (report) => `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                <span style="font-weight: 700; font-size: 14px; color: #0f172a;">${report.contact}</span>
                <span style="font-size: 12px; color: #64748b;">${new Date(report.dateSent).toLocaleString()}</span>
            </div>
            <div style="font-size: 13px; color: #334155; flex-grow: 1; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.5;">
                ${report.content}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 600; padding: 4px 8px; background: #e0f2fe; color: #0284c7; border-radius: 4px;">Status: ${report.status || "new"}</span>
                <span style="font-size: 11px; font-weight: 600; padding: 4px 8px; background: #fef3c7; color: #d97706; border-radius: 4px;">Priority: ${report.priority || "Normal"}</span>
            </div>
            <div style="text-align: center;">
                <button onclick="closeGroupModal(); openDetail(${report.id})" style="width: 100%; padding: 8px; background: white; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s hover:bg-gray-50;">Focus this Report</button>
            </div>
        </div>
    `
      )
      .join("");

    document.getElementById("groupReviewModal").classList.remove("hidden");
  }

  window.closeGroupModal = function () {
    const modal = document.getElementById("groupReviewModal");
    if (modal) modal.classList.add("hidden");
  };

function closeDetail() {
  document.getElementById("detailModal").classList.add("hidden");
}

async function setStatus(id, val) {
  const m = DATA.find((x) => x.id === id);
  if (m) {
    if (val === "resolved") val = "archived";

    m.status = val;
    // Persist to the database via the API
    try {
      const res = await fetch("/api/feedback/" + id + "/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: val }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.actionedByAdmin) m.actionedByAdmin = data.actionedByAdmin;
      }
    } catch (e) {
      /* fail silently, UI already updated */
    }
    openDetail(id);
    renderCounts();
    renderTable();
    let statusMsg = "Status updated to Resolved!";
    if (val === "review") statusMsg = "Status updated to Reviewed!";
    if (val === "new") statusMsg = "Report successfully restored to active list!";
    if (val === "archived")
      statusMsg = "Report successfully resolved and moved to Archive!";
    showToast(statusMsg);
  }
}

async function openBlotter(id) {
  let m = (typeof DATA !== "undefined" && Array.isArray(DATA)) ? DATA.find((x) => String(x.id) === String(id)) : null;
  
  if (!m) {
    try {
      const res = await fetch(`/api/feedback/${id}`);
      if (res.ok) {
        const item = await res.json();
        m = {
          id: item.id,
          contact: item.contact,
          msg: item.content,
          time: item.dateSent,
          status: item.status,
          priority: item.priority,
          flaggedPlace: item.flaggedPlace,
          cat: "incident"
        };
      }
    } catch (e) {
      console.error("Error fetching report for blotter:", e);
    }
  }

  if (!m) {
    alert("Could not load report details for Blotter Form #" + id);
    return;
  }

  m.hasBlotter = true; // Mark blotter as generated for the workflow sequence
  activeMsg = m;
  const draftKey = "blotter_draft_" + m.id;

  const blotterBody = document.getElementById("blotterBody");
  const btnReset = document.getElementById("btnResetBlotter");
  const overlay = document.getElementById("blotterOverlay");
  const msgEl = document.getElementById("feedbackBlotterSaveMsg");

  if (!blotterBody || !overlay) {
    console.error("Blotter modal DOM elements not found!");
    return;
  }

  if (msgEl) {
    msgEl.style.display = "none";
    msgEl.textContent = "";
  }

  const btnDone = document.getElementById("btnSaveBlotterDoneFeedback");
  if (btnDone) {
    btnDone.disabled = false;
    btnDone.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Save & Mark as Done`;
    btnDone.style.background = "#16a34a";
  }

  // 1. Try to fetch existing blotter paper from server by feedbackId
  let loadedFromServer = false;
  try {
    const res = await fetch(`/BlotterReport/GetPaperContent?feedbackId=${m.id}`);
    const data = await res.json();
    if (data && data.success && data.html) {
      blotterBody.innerHTML = data.html;
      if (data.incidentId) {
        window.currentFeedbackBlotterId = data.incidentId;
        window.currentFeedbackBlotterData = { id: data.incidentId, source: "SMS Report (" + (m.contact || "Unknown") + ")" };
      }
      loadedFromServer = true;
    }
  } catch (e) {
    console.warn("Could not fetch server blotter paper for feedback message:", e);
  }

  const savedDraft = localStorage.getItem(draftKey);

  if (!loadedFromServer && savedDraft) {
    blotterBody.innerHTML = savedDraft;
    if (btnReset) btnReset.style.display = "inline-block";
  } else if (!loadedFromServer) {
    if (btnReset) btnReset.style.display = "none";
    
    const bNoShort = String(m.id).padStart(2, "0");
    const dateObj = new Date(m.time);
    const timeStr = isNaN(dateObj.getTime())
      ? "03:00 PM"
      : dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
    const dateStr = isNaN(dateObj.getTime())
      ? "April 08, 2026"
      : dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    blotterBody.innerHTML = `
    <div class="blotter-gov" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
      <!-- Left Logo: Bayan ng Bantayan -->
      <div class="blotter-logo" style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
        <img src="/logo-bantayan.jpg" alt="Bayan ng Bantayan Logo" style="width: 65px; height: 65px; object-fit: contain;">
      </div>

      <div style="text-align: center; flex: 1; font-family: 'Times New Roman', Times, serif; line-height: 1.3;">
        <div contenteditable="true" style="font-size: 14px; font-weight: 500; outline: none;">Republic of the Philippines</div>
        <div contenteditable="true" style="font-size: 14px; font-weight: 500; outline: none;">Province of Cebu</div>
        <div contenteditable="true" style="font-size: 15px; font-weight: 700; text-transform: uppercase; outline: none;">Municipality of Bantayan</div>
        <div contenteditable="true" style="font-size: 14px; font-weight: 600; color: #1e293b; outline: none;">Municipal Agriculturist Office</div>
        <div contenteditable="true" style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; outline: none;">Bantay Dagat Headquarters</div>
        <div contenteditable="true" style="font-size: 12px; color: #475569; outline: none;">Brgy. Suba, Bantayan, Cebu</div>
      </div>

      <!-- Right Logo: Bantay Dagat -->
      <div class="blotter-logo" style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
        <img src="/logo-bantaydagat.jpg" alt="Bantay Dagat Logo" style="width: 65px; height: 65px; object-fit: contain;">
      </div>
    </div>

    <!-- Date printed on the right -->
    <div style="text-align: right; font-weight: bold; margin-bottom: 20px; font-size: 14px; font-family: 'Times New Roman', Times, serif; outline: none;" contenteditable="true">
      ${dateStr}
    </div>

    <!-- File details table block -->
    <div class="blotter-meta-grid" style="display: grid; grid-template-columns: 140px 20px 1fr; row-gap: 8px; margin-bottom: 15px; font-size: 14px; font-family: 'Times New Roman', Times, serif; line-height: 1.4;">
      <div contenteditable="true" style="font-weight: 500; outline: none;">File no.</div><div contenteditable="true" style="outline: none;">:</div><div contenteditable="true" style="font-weight: bold; outline: none;">${bNoShort}</div>
      <div contenteditable="true" style="font-weight: 500; outline: none;">Subject</div><div contenteditable="true" style="outline: none;">:</div><div contenteditable="true" style="outline: none;">Excerpt from the Municipal Bantay Dagat Blotter Report</div>
      <div contenteditable="true" style="font-weight: 500; outline: none;">Nature of Case</div><div contenteditable="true" style="outline: none;">:</div><div contenteditable="true" style="outline: none;">Resolution #33 Ordinance #02 Series of 2020 Section 37 Article 8</div>
    </div>

    <!-- Black solid line divider -->
    <div style="border-top: 2px solid #000; margin-bottom: 20px;"></div>

    <!-- Grid info (Occurrence and Suspect) -->
    <div class="occurrence-grid" style="display: grid; grid-template-columns: 180px 1fr; gap: 16px; margin-bottom: 20px; font-size: 14px; font-family: 'Times New Roman', Times, serif; line-height: 1.5; text-align: justify;">
      <div contenteditable="true" style="font-weight: bold; outline: none;">Time/Date/Place<br>Of Occurrence</div>
      <div contenteditable="true" style="outline: none;">--At about ${timeStr} of ${dateStr} at the vicinity municipal waters off ${m.flaggedPlace || "Bantayan"}, Cebu.</div>
      
      <div contenteditable="true" style="font-weight: bold; outline: none;">Report Source / Apprehended By</div>
      <div contenteditable="true" style="outline: none;">--Bantay Dagat Patrol (SMS Report from ${m.contact || "Unknown"})</div>
    </div>

    <!-- Facts section -->
    <div contenteditable="true" style="font-weight: bold; font-size: 14px; margin-bottom: 8px; font-family: 'Times New Roman', Times, serif; outline: none;">Facts & Actions Taken -</div>
    <div class="narrative" id="blotterNarrativeText" contenteditable="true" style="outline: none; font-size: 14px; font-family: 'Times New Roman', Times, serif; line-height: 1.6; min-height: 180px; margin-bottom: 40px; text-align: justify; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 4px; background: #f8fafc;">
      ${m.msg || ""}
      <br><br>
      --[Case Facts & Apprehension Summary]--<br>
      (Explain the incident details here: State how the violator was apprehended, unauthorized gears/documents used, and any registered/unregistered violations from the municipality.)
      <br><br>
      --[Confiscated Assets & Properties]--<br>
      A. (1) One [motorized banca / vessel type] named "[Vessel Name]" owned by [Owner Name], powered by [Engine Details, e.g. YAMA 16HP], using [Fishing Gear/Trap type] with [Catch details, e.g. 10kls assorted fish] estimated value of Php [Value].
      <br><br>
      --[Outcome & Disposition]--<br>
      Case logged under official municipal maritime enforcement records.
    </div>

    <!-- Signatures -->
    <div class="sig-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 14px; font-family: 'Times New Roman', Times, serif; margin-top: 50px;">
      <div>
        <div contenteditable="true" style="margin-bottom: 35px; outline: none;">Blotter by:</div>
        <div contenteditable="true" style="font-weight: bold; text-decoration: underline; outline: none; display: inline-block; min-width: 150px;">Julius L. Ejes</div>
        <div contenteditable="true" style="font-size: 12px; color: #475569; outline: none; margin-top: 4px;">Deputy Officer</div>
      </div>
      <div>
        <div contenteditable="true" style="margin-bottom: 35px; outline: none;">Noted by:</div>
        <div contenteditable="true" style="font-weight: bold; text-decoration: underline; outline: none; display: inline-block; min-width: 150px;">Niven G. Pestaño</div>
        <div contenteditable="true" style="font-size: 12px; color: #475569; outline: none; margin-top: 4px;">Bantay Dagat Officer</div>
      </div>
    </div>`;
  }

  // Attach event listener to save draft on edit
  blotterBody.oninput = function () {
    if (activeMsg) {
      localStorage.setItem(draftKey, this.innerHTML);
    }
    if (btnReset) btnReset.style.display = "inline-block";
  };

  overlay.style.display = "flex";
  overlay.classList.add("open");
}

function closeBlotter() {
  window.currentFeedbackBlotterId = null;
  window.currentFeedbackBlotterData = null;
  const overlay = document.getElementById("blotterOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
}

window.saveBlotterAndMarkDone = async function () {
  const btnDone = document.getElementById("btnSaveBlotterDoneFeedback");
  const msgEl = document.getElementById("feedbackBlotterSaveMsg");

  if (btnDone) {
    btnDone.disabled = true;
    btnDone.textContent = "Saving...";
  }

  const blotterBody = document.getElementById("blotterBody");
  const fullPaperHtml = blotterBody ? blotterBody.innerHTML : "";
  const narrativeEl = blotterBody ? (blotterBody.querySelector(".narrative") || blotterBody.querySelector("#blotterNarrativeText")) : null;
  const actionsText = narrativeEl ? narrativeEl.innerText.trim() : "";

  let payload = {
    status: "Done",
    outcome: "Resolved / Done",
    actionsTaken: actionsText,
    paperHtml: fullPaperHtml
  };

  if (window.currentFeedbackBlotterId) {
    payload.incidentId = window.currentFeedbackBlotterId;
    if (window.currentFeedbackBlotterData) {
      payload.incidentType = window.currentFeedbackBlotterData.type;
      payload.location = window.currentFeedbackBlotterData.location;
      payload.reportSource = window.currentFeedbackBlotterData.source;
      if (window.currentFeedbackBlotterData.relatedFeedbackId) {
        payload.relatedReportSubmissionId = window.currentFeedbackBlotterData.relatedFeedbackId;
      }
    }
  } else if (activeMsg) {
    payload.relatedReportSubmissionId = activeMsg.id;
    payload.incidentType = "Marine Incident";
    payload.location = activeMsg.flaggedPlace || "Bantayan Municipal Waters";
    payload.reportSource = "SMS Report (" + (activeMsg.contact || "Unknown") + ")";
  }

  try {
    const res = await fetch("/BlotterReport/SavePaper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      if (data.incidentId) {
        window.currentFeedbackBlotterId = data.incidentId;
      }
      if (activeMsg) {
        const draftKey = "blotter_draft_" + activeMsg.id;
        localStorage.removeItem(draftKey);
        activeMsg.status = "resolved";
        if (typeof renderTable === "function") renderTable();
        if (typeof renderCounts === "function") renderCounts();
      }

      if (msgEl) {
        msgEl.textContent = "✓ Blotter saved and marked as Done!";
        msgEl.style.display = "inline";
      }
      if (typeof showToast === "function") {
        showToast("✓ Blotter saved and marked as Done!");
      }

      if (btnDone) {
        btnDone.innerHTML = `✓ Done & Saved`;
        btnDone.style.background = '#059669';
      }

      setTimeout(() => {
        closeBlotter();
        window.location.reload();
      }, 700);
    } else {
      alert(data.message || "Error saving blotter.");
      if (btnDone) {
        btnDone.disabled = false;
        btnDone.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Save & Mark as Done`;
      }
    }
  } catch (e) {
    console.error("Error saving blotter:", e);
    alert("Failed to save blotter.");
    if (btnDone) {
      btnDone.disabled = false;
      btnDone.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Save & Mark as Done`;
    }
  }
};

window.resetBlotter = function () {
  if (activeMsg) {
    const draftKey = "blotter_draft_" + activeMsg.id;
    if (
      confirm(
        "Are you sure you want to discard your edits and reset to the default blotter template?",
      )
    ) {
      localStorage.removeItem(draftKey);
      openBlotter(activeMsg.id);
    }
  }
};

// ════ INIT ════
function displayCurrentDate() {
  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const el = document.getElementById("currentDateDisplay");
  if (el) {
    el.textContent = today.toLocaleDateString("en-US", options);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupFilterHandlers();

  document.getElementById("blotterOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("blotterOverlay")) closeBlotter();
  });

  document
    .getElementById("detailModalOverlay")
    .addEventListener("click", closeDetail);
  document
    .getElementById("detailModalCloseButton")
    .addEventListener("click", closeDetail);

  // Close dropdown when clicking outside
  window.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown-wrapper")) {
      document
        .querySelectorAll(".dropdown-content.show")
        .forEach((el) => el.classList.remove("show"));
    }
  });

  displayCurrentDate();
  // Load all feedback from the database
  loadFeedbackFromDb();
});

// ════ DB SYNC ════
async function loadFeedbackFromDb() {
  try {
    const res = await fetch("/api/feedback");
    if (!res.ok) throw new Error("API error");
    const dbData = await res.json();
    
    // Clean up flaggedPlace to ensure it's strictly a valid barangay name
    // and fix old subjects if the person registered AFTER sending the SMS
    dbData.forEach(item => {
        if (item.flaggedPlace) {
            let p = item.flaggedPlace.toLowerCase();
            if (p.includes("sulangan")) item.flaggedPlace = "Sulangan";
            else if (p.includes("patao")) item.flaggedPlace = "Patao";
            else if (p.includes("guiwanon")) item.flaggedPlace = "Guiwanon";
        }
        
        if (item.isRegistered && item.subject && item.subject.includes("Unregistered Sender")) {
            item.subject = "SMS Report from Registered Sender";
        }
    });

    DATA = dbData;
    renderCounts();
    renderTable();

    // Auto-archive logic
    let modified = false;
    const now = new Date();
    const twoMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      now.getDate(),
    );

    for (let i = 0; i < DATA.length; i++) {
      let item = DATA[i];
      if (item.status === "archived") continue;

      let itemDate = new Date(item.time);
      if (isNaN(itemDate.getTime())) continue;

      let shouldArchive = false;
      if (item.status === "resolved") {
        shouldArchive = true;
      } else if (item.status !== "resolved" && itemDate < twoMonthsAgo) {
        shouldArchive = true;
      }

      if (shouldArchive) {
        item.status = "archived";
        modified = true;
        try {
          await fetch("/api/feedback/" + item.id + "/status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "archived" }),
          });
        } catch (e) {}
      }
    }

    if (modified) {
      renderCounts();
      renderTable();
    }
  } catch (e) {
    // If API is unreachable, fall back to the built-in sample data
    console.warn("Feedback API unavailable, using local DATA:", e);
    renderCounts();
    renderTable();
  }
}

window.openBlockedNumbersModal = function () {
  document.getElementById("blockedNumbersModal").classList.remove("hidden");
  loadBlockedNumbers();
};
window.closeBlockedNumbersModal = function () {
  document.getElementById("blockedNumbersModal").classList.add("hidden");
};

async function loadBlockedNumbers() {
  const tbody = document.getElementById("blockedNumbersTableBody");
  const empty = document.getElementById("blockedNumbersEmpty");
  tbody.innerHTML =
    '<tr><td colspan="4" style="text-align: center; padding: 20px;">Loading...</td></tr>';

  try {
    const res = await fetch("/api/feedback/blocked");
    const data = await res.json();

    if (data.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
      tbody.innerHTML = data
        .map((b) => {
          const blockedUntilStr = b.blockedUntil
            ? new Date(b.blockedUntil).toLocaleDateString()
            : "Permanent";
          return `<tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${b.phoneNumber}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #475569;">${b.reason || "-"}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${blockedUntilStr}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">
                        <button onclick="unblockNumber('${b.phoneNumber}')" style="background: #e2e8f0; border: none; padding: 4px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; color: #0f172a; font-weight: 600;">Unblock</button>
                    </td>
                </tr>`;
        })
        .join("");
    }
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; padding: 20px; color: red;">Failed to load.</td></tr>';
  }
}

window.promptBlockSender = async function (phoneNumber) {
  const duration = prompt(
    "Block duration in days (Leave empty or 0 for permanent block):",
    "7",
  );
  if (duration === null) return; // Cancelled

  const reason = prompt("Reason for blocking:");
  if (reason === null) return; // Cancelled

  let durationDays = parseInt(duration);
  if (isNaN(durationDays) || durationDays <= 0) {
    durationDays = null;
  }

  try {
    const res = await fetch("/api/feedback/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        durationDays: durationDays,
        reason: reason,
      }),
    });

    if (res.ok) {
      showToast("Sender blocked successfully.");
      closeDetail();
    } else {
      alert("Failed to block sender.");
    }
  } catch (e) {
    alert("Error blocking sender.");
  }
};

window.unblockNumber = async function (phoneNumber) {
  if (!confirm("Are you sure you want to unblock " + phoneNumber + "?")) return;
  try {
    const res = await fetch("/api/feedback/unblock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phoneNumber }),
    });
    if (res.ok) {
      showToast("Number unblocked.");
      loadBlockedNumbers();
    } else {
      alert("Failed to unblock.");
    }
  } catch (e) {
    alert("Error unblocking number.");
  }
};
window.mergeGroup = async function() {
    if (!window.currentGroupIds || window.currentGroupIds.length <= 1) {
        alert("Not enough reports to merge.");
        return;
    }
    
    if (!confirm("Are you sure you want to merge " + (window.currentGroupIds.length - 1) + " report(s) into this primary report?")) return;

    try {
        const res = await fetch('/api/feedback/' + window.primaryGroupId + '/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.currentGroupIds)
        });

        if (res.ok) {
            showToast("Group merged successfully!");
            closeGroupModal();
            closeDetail();
            loadFeedbackFromDb();
        } else {
            alert("Failed to merge group.");
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred while merging the group.");
    }
};
