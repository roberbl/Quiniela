import { useState } from 'react';
import SignPicker from '../components/SignPicker';

const tabs = [
  ['rounds', 'Crear jornadas'],
  ['results', 'Añadir resultados'],
  ['predictions', 'Ver quinielas'],
  ['users', 'Usuarios'],
];

export default function Admin({ round, setRound, rounds, matches, setMatches, users, allPredictions, saveRound, saveMatch, saveAllResults, recalc, selectRound }) {
  const [tab, setTab] = useState('rounds');
  const selectedRoundTitle = `Jornada ${round.number || ''}: ${round.title || 'Sin título'}`;

  return <section className="page"><h1>Admin</h1>
    <div className="admin-tabs">{tabs.map(([id, label]) => <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)} type="button">{label}</button>)}</div>

    {tab === 'rounds' && <>
      <article className="card"><h2>Jornadas creadas</h2>{rounds.length === 0 && <p>No hay jornadas en Firebase todavía. Guarda la jornada actual para crearla.</p>}{rounds.map((r) => <button key={r.id} className={round.id === r.id ? 'selected-row' : ''} onClick={() => selectRound(r)} type="button">Jornada {r.number}: {r.title} · {r.status}</button>)}</article>
      <article className="card"><h2>Crear o editar jornada</h2><label>Número<input type="number" value={round.number} onChange={e=>setRound({...round,number:Number(e.target.value),id:`round-${e.target.value}`})}/></label><label>Título<input value={round.title} onChange={e=>setRound({...round,title:e.target.value})}/></label><label>Límite<input type="datetime-local" value={round.deadline} onChange={e=>setRound({...round,deadline:e.target.value})}/></label><label>Estado<select value={round.status} onChange={e=>setRound({...round,status:e.target.value})}><option>draft</option><option>open</option><option>closed</option></select></label><label>Copita<select value={round.copitaId || ''} onChange={e=>setRound({...round,copitaId:e.target.value})}><option value="">Sin copita</option>{users.map(u=><option value={u.id} key={u.id}>{u.name || u.username}</option>)}</select></label><label>Pleno local<input value={round.pleno?.home || ''} onChange={e=>setRound({...round,pleno:{...round.pleno,home:e.target.value}})}/></label><label>Pleno visitante<input value={round.pleno?.away || ''} onChange={e=>setRound({...round,pleno:{...round.pleno,away:e.target.value}})}/></label><button className="primary" onClick={saveRound}>Guardar jornada y partidos</button></article>
      <article className="card"><h2>Partidos de {selectedRoundTitle}</h2>{matches.map((m,idx)=><div className="admin-match" key={m.id}><b>Partido {m.order}</b><input value={m.home} onChange={e=>setMatches(matches.map((x,i)=>i===idx?{...x,home:e.target.value}:x))}/><input value={m.away} onChange={e=>setMatches(matches.map((x,i)=>i===idx?{...x,away:e.target.value}:x))}/><select value={m.competition} onChange={e=>setMatches(matches.map((x,i)=>i===idx?{...x,competition:e.target.value}:x))}><option>Primera</option><option>Segunda</option><option>Otra</option></select><button onClick={()=>saveMatch(m)}>Guardar partido</button></div>)}</article>
    </>}

    {tab === 'results' && <>
      <article className="card"><h2>Selecciona jornada</h2>{rounds.map((r) => <button key={r.id} className={round.id === r.id ? 'selected-row' : ''} onClick={() => selectRound(r)} type="button">Jornada {r.number}: {r.title}</button>)}</article>
      <article className="card"><h2>Resultados de {selectedRoundTitle}</h2><p>Marca el resultado real de cada partido. Al confirmar, se guardan resultados y se recalculan las clasificaciones.</p><label>Resultado Pleno al 15<input placeholder="Ej. 2-1" value={round.pleno?.result || ''} onChange={e=>setRound({...round,pleno:{...round.pleno,result:e.target.value}})}/></label></article>
      {matches.map((m,idx)=><article className="card" key={m.id}><b>{m.order}. {m.home} - {m.away}</b><small>{m.competition}</small><SignPicker value={m.result} onChange={v=>setMatches(matches.map((x,i)=>i===idx?{...x,result:v}:x))}/></article>)}
      <button className="primary" onClick={saveAllResults}>Confirmar resultados y actualizar clasificaciones</button>
    </>}

    {tab === 'predictions' && <>
      <article className="card"><h2>Quinielas por jornada</h2>{rounds.map((r) => <button key={r.id} className={round.id === r.id ? 'selected-row' : ''} onClick={() => selectRound(r)} type="button">Ver jornada {r.number}: {r.title}</button>)}</article>
      <article className="card"><h2>Quinielas recibidas de {selectedRoundTitle}</h2>{allPredictions.length === 0 && <p>Todavía no hay quinielas guardadas para esta jornada.</p>}{allPredictions.map((p)=><div className="prediction-review" key={p.userId}><b>{users.find(u=>u.id===p.userId)?.name || p.name || p.userId}</b><span>{Object.entries(p.picks || {}).sort(([a],[b])=>Number(a)-Number(b)).map(([k,v])=>`${k}:${v}`).join(' · ')}</span><small>Pleno: {p.pleno || 'sin pleno'}</small></div>)}</article>
    </>}

    {tab === 'users' && <article className="card"><h2>Usuarios registrados</h2>{users.map((u)=><div className="admin-row" key={u.id}><b>{u.name || u.username}</b><span>{u.role} · {u.totalPoints || 0} pts · {u.money || 0}€</span></div>)}<button className="primary" onClick={recalc}>Recalcular clasificación de la jornada seleccionada</button></article>}
  </section>;
}
