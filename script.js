/* ================================================
   SCRIPT.JS - Logika web: welcome, pencarian, filter, favorit.
   Data AU diambil dari data.js (AUS dan COUPLES).
   ================================================ */

const $ = s => document.querySelector(s);
const st = {couple:"", fav:false};
let favs = [];
try { favs = JSON.parse(localStorage.getItem("dira-favs") || "[]"); } catch(e){}
const saveFavs = () => { try { localStorage.setItem("dira-favs", JSON.stringify(favs)); } catch(e){} };
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = d => new Date(d).toLocaleDateString("id-ID",{month:"short",year:"numeric"});

/* welcome */
document.body.style.overflow = "hidden";
$("#enter").onclick = () => { $("#welcome").classList.add("out"); document.body.style.overflow = ""; setTimeout(() => $("#welcome").hidden = true, 700); };
$("#enter").focus();

/* stats + chips */
$("#s1").textContent = AUS.length;
$("#s2").textContent = Object.keys(COUPLES).length;
$("#s3").textContent = AUS.filter(a => a.status === "Tamat").length;
function drawChips(){
  const names = ["", ...Object.keys(COUPLES)];
  $("#chips").innerHTML = names.map(n =>
    `<button class="chip" data-c="${esc(n)}" aria-pressed="${st.couple===n}">${n||"Semua couple"}</button>`).join("");
  document.querySelectorAll(".chip").forEach(b => b.onclick = () => { st.couple = b.dataset.c; drawChips(); render(); });
}

function render(){
  const q = $("#q").value.trim().toLowerCase(), status = $("#st").value, so = $("#so").value;
  let list = AUS.filter(a =>
    (!st.couple || a.couple === st.couple) &&
    (!status || a.status === status) &&
    (!st.fav || favs.includes(a.title)) &&
    (!q || [a.title,a.couple,a.desc,...a.tags].join(" ").toLowerCase().includes(q)));
  list.sort((a,b) => so==="az" ? a.title.localeCompare(b.title) : so==="old" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  $("#count").textContent = `${list.length} dari ${AUS.length} AU`;
  $("#onlyfav").textContent = st.fav ? "Tampilkan semua" : "Tampilkan favorit saja";
  if(!list.length){
    $("#out").innerHTML = `<p class="empty">Tidak ada AU yang cocok. Coba kata kunci lain atau pilih “Semua couple”.</p>`; return;
  }
  const groups = {};
  list.forEach(a => (groups[a.couple] = groups[a.couple] || []).push(a));
  $("#out").innerHTML = Object.keys(groups).map(c => `
    <section class="couple">
      <h2>${esc(c)} <small>${groups[c].length} AU</small></h2>
      <p class="cdesc">${esc(COUPLES[c] || "")}</p>
      ${groups[c].map(a => `
        <article class="au" id="${esc(a.title)}">
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.desc)}</p>
          <div class="tags">
            <span class="tag st">${esc(a.status)}</span>
            <span class="tag">21+</span>
            ${a.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}
            <span class="tag">${fmt(a.date)}</span>
          </div>
          <div class="act">
            <button class="fav" data-t="${esc(a.title)}" aria-pressed="${favs.includes(a.title)}" aria-label="Simpan ke favorit">${favs.includes(a.title) ? "♥" : "♡"}</button>
            <a class="btn" href="${esc(a.link)}" target="_blank" rel="noopener">Baca di Twitter</a>
          </div>
        </article>`).join("")}
    </section>`).join("");
  document.querySelectorAll(".fav").forEach(b => b.onclick = () => {
    const t = b.dataset.t;
    favs = favs.includes(t) ? favs.filter(x => x !== t) : [...favs, t];
    saveFavs(); render();
  });
}

$("#q").oninput = render; $("#st").onchange = render; $("#so").onchange = render;
$("#onlyfav").onclick = () => { st.fav = !st.fav; render(); };
$("#rand").onclick = () => {
  const a = AUS[Math.floor(Math.random()*AUS.length)];
  st.couple = ""; st.fav = false; $("#q").value = a.title; $("#st").value = "";
  drawChips(); render();
  const el = document.getElementById(a.title); if(el) el.scrollIntoView({block:"center"});
};
drawChips(); render();
