const grid = document.getElementById("videosGrid");
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const addBtn = document.getElementById("addVideos");
const textarea = document.getElementById("videoLinks");
const overlay = document.getElementById("overlayVideo");

let videoURLs = [];

// Sidebar toggle
toggleSidebarBtn.onclick = ()=> sidebar.style.right="0";
closeSidebarBtn.onclick = ()=> sidebar.style.right="-320px";

// Overlay close
document.getElementById("closeOverlay").onclick = ()=>{
  overlay.style.display="none";
  overlay.innerHTML='<button id="closeOverlay">X</button>';
};

// Load JSON dari file
fetch("videos.json")
  .then(r=>r.json())
  .then(urls=>{
    videoURLs = urls;
    urls.forEach(url => addVideoToGrid(url,false));
  });

// Simpel generate embed
function generateEmbed(url){
  let embed;
  if(url.includes("drive.google.com")){
    let fileId = url.match(/\/d\/(.*?)\//)?.[1] || url.match(/id=(.*)/)?.[1];
    embed = document.createElement("iframe");
    embed.src = `https://drive.google.com/file/d/${fileId}/preview`;
    embed.allowFullscreen=true;
  } else if(url.match(/\.(mp4|webm|ogg)$/i)){
    embed=document.createElement("video");
    embed.src=url; embed.controls=true;
  } else {
    embed=document.createElement("iframe");
    embed.src=url;
  }
  embed.style.width="100%";
  embed.style.height="100%";
  return embed;
}

// Add video ke grid
function addVideoToGrid(url, save=true){
  if(videoURLs.includes(url)) return;
  const container=document.createElement("div");
  container.className="video-container";

  const delBtn=document.createElement("button");
  delBtn.textContent="X";
  delBtn.className="delete-btn";
  delBtn.onclick=(e)=>{
    e.stopPropagation();
    grid.removeChild(container);
    videoURLs = videoURLs.filter(u=>u!==url);
    if(save) saveJSON();
  };
  container.appendChild(delBtn);

  container.appendChild(generateEmbed(url));
  container.onclick=()=>{
    overlay.style.display="flex";
    overlay.innerHTML='<button id="closeOverlay">X</button>';
    overlay.appendChild(generateEmbed(url));
    document.getElementById("closeOverlay").onclick = ()=>{
      overlay.style.display="none";
      overlay.innerHTML='<button id="closeOverlay">X</button>';
    };
  };

  grid.appendChild(container);
  if(save) {
    videoURLs.push(url);
    saveJSON();
  }
}

// Save ke JSON lokal (hanya lokal, tidak persist di Netlify)
function saveJSON(){
  // Kalau cuma static site, kita tidak bisa write file
  // Bisa ganti pakai localStorage
  localStorage.setItem("videoURLs",JSON.stringify(videoURLs));
}

// Restore dari localStorage
let stored = localStorage.getItem("videoURLs");
if(stored){
  JSON.parse(stored).forEach(url=>addVideoToGrid(url,false));
}

// Tombol tambah video
addBtn.onclick=()=>{
  const links = textarea.value.split("\n").map(l=>l.trim()).filter(l=>l);
  links.forEach(url=>addVideoToGrid(url,true));
  textarea.value="";
  sidebar.style.right="-320px";
};
