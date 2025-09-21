const grid = document.getElementById("videosGrid");
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const addBtn = document.getElementById("addVideos");
const textarea = document.getElementById("videoLinks");
const overlay = document.getElementById("overlayVideo");

let videoURLs = JSON.parse(localStorage.getItem("videoURLs") || "[]");

// Sidebar toggle
toggleSidebarBtn.onclick = ()=> sidebar.style.right="0";
closeSidebarBtn.onclick = ()=> sidebar.style.right="-320px";

// Overlay close
document.getElementById("closeOverlay").onclick = ()=>{
  overlay.style.display="none";
  overlay.innerHTML='<button id="closeOverlay">X</button>';
};

// Generate embed
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
function addVideoToGrid(url){
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
    localStorage.setItem("videoURLs",JSON.stringify(videoURLs));
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
  videoURLs.push(url);
  localStorage.setItem("videoURLs",JSON.stringify(videoURLs));
}

// Load dari localStorage
videoURLs.forEach(url=>addVideoToGrid(url));

// Tombol tambah video
addBtn.onclick=()=>{
  const links = textarea.value.split("\n").map(l=>l.trim()).filter(l=>l);
  links.forEach(url=>addVideoToGrid(url));
  textarea.value="";
  sidebar.style.right="-320px";
};
