(async()=>{const{api,C,$}=E,el=$("#members");try{const d=await api(C.PATHS.stats);const n=+(d.members??d.membros??d.memberCount);if(n>0)el.textContent=n}catch{}})();
