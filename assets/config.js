// A API roda no mesmo projeto (pasta /api), então a URL é só "/api".
window.ETERNA={
  API_BASE:"/api", // back-end no mesmo projeto da Vercel (pasta /api)
  PATHS:{
    me:"/auth/me", login:"/auth/discord", logout:"/auth/logout",
    stats:"/stats", tournaments:"/tournaments", register:id=>`/tournaments/${id}/register`,
    polls:"/polls", vote:id=>`/polls/${id}/vote`, mcInfo:"/minecraft/info"
  },
  FALLBACK_MEMBERS:540
};