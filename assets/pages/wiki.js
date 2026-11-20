(()=>{const{esc,fx,$,$$}=E,R={comum:["Comum","#9ca3af"],incomum:["Incomum","#4ade80"],rara:["Rara","#60a5fa"],lendaria:["Lendária","#fbbf24"],eternamax:["ETERNAMAX","#e879f9"]};
// ===== DADOS: edite aqui. Itens: [nome, id técnico, quantidade] =====
const BOX={free:{n:"Caixa Free",ch:{comum:65,incomum:25,rara:9,lendaria:1},it:{
comum:[["Pokébola","serp:pokeball",8],["Poção","serp:potion",6],["Doce de EXP XS","serp:exp_candy_xs",10],["Ticket EternaCoins (+1.000 EC)","eterna:ticket_ec",1]],
incomum:[["Great Ball","serp:greatball",5],["Super Poção","serp:super_potion",5],["Doce de EXP S","serp:exp_candy_s",8],["Pedra do Fogo","serp:fire_stone",1],["Poção Máxima","serp:max_potion",2]],
rara:[["Doce Raro","serp:rare_candy",2],["Doce de EXP M","serp:exp_candy_m",8],["Pedra da Folha","serp:leaf_stone",2],["Ultra Ball","serp:ultraball",5],["Doce de EXP L","serp:exp_candy_l",4]],
lendaria:[["Master Ball","serp:masterball",1],["Doce de EXP XL","serp:exp_candy_xl",32],["Shiny Charm","serp:shiny_charm",1],["Fragmento dos Desejos","serp:wishing_shard",2],["Absolite","serp:absolite",1]]}},
epica:{n:"Caixa Épica",ch:{comum:25,incomum:40,rara:25,lendaria:10},it:{}},
lendaria:{n:"Caixa Lendária",ch:{comum:5,incomum:20,rara:40,lendaria:35},it:{}},
eternamax:{n:"Caixa ETERNAMAX",ch:{rara:40,lendaria:40,eternamax:20},it:{}}};
const pct=n=>(Math.round(n*100)/100).toString().replace(".",",")+"%";
function box(k){const b=BOX[k];const segs=Object.entries(b.ch);
 let h=`<div class="panel"><h3>${esc(b.n)}</h3><p>Chances por raridade:</p><div class="bar">${segs.map(([r,v])=>`<i style="width:${v}%;background:${R[r][1]}" title="${R[r][0]} ${v}%"></i>`).join("")}</div><div class="legend">${segs.map(([r,v])=>`<span style="--rc:${R[r][1]}"><i></i>${R[r][0]} <b style="color:var(--text)">${v}%</b></span>`).join("")}</div></div>`;
 segs.forEach(([r,v])=>{const l=b.it[r];h+=`<div class="panel rar" style="--rc:${R[r][1]}"><div class="rar-h"><span class="tag">${R[r][0]}</span><span>Grupo: <b>${v}%</b></span>${l?`<span>Por item: <b>${pct(v/l.length)}</b></span><span>${l.length} recompensas</span>`:""}</div>${l?`<div class="tw"><table><thead><tr><th>Recompensa</th><th class="num">Qtd.</th><th class="num">Chance</th></tr></thead><tbody>${l.map(i=>`<tr><td>${esc(i[0])}<span class="iid">${esc(i[1])}</span></td><td class="num">${i[2]}×</td><td class="num acc">${pct(v/l.length)}</td></tr>`).join("")}</tbody></table></div>`:`<p>Lista de recompensas em atualização.</p>`}</div>`});return h}
function cmp(){const rs=["comum","incomum","rara","lendaria","eternamax"];return`<h3 style="margin:2rem 0 .8rem">Comparativo das caixas</h3><div class="panel tw"><table style="min-width:560px"><thead><tr><th>Caixa</th>${rs.map(r=>`<th class="num" style="color:${R[r][1]}">${R[r][0]}</th>`).join("")}</tr></thead><tbody>${Object.values(BOX).map(b=>`<tr><td><b>${b.n}</b></td>${rs.map(r=>`<td class="num">${b.ch[r]?b.ch[r]+"%":"—"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`}
const T={caixas:()=>`<div class="panel"><h3>Como funcionam as caixas</h3><p>Cada abertura concede <b>um único item</b>, sorteado de um grupo de raridade. A chance de cada item é a chance da raridade dividida igualmente entre os itens do grupo. Ex.: 40% com 5 recompensas = <b>8%</b> cada.</p></div><div class="tabs" id="bx">${Object.entries(BOX).map(([k,b],i)=>`<button class="tab" role="tab" data-b="${k}" aria-selected="${!i}">${b.n}</button>`).join("")}</div><div id="bc">${box("free")}</div>${cmp()}`,
free:()=>'<div class="panel"><h3>Passe Free</h3><p>Conteúdo em atualização. Edite <code>assets/pages/wiki.js</code> para adicionar as recompensas.</p></div>',
premium:()=>'<div class="panel"><h3>Passe Premium</h3><p>Conteúdo em atualização.</p></div>',
cal:()=>'<div class="panel"><h3>Calendário Diário</h3><p>Conteúdo em atualização.</p></div>'};
const M={caixas:"caixas","passe-free":"free","passe-premium":"premium",calendario:"cal"},root=$("#root");
function show(id){id=M[id]?id:"caixas";$$("[data-tab]").forEach(b=>b.setAttribute("aria-selected",b.dataset.tab===id));root.innerHTML=T[M[id]]();fx(root)}
$$("[data-tab]").forEach(b=>b.addEventListener("click",()=>{history.replaceState(null,"","#"+b.dataset.tab);show(b.dataset.tab)}));
root.addEventListener("click",e=>{const b=e.target.closest("[data-b]");if(!b)return;$$("#bx .tab").forEach(x=>x.setAttribute("aria-selected",x===b));$("#bc").innerHTML=box(b.dataset.b)});
$("#ids").addEventListener("change",e=>document.body.classList.toggle("ids",e.target.checked));
addEventListener("hashchange",()=>show(location.hash.slice(1)));show(location.hash.slice(1));})();
