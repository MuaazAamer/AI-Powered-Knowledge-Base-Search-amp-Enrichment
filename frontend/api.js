const BASE_URL = (window.__BACKEND_URL__ || 'http://localhost:8000').replace(/\/+$/,'');

async function fetchJson(url, opts = {}){
  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try{ data = text ? JSON.parse(text) : {}; }catch(e){ data = { _raw: text }; }
  if(!res.ok){ const err = new Error(data.detail || data.error || res.statusText); err.status = res.status; err.body = data; throw err }
  return data;
}

export async function healthCheck(){ return fetchJson(`${BASE_URL}/health`) }

export async function uploadDocument(file){
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: fd });
  const text = await res.text();
  try{ const data = JSON.parse(text); if(!res.ok) throw new Error(data.detail || 'Upload failed'); return data }catch(e){ if(!res.ok) throw e; return { _raw: text } }
}

export async function searchQuery(query, top_k=5, include_auto_enrichment=false){
  const body = JSON.stringify({ query, top_k, include_auto_enrichment });
  return fetchJson(`${BASE_URL}/search`, { method: 'POST', headers: {'Content-Type':'application/json'}, body });
}

export async function getDocumentCount(){ return fetchJson(`${BASE_URL}/documents/count`) }

export async function getDocumentList(){ return fetchJson(`${BASE_URL}/documents/list`) }

export async function resetKnowledgeBase(){
  return fetchJson(`${BASE_URL}/documents/reset`, { method: 'DELETE' });
}

export default { healthCheck, uploadDocument, searchQuery, getDocumentCount, getDocumentList, resetKnowledgeBase };
