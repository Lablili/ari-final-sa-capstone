(function(){
  // Global printable blotter generator. Reads values from detail view DOM so it works even if page scripts are local.
  window.generateBlotter = function(){
    var get = id => (document.getElementById(id) && document.getElementById(id).textContent.trim()) || '';
    var reportId = get('detailId');
    var date = get('detailDate');
    var category = get('detailStatusPill');
    var type = get('detailBannerType');
    var reporter = get('detailSender');
    var phone = get('detailPhone');
    var boat = get('detailBoat');
    var location = get('detailLocation');
    var message = get('detailMessage');

    var safe = function(s){ return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };

    var html = '';
    html += '<!doctype html>';
    html += '<html>';
    html += '<head>';
    html += '<meta charset="utf-8">';
    html += '<meta name="viewport" content="width=device-width,initial-scale=1">';
    html += '<title>Blotter - ' + safe(reportId) + '</title>';
    html += '<style>';
    html += 'html,body{height:100%;margin:0;padding:0;background:#fff;color:#000;font-family:Arial, Helvetica, sans-serif}';
    html += '.page{width:820px;max-width:100%;margin:12px auto;padding:18px;box-sizing:border-box}';
    html += '.header{text-align:center;margin-bottom:14px}';
    html += '.title{font-size:22px;font-weight:700}';
    html += '.subtitle{font-size:14px;margin-top:6px}';
    html += '.grid{display:flex;gap:12px;margin-top:10px;flex-wrap:wrap}';
    html += '.col{flex:1;min-width:200px}';
    html += '.field{margin-bottom:8px}';
    html += '.label{font-weight:700;font-size:15px}';
    html += '.value{font-size:16px}';
    html += '.narrative{margin-top:12px;border:1px solid #111;padding:12px;min-height:140px;font-size:17px;line-height:1.5;background:#fff}';
    html += '.signature{display:flex;justify-content:space-between;margin-top:26px;gap:10px}';
    html += '.sig-line{flex:1;text-align:center;border-top:1px solid #000;padding-top:8px;font-size:16px}';
    html += '@media print{body{color-adjust:exact}.page{margin:0;padding:12mm;width:auto}.narrative{min-height:120px}@page{size:portrait}}';
    html += '</style>';
    html += '</head>';
    html += '<body>';
    html += '<div class="page">';
    html += '<div class="header">';
    html += '<div class="title">BANTAY DAGAT — BLOTTER FORM</div>';
    html += '<div class="subtitle">Official Incident / Rescue Report</div>';
    html += '</div>';
    html += '<div class="grid">';
    html += '<div class="col">';
    html += '<div class="field"><div class="label">Report ID</div><div class="value">' + safe(reportId) + '</div></div>';
    html += '<div class="field"><div class="label">Date &amp; Time</div><div class="value">' + safe(date) + '</div></div>';
    html += '<div class="field"><div class="label">Category</div><div class="value">' + safe(category) + '</div></div>';
    html += '<div class="field"><div class="label">Type</div><div class="value">' + safe(type) + '</div></div>';
    html += '</div>';
    html += '<div class="col">';
    html += '<div class="field"><div class="label">Reporter Name</div><div class="value">' + safe(reporter || 'N/A') + '</div></div>';
    html += '<div class="field"><div class="label">Contact</div><div class="value">' + safe(phone || 'N/A') + '</div></div>';
    html += '<div class="field"><div class="label">Boat</div><div class="value">' + safe(boat || 'N/A') + '</div></div>';
    html += '<div class="field"><div class="label">Location</div><div class="value">' + safe(location || 'N/A') + '</div></div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="field" style="margin-top:12px"><div class="label">Message / Narrative</div></div>';
    html += '<div class="narrative">' + safe(message) + '</div>';
    html += '<div class="signature">';
    html += '<div class="sig-line">Signature of Reporter</div>';
    html += '<div class="sig-line">Authorized Officer</div>';
    html += '</div>';
    html += '</div>';
    html += '<script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>';
    html += '</body></html>';

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    return true;
  };
  // Also wire any existing Generate Blotter buttons to this function when DOM is ready.
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.btn-blotter').forEach(function(btn){
      // remove inline onclick to avoid duplicate behavior
      try{ btn.onclick = null; }catch(e){}
      btn.addEventListener('click', function(e){ e.preventDefault(); window.generateBlotter(); });
    });
  });
})();
