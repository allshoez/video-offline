
const grid = document.getElementById("videosGrid");
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const addBtn = document.getElementById("addVideos");
const textarea = document.getElementById("videoLinks");
const overlay = document.getElementById("overlayVideo");
const closeOverlayBtn = document.getElementById("closeOverlay");
const showCacheBtn = document.getElementById("showCache");
const cacheList = document.getElementById("cacheList");
let overlayContent = null;

// --- IndexedDB setup ---
let db;
const request = indexedDB.open("videoCacheDB", 1);

request.onupgradeneeded = e => {
  db = e.target.result;
  if(!db.objectStoreNames.contains("videos")) db.createObjectStore("videos", { keyPath:"url" });
  if(!db.objectStoreNames.contains("videoList")) db.createObjectStore("videoList", { keyPath:"id" });
};

request.onsuccess = e => {
  db = e.target.result;
  loadVideoList();
};

request.onerror = e => console.error("IndexedDB error", e);

// --- Cache video blob ---
function cacheVideo(url, blob){
  if(!db) return;
  const tx = db.transaction("videos","readwrite");
  tx.objectStore("videos").put({url, blob});
}

function getCachedVideo(url){
  return new Promise(resolve => {
    if(!db) return resolve(null);
    const tx = db.transaction("videos","readonly");
    const req = tx.objectStore("videos").get(url);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => resolve(null);
  });
}

// --- Video list persistence ---
function saveVideoList(urls){
  if(!db) return;
  const tx = db.transaction("videoList","readwrite");
  tx.objectStore("videoList").put({id:1, urls});
}

function loadVideoList(){
  if(!db) return;
  const tx = db.transaction("videoList","readonly");
  const req = tx.objectStore("videoList").get(1);
  req.onsuccess = () => {
    const urls = req.result?.urls || [];
    urls.forEach(url => addVideoToGrid(url));
  };
}

// --- Sidebar toggle ---
toggleSidebarBtn.onclick = () => { sidebar.style.right="0"; };
closeSidebarBtn.onclick = () => { sidebar.style.right="-320px"; };

// --- Tambah video ---
addBtn.onclick = () => {
  const links = textarea.value.split("\n").map(l=>l.trim()).filter(l=>l);
  if(links.length===0) return;

  links.forEach(url=>{
    addVideoToGrid(url);
  });

  // update DB setelah video ditambahkan
  const currentUrls = Array.from(grid.children).map(c=>c.dataset.url);
  saveVideoList(currentUrls);

  textarea.value="";
  sidebar.style.right="-320px";
};

// --- Overlay fullscreen ---
closeOverlayBtn.onclick = () => {
  overlay.style.display="none";
  if(overlayContent){
    if(overlayContent.tagName==="VIDEO") overlayContent.pause();
    overlay.removeChild(overlayContent);
    overlayContent=null;
  }
};

// --- Tambah video ke grid ---
function addVideoToGrid(url){
  if(Array.from(grid.children).some(c=>c.dataset.url===url)) return;

  const container = document.createElement("div");
  container.className = "video-container";
  container.dataset.url = url;
  container.textContent = url.split("/").pop(); // optional: tampilkan nama file

  container.onclick = async () => {
    overlay.style.display="flex";
    overlay.innerHTML="";
    overlay.appendChild(closeOverlayBtn);

    if(url.includes(".mp4") || url.includes(".m3u8")){
      let cachedBlob = await getCachedVideo(url);
      overlayContent = document.createElement("video");
      overlayContent.controls = true;
      overlayContent.autoplay = true;
      if(cachedBlob){
        overlayContent.src = URL.createObjectURL(cachedBlob);
      } else {
        fetch(url).then(r=>r.blob()).then(blob=>{
          cacheVideo(url, blob);
          overlayContent.src = URL.createObjectURL(blob);
        });
      }
    } else {
      overlayContent = document.createElement("iframe");
      overlayContent.src = url;
      overlayContent.allowFullscreen = true;
    }
    overlay.appendChild(overlayContent);
  };
  grid.appendChild(container);
}

// --- Debug cache di sidebar ---
showCacheBtn.onclick = () => {
  if(!db) return alert("DB belum siap");
  if(cacheList.style.display==="block"){ cacheList.style.display="none"; return; }
  const tx = db.transaction("videos","readonly");
  const req = tx.objectStore("videos").getAll();
  req.onsuccess = () => {
    cacheList.innerHTML="";
    const closeBtn = document.createElement("button");
    closeBtn.textContent="X Tutup";
    closeBtn.onclick = ()=> cacheList.style.display="none";
    cacheList.appendChild(closeBtn);
    req.result.forEach(item=>{
      const div = document.createElement("div");
      div.textContent = item.url+" ("+(item.blob.size/1024/1024).toFixed(2)+" MB)";
      cacheList.appendChild(div);
    });
    cacheList.style.display="block";
  };
};
