// Elements
const grid = document.getElementById("videosGrid");
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const addBtn = document.getElementById("addVideos");
const textarea = document.getElementById("videoLinks");
const overlay = document.getElementById("overlayVideo");

// Load URLs dari localStorage
let videoURLs = JSON.parse(localStorage.getItem("videoURLs") || "[]");

// Toggle sidebar
toggleSidebarBtn.onclick = () => sidebar.style.right = "0";
closeSidebarBtn.onclick = () => sidebar.style.right = "-320px";

// Overlay close
document.getElementById("closeOverlay").onclick = () => {
  overlay.style.display = "none";
  overlay.innerHTML = '<button id="closeOverlay">X</button>';
};

// Generate embed sesuai URL
function generateEmbed(url){
  let embed;
  if(url.includes("drive.google.com")){
    // Support berbagai format Drive link
    let fileId = url.match(/\/d\/(.*?)\//)?.[1] || url.match(/id=(.*)/)?.[1];
    if(fileId){
      embed = document.createElement("iframe");
      embed.src = `https://drive.google.com/file/d/${fileId}/preview`;
      embed.allowFullscreen = true;
    } else {
      embed = document.createElement("div");
      embed.textContent = "URL Drive tidak valid";
      embed.style.color = "red";
    }
  } else if(url.match(/\.(mp4|webm|ogg)$/i)){
    embed = document.createElement("video");
    embed.src = url;
    embed.controls = true;
    embed.style.background = "#000";
  } else {
    embed = document.createElement("iframe");
    embed.src = url;
    embed.allowFullscreen = true;
  }
  embed.style.width = "100%";
  embed.style.height = "100%";
  return embed;
}

// Tambah video ke grid
function addVideoToGrid(url, save = true){
  const container = document.createElement("div");
  container.className = "video-container";

  // Tombol delete
  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.className = "delete-btn";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    grid.removeChild(container);
    videoURLs = videoURLs.filter(u => u !== url);
    localStorage.setItem("videoURLs", JSON.stringify(videoURLs));
  };
  container.appendChild(delBtn);

  // Embed video
  const embed = generateEmbed(url);
  container.appendChild(embed);

  // Klik container → popup overlay
  container.onclick = () => {
    overlay.style.display = "flex";
    overlay.innerHTML = '<button id="closeOverlay">X</button>';
    overlay.appendChild(generateEmbed(url));
    document.getElementById("closeOverlay").onclick = () => {
      overlay.style.display = "none";
      overlay.innerHTML = '<button id="closeOverlay">X</button>';
    };
  };

  grid.appendChild(container);

  // Simpan ke array + localStorage
  if(save && !videoURLs.includes(url)){
    videoURLs.push(url);
    localStorage.setItem("videoURLs", JSON.stringify(videoURLs));
  }
}

// Load semua URL dari localStorage saat awal
videoURLs.forEach(url => addVideoToGrid(url, false));

// Tombol tambah video
addBtn.onclick = () => {
  const links = textarea.value.split("\n").map(l => l.trim()).filter(l => l);
  links.forEach(url => addVideoToGrid(url));
  textarea.value = "";
  sidebar.style.right = "-320px";
};
