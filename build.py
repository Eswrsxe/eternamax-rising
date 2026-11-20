#!/usr/bin/env python3
"""Gera as rotas estáticas (cada página em /rota/index.html). Rode: python3 build.py"""
import os
DISCORD="https://discord.gg/G98ern6ZgK"
ICONS={
"logo":'<path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z"/><path d="M8.5 9h7M8.5 12h5M8.5 15h7"/>',
"home":'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
"info":'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
"grid":'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
"users":'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.4c2 .7 3.5 2.6 3.5 5.6"/>',
"discord":'<path d="M7 7.5c3-1.3 7-1.3 10 0 1.8 3 2.7 6 2.6 9.5-1.3 1-2.6 1.6-4 2l-1-1.8M7 7.5c-1.8 3-2.7 6-2.6 9.5 1.3 1 2.6 1.6 4 2l1-1.8"/><circle cx="9.3" cy="12.5" r="1.2"/><circle cx="14.7" cy="12.5" r="1.2"/><path d="M9 16.2c2 .8 4 .8 6 0"/>',
"trophy":'<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4v1.5A3.5 3.5 0 0 0 7.7 11M16.5 6H20v1.5a3.5 3.5 0 0 1-3.7 3.5"/><path d="M12 13.5V17M8.5 20h7M10 17h4v3h-4z"/>',
"vote":'<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M8 16V12M12 16V8M16 16v-6"/>',
"cube":'<path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9"/>',
"book":'<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
"server":'<rect x="3.5" y="4" width="17" height="6.5" rx="2"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="2"/><path d="M7 7.2h.01M7 16.7h.01M11 7.2h6M11 16.7h6"/>',
"box":'<path d="M3.5 8 12 3.5 20.5 8v9L12 21.5 3.5 17z"/><path d="M3.5 8 12 12.5 20.5 8M12 12.5v9"/>',
"ticket":'<path d="M3.5 8.5a2 2 0 0 0 0 7V18a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-2.5a2 2 0 0 1 0-7V6a1 1 0 0 0-1-1h-15a1 1 0 0 0-1 1z"/><path d="M14 5v3M14 11v2M14 16v3"/>',
"crown":'<path d="M3.5 8l4.5 4 4-6.5 4 6.5 4.5-4-1.5 11h-14z"/>',
"cal":'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
"arrow":'<path d="M5 12h14M13 6l6 6-6 6"/>',"back":'<path d="M19 12H5M11 6l-6 6 6 6"/>',
"check":'<path d="m5 12.5 4.5 4.5L19 7.5"/>',"plus":'<path d="M12 5v14M5 12h14"/>',"x":'<path d="M6 6l12 12M18 6 6 18"/>',
"out":'<path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10M15 8l4 4-4 4M19 12H9"/>',
"shield":'<path d="M12 3 4.5 6v5.5c0 4.5 3 7.7 7.5 9.5 4.5-1.8 7.5-5 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
"gavel":'<path d="m14 5 5 5M10.5 8.5l5 5M8 11l5 5"/><path d="M12.5 3.5 18 9M3.5 20.5l7-7"/>',
"chat":'<path d="M4 5.5C4 4.7 4.7 4 5.5 4h13c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5H10l-4.5 4V16h0A1.5 1.5 0 0 1 4 14.5z"/>',
"bolt":'<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',"copy":'<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5v-3A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3"/>',
"youtube":'<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9.5 5 2.5-5 2.5z"/>',
"menu":'<path d="M4 7h16M4 12h16M4 17h16"/>',
}
def ic(n,c=""): return f'<svg class="ic {c}"><use href="#i-{n}"/></svg>'
SPRITE='<svg width="0" height="0" style="position:absolute" aria-hidden="true">'+"".join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k,v in ICONS.items())+'</svg>'
NAV=[("/","home","Início"),("/sobre","info","Sobre"),("/recursos","grid","Recursos"),("/equipe","users","Equipe"),("/comunidade","discord","Comunidade")]
def page(path,title,body,pg="static",desc="",active=None,extra_nav=""):
    active=active or path
    nav="".join(f'<li><a href="{h}" {"aria-current=page" if h==active else ""}>{ic(i)} {t}</a></li>' for h,i,t in NAV)
    html=f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | Eternamax Rising</title><meta name="description" content="{desc or 'Servidor competitivo de Pokémon: torneios, votações, Minecraft e comunidade.'}"><meta name="theme-color" content="#06030d">
<style>html,body{{background:#06030d;color-scheme:dark}}</style>
<link rel="stylesheet" href="/assets/style.css">
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"></noscript></head>
<body data-page="{pg}">{SPRITE}<div class="aurora"><i></i><i></i><i></i></div>
<header><a class="brand" href="/">{ic("logo")}Eternamax <span>Rising</span></a>
<nav><ul id="menu">{nav}</ul></nav><div class="hd-right"><div id="auth"></div><button class="burger" id="burger" aria-label="Menu" aria-expanded="false">{ic("menu")}</button></div></header>
<main>{body}</main><footer>© 2026 Eternamax Rising. Todos os direitos reservados.</footer>
<script src="/assets/config.js"></script><script src="/assets/app.js" defer></script></body></html>'''
    d=os.path.join(".",path.strip("/")); os.makedirs(d,exist_ok=True); open(os.path.join(d,"index.html"),"w",encoding="utf-8").write(html)
def head(t,p): return f'<div class="sec-head rv"><h1>{t}</h1><p>{p}</p></div>'
def card(href,icon,t,p,more): return f'<a class="card rv" data-tilt href="{href}"><div class="ico">{ic(icon)}</div><h3>{t}</h3><p>{p}</p><div class="more">{more} {ic("arrow")}</div></a>'
feat=lambda i,t,p:f'<div class="card rv"><div class="ico">{ic(i)}</div><h3>{t}</h3><p>{p}</p></div>'
cta=f'<div class="card cta rv">{ic("discord","big")}<h2>Faça parte do <span class="grad">Eternamax Rising</span></h2><p>Junte-se a centenas de treinadores, participe de debates táticos, entre em torneios e faça novas amizades.</p><a class="btn btn-primary glow" href="{DISCORD}" target="_blank" rel="noopener">{ic("discord")} Entrar no Discord</a></div>'
# HOME
page("/","Servidor Oficial",f'''<section class="hero"><div class="badge rv">{ic("bolt")} O ápice da jornada Pokémon</div>
<h1 class="rv">Bem-vindo ao <span class="grad">Eternamax Rising</span></h1><p class="rv">Mergulhe em um universo competitivo definitivo: mecânicas avançadas, torneios personalizados e uma comunidade apaixonada por batalhas e estratégia.</p>
<div class="row rv"><a class="btn btn-primary" href="{DISCORD}" target="_blank" rel="noopener">{ic("discord")} Entrar no Discord</a><a class="btn btn-ghost" href="/sobre">{ic("grid")} Explorar servidor</a></div></section>
<div class="grid">{feat("trophy","Torneios ativos","Competições frequentes com formatos dinâmicos e premiações exclusivas.")}{feat("shield","Jogos variados","Variedade de jogos para quem busca outro passatempo no servidor.")}{feat("chat","Comunidade ativa","Troca de experiências, dicas de team building e bate-papo diário.")}</div>
<div class="stats" style="margin-top:3rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))"><div class="stat rv"><span>Membros</span><b id="members" data-count="540">0</b></div><div class="stat rv"><span>Torneios realizados</span><b data-count="5">0</b></div><div class="stat rv"><span>Competitivo</span><b data-count="50" data-suf="%">0</b></div></div>''',"home")
# SOBRE
page("/sobre","Sobre",f'''{head('Sobre o <span class="grad">Servidor</span>',"Conheça nossa história, pilares e o que nos torna únicos.")}
<div class="split"><div class="rv"><h3>Nossa missão</h3><p>O <b>Eternamax Rising</b> nasceu da paixão pelo universo de Pokémon. Nosso objetivo é proporcionar um ambiente imersivo, organizado e desafiador para veteranos e novos jogadores que querem aprimorar suas habilidades táticas ou apenas se divertir.</p>
<ul class="checks"><li>{ic("check")} Staff dedicada e suporte rápido</li><li>{ic("check")} Eventos e torneios semanais</li><li>{ic("check")} Ambientes organizados para troca de ideias</li></ul></div>
<div class="stats"><div class="stat rv"><span>Membros</span><b data-count="540">0</b></div><div class="stat rv"><span>Torneios realizados</span><b data-count="5">0</b></div><div class="stat rv"><span>Competitivo</span><b data-count="50" data-suf="%">0</b></div></div></div>''',desc="Conheça a missão do Eternamax Rising.")
# RECURSOS
page("/recursos","Recursos",head('Nossos <span class="grad">Recursos</span>',"Ferramentas e utilitários da comunidade.")+'<div class="grid">'+card("/minecraft","cube","Servidor de Minecraft","Jogue no nosso servidor exclusivo, integrado com a comunidade.","Ver informações")+card("/torneios","trophy","Torneios","Consulte campeonatos oficiais, regras de tiers e participe das competições ativas.","Acessar torneios")+card("/votacoes","vote","Votações oficiais","Participe das decisões ativas da comunidade ou consulte enquetes abertas.","Acessar votações")+'</div>')
# EQUIPE
P=lambda img,n,r,d,soc:f'<div class="card profile rv" data-tilt><div class="avatar"><img src="/img/{img}" alt="Foto de {n}" width="120" height="120" loading="lazy"></div><h3 style="margin:0">{n}</h3><span class="role">{r}</span><p>{d}</p><div class="socials">{soc}</div></div>'
S=lambda i,u,t:f'<a href="{u}" target="_blank" rel="noopener" title="{t}" aria-label="{t}">{ic(i)}</a>'
page("/equipe","Equipe",head('Fundadores &amp; <span class="grad">Administração</span>',"Os treinadores responsáveis por liderar e manter o Eternamax Rising.")+'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))">'+
P("Mathias.webp","Mathias","Dono","Focado na moderação e organização de eventos da comunidade. Garante a integridade das regras, suporte aos membros e parcerias com outros servidores.",S("discord","https://discord.com/channels/@me/984234207360479272","Discord")+S("youtube","https://youtube.com/@kyuhc2?si=1OaQvFuoy9mKmfzo","YouTube"))+
P("hard.webp","Hard","Fundador","Focado na moderação e organização de eventos. Especialista no metagame competitivo, responsável pela criação do site do servidor e pelo gerenciamento geral.",S("discord","https://discord.com/channels/@me/882115784841789450","Discord"))+
P("Easy.webp","Easy","Fundador","Focado no aprimoramento do servidor e criador do bot do Eternamax. Garante a integridade das regras, suporte aos membros e parcerias com outros servidores.",S("discord","https://discord.com/channels/@me/986372053689073694","Discord"))+'</div>'+
'<div class="grid" style="margin-top:3rem">'+feat("gavel","Moderadores","Garantem a harmonia, o respeito e o cumprimento das diretrizes.")+feat("trophy","Organizadores","Criadores e árbitros dos campeonatos, tabelas e premiações.")+'</div>')
# COMUNIDADE
page("/comunidade","Comunidade",cta)
# TORNEIOS
page("/torneios","Torneios",f'''{head('Campeonatos &amp; <span class="grad">Torneios</span>',"Escolha um torneio para ver os detalhes e se inscrever.")}
<div data-admin hidden style="text-align:center;margin-bottom:2rem"><button class="btn btn-primary" id="opennew">{ic("plus")} Criar torneio</button></div>
<div id="list" class="grid"></div>
<div class="modal" id="regm"><div role="dialog" aria-modal="true"><h2>Inscrição</h2><p id="rt" style="color:var(--accent)"></p><form id="regf"><label for="nick">Seu nick no jogo</label><input id="nick" required minlength="2" maxlength="40"><label for="notes">Observações (opcional)</label><textarea id="notes" rows="3" maxlength="300"></textarea><div class="acts"><button type="button" class="btn btn-ghost" data-close="regm">Cancelar</button><button class="btn btn-primary" id="regs">Confirmar</button></div></form></div></div>
<div class="modal" id="newm"><div role="dialog" aria-modal="true"><h2>Criar novo torneio</h2><form id="newf"><label for="game">Jogo</label><select id="game"><option value="minecraft">Minecraft</option><option value="brawl_stars">Brawl Stars</option><option value="pokemon_champions">Pokémon Champions</option></select><label for="tt">Título</label><input id="tt" required minlength="3" maxlength="100" placeholder="Ex: Copa Eternamax"><label for="td">Descrição / regras</label><textarea id="td" rows="3" required minlength="3" maxlength="2000"></textarea><label>Modos / regras adicionais</label><div id="xs"><div class="row-in"><input class="xi" maxlength="200" placeholder="Modo de jogo / regra"></div></div><button type="button" class="btn btn-ghost btn-sm" id="addx">{ic("plus")} Adicionar</button><label for="tf">Anexos (até 5 arquivos de 5 MB)</label><input type="file" id="tf" multiple accept="image/*,application/pdf,text/plain"><div class="acts"><button type="button" class="btn btn-ghost" data-close="newm">Cancelar</button><button class="btn btn-primary">Publicar</button></div></form></div></div>''',"torneios")
# VOTAÇÕES
page("/votacoes","Votações",f'''{head('Painel de <span class="grad">Votações</span>',"Vote nas enquetes ativas da comunidade.")}
<div data-admin hidden class="card" style="margin-bottom:2.5rem"><h3 style="margin-top:0">Nova votação</h3><form id="pf"><label for="q">Pergunta</label><input id="q" required><label>Alternativas</label><div id="os"><div class="row-in"><input class="po" placeholder="Opção 1" required></div><div class="row-in"><input class="po" placeholder="Opção 2" required></div></div><button type="button" class="btn btn-ghost btn-sm" id="addo">{ic("plus")} Adicionar alternativa</button><label for="dur">Duração</label><select id="dur"><option value="1">1 hora</option><option value="24" selected>24 horas</option><option value="72">72 horas</option><option value="168">1 semana</option></select><label for="img">Imagem (opcional)</label><input type="file" id="img" accept="image/*"><div class="acts"><button class="btn btn-primary">{ic("vote")} Publicar</button></div></form></div>
<div id="list" class="grid"></div>''',"votacoes")
# MINECRAFT
page("/minecraft","Servidor de Minecraft",head('Servidor de <span class="grad">Minecraft</span>',"Dados de acesso e guia de recompensas.")+f'''<div class="grid"><div class="card rv"><div class="ico">{ic("server")}</div><h3>IP do servidor</h3><p>Entre com sua conta do Discord para ver IP, porta e versão.</p><div id="info" style="margin-top:1rem"></div></div>{card("/minecraft/wiki","book","Wiki","Caixas, Passe Free e Premium e Calendário Diário, com quantidades e chances.","Abrir a wiki")}</div>''',"minecraft")
# WIKI
page("/minecraft/wiki","Wiki do Minecraft",head('Wiki do <span class="grad">Minecraft</span>',"Caixas de recompensa, passe e calendário diário.")+f'''<div class="tabs" role="tablist"><button class="tab" role="tab" data-tab="caixas">{ic("box")} Caixas</button><button class="tab" role="tab" data-tab="passe-free">{ic("ticket")} Passe Free</button><button class="tab" role="tab" data-tab="passe-premium">{ic("crown")} Passe Premium</button><button class="tab" role="tab" data-tab="calendario">{ic("cal")} Calendário</button></div>
<label style="display:flex;gap:.6rem;align-items:center;justify-content:center;margin-bottom:1.5rem"><input type="checkbox" id="ids" style="width:auto"> Mostrar IDs técnicos dos itens</label><div id="root"></div>''',"wiki",active="/recursos")
open("vercel.json","w").write('{"cleanUrls":true,"trailingSlash":false,"headers":[{"source":"/assets/(.*)","headers":[{"key":"Cache-Control","value":"public, max-age=86400"}]},{"source":"/img/(.*)","headers":[{"key":"Cache-Control","value":"public, max-age=86400"}]}]}')
open("404.html","w",encoding="utf-8").write('<meta http-equiv="refresh" content="0;url=/"><title>Página não encontrada</title>')
