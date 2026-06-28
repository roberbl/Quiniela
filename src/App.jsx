import { useMemo, useState } from 'react';
import Nav from './components/Nav';
import Home from './pages/Home';
import Ranking from './pages/Ranking';
import Season from './pages/Season';
import Rules from './pages/Rules';
import Admin from './pages/Admin';
import { mockMatches, mockRound, mockTeams, mockUsers } from './data/mock';
import { savePrediction, upsertMatch, upsertRound } from './services/firestore';
import { simpleLogin } from './services/firebase';
import { scoreRound, rankRound, computeGeneral } from './services/scoring';
import './styles.css';

export default function App() {
  const [page,setPage]=useState('home'); const [name,setName]=useState(localStorage.name||''); const [user,setUser]=useState(null);
  const [round,setRound]=useState(mockRound); const [matches,setMatches]=useState(mockMatches); const [teams]=useState(mockTeams); const [users,setUsers]=useState(mockUsers);
  const [prediction,setPrediction]=useState({ picks:{}, pleno:'' }); const [allPredictions,setAllPredictions]=useState([]); const [season,setSeason]=useState({}); const [message,setMessage]=useState('');
  const activeUser = user ? users.find(u=>u.id===user.uid) || { id:user.uid, name } : null; const isAdmin = activeUser?.role === 'admin' || name.toLowerCase()==='admin';
  const closed = round.status !== 'open' || new Date(round.deadline) < new Date();
  const rankedUsers = useMemo(()=>computeGeneral(users, Object.fromEntries(users.map(u=>[u.id,u.totalPoints||0]))),[users]);
  async function login(){ const u=await simpleLogin(name||'Familiar'); localStorage.name=name; setUser(u); setUsers(prev=>prev.some(x=>x.id===u.uid)?prev:[...prev,{id:u.uid,name,role:isAdmin?'admin':'participant'}]); }
  async function save(){ const data={...prediction,name:name||activeUser?.name}; setAllPredictions(p=>[...p.filter(x=>x.userId!==activeUser.id),{...data,userId:activeUser.id}]); try{ await savePrediction(round.id, activeUser.id, data);}catch{} setMessage('Quiniela guardada correctamente'); }
  async function saveRound(){ await upsertRound(round); setMessage('Jornada guardada'); }
  async function saveMatch(m){ await upsertMatch(round.id,m); setMessage('Partido guardado'); }
  function recalc(){ const scores=rankRound(allPredictions.map(p=>scoreRound(matches,{...p,roundPlenoResult:round.pleno.result},round.copitaId))); setUsers(users.map(u=>({...u,totalPoints:scores.find(s=>s.userId===u.id)?.points||u.totalPoints||0,copitaCount:u.id===scores[0]?.userId?(u.copitaCount||0)+1:u.copitaCount}))); setMessage('Clasificación recalculada'); }
  if(!user) return <main className="login"><h1>Quiniela familiar 2026/2027</h1><p>Entra con tu nombre o clave familiar sencilla.</p><input placeholder="Nombre o clave" value={name} onChange={e=>setName(e.target.value)}/><button className="primary" onClick={login}>Entrar</button></main>;
  return <><header><b>Quiniela 26/27</b><span>{activeUser?.name||name}</span></header>{message&&<div className="toast">{message}</div>}<main>{page==='home'&&<Home round={round} matches={matches} prediction={prediction} setPrediction={setPrediction} save={save} allPredictions={allPredictions} closed={closed}/>} {page==='ranking'&&<Ranking users={rankedUsers} teams={teams}/>} {page==='season'&&<Season season={season} setSeason={setSeason} saveSeason={()=>setMessage('Tablas guardadas')} isAdmin={isAdmin}/>} {page==='rules'&&<Rules/>} {page==='admin'&&isAdmin&&<Admin round={round} setRound={setRound} matches={matches} setMatches={setMatches} users={users} saveRound={saveRound} saveMatch={saveMatch} recalc={recalc}/>}</main><Nav page={page} setPage={setPage} isAdmin={isAdmin}/></>;
}
