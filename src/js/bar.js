// Carta “plana” desde data/price.json (sin desplegables) + imágenes por sección

const gridEl = document.getElementById("menuGrid");
const searchEl = document.getElementById("search");

// Mapa: id de sección (price.json) -> imagen en /img
// Ajustado a tus nombres actuales de archivos
const IMG_MAP = {
  carne: "./img/carne.jpg",
  ensaladas: "./img/ensalada.jpg",
  hamburguesas: "./img/hamburgesa.jpg",
  pescado: "./img/pescado.jpg",
  bocadillos: "./img/bocadillo.jpg",
  ninos: "./img/ninos.jpg",
};

function normalize(str){
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function formatEuro(value){
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(num)) return String(value);
  return num.toFixed(2).replace(".", ",") + "€";
}

function card(section, items){
  const el = document.createElement("article");
  el.className = "sf-card";

  // Imagen de sección (si existe)
  const imgSrc = IMG_MAP[section.id];
  if(imgSrc){
    const img = document.createElement("img");
    img.className = "sf-card__img";
    img.src = imgSrc;
    img.alt = section.title;
    img.loading = "lazy";
    el.appendChild(img);
  }

  const head = document.createElement("div");
  head.className = "sf-card__head";

  const title = document.createElement("div");
  title.className = "sf-card__title";
  title.textContent = section.title;

  head.appendChild(title);

  if(section.note){
    const note = document.createElement("div");
    note.className = "sf-card__note";
    note.textContent = section.note;
    head.appendChild(note);
  }

  const list = document.createElement("div");
  list.className = "sf-list";

  items.forEach(it => {
    const row = document.createElement("div");
    row.className = "sf-row";

    const desc = it.desc ? `<div class="mt-1 text-xs text-slate-600">${it.desc}</div>` : "";

    row.innerHTML = `
      <div class="sf-leader">
        <div class="sf-leader__name">${it.name}</div>
        <div class="sf-leader__dots"></div>
        <div class="sf-leader__price">${formatEuro(it.price)}</div>
      </div>
      ${desc}
    `;
    list.appendChild(row);
  });

  el.appendChild(head);
  el.appendChild(list);
  return el;
}

function render(data, query=""){
  gridEl.innerHTML = "";
  const q = normalize(query.trim());

  const sections = data.sections || [];
  let shown = 0;

  sections.forEach(section => {
    const items = (section.items || []).filter(it => {
      const hay = normalize(section.title + " " + it.name + " " + (it.desc || ""));
      return q ? hay.includes(q) : true;
    });

    if(q && items.length === 0) return;

    gridEl.appendChild(card(section, items));
    shown++;
  });

  if(data.meta?.extra_note){
    const note = document.createElement("div");
    note.className = "md:col-span-2 sf-card";
    note.innerHTML = `
      <div class="sf-card__head">
        <div class="sf-card__title">Información</div>
      </div>
      <div class="sf-list">
        <div class="sf-row">
          <div class="text-sm text-slate-700">${data.meta.extra_note}</div>
           <div class="text-sm text-slate-700">Teléfono: ${data.meta.phone}</div>
            <div class="text-sm text-slate-700">${data.meta.address}</div>
        </div>
      </div>
    `;
    gridEl.appendChild(note);
  }

  if(shown === 0){
    const empty = document.createElement("div");
    empty.className = "md:col-span-2 sf-card";
    empty.innerHTML = `
      <div class="sf-card__head">
        <div class="sf-card__title">Sin resultados</div>
      </div>
      <div class="sf-list">
        <div class="sf-row text-slate-600">No hay resultados para esa búsqueda.</div>
      </div>
    `;
    gridEl.appendChild(empty);
  }
}

async function main(){
  document.getElementById("year").textContent = new Date().getFullYear();

  const res = await fetch("./data/price.json", { cache: "no-store" });
  const data = await res.json();

  render(data, "");

  searchEl?.addEventListener("input", (e) => render(data, e.target.value));
}

main().catch((err) => {
  console.error(err);
  gridEl.innerHTML = '<div class="sf-card"><div class="sf-card__head"><div class="sf-card__title">Error</div></div><div class="sf-list"><div class="sf-row text-red-700">No se pudo cargar <b>data/price.json</b>. Revisa que exista y sea JSON válido.</div></div></div>';
});
