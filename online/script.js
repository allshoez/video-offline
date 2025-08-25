const grid = document.getElementById("videosGrid");
const modal = document.getElementById("modalForm");
const openFormBtn = document.getElementById("openForm");
const closeFormBtn = document.getElementById("closeForm");
const addBtn = document.getElementById("addVideos");
const textarea = document.getElementById("videoLinks");

const overlay = document.getElementById("overlayVideo");
const closeOverlayBtn = document.getElementById("closeOverlay");

let overlayContent = null;

// --- IndexedDB setup ---
let db;
const request = indexedDB.open("videoCacheDB", 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  if(!db.objectStoreNames.contains("videos")){
    db.createObjectStore("videos", { keyPath: "url" });
  }
};

request.onsuccess = (e) => { db = e.target.result; };
request.onerror = (e) => { console.error("IndexedDB error", e); };

// --- Helper functions IndexedDB ---
function cacheVideo(url, blob){
  if(!db) return;
  const tx = db.transaction("videos", "readwrite");
  const store = tx.objectStore("videos");
  store.put({ url, blob });
}

function getCachedVideo(url){
  return new Promise((resolve, reject) => {
    if(!db) return resolve(null);
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const req = store.get(url);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => resolve(null);
  });
}

// --- Modal open/close ---
openFormBtn.onclick = () => { modal.style.display="flex"; };
closeFormBtn.onclick = () => { modal.style.display="none"; };

// --- Tutup overlay ---
closeOverlayBtn.onclick = () => {
  overlay.style.display="none";
  if(overlayContent){
    if(overlayContent.tagName==="VIDEO") overlayContent.pause();
    overlay.removeChild(overlayContent);
    overlayContent = null;
  }
};

// --- Tambah video dari form ---
addBtn.onclick = () => {
  const links = textarea.value.split("\n").map(l=>l.trim()).filter(l=>l);
  if(links.length===0) return;
  links.forEach(link => addVideoToGrid(link));
  textarea.value="";
  modal.style.display="none";
};

// --- Fungsi tambah video ke grid ---
function addVideoToGrid(url){
  const container = document.createElement("div");
  container.className = "video-container";
  container.textContent = "Klik untuk putar video"; // placeholder grid

  container.onclick = async () => {
    overlay.style.display="flex";

    if(url.includes(".mp4") || url.includes(".m3u8")){
      let cachedBlob = await getCachedVideo(url);

      overlayContent = document.createElement("video");
      overlayContent.controls = true;
      overlayContent.autoplay = true;

      if(cachedBlob){
        overlayContent.src = URL.createObjectURL(cachedBlob);
        console.log("Video dari cache");
      } else {
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            cacheVideo(url, blob);
            overlayContent.src = URL.createObjectURL(blob);
            console.log("Video disimpan di cache");
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