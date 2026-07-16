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
      var date = it.createdAt ? new Date(it.createdAt).toLocaleDateString() : '';
      return '<div class="list-item">'+
        '<span class="list-dot blue"></span>'+
        '<div>'+
        '<p class="item-title">'+ escapeHtml(it.message.length ? it.message : (it.template||'Announcement')) +'</p>'+
        '<p class="item-meta">'+ escapeHtml((it.deliveredCount||'0') + ' recipients') + ' &middot; ' + escapeHtml(date) + '</p>'+
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
      var rel = '';
      try{ rel = (function(d){
        var seconds = Math.max(0, Math.floor((Date.now() - new Date(d).getTime())/1000));
        if(seconds>=86400){ var days = Math.floor(seconds/86400); return days + (days===1? ' day ago':' days ago'); }
        if(seconds>=3600){ var hours = Math.floor(seconds/3600); return hours + (hours===1? ' hour ago':' hours ago'); }
        if(seconds>=60){ var mins = Math.floor(seconds/60); return mins + (mins===1? ' minute ago':' minutes ago'); }
        return 'Just now';
      })(it.time||it.createdAt||Date.now()); }catch(e){ rel = ''; }
      var dotClass = 'blue';
      if(it.cat==='sos') dotClass='red';
      else if(it.cat==='incident') dotClass='amber';
      else if(it.cat==='info') dotClass='green';
      return '<div class="list-item">'+
        '<span class="list-dot '+dotClass+'"></span>'+
        '<div>'+
        '<p class="item-title">'+ escapeHtml(it.subject||it.message||'Report') +'</p>'+
        '<p class="item-meta">'+ escapeHtml((it.sender? it.sender : '') + (it.brgy? ' · '+it.brgy : '')) + ' &middot; ' + escapeHtml(rel) + '</p>'+
        '</div>'+
        '</div>';
    }).join('\n');
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderAnnouncements();
    renderFeedback();
    setInterval(renderAnnouncements, 30000);
    setInterval(renderFeedback, 30000);
  });
})();
