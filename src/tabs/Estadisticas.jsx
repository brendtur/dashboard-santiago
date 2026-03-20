import { useState } from 'react';
import useStore from '../store/useStore';
import './Estadisticas.css';

function ls(k, fb) { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } }

const XP_PER_LEVEL = 500;

function getDias(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split('T')[0];
  });
}

function formatFecha(fecha) {
  const [, m, d] = fecha.split('-');
  return `${d}/${m}`;
}

export default function Estadisticas() {
  const { xp, streak } = useStore();
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpCurrent = xp % XP_PER_LEVEL;
  const xpPct = (xpCurrent / XP_PER_LEVEL) * 100;

  const dias7 = getDias(7);
  const dias30 = getDias(30);

  // Horas de estudio
  const horas = ls('estudio-horas', []);
  const horasPorDia = dias7.map(fecha => ({
    fecha,
    total: horas.filter(h => h.fecha === fecha).reduce((a, h) => a + Number(h.cantidad), 0),
  }));
  const maxHoras = Math.max(...horasPorDia.map(h => h.total), 1);
  const totalHorasSemana = horasPorDia.reduce((a, h) => a + h.total, 0);

  // Hábitos
  const habitosList = ls('habitos-lista', []);
  const registros = ls('habitos-registros', {});
  const habitosPorDia = dias7.map(fecha => ({
    fecha,
    completados: habitosList.filter(h => registros[fecha]?.[h.id]).length,
    total: habitosList.length,
  }));

  // Metas
  const metas = ls('metas-data', []);
  const metasCompletadas = metas.filter(m => {
    if (!m.subtareas?.length) return false;
    return m.subtareas.every(s => s.done);
  }).length;

  // Hábitos completados hoy
  const hoy = new Date().toISOString().split('T')[0];
  const habitosHoy = habitosList.filter(h => registros[hoy]?.[h.id]).length;

  // Racha
  const rachaMaxima = (() => {
    let max = 0, actual = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const tieneActividad = horas.some(h => h.fecha === k) || habitosList.some(h => registros[k]?.[h.id]);
      if (tieneActividad) { actual++; max = Math.max(max, actual); } else actual = 0;
    }
    return max;
  })();

  return (
    <div className="stats-wrap">
      <h2 className="stats-titulo">📊 Estadísticas</h2>

      {/* ── Resumen general ── */}
      <div className="stats-resumen">
        <div className="resumen-chip resumen-chip--lila">
          <span className="rc-valor">{xp}</span>
          <span className="rc-label">XP total</span>
        </div>
        <div className="resumen-chip resumen-chip--rosa">
          <span className="rc-valor">Nv.{level}</span>
          <span className="rc-label">Nivel actual</span>
        </div>
        <div className="resumen-chip resumen-chip--teal">
          <span className="rc-valor">{streak}</span>
          <span className="rc-label">Racha actual 🔥</span>
        </div>
        <div className="resumen-chip resumen-chip--azul">
          <span className="rc-valor">{rachaMaxima}</span>
          <span className="rc-label">Racha máxima</span>
        </div>
        <div className="resumen-chip resumen-chip--amarillo">
          <span className="rc-valor">{totalHorasSemana}h</span>
          <span className="rc-label">Esta semana</span>
        </div>
        <div className="resumen-chip resumen-chip--rosa">
          <span className="rc-valor">{metasCompletadas}</span>
          <span className="rc-label">Metas logradas</span>
        </div>
      </div>

      <div className="stats-grid">

        {/* ── XP y nivel ── */}
        <div className="stats-card">
          <h3 className="stats-card-titulo">⭐ XP y Nivel</h3>
          <div className="xp-nivel-wrap">
            <div className="xp-nivel-circulo">
              <svg viewBox="0 0 100 100" width="120" height="120" style={{display:'block',margin:'0 auto'}}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg2)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#xpGrad)" strokeWidth="8"
                  strokeDasharray={`${(xpPct/100)*263.9} 263.9`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <defs>
                  <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c9a7f0" /><stop offset="100%" stopColor="#f5a7c7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="xp-nivel-txt">
                <span className="xp-nivel-num">Nv.{level}</span>
                <span className="xp-nivel-sub">{xpCurrent}/{XP_PER_LEVEL}</span>
              </div>
            </div>
            <div className="xp-info">
              <p className="xp-total">⭐ {xp} XP total acumulado</p>
              <p className="xp-falta">Faltan <strong>{XP_PER_LEVEL - xpCurrent} XP</strong> para el nivel {level + 1}</p>
              <div className="xp-tips">
                <p className="xp-tip">+3 XP — agregar tema de estudio</p>
                <p className="xp-tip">+5 XP — registrar hábito</p>
                <p className="xp-tip">+10 XP — completar meta</p>
                <p className="xp-tip">+15 XP — paso del roadmap</p>
                <p className="xp-tip">+20 XP — pomodoro completo</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Horas de estudio ── */}
        <div className="stats-card">
          <h3 className="stats-card-titulo">⏱️ Horas estudiadas esta semana</h3>
          <p className="stats-sub">Total: <strong>{totalHorasSemana}h</strong></p>
          <div className="barras-wrap">
            {horasPorDia.map(d => (
              <div key={d.fecha} className="barra-col">
                <span className="barra-val">{d.total > 0 ? `${d.total}h` : ''}</span>
                <div className="barra-bg">
                  <div className="barra-fill" style={{ height: `${(d.total / maxHoras) * 100}%` }} />
                </div>
                <span className="barra-label">{formatFecha(d.fecha)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hábitos por día ── */}
        <div className="stats-card">
          <h3 className="stats-card-titulo">✅ Hábitos esta semana</h3>
          <p className="stats-sub">Hoy: <strong>{habitosHoy}/{habitosList.length}</strong> completados</p>
          <div className="habitos-semana-grid">
            {habitosPorDia.map(d => {
              const pct = d.total > 0 ? Math.round((d.completados / d.total) * 100) : 0;
              return (
                <div key={d.fecha} className="hab-dia-col">
                  <div className="hab-circulo-bg">
                    <div className="hab-circulo-fill" style={{ height: `${pct}%` }} />
                    <span className="hab-pct">{pct}%</span>
                  </div>
                  <span className="hab-fecha">{formatFecha(d.fecha)}</span>
                </div>
              );
            })}
          </div>
          <div className="habitos-lista-mini">
            {habitosList.slice(0, 5).map(h => (
              <div key={h.id} className="hab-mini-row">
                <span>{h.emoji} {h.label}</span>
                <span className={`hab-mini-estado${registros[hoy]?.[h.id] ? ' done' : ''}`}>
                  {registros[hoy]?.[h.id] ? '✅' : '⭕'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Racha ── */}
        <div className="stats-card">
          <h3 className="stats-card-titulo">🔥 Actividad — últimos 30 días</h3>
          <div className="calendario-actividad">
            {dias30.map(fecha => {
              const tieneActividad = horas.some(h => h.fecha === fecha) || habitosList.some(h => registros[fecha]?.[h.id]);
              return (
                <div key={fecha} className={`cal-dia${tieneActividad ? ' cal-dia--activo' : ''}`} title={fecha} />
              );
            })}
          </div>
          <div className="racha-info">
            <div className="racha-chip racha-chip--actual">🔥 Racha actual: <strong>{streak} días</strong></div>
            <div className="racha-chip racha-chip--max">🏆 Racha máxima: <strong>{rachaMaxima} días</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
}