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

  async function renderStats() {
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

    // 2. Incident Reports (Community Reports)
    var reportsEl = document.getElementById("stat-reports");
    var reportsSubEl = document.getElementById("stat-reports-sub");
    if (reportsEl) {
      try {
        var res = await fetch('/api/feedback');
        var itemsR = res.ok ? await res.json() : [];
        reportsEl.textContent = itemsR.length.toLocaleString();
        if (reportsSubEl) {
          var newCount = itemsR.filter(function(x) { return x.status && x.status.toLowerCase() === 'new'; }).length;
          var resCount = itemsR.filter(function(x) { return x.status && (x.status.toLowerCase() === 'resolved' || x.status.toLowerCase() === 'archived'); }).length;
          reportsSubEl.textContent = newCount + " New, " + resCount + " Resolved";
          if (newCount > 0) {
            reportsSubEl.className = "stat-subtext negative";
          } else {
            reportsSubEl.className = "stat-subtext positive";
          }
        }
      } catch (e) {
        console.error("Error loading community reports for stats", e);
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

  async function renderFeedback(){
    var el = document.querySelector('.report-list');
    if(!el) return;
    try {
      var res = await fetch('/api/feedback');
      var items = res.ok ? await res.json() : [];
      if(!items.length){
        el.innerHTML = '<div class="list-item"><div><p class="item-title">No reports</p></div></div>';
        return;
      }
      items.sort(function(a,b){ return new Date(b.dateSent||0) - new Date(a.dateSent||0); });
      el.innerHTML = items.slice(0,4).map(function(it){
        var dateText = it.dateSent ? fmtDate(it.dateSent) : '';
        var dotClass = 'blue';
        if(it.priority==='High') dotClass='red';
        else if(it.priority==='Normal') dotClass='amber';
        return '<div class="list-item">'+
          '<span class="list-dot '+dotClass+'"></span>'+
          '<div>'+
          '<p class="item-title">'+ escapeHtml(it.content||it.subject||'Report') +'</p>'+
          '<p class="item-meta">'+ escapeHtml((it.contact? it.contact : '') + (it.flaggedPlace? ' A '+it.flaggedPlace : '')) + ' &middot; ' + escapeHtml(dateText) + '</p>'+
          '</div>'+
          '</div>';
      }).join('\n');
    } catch (e) {
      console.error("Error loading feedback list", e);
    }
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
