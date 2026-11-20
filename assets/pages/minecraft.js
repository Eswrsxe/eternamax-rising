(()=>{const{api,C,esc,ic,toast,state,$,auth}=E,B=$("#info");
async function load(){if(!auth.user){B.innerHTML=state("Entre com o Discord para ver o IP do servidor.");return}
 B.innerHTML=state('<div class="spin"></div>Carregando...');
 try{const d=await api(C.PATHS.mcInfo);B.innerHTML=[["IP",d.ip||d.host],["Porta",d.port||d.porta],["Versão",d.version||d.versao]].filter(r=>r[1]).map(([k,v])=>`<label>${k}</label><div class="ip"><span>${esc(v)}</span><button class="btn btn-ghost btn-sm" data-c="${esc(v)}">${ic("copy")} Copiar</button></div>`).join("")||state("Informações indisponíveis.")}
 catch(e){B.innerHTML=state(esc(e.message),1)}}
B.addEventListener("click",async e=>{if(e.target.closest("[data-retry]"))return load();const b=e.target.closest("[data-c]");if(b){try{await navigator.clipboard.writeText(b.dataset.c);toast("Copiado!")}catch{toast("Copie manualmente.",1)}}});
document.addEventListener("auth",load);auth.ready.then(load);})();
