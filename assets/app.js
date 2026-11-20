(()=>{
const C=window.ETERNA,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ic=n=>`<svg class="ic"><use href="#i-${n}"/></svg>`;
function toast(m,err){let b=$("#toasts");if(!b){b=document.createElement("div");b.id="toasts";document.body.append(b)}const t=document.createElement("div");t.className="toast"+(err?" err":"");t.textContent=m;b.append(t);setTimeout(()=>t.remove(),4200)}
// Cliente de API: timeout, retry em GET, cookies de sessão, erros legíveis
async function api(path,{method="GET",body,retries=method==="GET"?2:0}={}){
  for(let i=0;;i++){
    const ac=new AbortController(),t=setTimeout(()=>ac.abort(),12000);
    try{
      const o={method,credentials:"include",signal:ac.signal,headers:{Accept:"application/json"}};
      if(body instanceof FormData)o.body=body;else if(body){o.body=JSON.stringify(body);o.headers["Content-Type"]="application/json"}
      const r=await fetch(C.API_BASE+path,o);clearTimeout(t);
      const d=await r.json().catch(()=>null);
      if(!r.ok){const e=new Error(d?.error||d?.message||`Erro ${r.status}`);e.status=r.status;if(r.status<500||i>=retries)throw e;}
      else return d;
    }catch(e){clearTimeout(t);if(e.status&&e.status<500)throw e;if(i>=retries){e.message=e.name==="AbortError"?"A API demorou demais para responder.":e.status?e.message:"Não foi possível conectar à API.";throw e}}
    await new Promise(r=>setTimeout(r,500*2**i));
  }
}
// Sessão
const auth={user:null,ready:null,async load(){if(/SEU-BACKEND/.test(C.API_BASE)){auth.user=null;auth.render();return}try{const d=await api(C.PATHS.me,{retries:0});auth.user=d.user||d||null;if(!auth.user?.id&&!auth.user?.username)auth.user=null}catch{auth.user=null}auth.render()},
render(){const b=$("#auth");if(!b)return;const u=auth.user;
 b.innerHTML=u?`<div class="user"><img alt="" src="${esc(u.avatar||"")}" onerror="this.style.display='none'"><span>${esc(u.global_name||u.username||u.name)}</span><button class="btn btn-sm btn-danger" id="lo" aria-label="Sair">${ic("out")}</button></div>`:`<button class="btn btn-primary btn-sm" id="li">${ic("discord")} Entrar</button>`;
 $("#li")?.addEventListener("click",()=>location.href=`${C.API_BASE}${C.PATHS.login}?redirect=${encodeURIComponent(location.href)}`);
 $("#lo")?.addEventListener("click",async()=>{try{await api(C.PATHS.logout,{method:"POST"})}catch{}auth.user=null;auth.render();document.dispatchEvent(new Event("auth"))});
 $$("[data-admin]").forEach(e=>e.hidden=!(u&&(u.isAdmin||u.admin||u.is_admin)));}};
auth.ready=auth.load();
// Navegação
$("#burger")?.addEventListener("click",e=>{const o=$("#menu").classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",o)});
// Efeitos: reveal, spotlight/tilt, count-up
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
function fx(r=document){$$(".rv:not(.in)",r).forEach((e,i)=>{e.style.setProperty("--d",(i%6)*.07+"s");io.observe(e)});
 $$(".card:not([data-fx])",r).forEach(c=>{c.dataset.fx=1;c.addEventListener("pointermove",e=>{const b=c.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;c.style.setProperty("--mx",x+"px");c.style.setProperty("--my",y+"px");if(c.dataset.tilt!=null&&e.pointerType==="mouse")c.style.transform=`perspective(800px) rotateX(${(.5-y/b.height)*6}deg) rotateY(${(x/b.width-.5)*6}deg) translateY(-4px)`});c.addEventListener("pointerleave",()=>c.style.transform="")});
 $$("[data-count]:not([data-done])",r).forEach(el=>{el.dataset.done=1;const n=+el.dataset.count,suf=el.dataset.suf||"";let s=null;const o=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;o.disconnect();const f=t=>{s??=t;const p=Math.min((t-s)/1200,1);el.textContent=Math.round(n*(1-Math.pow(1-p,3)))+suf;p<1&&requestAnimationFrame(f)};requestAnimationFrame(f)});o.observe(el)})}
fx();
const modal={open:id=>$("#"+id)?.classList.add("open"),close:id=>$("#"+id)?.classList.remove("open")};
document.addEventListener("click",e=>{const c=e.target.closest("[data-close]");if(c)modal.close(c.dataset.close);if(e.target.classList.contains("modal"))e.target.classList.remove("open")});
document.addEventListener("keydown",e=>e.key==="Escape"&&$$(".modal.open").forEach(m=>m.classList.remove("open")));
const state=(t,retry)=>`<div class="state">${t}${retry?`<br><button class="btn btn-ghost btn-sm" data-retry style="margin-top:1rem">Tentar novamente</button>`:""}</div>`;
const skel=n=>Array(n).fill('<div class="skel"></div>').join("");
const fmt=d=>d?new Date(d).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}):"";
window.E={api,auth,esc,ic,toast,fx,modal,state,skel,fmt,$,$$,C};
// Carrega módulo da página
const p=document.body.dataset.page;if(p&&p!=="static"){const s=document.createElement("script");s.src="/assets/pages/"+p+".js";document.body.append(s)}
})();
