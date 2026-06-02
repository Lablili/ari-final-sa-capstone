// ════ DATA ════
const DATA = [
  { id:1, cat:'sos',      sender:'Juan dela Cruz',      contact:'+63 912 345 6789', brgy:'Brgy. Basak',        vessel:'Bangka #BD-0042', time:'2026-05-25 06:14', status:'new',      subject:'Engine Failure at Sea – Mayday',             msg:'Mayday! Engine failure. We are approximately 3 nautical miles northeast of Basak. 4 crew on board, no injuries. Please send rescue immediately. Vessel drifting northwest.' },
  { id:2, cat:'sos',      sender:'Roberto Mancao',      contact:'+63 918 876 5432', brgy:'Brgy. Looc',         vessel:'Bangka #BD-0098', time:'2026-05-24 21:45', status:'review',   subject:'Rescue Request – Capsized Boat',              msg:'Our boat capsized near Looc shoreline. 2 fishermen clinging to the hull. Urgent rescue needed. Location near the red buoy marker.' },
  { id:3, cat:'incident', sender:'Pedro Santos',         contact:'+63 917 111 2222', brgy:'Brgy. Punta Engaño', vessel:'Bangka #BD-0011', time:'2026-05-25 08:30', status:'new',      subject:'Illegal Fishing – Use of Dynamite',           msg:'We witnessed a large motorized banca using dynamite fishing near the coral reef area off Punta Engaño at around 8:00 AM. Vessel has no markings and fled westward.' },
  { id:4, cat:'incident', sender:'Maria Flores',         contact:'+63 923 444 5555', brgy:'Brgy. Tungasan',     vessel:'N/A',             time:'2026-05-24 14:10', status:'resolved', subject:'Trespassing in Protected Marine Area',        msg:'A foreign-flagged speedboat was observed entering the marine sanctuary near Tungasan without permits. Plate or registration not visible.' },
  { id:5, cat:'complaint',sender:'Lito Buenaventura',    contact:'+63 935 777 8888', brgy:'Brgy. Calape',       vessel:'Bangka #BD-0055', time:'2026-05-23 16:00', status:'review',   subject:'No Patrol Presence in Our Barangay',         msg:'We have not seen any Bantay Dagat patrol in our area for two weeks. Illegal fishing is rampant near Calape. Requesting prioritization for regular patrol.' },
  { id:6, cat:'complaint',sender:'Anita Reyes',          contact:'+63 906 321 6547', brgy:'Brgy. Bontoc',       vessel:'N/A',             time:'2026-05-22 09:15', status:'resolved', subject:'Conflict with Commercial Vessels',            msg:'Large commercial vessels are operating too close to our municipal fishing ground boundary in Bontoc, displacing small-scale fisherfolk. Requesting documentation.' },
  { id:7, cat:'info',     sender:'Carlos Tan',           contact:'+63 945 654 3210', brgy:'Brgy. Tubod',        vessel:'Bangka #BD-0077', time:'2026-05-21 11:00', status:'resolved', subject:'Follow-up on Vessel Registration BD-0077',   msg:'I would like to follow up on the status of my vessel registration BD-0077. I submitted the requirements last week and have not received any confirmation yet.' },
  { id:8, cat:'info',     sender:'Emilio Ramos',         contact:'+63 956 888 9999', brgy:'Brgy. Alegria',      vessel:'N/A',             time:'2026-05-20 13:30', status:'review',   subject:'Request for June 2026 Patrol Schedule',      msg:'Good day. We are requesting the Bantay Dagat patrol schedule for June 2026 for our barangay council records. We would also like to coordinate for a coastal clean-up activity.' },
];

// ════ AUTH CONSTANTS ════
const PASSWORD = "bantay";
const STORAGE_KEY = "bantay-dagat-authenticated";

// ════ SELECTORS ════
const loginScreen = document.getElementById("loginScreen");
const dashboardShell = document.getElementById("dashboardShell");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const logoutButton = document.getElementById("logoutButton");

// ════ METADATA ════
const CAT = {
  sos:      { label:'SOS / Rescue',    cls:'cat-sos', rowCls:'row-sos', bannerCls:'sos', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
  incident: { label:'Incident Report', cls:'cat-inc', rowCls:'row-inc', bannerCls:'inc', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
  complaint:{ label:'Complaint',       cls:'cat-cmp', rowCls:'row-cmp', bannerCls:'cmp', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  info:     { label:'General Info',    cls:'cat-inf', rowCls:'row-inf', bannerCls:'inf', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' },
};
const STAT = {
  new:      { cls:'dot-new',      label:'New' },
  review:   { cls:'dot-review',   label:'In Review' },
  resolved: { cls:'dot-resolved', label:'Resolved' },
};

// ════ STATE ════
let activeFilter = 'all';
let page = 1;
const PER = 6;
let activeMsg = null;

// ════ UTILITIES ════
function fmtDate(s, short) {
  const d = new Date(s);
  return short
    ? d.toLocaleDateString('en-PH',{month:'short',day:'numeric'}) + ' ' + d.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})
    : d.toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'}) + ' at ' + d.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'});
}

function filtered() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  return DATA.filter(m => {
    const mc = activeFilter === 'all' || m.cat === activeFilter;
    const mq = !q || m.sender.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.brgy.toLowerCase().includes(q);
    return mc && mq;
  });
}

// ════ RENDER FUNCTIONS ════
function renderCounts() {
  document.getElementById('s-total').textContent = DATA.length;
  document.getElementById('s-sos').textContent   = DATA.filter(m=>m.cat==='sos').length;
  document.getElementById('s-inc').textContent   = DATA.filter(m=>m.cat==='incident').length;
  const nw = DATA.filter(m=>m.status==='new').length;
  document.getElementById('s-new').textContent   = nw;
  document.getElementById('newBadge').textContent = nw + ' New';

  ['all','sos','incident','complaint','info'].forEach(f => {
    const el = document.getElementById('cc-'+f);
    if (el) el.textContent = f==='all' ? DATA.length : DATA.filter(m=>m.cat===f).length;
  });
}

function renderTable() {
  const rows = filtered();
  const total = rows.length;
  const start = (page-1)*PER;
  const slice = rows.slice(start, start+PER);
  const tbody = document.getElementById('tbody');
  const empty = document.getElementById('emptyState');
  const totalPages = Math.ceil(total/PER)||1;

  document.getElementById('recCount').textContent = total + ' record' + (total!==1?'s':'');
  document.getElementById('pgInfo').textContent = total ? `Showing ${start+1}–${Math.min(start+PER,total)} of ${total}` : '0 records';
  document.getElementById('pgNum').textContent  = `Page ${page} / ${totalPages}`;
  document.getElementById('btnPrev').disabled = page===1;
  document.getElementById('btnNext').disabled = page>=totalPages;
  document.getElementById('btnClear').style.display = (activeFilter!=='all' || document.getElementById('searchInput').value) ? '' : 'none';

  if (!slice.length) {
    tbody.innerHTML='';
    empty.style.display='block';
    return;
  }
  empty.style.display='none';

  tbody.innerHTML = slice.map((m,i) => {
    const c = CAT[m.cat], s = STAT[m.status];
    return `<tr class="${c.rowCls}" style="animation-delay:${i*40}ms" onclick="openDetail(${m.id})">
      <td><span class="cat-badge ${c.cls}">${c.icon}&nbsp;${c.label}</span></td>
      <td><div class="sender-name">${m.sender}</div><div class="sender-sub">${m.brgy}</div></td>
      <td><div style="font-weight:500">${m.subject}</div><div class="msg-preview">${m.msg}</div></td>
      <td><span class="status-dot"><span class="dot ${s.cls}"></span>${s.label}</span></td>
      <td class="time-cell">${fmtDate(m.time, true)}</td>
      <td><button class="btn-view" onclick="event.stopPropagation();openDetail(${m.id})">View <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button></td>
    </tr>`;
  }).join('');
}

// ════ PAGINATION ════
function goPage(d) {
  const t = Math.ceil(filtered().length/PER)||1;
  page = Math.max(1,Math.min(page+d,t));
  renderTable();
}

// ════ FILTER & SEARCH ════
function clearFilters() {
  activeFilter='all';
  document.getElementById('searchInput').value='';
  document.getElementById('chips').querySelectorAll('.filter-button').forEach(c=>c.classList.remove('active'));
  document.querySelector('[data-f="all"]').classList.add('active');
  page=1;
  renderTable();
}

function setupFilterHandlers() {
  document.getElementById('chips').addEventListener('click', e=>{
    const chip = e.target.closest('.filter-button');
    if (!chip) return;
    activeFilter = chip.dataset.f;
    document.getElementById('chips').querySelectorAll('.filter-button').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    page=1;
    renderTable();
  });

  document.getElementById('searchInput').addEventListener('input',()=>{
    page=1;
    renderTable();
  });
}

// ════ DETAIL VIEW ════
function openDetail(id) {
  activeMsg = DATA.find(m=>m.id===id);
  if (!activeMsg) return;
  const c = CAT[activeMsg.cat], s = STAT[activeMsg.status];

  document.getElementById('detailModal').classList.remove('hidden');

  document.getElementById('detailBody').innerHTML = `
    <div class="cat-banner ${c.bannerCls}">
      <div class="banner-icon-wrap">${c.icon.replace('14','20')}</div>
      <div>
        <div class="banner-label">Message Category</div>
        <div class="banner-title">${activeMsg.subject}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-card"><div class="info-l">Sender</div><div class="info-v">${activeMsg.sender}</div></div>
      <div class="info-card"><div class="info-l">Contact</div><div class="info-v">${activeMsg.contact}</div></div>
      <div class="info-card"><div class="info-l">Barangay</div><div class="info-v">${activeMsg.brgy}</div></div>
      <div class="info-card"><div class="info-l">Vessel / Bangka</div><div class="info-v">${activeMsg.vessel}</div></div>
      <div class="info-card"><div class="info-l">Date &amp; Time</div><div class="info-v">${fmtDate(activeMsg.time,false)}</div></div>
      <div class="info-card"><div class="info-l">Status</div><div class="info-v"><span class="status-dot"><span class="dot ${s.cls}"></span>${s.label}</span></div></div>
    </div>

    <div class="section-label">Full Message</div>
    <div class="msg-block">${activeMsg.msg}</div>

    <div class="action-bar">
      <button class="btn-secondary" onclick="setStatus(${activeMsg.id},'review')">Mark In Review</button>
      <button class="btn-secondary" onclick="setStatus(${activeMsg.id},'resolved')">Mark Resolved</button>
      <button class="btn-primary" onclick="closeDetail();openBlotter(${activeMsg.id})">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Create Blotter Form
      </button>
    </div>`;
}

// Global functions so they can be triggered from inline onclick bindings
window.setStatus = setStatus;
window.closeDetail = closeDetail;
window.openBlotter = openBlotter;
window.closeBlotter = closeBlotter;
window.goPage = goPage;
window.clearFilters = clearFilters;

function closeDetail() {
  document.getElementById('detailModal').classList.add('hidden');
}

function setStatus(id, val) {
  const m = DATA.find(x=>x.id===id);
  if (m) {
    m.status=val;
    openDetail(id);
    renderCounts();
  }
}

// ════ BLOTTER MODAL ════
function openBlotter(id) {
  const m = DATA.find(x=>x.id===id);
  if (!m) return;
  const c = CAT[m.cat];
  const bNo = 'BD-' + String(m.id).padStart(4,'0') + '-2026';
  const now = new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});

  document.getElementById('blotterBody').innerHTML = `
    <div class="blotter-gov">
      <div class="lgu">Republic of the Philippines · Local Government Unit</div>
      <div class="dept">Office of Bantay Dagat – Coastal Monitoring Unit</div>
      <h2>Blotter Entry Form</h2>
    </div>

    <div class="blotter-row">
      <div class="b-field"><label>Blotter No.</label><div class="val">${bNo}</div></div>
      <div class="b-field"><label>Date Encoded</label><div class="val">${now}</div></div>
      <div class="b-field"><label>Category</label><div class="val">${c.label}</div></div>
    </div>

    <div class="blotter-sec">Complainant / Reporter Information</div>
    <div class="blotter-row">
      <div class="b-field"><label>Full Name</label><div class="val">${m.sender}</div></div>
      <div class="b-field"><label>Contact Number</label><div class="val">${m.contact}</div></div>
      <div class="b-field"><label>Barangay</label><div class="val">${m.brgy}</div></div>
    </div>

    <div class="blotter-sec">Incident / Report Details</div>
    <div class="blotter-row blotter-row-2">
      <div class="b-field"><label>Subject</label><div class="val">${m.subject}</div></div>
      <div class="b-field"><label>Vessel / Bangka</label><div class="val">${m.vessel}</div></div>
    </div>
    <div class="blotter-row blotter-row-2">
      <div class="b-field"><label>Date &amp; Time of Report</label><div class="val">${fmtDate(m.time,false)}</div></div>
      <div class="b-field"><label>Location / Barangay</label><div class="val">${m.brgy}</div></div>
    </div>

    <div class="blotter-sec">Narrative</div>
    <div class="narrative">${m.msg}</div>

    <div class="blotter-sec">Action Taken by Officer</div>
    <div class="narrative blank">(To be filled in by the responding Bantay Dagat officer on duty)</div>

    <div class="sig-grid">
      <div class="sig-block">
        <div style="height:44px"></div>
        <div class="sig-line">${m.sender}</div>
        <div class="sig-sub">Signature of Complainant / Reporter</div>
      </div>
      <div class="sig-block">
        <div style="height:44px"></div>
        <div class="sig-line">________________________________</div>
        <div class="sig-sub">Bantay Dagat Officer on Duty</div>
      </div>
    </div>`;

  document.getElementById('blotterOverlay').classList.add('open');
}

function closeBlotter() {
  document.getElementById('blotterOverlay').classList.remove('open');
}

// ════ AUTHENTICATION VIEW ROUTING ════
function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboardShell.classList.remove("hidden");
  loginError.textContent = "";
  displayCurrentDate();
  renderCounts();
  renderTable();
}

function showLogin() {
  dashboardShell.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  passwordInput.value = "";
  loginError.textContent = "";
  passwordInput.focus();
}

function displayCurrentDate() {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const el = document.getElementById("currentDateDisplay");
  if (el) {
    el.textContent = today.toLocaleDateString('en-US', options);
  }
}

// ════ INIT ════
document.addEventListener('DOMContentLoaded', function() {
  // Setup DOM Event Listeners and Filters
  setupFilterHandlers();
  
  document.getElementById('blotterOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('blotterOverlay')) closeBlotter();
  });

  document.getElementById('detailModalOverlay').addEventListener('click', closeDetail);
  document.getElementById('detailModalCloseButton').addEventListener('click', closeDetail);

  // Authentication Setup
  if (localStorage.getItem(STORAGE_KEY) === "true") {
    showDashboard();
  } else {
    showLogin();
  }

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

  logoutButton.addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    showLogin();
  });
});

// Persist feedback seed so other pages (Overview) can read it from localStorage
(function persistFeedbackSeed() {
  try {
    var key = 'bantay-dagat-feedback';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(DATA));
    }
  } catch (e) {
    // ignore storage errors
  }
})();
