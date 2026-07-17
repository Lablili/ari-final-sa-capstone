function displayCurrentDate() {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const el = document.getElementById("currentDateDisplay");
  if (el) {
    el.textContent = today.toLocaleDateString('en-US', options);
  }
}
(function(){
  function escapeHtml(s){return String(s||"").replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

  function fmtDate(s) {
    if (!s) return '';
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) + ' ' + 
           d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  }

  function renderStats() {
    // 1. Registered Fisherfolk
    var fisherfolkEl = document.getElementById("stat-fisherfolk");
    var fisherfolkSubEl = document.getElementById("stat-fisherfolk-sub");
    if (fisherfolkEl) {
      var rawF = localStorage.getItem('bantay-dagat-fisherfolk-database');
      var countF = 3; // default seed size
      if (rawF) {
        try { countF = JSON.parse(rawF).length; } catch(e) {}
      }
      fisherfolkEl.textContent = countF.toLocaleString();
      if (fisherfolkSubEl) {
        fisherfolkSubEl.textContent = "Active Registry";
      }
    }

    // 2. Incident Reports
    var reportsEl = document.getElementById("stat-reports");
    var reportsSubEl = document.getElementById("stat-reports-sub");
    if (reportsEl) {
      var rawR = localStorage.getItem('bantay-dagat-feedback');
      var itemsR = [];
      if (rawR) {
        try { itemsR = JSON.parse(rawR); } catch(e) {}
      } else {
        itemsR = [{},{},{},{},{},{},{},{}]; // fallback seed size is 8
      }
      reportsEl.textContent = itemsR.length.toLocaleString();
      if (reportsSubEl) {
        var newCount = itemsR.filter(function(x) { return x.status === 'new'; }).length;
        reportsSubEl.textContent = newCount + " New Reports";
        if (newCount > 0) {
          reportsSubEl.className = "stat-subtext negative";
        } else {
          reportsSubEl.className = "stat-subtext positive";
        }
      }
    }

    // 3. Announcements Sent Today
    var announcementsEl = document.getElementById("stat-announcements");
    if (announcementsEl) {
      var rawA = localStorage.getItem('bantay-dagat-announcements');
      var itemsA = [];
      if (rawA) {
        try { itemsA = JSON.parse(rawA); } catch(e) {}
      } else {
        itemsA = [
          { createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), archived: false },
          { createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), archived: false }
        ];
      }
      var today = new Date();
      var sentToday = itemsA.filter(function (item) {
        var itemDate = new Date(item.createdAt);
        return (
          !item.archived &&
          itemDate.getFullYear() === today.getFullYear() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getDate() === today.getDate()
        );
      }).length;
      announcementsEl.textContent = sentToday.toLocaleString();
    }
  }

  function renderAnnouncements(){
    var el = document.querySelector('.announcement-list');
    if(!el) return;
    var raw = localStorage.getItem('bantay-dagat-announcements');
    var items = [];
    try{ items = raw ? JSON.parse(raw) : []; }catch(e){ items = []; }
    if(!items.length){
      el.innerHTML = '<div class="list-item"><div><p class="item-title">No announcements</p></div></div>';
      return;
    }
    items.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
    el.innerHTML = items.slice(0,4).map(function(it){
      var dateText = it.createdAt ? fmtDate(it.createdAt) : '';
      return '<div class="list-item">'+
        '<span class="list-dot blue"></span>'+
        '<div>'+
        '<p class="item-title">'+ escapeHtml(it.message ? it.message : (it.template||'Announcement')) +'</p>'+
        '<p class="item-meta">'+ escapeHtml((it.deliveredCount||'0') + ' recipients') + ' &middot; ' + escapeHtml(dateText) + '</p>'+
        '</div>'+
        '</div>';
    }).join('\n');
  }

  function renderFeedback(){
    var el = document.querySelector('.report-list');
    if(!el) return;
    var raw = localStorage.getItem('bantay-dagat-feedback');
    var items = [];
    try{ items = raw ? JSON.parse(raw) : []; }catch(e){ items = []; }
    if(!items.length){
      el.innerHTML = '<div class="list-item"><div><p class="item-title">No reports</p></div></div>';
      return;
    }
    items.sort(function(a,b){ return new Date(b.time||0) - new Date(a.time||0); });
    el.innerHTML = items.slice(0,4).map(function(it){
      var dateText = it.time ? fmtDate(it.time) : '';
      var dotClass = 'blue';
      if(it.cat==='sos') dotClass='red';
      else if(it.cat==='incident') dotClass='amber';
      else if(it.cat==='info') dotClass='green';
      return '<div class="list-item">'+
        '<span class="list-dot '+dotClass+'"></span>'+
        '<div>'+
        '<p class="item-title">'+ escapeHtml(it.msg||it.message||it.subject||'Report') +'</p>'+
        '<p class="item-meta">'+ escapeHtml((it.sender? it.sender : '') + (it.brgy? ' · '+it.brgy : '')) + ' &middot; ' + escapeHtml(dateText) + '</p>'+
        '</div>'+
        '</div>';
    }).join('\n');
  }

  document.addEventListener('DOMContentLoaded', function(){
    displayCurrentDate();
    renderStats();
    renderAnnouncements();
    renderFeedback();
    setInterval(renderStats, 30000);
    setInterval(renderAnnouncements, 30000);
    setInterval(renderFeedback, 30000);
  });
})();
