// ── Pedir permiso de notificaciones ──────────────────────────────────────────
export async function pedirPermiso() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// ── Enviar notificación ───────────────────────────────────────────────────────
function notificar(titulo, cuerpo, icono = '/icon-192.png') {
  if (Notification.permission !== 'granted') return;
  new Notification(titulo, { body: cuerpo, icon: icono, badge: '/icon-192.png' });
}

// ── Pomodoro terminado ────────────────────────────────────────────────────────
export function notifPomodoro() {
  notificar('🍅 ¡Pomodoro completado!', '25 minutos de enfoque total. ¡Descansa 5 minutos! +20 XP');
}

// ── Recordatorios programados ─────────────────────────────────────────────────
const intervalos = {};

function programar(id, fn, ms) {
  if (intervalos[id]) clearInterval(intervalos[id]);
  intervalos[id] = setInterval(fn, ms);
}

// Hábitos — una vez al día a la hora configurada
export function activarRecordatorioHabitos(hora = 20) { // 8pm por defecto
  const ahora = new Date();
  const objetivo = new Date();
  objetivo.setHours(hora, 0, 0, 0);
  if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1);
  const msHasta = objetivo - ahora;

  setTimeout(() => {
    notificar('✅ ¡Hábitos del día!', '¿Ya completaste tus hábitos de hoy? No pierdas tu racha 🔥');
    programar('habitos', () =>
      notificar('✅ ¡Hábitos del día!', '¿Ya completaste tus hábitos de hoy? No pierdas tu racha 🔥'),
      24 * 60 * 60 * 1000
    );
  }, msHasta);
}

// Hidratación — cada 2 horas
export function activarRecordatorioAgua(intervaloHoras = 2) {
  programar('agua', () =>
    notificar('💧 ¡Hora de tomar agua!', '¿Ya tomaste tu vaso de agua? Tu cuerpo te lo agradece 💙'),
    intervaloHoras * 60 * 60 * 1000
  );
}

// Stream — recordatorio a la hora configurada
export function activarRecordatorioStream(hora = 18) { // 6pm por defecto
  const ahora = new Date();
  const objetivo = new Date();
  objetivo.setHours(hora, 0, 0, 0);
  if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1);
  const msHasta = objetivo - ahora;

  setTimeout(() => {
    notificar('🎮 ¡Hora del stream!', '¡Es hora de conectarte en Kick! Tu audiencia te espera 🔴');
    programar('stream', () =>
      notificar('🎮 ¡Hora del stream!', '¡Es hora de conectarte en Kick! Tu audiencia te espera 🔴'),
      24 * 60 * 60 * 1000
    );
  }, msHasta);
}

// Horario — recordatorio general de mañana
export function activarRecordatorioHorario(hora = 7) { // 7am por defecto
  const ahora = new Date();
  const objetivo = new Date();
  objetivo.setHours(hora, 0, 0, 0);
  if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1);
  const msHasta = objetivo - ahora;

  setTimeout(() => {
    notificar('📅 ¡Buenos días Santiago!', 'Revisa tu horario de hoy y prepárate para un día increíble 🚀');
    programar('horario', () =>
      notificar('📅 ¡Buenos días Santiago!', 'Revisa tu horario de hoy y prepárate para un día increíble 🚀'),
      24 * 60 * 60 * 1000
    );
  }, msHasta);
}

// ── Activar todas ─────────────────────────────────────────────────────────────
export async function activarTodasLasNotificaciones(config = {}) {
  const permiso = await pedirPermiso();
  if (!permiso) return false;

  activarRecordatorioHabitos(config.horaHabitos || 20);
  activarRecordatorioAgua(config.intervaloAgua || 2);
  activarRecordatorioStream(config.horaStream || 18);
  activarRecordatorioHorario(config.horaHorario || 7);

  return true;
}