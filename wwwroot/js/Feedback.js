// ════ DATA ════
let DATA = [
  { id:1, cat:'sos',      sender:'Juan dela Cruz',      contact:'+63 912 345 6789', brgy:'Patao',              vessel:'Bangka #BD-0042', time:'2026-05-25 06:14', status:'new',      subject:'Kalit nga pagka-dehado sa makina – Mayday',    msg:'Mayday! Nabuslot ang makina. Duol mi mga 3 nautical miles sa amihan-sidlakan sa Patao. 4 ka crew, walay kadaut. Palihug padala dayon og tabang. Ang barko naglutaw paingon sa amihanan-kasadpan.' },
  { id:2, cat:'sos',      sender:'Roberto Mancao',      contact:'+63 918 876 5432', brgy:'Guiwanon',           vessel:'Bangka #BD-0098', time:'2026-05-24 21:45', status:'review',   subject:'Hangyo og Reskyu – Nag-umol ang Bangka',       msg:'Natumba ang among bangka duol sa baybayon sa Guiwanon. 2 ka mangingisda nagkapilit sa hull. Kinahanglan og dali nga reskyu. Duol sa pulang buoy ang lokasyon.' },
  { id:3, cat:'incident', sender:'Pedro Santos',         contact:'+63 917 111 2222', brgy:'Sulangan',           vessel:'Bangka #BD-0011', time:'2026-05-25 08:30', status:'new',      subject:'Iligal nga pagpangisda – Paggamit sa dinamita', msg:'Nakit-an namo ang usa ka dako nga motorized banca nga naggamit og dinamita sa daplin sa coral reef duol sa Sulangan sa alas 8:00 sa buntag. Wala kiniy marka ug nidagan paingon sa kasadpan.' },
  { id:4, cat:'incident', sender:'Maria Flores',         contact:'+63 923 444 5555', brgy:'Patao',              vessel:'N/A',             time:'2026-05-24 14:10', status:'resolved', subject:'Paglapas sa Protektadong Marine Area',         msg:'Nakita ang usa ka speedboat nga walay permiso misulod sa marine sanctuary duol sa Patao. Wala makita ang plaka.' },
  { id:5, cat:'complaint',sender:'Lito Buenaventura',    contact:'+63 935 777 8888', brgy:'Guiwanon',           vessel:'Bangka #BD-0055', time:'2026-05-23 16:00', status:'review',   subject:'Walay Bantay Dagat sa among Barangay',        msg:'Wala mi makakita og Bantay Dagat patrol sa among lugar sulod sa duha ka semana. Daghang iligal nga pagpangisda duol sa Guiwanon. Nangayo og prayoridad alang sa regular patrol.' },
  { id:6, cat:'complaint',sender:'Anita Reyes',          contact:'+63 906 321 6547', brgy:'Sulangan',           vessel:'N/A',             time:'2026-05-22 09:15', status:'resolved', subject:'Panaglalis sa Komersyal nga mga Sakayan',    msg:'Nag-operate ang dagkong komersyal nga sakayan hapit sa among municipal fishing ground sa Sulangan, nagbalhin sa gamay nga mangingisda. Nangayo kami og dokumentasyon.' },
  { id:7, cat:'info',     sender:'Carlos Tan',           contact:'+63 945 654 3210', brgy:'Patao',              vessel:'Bangka #BD-0077', time:'2026-05-21 11:00', status:'resolved', subject:'Follow-up sa Rehistro sa Bangka BD-0077', msg:'Gusto nako mag-follow up sa status sa akong rehistro sa bangka BD-0077. Gisumite nako ang mga requirements sauna nga semana ug wala pa ko madawat nga kumpirmasyon.' },
  { id:8, cat:'info',     sender:'Emilio Ramos',         contact:'+63 956 888 9999', brgy:'Guiwanon',           vessel:'N/A',             time:'2026-05-20 13:30', status:'review',   subject:'Hangyo sa Patrol Schedule sa Hunyo 2026',    msg:'Maayong adlaw. Nangayo kami sa schedule sa Bantay Dagat patrol para sa Hunyo 2026 alang sa records sa barangay council. Gusto usab namo magkokoordinar para sa coastal clean-up.' },
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
  sos:      { label:'SOS / Rescue',       cls:'cat-sos', rowCls:'row-sos', bannerCls:'sos', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
  incident: { label:'Incident Report',   cls:'cat-inc', rowCls:'row-inc', bannerCls:'inc', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
  complaint:{ label:'Complaint',         cls:'cat-cmp', rowCls:'row-cmp', bannerCls:'cmp', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  info:     { label:'Information',        cls:'cat-inf', rowCls:'row-inf', bannerCls:'inf', icon:'<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' },
};
const STAT = {
  new:      { cls:'dot-new',      label:'New' },
  review:   { cls:'dot-review',   label:'Review' },
  resolved: { cls:'dot-resolved', label:'Resolved' },
};

// ════ STATE ════
let activeFilter = 'all';
let page = 1;
const PER = 6;
let activeMsg = null;

// ════ UTILITIES ════
function showToast(message) {
  let toast = document.getElementById('feedbackToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'feedbackToast';
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
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 2000);
}

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

  document.getElementById('recCount').textContent = total + ' records';
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
    <div class="info-grid">
      <div class="info-card"><div class="info-l">Sender</div><div class="info-v">${activeMsg.sender}</div></div>
      <div class="info-card"><div class="info-l">Contact</div><div class="info-v">${activeMsg.contact}</div></div>
      <div class="info-card"><div class="info-l">Barangay</div><div class="info-v">${activeMsg.brgy}</div></div>
      <div class="info-card"><div class="info-l">Vessel</div><div class="info-v">${activeMsg.vessel}</div></div>
      <div class="info-card"><div class="info-l">Date &amp; Time</div><div class="info-v">${fmtDate(activeMsg.time,false)}</div></div>
      <div class="info-card"><div class="info-l">Status</div><div class="info-v"><span class="status-dot"><span class="dot ${s.cls}"></span>${s.label}</span></div></div>
    </div>

    <div class="section-label">Full Message</div>
    <div class="msg-block">${activeMsg.msg}</div>

    <div class="action-bar">
      <button class="btn-secondary" onclick="setStatus(${activeMsg.id},'review')">Mark as Reviewed</button>
      <button class="btn-secondary" onclick="setStatus(${activeMsg.id},'resolved')">Mark as Resolved</button>
      <button class="btn-primary" onclick="closeDetail();openBlotter(${activeMsg.id})">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Generate Blotter
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
    try {
      localStorage.setItem('bantay-dagat-feedback', JSON.stringify(DATA));
    } catch(e) {}
    openDetail(id);
    renderCounts();
    renderTable();
    showToast("Status updated to " + (val === 'review' ? 'Reviewed' : 'Resolved') + "!");
  }
}

function openBlotter(id) {
  const m = DATA.find(x=>x.id===id);
  if (!m) return;
  const c = CAT[m.cat];
  const bNoShort = String(m.id).padStart(2,'0');
  const dateObj = new Date(m.time);
  const timeStr = isNaN(dateObj.getTime()) ? '03:00 PM' : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = isNaN(dateObj.getTime()) ? 'April 08, 2026' : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('blotterBody').innerHTML = `
    <div class="blotter-gov" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
      <!-- Left Logo: Bayan ng Bantayan -->
      <div class="blotter-logo" style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
        <img src="/logo-bantayan.jpg" alt="Bayan ng Bantayan Logo" style="width: 65px; height: 65px; object-fit: contain;">
      </div>

      <div style="text-align: center; flex: 1; font-family: 'Times New Roman', Times, serif; line-height: 1.3;">
        <div style="font-size: 14px; font-weight: 500;">Republic of the Philippines</div>
        <div style="font-size: 14px; font-weight: 500;">Province of Cebu</div>
        <div style="font-size: 15px; font-weight: 700; text-transform: uppercase;">Municipality of Bantayan</div>
        <div style="font-size: 14px; font-weight: 600; color: #1e293b;">Municipal Agriculturist Office</div>
        <div style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Bantay Dagat Headquarters</div>
        <div style="font-size: 12px; color: #475569;">Brgy. Suba, Bantayan, Cebu</div>
      </div>

      <!-- Right Logo: Bantay Dagat -->
      <div class="blotter-logo" style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
        <svg width="65" height="65" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#047857" stroke-width="3"/>
          <circle cx="50" cy="50" r="38" fill="#065f46" stroke="#eab308" stroke-width="1.5"/>
          <path d="M50 22 L50 78 M35 45 L65 45 M35 55 L65 55" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
          <text x="50" y="82" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">BANTAY DAGAT</text>
        </svg>
      </div>
    </div>

    <!-- Date printed on the right -->
    <div style="text-align: right; font-weight: bold; margin-bottom: 20px; font-size: 14px; font-family: 'Times New Roman', Times, serif; outline: none;" contenteditable="true">
      ${dateStr}
    </div>

    <!-- File details table block -->
    <div class="blotter-meta-grid" style="display: grid; grid-template-columns: 140px 20px 1fr; row-gap: 8px; margin-bottom: 15px; font-size: 14px; font-family: 'Times New Roman', Times, serif; line-height: 1.4;">
      <div style="font-weight: 500;">File no.</div><div>:</div><div contenteditable="true" style="font-weight: bold; outline: none;">${bNoShort}</div>
      <div style="font-weight: 500;">Subject</div><div>:</div><div contenteditable="true" style="outline: none;">Excerpt from the Municipal Bantay Dagat Blotter Report</div>
      <div style="font-weight: 500;">Nature of Case</div><div>:</div><div contenteditable="true" style="outline: none;">Resolution #33 Ordinance #02 Series of 2020 Section 37 Article 8</div>
    </div>

    <!-- Black solid line divider -->
    <div style="border-top: 2px solid #000; margin-bottom: 20px;"></div>

    <!-- Grid info (Occurrence and Suspect) -->
    <div class="occurrence-grid" style="display: grid; grid-template-columns: 180px 1fr; gap: 16px; margin-bottom: 20px; font-size: 14px; font-family: 'Times New Roman', Times, serif; line-height: 1.5; text-align: justify;">
      <div style="font-weight: bold;">Time/Date/Place<br>Of Occurrence</div>
      <div contenteditable="true" style="outline: none;">--At about ${timeStr} of ${dateStr} at the vicinity municipal waters off Brgy. ${m.brgy}, Bantayan, Cebu.</div>
      
      <div style="font-weight: bold;">Arrested Suspect</div>
      <div contenteditable="true" style="outline: none;">--${m.sender}, resident of Brgy. ${m.brgy}, Bantayan, Cebu (Vessel: ${m.vessel || 'N/A'}, Contact: ${m.contact || 'N/A'}). [Add other suspects: Name, Age, DOB, address, and vessel role]</div>
    </div>

    <!-- Facts section -->
    <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; font-family: 'Times New Roman', Times, serif;">Facts -</div>
    <div class="narrative" contenteditable="true" style="outline: none; font-size: 14px; font-family: 'Times New Roman', Times, serif; line-height: 1.6; min-height: 180px; margin-bottom: 40px; text-align: justify; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 4px; background: #f8fafc;">
      ${m.msg}
      <br><br>
      --[Case Facts & Apprehension Summary]--<br>
      (Explain the incident details here: State how the violator was apprehended, unauthorized gears/documents used, and any registered/unregistered violations from the municipality.)
      <br><br>
      --[Confiscated Assets & Properties]--<br>
      A. (1) One [motorized banca / vessel type] named "[Vessel Name]" owned by [Owner Name], powered by [Engine Details, e.g. YAMA 16HP], using [Fishing Gear/Trap type] with [Catch details, e.g. 10kls assorted fish] estimated value of Php [Value].
      <br><br>
      --[Apprehension Penalties & Fine Details]--<br>
      State the penalties: [Number] arrested violators are penalized to pay [Amount in words] pesos each (P [Amount in numbers]) as payment for [First/Second] offense of violating Section [Section No.] of Municipal Ordinance [Ordinance No.], Series of [Year], with a combined total fine of [Total in words] pesos (P [Total in numbers]).
    </div>

    <!-- Signatures -->
    <div class="sig-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 14px; font-family: 'Times New Roman', Times, serif; margin-top: 50px;">
      <div>
        <div style="margin-bottom: 35px;">Blotter by:</div>
        <div contenteditable="true" style="font-weight: bold; text-decoration: underline; outline: none; display: inline-block; min-width: 150px;">Julius L. Ejes</div>
        <div contenteditable="true" style="font-size: 12px; color: #475569; outline: none; margin-top: 4px;">Deputy Officer</div>
      </div>
      <div>
        <div style="margin-bottom: 35px;">Noted by:</div>
        <div contenteditable="true" style="font-weight: bold; text-decoration: underline; outline: none; display: inline-block; min-width: 150px;">Niven G. Pestaño</div>
        <div contenteditable="true" style="font-size: 12px; color: #475569; outline: none; margin-top: 4px;">Bantay Dagat Officer</div>
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

  // Authentication Setup (defensive)
  var authEnabled = true;
  if (!loginForm || !loginScreen || !passwordInput || !loginError) {
    authEnabled = false;
    if (dashboardShell) dashboardShell.classList.remove("hidden");
    // initialize UI pieces that don't require auth
    displayCurrentDate();
    renderCounts();
    renderTable();
  }

  if (authEnabled) {
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
});

// Persist feedback seed so other pages (Overview) can read it from localStorage
(function persistFeedbackSeed() {
  try {
    var key = 'bantay-dagat-feedback';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(DATA));
    } else {
      var stored = localStorage.getItem(key);
      if (stored) {
        DATA = JSON.parse(stored);
      }
    }
  } catch (e) {
    // ignore storage errors
  }
})();
