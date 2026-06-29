export const mockUsers = Array.from({ length: 12 }, (_, i) => ({ id: `u${i+1}`, name: ['Ana','Luis','Marta','Pablo','Carmen','Diego','Sofía','Javi','Elena','Raúl','Nora','Hugo'][i], teamId: `t${Math.floor(i/3)+1}`, money: 0, copitaCount: 0, role: i === 0 ? 'admin' : 'participant' }));
export const mockTeams = [1,2,3,4].map((n) => ({ id: `t${n}`, name: `Equipo ${n}` }));
export const mockRound = { id: 'round-1', number: 1, title: 'Jornada 1', status: 'open', deadline: '2026-08-14T12:00', copitaId: 'u1', pleno: { home: 'Real Madrid', away: 'Barcelona', result: '' } };
export const mockMatches = Array.from({ length: 14 }, (_, i) => ({ id: `m${i+1}`, order: i + 1, home: `Local ${i+1}`, away: `Visitante ${i+1}`, competition: i % 3 === 0 ? 'Segunda' : 'Primera', result: '' }));
