import api from './api.js';

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const countBtn = document.getElementById('countBtn');
const resetBtn = document.getElementById('resetBtn');

const searchInput = document.getElementById('searchInput');
const topKInput = document.getElementById('topK');
const autoEnrichCheckbox = document.getElementById('autoEnrich');
const searchBtn = document.getElementById('searchBtn');
const searchStatus = document.getElementById('searchStatus');

const answerArea = document.getElementById('answerArea');
const metaArea = document.getElementById('metaArea');
const sourcesArea = document.getElementById('sourcesArea');
const missingArea = document.getElementById('missingArea');
const enrichmentArea = document.getElementById('enrichmentArea');
const rawJson = document.getElementById('rawJson');
const backendStatus = document.getElementById('backendStatus');

function setBackendStatus(text, ok=true){ backendStatus.textContent = text; backendStatus.style.color = ok ? '#86efac' : '#fca5a5' }

// Initialize health
(async function(){
  try{
    const h = await api.healthCheck();
    setBackendStatus(`${h.status} — ${h.message}`, true);
  }catch(e){
    setBackendStatus('unreachable', false);
  }
})();

// Upload handler
uploadBtn.addEventListener('click', async ()=>{
  const file = fileInput.files && fileInput.files[0];
  if(!file){ uploadStatus.textContent = 'Please choose a file first.'; return }
  uploadStatus.textContent = 'Uploading...';
  try{
    const res = await api.uploadDocument(file);
    uploadStatus.textContent = `Success: ${res.message || JSON.stringify(res)}`;
  }catch(err){
    console.error(err);
    uploadStatus.textContent = `Upload failed: ${err.message || JSON.stringify(err)}`;
  }
});

// Count handler
countBtn.addEventListener('click', async ()=>{
  countBtn.disabled = true;
  try{
    const res = await api.getDocumentCount();
    uploadStatus.textContent = `Knowledge base chunks: ${res.count}`;
  }catch(e){
    uploadStatus.textContent = `Failed to get count: ${e.message || e}`;
  }finally{ countBtn.disabled = false }
});

// Reset handler
resetBtn.addEventListener('click', async ()=>{
  if(!confirm('Delete all documents in the knowledge base? This cannot be undone.')) return;
  resetBtn.disabled = true;
  try{
    const res = await api.resetKnowledgeBase();
    uploadStatus.textContent = res.message || 'Knowledge base reset.';
  }catch(e){
    uploadStatus.textContent = `Reset failed: ${e.message || e}`;
  }finally{ resetBtn.disabled = false }
});

// Search handler
searchBtn.addEventListener('click', async ()=>{
  const q = searchInput.value && searchInput.value.trim();
  if(!q){ searchStatus.textContent = 'Please enter a query.'; return }
  searchBtn.disabled = true; searchStatus.textContent = 'Searching...';
  clearResults();
  try{
    const top_k = parseInt(topKInput.value || '5', 10) || 5;
    const include_auto_enrichment = autoEnrichCheckbox.checked;
    const res = await api.searchQuery(q, top_k, include_auto_enrichment);
    renderSearchResponse(res);
    rawJson.textContent = JSON.stringify(res, null, 2);
  }catch(err){
    console.error(err);
    searchStatus.textContent = `Search failed: ${err.message || JSON.stringify(err)}`;
  }finally{ searchBtn.disabled = false }
});

function clearResults(){ answerArea.innerHTML=''; metaArea.innerHTML=''; sourcesArea.innerHTML=''; missingArea.innerHTML=''; enrichmentArea.innerHTML=''; rawJson.textContent=''; searchStatus.textContent=''; uploadStatus.textContent=''; }

function ordinalWord(idx){
  const words = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
  return words[idx] || `${idx+1}th`;
}

function renderSearchResponse(res){
  searchStatus.textContent = '';
  // Answer
  answerArea.innerHTML = res.answer ? sanitize(res.answer) : '<em>No answer returned.</em>';

  // Confidence and metadata
  const conf = (res.confidence || '').toString().toLowerCase();
  const span = document.createElement('span');
  span.className = `conf-badge conf-${conf}`;
  span.textContent = conf || 'unknown';
  metaArea.innerHTML = '';
  
  let metaText = `Retrieved chunks: ${res.retrieved_chunks || 0}`;
  if (res.processing_time) {
    metaText += ` • Processing time: ${res.processing_time.toFixed(2)}s`;
  }
  if (res.reasoning) {
    metaText += ` • Reasoning: ${escapeHtml(res.reasoning)}`;
  }
  
  metaArea.appendChild(document.createTextNode(metaText));
  metaArea.appendChild(span);

  // Sources — horizontal scrolling row
  sourcesArea.innerHTML = '';
  if(res.sources && res.sources.length){
    const wrap = document.createElement('div'); 
    wrap.className = 'sources-horizontal';
    wrap.innerHTML = '<h3>Sources Found</h3>';
    const listBox = document.createElement('div'); 
    listBox.className = 'sources-list-box';
    
    res.sources.forEach((s, idx)=>{
      const card = document.createElement('div');
      card.className = 'source-line';
      const ordinal = ordinalWord(idx);
      
      // Handle both old string format and new object format
      const sourceText = typeof s === 'string' ? s : `${s.filename} (chunk ${s.chunk_id})`;
      const contentPreview = s.content_preview ? escapeHtml(s.content_preview) : '';
      const relevanceScore = s.relevance_score ? ` (${(s.relevance_score * 100).toFixed(1)}% relevant)` : '';
      
      card.innerHTML = `
        <div><strong>${ordinal}</strong>${relevanceScore}</div>
        <div style="margin-top:4px">${escapeHtml(sourceText)}</div>
        ${contentPreview ? `<div style="margin-top:4px;font-size:0.9em;color:#94a3b8">${contentPreview}</div>` : ''}
      `;
      listBox.appendChild(card);
    });
    
    wrap.appendChild(listBox);
    sourcesArea.appendChild(wrap);
  }

  // Missing info
  missingArea.innerHTML = '';
  if(res.missing_info && res.missing_info.length){
    const wrap = document.createElement('div'); wrap.className='missing'; wrap.innerHTML = '<h3>Missing Information</h3>';
    res.missing_info.forEach(mi=>{
      const el = document.createElement('div'); el.className='missing-item';
      el.innerHTML = `<strong>${escapeHtml(mi.topic)}</strong><div>${escapeHtml(mi.reason)}</div>${mi.suggested_source?`<div class='muted'>Suggested: ${escapeHtml(mi.suggested_source)}</div>`:''}`;
      wrap.appendChild(el);
    });
    missingArea.appendChild(wrap);
  }

  // Enrichment
  enrichmentArea.innerHTML = '';
  if(res.enrichment_suggestions && res.enrichment_suggestions.length){
    const wrap = document.createElement('div'); wrap.className='enrichment'; wrap.innerHTML = '<h3>Enrichment Suggestions</h3>';
    res.enrichment_suggestions.forEach(es=>{
      const el = document.createElement('div'); el.className='enrich-item';
      el.innerHTML = `<strong>${escapeHtml(es.suggestion_type)}</strong> — ${escapeHtml(es.description)} <div class='muted'>Priority: ${escapeHtml(es.priority)}</div>`;
      wrap.appendChild(el);
    });
    enrichmentArea.appendChild(wrap);
  }
  
  // Auto-enrichment results
  if(res.auto_enrichment){
    const autoWrap = document.createElement('div');
    autoWrap.className = 'enrichment';
    autoWrap.innerHTML = '<h3>Auto-Enrichment Result</h3>';
    
    const autoEl = document.createElement('div');
    autoEl.className = 'enrich-item';
    autoEl.style.border = '2px solid #10b981';
    autoEl.style.backgroundColor = 'rgba(16,185,129,0.1)';
    
    if(res.auto_enrichment.success){
      autoEl.innerHTML = `
        <div style="color: #10b981; font-weight: bold;">✅ Auto-enriched from ${escapeHtml(res.auto_enrichment.source)}</div>
        <div style="margin-top: 8px;">${escapeHtml(res.auto_enrichment.content || 'No content available')}</div>
        <div class='muted'>Confidence: ${(res.auto_enrichment.confidence * 100).toFixed(1)}%</div>
      `;
    } else {
      autoEl.innerHTML = `
        <div style="color: #ef4444; font-weight: bold;">❌ Auto-enrichment failed</div>
        <div class='muted'>${escapeHtml(res.auto_enrichment.error_message || 'Unknown error')}</div>
      `;
    }
    
    autoWrap.appendChild(autoEl);
    enrichmentArea.appendChild(autoWrap);
  }
}

function sanitize(html){
  // Very small sanitizer: escape angle brackets to avoid raw HTML injection
  return escapeHtml(html).replace(/\n/g,'<br>');
}
function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"]/g, (c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) }

// Expose for debugging
window.__API__ = api;

function renderResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // clear previous results

  // Show summary
  const summary = document.createElement("div");
  summary.className = "mb-4 p-2 rounded bg-gray-800 text-white";
  summary.innerHTML = `<p>${data.answer || "No answer generated."}</p>`;
  resultsDiv.appendChild(summary);

  // Show retrieved chunks
  if (data.retrieved_chunks) {
    const chunksSection = document.createElement("div");
    chunksSection.innerHTML = `<h3 class="text-lg font-bold mt-4">Retrieved Chunks:</h3>`;
    data.retrieved_chunks.forEach((chunk, i) => {
      const chunkCard = document.createElement("div");
      chunkCard.className = "mt-2 p-3 rounded bg-gray-700 text-sm";
      chunkCard.innerHTML = `
        <strong>Chunk ${i + 1}</strong><br>
        <em>${chunk.source || "Unknown source"}</em><br>
        ${chunk.content || ""}
      `;
      chunksSection.appendChild(chunkCard);
    });
    resultsDiv.appendChild(chunksSection);
  }

  // Show missing info
  if (data.missing_information) {
    const missingDiv = document.createElement("div");
    missingDiv.className = "mt-4 p-3 rounded bg-yellow-800 text-sm";
    missingDiv.innerHTML = `<h3 class="font-bold">Missing Information</h3><p>${data.missing_information}</p>`;
    resultsDiv.appendChild(missingDiv);
  }

  // Show enrichment suggestions
  if (data.enrichment_suggestions) {
    const enrichDiv = document.createElement("div");
    enrichDiv.className = "mt-4 p-3 rounded bg-blue-800 text-sm";
    enrichDiv.innerHTML = `<h3 class="font-bold">Enrichment Suggestions</h3><p>${data.enrichment_suggestions}</p>`;
    resultsDiv.appendChild(enrichDiv);
  }

  // Raw JSON toggle
  const rawBtn = document.createElement("button");
  rawBtn.className = "mt-4 bg-gray-600 px-3 py-1 rounded";
  rawBtn.innerText = "Show Raw JSON";
  rawBtn.onclick = () => {
    alert(JSON.stringify(data, null, 2));
  };
  resultsDiv.appendChild(rawBtn);
}
