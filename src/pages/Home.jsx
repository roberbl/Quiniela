import SignPicker from '../components/SignPicker';
import { emptyPicks } from '../services/scoring';
export default function Home({ round, matches, prediction, setPrediction, save, allPredictions, closed }) {
  const picks = prediction.picks || emptyPicks();
  return <section className="page"><div className="hero"><p>{round.status === 'open' ? 'Jornada abierta' : 'Jornada cerrada'}</p><h1>{round.title}</h1><small>Límite: {new Date(round.deadline).toLocaleString('es-ES')}</small></div>
    {matches.map((m) => <article className="card match" key={m.id}><div><b>{m.order}. {m.home} - {m.away}</b><small>{m.competition}</small></div><SignPicker disabled={closed} value={picks[m.order]} onChange={(v)=>setPrediction({ ...prediction, picks: { ...picks, [m.order]: v } })}/></article>)}
    <article className="card"><b>Pleno al 15</b><p>{round.pleno.home} - {round.pleno.away}</p><input disabled={closed} placeholder="Resultado exacto (ej. 2-1)" value={prediction.pleno || ''} onChange={(e)=>setPrediction({...prediction, pleno:e.target.value})}/></article>
    {!closed && <button className="primary sticky" onClick={save}>Guardar quiniela</button>}
    {closed && <div><h2>Pronósticos de todos</h2>{allPredictions.map((p)=><article className="card" key={p.userId}><b>{p.name || p.userId}</b><p>{Object.values(p.picks||{}).join(' · ')} | Pleno: {p.pleno}</p></article>)}</div>}
  </section>;
}
