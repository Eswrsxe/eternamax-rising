// Ajuste aqui a URL da sua API e os caminhos. Tudo no site usa só este arquivo.
window.ETERNA={
  API_BASE:"https://eternamax-rising.vercel.app/", // <- troque pela URL real da API
  PATHS:{
    me:"/auth/me", login:"/auth/discord", logout:"/auth/logout",
    stats:"/stats", tournaments:"/tournaments", register:id=>`/tournaments/${id}/register`,
    polls:"/polls", vote:id=>`/polls/${id}/vote`, mcInfo:"/minecraft/info"
  },
  FALLBACK_MEMBERS:540
};
