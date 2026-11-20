// App Saúde e Rotina
const SB_URL = 'https://sacxnnvxexbtgsstrzyc.supabase.co';
const SB_KEY = 'sb_publishable_EOnkk8t-MOth7D593OAtcQ_y9UlHRht';
const sb = supabase.createClient(SB_URL, SB_KEY);
const D = APPDATA;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = { user: null, profile: null, tab: 'inicio', dia: hojeISO(), assess: null };

function hojeISO(d = new Date()) { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
function addDias(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return hojeISO(d); }
function weekday(iso) { return new Date(iso + 'T12:00:00').getDay(); }
function fmtDia(iso) { const d = new Date(iso + 'T12:00:00'); return D.DIAS[d.getDay()] + ', ' + d.toLocaleDateString('pt-BR'); }
function toast(m) { const t = $('#toast'); t.textContent = m; t.style.display = 'block'; clearTimeout(t._h); t._h = setTimeout(() => (t.style.display = 'none'), 2200); }
function err(e) { console.error(e); toast('Erro: ' + (e.message || e)); }

// ---------- Autenticação ----------
async function init() {
  const { data } = await sb.auth.getSession();
  sb.auth.onAuthStateChange((_e, sess) => { S.user = sess?.user || null; boot(); });
  S.user = data.session?.user || null;
  boot();
}

async function boot() {
  if (!S.user) { $('#nav').style.display = 'none'; $('#hdr').textContent = ''; return renderLogin(); }
  $('#nav').style.display = 'flex';
  const { data: p } = await sb.from('profiles').select('*').eq('id', S.user.id).maybeSingle();
  S.profile = p || { id: S.user.id, config: {} };
  S.expirado = !S.profile.is_admin && S.profile.valid_until && new Date(S.profile.valid_until) < new Date();
  $('#hdr').innerHTML = `${esc(S.profile.nome || S.user.email)} <button class="s" id="btnAval" style="margin-left:8px;padding:4px 10px">Avaliar o app</button>`;
  $('#btnAval').onclick = renderPesquisa;
  document.querySelector('#nav [data-t="admin"]').style.display = S.profile.is_admin ? '' : 'none';
  if (S.expirado) { $('#nav').style.display = 'none'; return renderExpirado(); }
  const { data: a } = await sb.from('assessments').select('*').order('created_at', { ascending: false }).limit(1);
  S.assess = a && a[0] ? a[0] : null;
  go(S.tab);
}

function renderExpirado() {
  const ate = new Date(S.profile.valid_until).toLocaleDateString('pt-BR');
  $('#app').innerHTML = `<div class="card"><h2>Seu período de uso terminou</h2>
  <p>O acesso ao app foi até <b>${ate}</b>. Para continuar, fale com o administrador do Saúde e Rotina.</p>
  <p class="mut">Seus registros continuam guardados e voltam a aparecer quando o acesso for renovado.</p>
  <div class="row"><button class="b" id="exAval">Avaliar o app</button><button class="s" id="exSair">Sair</button></div></div>`;
  $('#exAval').onclick = renderPesquisa;
  $('#exSair').onclick = () => sb.auth.signOut();
}

function validadeHTML() {
  if (S.profile.is_admin || !S.profile.valid_until) return '';
  const dias = Math.ceil((new Date(S.profile.valid_until) - new Date()) / 86400000);
  return dias <= 7 ? `<div class="alert">Seu acesso vale até ${new Date(S.profile.valid_until).toLocaleDateString('pt-BR')} (${dias} dia${dias === 1 ? '' : 's'}).</div>` : '';
}

async function lembretesHTML() {
  let h = '';
  const [{ data: d1 }, { data: d2 }, { data: camp }, { data: resp }] = await Promise.all([
    sb.from('daily_logs').select('dia').order('dia', { ascending: false }).limit(1),
    sb.from('meal_logs').select('dia').order('dia', { ascending: false }).limit(1),
    sb.from('survey_campaigns').select('*').eq('ativa', true).order('created_at', { ascending: false }).limit(1),
    sb.from('survey_responses').select('campaign_id')
  ]);
  const ult = [d1?.[0]?.dia, d2?.[0]?.dia].filter(Boolean).sort().pop();
  const criado = new Date(S.profile.created_at || Date.now());
  const semUso = ult ? Math.floor((new Date(hojeISO()) - new Date(ult)) / 86400000) : Math.floor((Date.now() - criado) / 86400000);
  if (semUso >= 3) h += `<div class="alert"><b>Sentimos sua falta.</b> Faz ${semUso} dias sem registros. A sua disciplina é o principal componente do sistema: o app só mostra resultado com o seu registro de cada dia. Que tal começar agora, pelo sono desta noite?</div>`;
  const criadoHa = Math.floor((Date.now() - criado) / 86400000);
  if (criadoHa >= 7 && (S.profile.config || {}).ultimo_rel_semana !== inicioSemana()) h += `<div class="alert">${semUso >= 3 ? 'Veja como foi a sua semana e retome o ritmo.' : 'Seu relatório da semana está pronto.'} <button class="s" id="semBtn">Ver relatório da semana</button></div>`;
  const c = camp?.[0];
  if (c && !(resp || []).some((r) => r.campaign_id === c.id)) h += `<div class="alert">Queremos ouvir você: <b>${esc(c.titulo)}</b>. <button class="s" id="campBtn">Responder a pesquisa</button></div>`;
  S.campanha = c || null;
  return h;
}

// ---------- INÍCIO (DASHBOARD) ----------
async function renderInicio() {
  $('#app').innerHTML = '<div class="card">Carregando…</div>';
  const hoje = hojeISO(), ini = addDias(hoje, -6);
  const [lemb, sem, { data: itens }, { data: logsHoje }, { data: dailyHoje }, { count: nSug }] = await Promise.all([
    lembretesHTML(), dadosPeriodo(ini, hoje),
    sb.from('plan_items').select('id,qtd').eq('weekday', weekday(hoje)).eq('ativo', true),
    sb.from('meal_logs').select('plan_item_id,qtd').eq('dia', hoje),
    sb.from('daily_logs').select('categoria,dados').eq('dia', hoje),
    sb.from('plan_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pendente')
  ]);
  const dh = (c) => (dailyHoje || []).find((x) => x.categoria === c)?.dados;
  const plan = (itens || []).filter((i) => i.qtd);
  const feitos = plan.filter((p) => (logsHoje || []).some((l) => l.plan_item_id === p.id)).length;
  const sono = dh('sono'), agua = dh('agua'), treino = dh('treino'), emoc = dh('emocional');
  const adSem = mediaArr(sem.ad);
  const nome = (S.profile.nome || '').split(' ')[0];
  const hora = new Date().getHours();
  const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const tile = (t, ic, label, info) => `<button class="tile" data-go="${t}"><span style="font-size:22px">${ic}</span><b>${label}</b><span class="mut">${info}</span></button>`;
  let h = `<div class="card"><h2>${saud}${nome ? ', ' + esc(nome) : ''}!</h2><p class="mut">${fmtDia(hoje)}</p></div>`;
  if ((S.profile.config || {}).ajuda_versao !== window.AJUDA.VERSAO) h += `<div class="alert">${(S.profile.config || {}).ajuda_versao ? 'O app foi atualizado. Veja as novidades e como usar.' : 'Primeira vez aqui? Veja o treinamento rápido de como usar o app.'} <button class="s" data-go="ajuda">Abrir treinamento</button></div>`;
  h += validadeHTML() + lemb + alertasHTML();
  h += `<div class="card"><h2>Hoje</h2><div class="grid2">
    <div class="met"><span class="mut">Sono registrado</span><b>${sono ? (sono.qualidade != null ? sono.qualidade + '/10' : 'sim') : '—'}</b></div>
    <div class="met"><span class="mut">Itens do plano</span><b>${feitos}/${plan.length}</b></div>
    <div class="met"><span class="mut">Copos de água</span><b>${agua?.copos || 0}/10</b></div>
    <div class="met"><span class="mut">Treino</span><b>${treino?.voltas ? treino.voltas + ' volta(s)' : '—'}</b></div>
    <div class="met"><span class="mut">Humor</span><b>${emoc?.humor != null ? emoc.humor + '/10' : '—'}</b></div>
    <div class="met"><span class="mut">Estresse</span><b>${emoc?.estresse != null ? emoc.estresse + '/10' : '—'}</b></div>
  </div><button class="b" data-go="hoje" style="width:100%;margin-top:10px">Registrar o dia</button></div>`;
  h += `<div class="card"><h2>Últimos 7 dias</h2><div class="grid2">
    <div class="met"><span class="mut">Dias com registro</span><b>${sem.diasReg.size}/7</b></div>
    <div class="met"><span class="mut">Cumprimento da dieta</span><b>${adSem != null ? Math.round(adSem) + '%' : '—'}</b></div>
    <div class="met"><span class="mut">Dias com treino</span><b>${sem.treinos}</b></div>
    <div class="met"><span class="mut">Sono (média)</span><b>${mediaArr(sem.sonoQ) != null ? mediaArr(sem.sonoQ).toFixed(1) : '—'}</b></div>
  </div><button class="s" id="ini_sem" style="width:100%;margin-top:10px">Ver relatório da semana</button></div>`;
  h += `<div class="grid2">
    ${tile('hoje', '📝', 'Registrar', 'refeições, sono, água')}
    ${tile('plano', '🍽️', 'Meu plano', nSug ? nSug + ' sugestão(ões)' : 'cardápio da semana')}
    ${tile('avaliacao', '📋', 'Avaliação', S.assess ? 'última em ' + new Date(S.assess.created_at).toLocaleDateString('pt-BR') : 'ainda não feita')}
    ${tile('exames', '🧪', 'Exames', 'resultados e histórico')}
    ${tile('emocional', '🧠', 'Emocional', (S.profile.config || {}).emoc_inicio ? 'programa em andamento' : 'programa de 10 semanas')}
    ${tile('relatorio', '📊', 'Relatórios', '7 e 30 dias')}
    ${tile('pesquisa', '⭐', 'Avaliar o app', 'sua opinião')}
    ${tile('ajuda', '🎓', 'Como usar', 'treinamento do app')}
    ${S.profile.is_admin ? tile('admin', '⚙️', 'Administração', 'usuários e pesquisas') : ''}
  </div>`;
  $('#app').innerHTML = h;
  document.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => (b.dataset.go === 'pesquisa' ? renderPesquisa() : go(b.dataset.go))));
  $('#ini_sem').onclick = renderSemanal;
  const cb = $('#campBtn'); if (cb) cb.onclick = renderPesquisa;
  const sbn = $('#semBtn'); if (sbn) sbn.onclick = renderSemanal;
}

// ---------- TREINAMENTO ----------
function renderAjuda() {
  const A = window.AJUDA;
  let h = `<div class="card"><h2>Como usar o app</h2><p class="mut">Versão ${esc(A.VERSAO)}</p>
  <h3>Novidades</h3><ul>${A.NOVIDADES.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`;
  A.LICOES.filter((l) => !l.admin || S.profile.is_admin).forEach((l, k) => {
    h += `<details class="card" ${k === 0 ? 'open' : ''}><summary><b>${esc(l.t)}</b></summary><ol>${l.p.map((p) => `<li style="margin:6px 0">${esc(p)}</li>`).join('')}</ol></details>`;
  });
  h += `<div class="card"><button class="b" id="aj_ok" style="width:100%">Entendi, ir para o início</button></div>`;
  $('#app').innerHTML = h; window.scrollTo(0, 0);
  $('#aj_ok').onclick = () => { saveConfig({ ajuda_versao: A.VERSAO }).catch(() => {}); go('inicio'); };
}

// ---------- RELATÓRIO SEMANAL ----------
function inicioSemana(iso = hojeISO()) { const wd = weekday(iso); return addDias(iso, -((wd + 6) % 7)); }

async function dadosPeriodo(ini, fim) {
  const [{ data: itens }, { data: logs }, { data: daily }] = await Promise.all([
    sb.from('plan_items').select('*').eq('ativo', true),
    sb.from('meal_logs').select('*').gte('dia', ini).lte('dia', fim),
    sb.from('daily_logs').select('*').gte('dia', ini).lte('dia', fim)
  ]);
  const r = { diasReg: new Set(), mod: {}, ad: [], porItem: {}, porRef: {}, extras: {}, sonoQ: [], desp: [], humor: [], estr: [], copos: [], treinos: 0, leitura: [], redes: [] };
  (logs || []).forEach((l) => { r.diasReg.add(l.dia); r.mod['Refeições'] = (r.mod['Refeições'] || new Set()).add(l.dia); if (l.tipo !== 'plano') r.extras[l.alimento] = (r.extras[l.alimento] || 0) + 1; });
  const nomes = { sono: 'Sono', agua: 'Água', treino: 'Treino', rotina: 'Leitura e lazer', emocional: 'Humor e estresse', habitos: 'Hábitos' };
  (daily || []).forEach((d) => {
    r.diasReg.add(d.dia); (r.mod[nomes[d.categoria]] = r.mod[nomes[d.categoria]] || new Set()).add(d.dia);
    const x = d.dados || {};
    if (d.categoria === 'sono') { if (x.qualidade != null) r.sonoQ.push(x.qualidade); if (x.vezes != null) r.desp.push(x.vezes); }
    if (d.categoria === 'emocional') { if (x.humor != null) r.humor.push(x.humor); if (x.estresse != null) r.estr.push(x.estresse); }
    if (d.categoria === 'agua' && x.copos != null) r.copos.push(x.copos);
    if (d.categoria === 'treino' && x.voltas > 0) r.treinos++;
    if (d.categoria === 'rotina') { if (x.leitura != null) r.leitura.push(x.leitura); if (x.redes != null) r.redes.push(x.redes); }
  });
  for (let dia = ini; dia <= fim; dia = addDias(dia, 1)) {
    const plan = (itens || []).filter((i) => i.weekday === weekday(dia) && i.qtd);
    const lg = (logs || []).filter((l) => l.dia === dia);
    if (!lg.length || !plan.length) continue;
    let s = 0;
    plan.forEach((p) => {
      const l = lg.find((x) => x.plan_item_id === p.id); const v = l && p.qtd ? Math.min(1, (l.qtd || 0) / p.qtd) : 0; s += v;
      const a = (r.porItem[p.alimento] = r.porItem[p.alimento] || { s: 0, n: 0 }); a.s += v; a.n++;
      const b = (r.porRef[p.meal] = r.porRef[p.meal] || { s: 0, n: 0 }); b.s += v; b.n++;
    });
    r.ad.push((s / plan.length) * 100);
  }
  return r;
}
const mediaArr = (a) => (a.length ? a.reduce((x, y) => x + Number(y), 0) / a.length : null);

async function renderSemanal() {
  $('#app').innerHTML = '<div class="card">Montando seu relatório…</div>';
  const fim = hojeISO(), ini = addDias(fim, -6), iniAnt = addDias(ini, -7), fimAnt = addDias(ini, -1);
  const [a, b] = await Promise.all([dadosPeriodo(ini, fim), dadosPeriodo(iniAnt, fimAnt)]);
  const todos = ['Sono', 'Refeições', 'Água', 'Treino', 'Leitura e lazer', 'Humor e estresse', 'Hábitos'];
  const usados = todos.filter((m) => a.mod[m]);
  const naoUsados = todos.filter((m) => !a.mod[m]);
  const comp = (nome, va, vb, casas = 1, menorMelhor = false, suf = '') => {
    if (va == null) return `<tr><td>${nome}</td><td>—</td><td></td></tr>`;
    let seta = '';
    if (vb != null) { const dif = va - vb; const bom = menorMelhor ? dif < 0 : dif > 0; seta = Math.abs(dif) < 0.05 ? '= igual' : `<span style="color:${bom ? 'var(--ac)' : 'var(--dtx)'}">${dif > 0 ? '▲' : '▼'} ${Math.abs(dif).toFixed(casas)}${suf}</span>`; }
    return `<tr><td>${nome}</td><td><b>${va.toFixed(casas)}${suf}</b></td><td>${seta}</td></tr>`;
  };
  const piores = Object.entries(a.porItem).map(([k, v]) => [k, (v.s / v.n) * 100]).filter((x) => x[1] < 80).sort((x, y) => x[1] - y[1]).slice(0, 5);
  const refs = Object.entries(a.porRef).map(([k, v]) => [D.REFEICOES.find((r) => r.key === k)?.nome || k, (v.s / v.n) * 100]).sort((x, y) => x[1] - y[1]);
  const extras = Object.entries(a.extras).sort((x, y) => y[1] - x[1]).slice(0, 5);
  const diasUso = a.diasReg.size;
  let h = `<div class="card"><h2>Relatório da semana</h2><p class="mut">${new Date(ini + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(fim + 'T12:00:00').toLocaleDateString('pt-BR')}, comparado com a semana anterior.</p>
  <p>Você registrou algo em <b>${diasUso} de 7 dias</b>.</p><div class="bar"><i style="width:${Math.round((diasUso / 7) * 100)}%"></i></div>
  ${diasUso < 4 ? '<div class="alert" style="margin-top:10px">Esta semana teve poucos registros. Lembre-se: a sua disciplina é o principal componente do sistema. Comece pelo mais simples, como o sono ao acordar e a água, e vá aumentando.</div>' : '<p class="ok" style="margin-top:10px">Boa constância! Continue registrando para ver o impacto com mais clareza.</p>'}</div>`;
  h += `<div class="card"><h2>O que você usou</h2>${usados.map((m) => `<span class="tag">${m} · ${a.mod[m].size} dia${a.mod[m].size === 1 ? '' : 's'}</span>`).join('') || '<p class="mut">Nenhum registro.</p>'}
  ${naoUsados.length ? `<h3>Não usou esta semana</h3><p>${naoUsados.join(', ')}</p>` : ''}</div>`;
  h += `<div class="card"><h2>Seu avanço</h2><table><tr><th></th><th>Esta semana</th><th>Mudança</th></tr>
  ${comp('Cumprimento da dieta', mediaArr(a.ad), mediaArr(b.ad), 0, false, '%')}
  ${comp('Dias com treino', a.treinos, b.treinos, 0)}
  ${comp('Copos de água por dia', mediaArr(a.copos), mediaArr(b.copos))}
  ${comp('Qualidade do sono (0-10)', mediaArr(a.sonoQ), mediaArr(b.sonoQ))}
  ${comp('Despertares por noite', mediaArr(a.desp), mediaArr(b.desp), 1, true)}
  ${comp('Humor (0-10)', mediaArr(a.humor), mediaArr(b.humor))}
  ${comp('Estresse (0-10)', mediaArr(a.estr), mediaArr(b.estr), 1, true)}
  ${comp('Leitura (min/dia)', mediaArr(a.leitura), mediaArr(b.leitura), 0)}
  ${comp('Redes sociais (h/dia)', mediaArr(a.redes), mediaArr(b.redes), 1, true)}</table></div>`;
  h += `<div class="card"><h2>Onde a dieta está falhando mais</h2>
  ${refs.length ? `<h3>Por refeição</h3><table>${refs.map(([n, v]) => `<tr><td>${n}</td><td><b>${Math.round(v)}%</b></td><td style="width:40%"><div class="bar"><i style="width:${Math.round(v)}%"></i></div></td></tr>`).join('')}</table>` : '<p class="mut">Registre as refeições para ver esta parte.</p>'}
  ${piores.length ? `<h3>Itens que você mais deixou de comer</h3><ul>${piores.map(([n, v]) => `<li>${esc(n)} — ${Math.round(v)}% do planejado</li>`).join('')}</ul>` : ''}
  ${extras.length ? `<h3>O que mais entrou fora do plano</h3><ul>${extras.map(([n, v]) => `<li>${esc(n)} (${v}x)</li>`).join('')}</ul>` : ''}
  ${refs[0] && refs[0][1] < 70 ? `<div class="alert">Foco da próxima semana: ${refs[0][0].toLowerCase()}. Se ela não cabe na sua rotina, ajuste o plano em vez de pular.</div>` : ''}</div>`;
  h += `<div class="card"><button class="s" id="sem_voltar">Voltar</button></div>`;
  $('#app').innerHTML = h; window.scrollTo(0, 0);
  $('#sem_voltar').onclick = () => go(S.tab);
  saveConfig({ ultimo_rel_semana: inicioSemana() }).catch(() => {});
}

// ---------- PESQUISA DE SATISFAÇÃO ----------
const PESQUISA = [
  ['usando', 'Você está usando o app?', 'u', ['Sim, todo dia', 'Sim, algumas vezes por semana', 'Pouco', 'Parei de usar']],
  ['motivo_parar', 'Se usa pouco ou parou, por quê?', 'm', ['Falta de tempo', 'Esqueço', 'É difícil de usar', 'Não vi resultado', 'Perdi a motivação', 'Problemas técnicos', 'Outro']],
  ['partes', 'Quais partes você usa', 'm', ['Registro de refeições', 'Água', 'Treino', 'Sono', 'Humor e estresse', 'Hábitos', 'Exames', 'Programa emocional', 'Relatórios', 'Plano']],
  ['facilidade', 'O app é fácil de usar? (0 a 10)', 'e'],
  ['utilidade', 'O app está ajudando sua saúde? (0 a 10)', 'e'],
  ['mudanca', 'Percebeu alguma mudança desde que começou', 'm', ['Durmo melhor', 'Mais disposição', 'Glicose melhor', 'Perdi ou ganhei peso como queria', 'Menos estresse', 'Como melhor', 'Nenhuma ainda']],
  ['gosta', 'O que você mais gosta no app', 't'],
  ['nao_gosta', 'O que você menos gosta', 't'],
  ['falta', 'O que falta no app', 't'],
  ['recomenda', 'De 0 a 10, quanto você recomendaria o app a um amigo', 'e'],
  ['pagaria', 'Você continuaria usando se fosse pago', 'u', ['Sim', 'Talvez', 'Não']],
  ['valor', 'Quanto pagaria por mês', 'u', ['Até R$ 10', 'R$ 10 a R$ 20', 'R$ 20 a R$ 40', 'Mais de R$ 40', 'Não pagaria']],
  ['comentario', 'Comentários livres', 't']
];

function renderPesquisa() {
  $('#nav').style.display = 'none';
  let h = `<div class="card"><h2>Pesquisa de satisfação</h2><p class="mut">Sua opinião ajuda a melhorar o app. Leva uns 3 minutos.${S.campanha ? ' Pesquisa: ' + esc(S.campanha.titulo) : ''}</p>`;
  PESQUISA.forEach(([id, t, tp, opts]) => {
    let inp = '';
    if (tp === 'e') inp = `<input type="number" min="0" max="10" data-p="${id}" placeholder="0 a 10">`;
    else if (tp === 't') inp = `<textarea rows="2" data-p="${id}"></textarea>`;
    else if (tp === 'u') inp = `<div class="opts">${opts.map((o) => `<label><input type="radio" name="p_${id}" data-p="${id}" value="${esc(o)}">${esc(o)}</label>`).join('')}</div>`;
    else inp = `<div class="opts">${opts.map((o) => `<label><input type="checkbox" data-pm="${id}" value="${esc(o)}">${esc(o)}</label>`).join('')}</div>`;
    h += `<div class="q"><div>${esc(t)}</div>${inp}</div>`;
  });
  h += `<div class="row"><button class="b" id="pq_ok">Enviar</button><button class="s" id="pq_no">Voltar</button></div></div>`;
  $('#app').innerHTML = h; window.scrollTo(0, 0);
  $('#pq_no').onclick = () => (S.expirado ? renderExpirado() : ($('#nav').style.display = 'flex', go(S.tab)));
  $('#pq_ok').onclick = async () => {
    const r = {};
    document.querySelectorAll('[data-p]').forEach((el) => { if (el.type === 'radio') { if (el.checked) r[el.dataset.p] = el.value; } else if (el.value !== '') r[el.dataset.p] = el.type === 'number' ? Number(el.value) : el.value; });
    document.querySelectorAll('[data-pm]').forEach((el) => { if (el.checked) (r[el.dataset.pm] = r[el.dataset.pm] || []).push(el.value); });
    if (!Object.keys(r).length) return toast('Responda pelo menos uma pergunta');
    const { error } = await sb.from('survey_responses').insert({ user_id: S.user.id, campaign_id: S.campanha?.id || null, respostas: r });
    if (error) return err(error);
    toast('Obrigado pela sua avaliação!');
    $('#pq_no').click();
  };
}

// ---------- ADMINISTRADOR ----------
async function renderAdmin() {
  if (!S.profile.is_admin) return go('hoje');
  const [{ data: us, error }, { data: camps }, { data: resps }] = await Promise.all([
    sb.rpc('admin_usuarios'), sb.from('survey_campaigns').select('*').order('created_at', { ascending: false }), sb.from('survey_responses').select('*').order('created_at', { ascending: false })
  ]);
  if (error) return err(error);
  let h = `<div class="card"><h2>Usuários</h2><div style="overflow-x:auto"><table><tr><th>Nome / e-mail</th><th>Válido até</th><th>Último registro</th><th>Dias usados</th><th>Nova data</th></tr>`;
  (us || []).forEach((u) => {
    const venc = new Date(u.valid_until) < new Date();
    const semUso = u.ultimo_registro ? Math.floor((new Date(hojeISO()) - new Date(u.ultimo_registro)) / 86400000) : null;
    h += `<tr><td>${esc(u.nome || '')}<div class="mut">${esc(u.email || '')}</div></td>
    <td>${new Date(u.valid_until).toLocaleDateString('pt-BR')}${venc ? ' <b style="color:var(--dtx)">vencido</b>' : ''}</td>
    <td>${u.ultimo_registro ? new Date(u.ultimo_registro + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}${semUso != null && semUso >= 3 ? ` <span class="tag">${semUso} dias parado</span>` : ''}</td>
    <td>${u.dias_com_registro}</td>
    <td><input type="date" class="adm_d" data-id="${u.id}" style="width:150px"><button class="s adm_ok" data-id="${u.id}">Salvar</button>
    <div class="row" style="margin-top:4px"><button class="s adm_mais" data-id="${u.id}" data-v="${u.valid_until}" data-n="30">+30 dias</button><button class="s adm_bloq" data-id="${u.id}">Bloquear hoje</button></div></td></tr>`;
  });
  h += `</table></div><p class="mut">Usuários parados há 3 dias ou mais veem o lembrete de disciplina ao abrir o app.</p></div>`;
  h += `<div class="card"><h2>Pesquisas de satisfação</h2><div class="row"><input id="cp_tit" placeholder="Título da pesquisa (ex.: Avaliação de dezembro)" style="flex:2"><button class="b" id="cp_new">Disparar nova pesquisa</button></div>
  ${(camps || []).map((c) => `<div class="it" style="grid-template-columns:1fr auto"><div>${esc(c.titulo)} <span class="mut">${new Date(c.created_at).toLocaleDateString('pt-BR')} · ${(resps || []).filter((r) => r.campaign_id === c.id).length} respostas</span></div>
  <button class="s cp_tg" data-id="${c.id}" data-a="${c.ativa}">${c.ativa ? 'Encerrar' : 'Reativar'}</button></div>`).join('')}</div>`;
  const nps = (resps || []).map((r) => r.respostas.recomenda).filter((x) => x != null);
  const med = (k) => { const v = (resps || []).map((r) => r.respostas[k]).filter((x) => x != null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '-'; };
  const npsScore = nps.length ? Math.round(((nps.filter((x) => x >= 9).length - nps.filter((x) => x <= 6).length) / nps.length) * 100) : '-';
  h += `<div class="card"><h2>Resultados (${(resps || []).length} respostas)</h2><table><tr><td>Facilidade (média)</td><td><b>${med('facilidade')}</b></td></tr><tr><td>Utilidade (média)</td><td><b>${med('utilidade')}</b></td></tr><tr><td>NPS (recomendação)</td><td><b>${npsScore}</b></td></tr></table>
  ${(resps || []).slice(0, 30).map((r) => `<details style="margin-top:6px"><summary>${new Date(r.created_at).toLocaleDateString('pt-BR')} · ${esc(r.respostas.usando || '')}</summary><div class="mut">${Object.entries(r.respostas).map(([k, v]) => `<div><b>${esc(k)}:</b> ${esc(Array.isArray(v) ? v.join(', ') : v)}</div>`).join('')}</div></details>`).join('')}</div>`;
  $('#app').innerHTML = h;
  const setVal = async (id, iso) => { const { error } = await sb.rpc('admin_definir_validade', { p_user: id, p_ate: iso }); if (error) return err(error); toast('Validade atualizada'); renderAdmin(); };
  document.querySelectorAll('.adm_ok').forEach((b) => (b.onclick = () => { const v = document.querySelector(`.adm_d[data-id="${b.dataset.id}"]`).value; if (!v) return toast('Escolha a data'); setVal(b.dataset.id, v); }));
  document.querySelectorAll('.adm_mais').forEach((b) => (b.onclick = () => { const base = new Date(b.dataset.v) > new Date() ? hojeISO(new Date(b.dataset.v)) : hojeISO(); setVal(b.dataset.id, addDias(base, 30)); }));
  document.querySelectorAll('.adm_bloq').forEach((b) => (b.onclick = () => setVal(b.dataset.id, addDias(hojeISO(), -1))));
  $('#cp_new').onclick = async () => { const t = $('#cp_tit').value.trim(); if (!t) return toast('Informe o título'); await sb.from('survey_campaigns').update({ ativa: false }).eq('ativa', true); const { error } = await sb.from('survey_campaigns').insert({ titulo: t }); if (error) return err(error); toast('Pesquisa disparada para todos'); renderAdmin(); };
  document.querySelectorAll('.cp_tg').forEach((b) => (b.onclick = async () => { const { error } = await sb.from('survey_campaigns').update({ ativa: b.dataset.a !== 'true' }).eq('id', b.dataset.id); if (error) return err(error); renderAdmin(); }));
}

function renderLogin(modo = 'entrar') {
  $('#app').innerHTML = `<div class="card"><h2>${modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h2>
  ${modo === 'criar' ? '<div class="q"><div>Nome</div><input id="lnome"></div>' : ''}
  <div class="q"><div>E-mail</div><input id="lemail" type="email" autocomplete="email"></div>
  <div class="q"><div>Senha (mínimo 6 caracteres)</div><input id="lsenha" type="password"></div>
  <div class="row"><button class="b" id="lgo">${modo === 'entrar' ? 'Entrar' : 'Criar conta'}</button>
  <button class="s" id="ltroca">${modo === 'entrar' ? 'Criar conta nova' : 'Já tenho conta'}</button></div>
  <p class="mut">Este app ajuda a medir e organizar alimentação, exercícios e rotina. Ele não substitui o médico ou o nutricionista e nunca indica remédios ou suplementos.</p></div>`;
  $('#ltroca').onclick = () => renderLogin(modo === 'entrar' ? 'criar' : 'entrar');
  $('#lgo').onclick = async () => {
    const email = $('#lemail').value.trim(), password = $('#lsenha').value;
    if (!email || password.length < 6) return toast('Preencha e-mail e senha (6+ caracteres)');
    try {
      if (modo === 'entrar') { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; }
      else {
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { nome: $('#lnome').value.trim() } } });
        if (error) throw error;
        if (!data.session) toast('Conta criada. Confirme pelo link enviado ao seu e-mail e depois entre.');
      }
    } catch (e) { err(e); }
  };
}

// ---------- Navegação ----------
document.querySelectorAll('#nav button').forEach((b) => (b.onclick = () => go(b.dataset.t)));
function go(t) {
  S.tab = t;
  document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
  ({ ajuda: renderAjuda, inicio: renderInicio, hoje: renderHoje, plano: renderPlano, avaliacao: renderAvaliacao, exames: renderExames, emocional: renderEmocional, relatorio: renderRelatorio, admin: renderAdmin }[t])();
  window.scrollTo(0, 0);
}

// ---------- Utilidades de dados ----------
async function getDaily(dia, cat) {
  const { data } = await sb.from('daily_logs').select('dados').eq('dia', dia).eq('categoria', cat).maybeSingle();
  return data ? data.dados : {};
}
async function setDaily(dia, cat, dados) {
  const { error } = await sb.from('daily_logs').upsert({ user_id: S.user.id, dia, categoria: cat, dados }, { onConflict: 'user_id,dia,categoria' });
  if (error) throw error;
}
async function saveConfig(patch) {
  S.profile.config = Object.assign({}, S.profile.config || {}, patch);
  const { error } = await sb.from('profiles').update({ config: S.profile.config }).eq('id', S.user.id);
  if (error) throw error;
}

// ---------- Alertas a partir da avaliação ----------
function regrasAvaliacao(a) {
  const al = [], sug = [];
  if (!a) return { al, sug };
  const has = (k, v) => Array.isArray(a[k]) ? a[k].includes(v) : a[k] === v;
  const yes = (k) => a[k] === 'Sim';
  const diab = has('cond_metab', 'Diabetes tipo 1') || has('cond_metab', 'Diabetes tipo 2') || has('cond_metab', 'Pré-diabetes');
  const semAuto = yes('gestante') || has('cirurgias', 'Bariátrica') || has('tratamentos', 'Quimioterapia ou radioterapia') || has('cond_mental', 'Transtorno alimentar') || has('cond_outras', 'Câncer (tratamento ou acompanhamento)');
  if (semAuto) al.push(['danger', 'Pela sua situação (gestação, bariátrica, tratamento de câncer ou transtorno alimentar), o app não monta plano sozinho. Use o registro e siga a orientação da sua equipe de saúde.']);
  if ((yes('insulina') || has('rem_diabetes', 'Glibenclamida') || has('rem_diabetes', 'Gliclazida')) && a.horario_treino === 'Antes do trabalho') al.push(['', 'Você usa insulina ou remédio que pode baixar muito a glicose e treina cedo: coma algo pequeno antes (meia fruta) e pare se sentir tremor, suor frio ou tontura.']);
  if (has('cond_rins', 'Doença renal crônica') || has('cond_rins', 'Diálise')) al.push(['danger', 'Com doença nos rins, o app não aumenta a proteína. Converse com seu médico ou nutricionista sobre as quantidades.']);
  if (has('cond_coracao', 'Infarto ou angina') || has('cond_coracao', 'Insuficiência cardíaca') || has('cirurgias', 'Coração') || a.escada_sensacao === 'Com falta de ar') al.push(['danger', 'Antes de começar ou aumentar os exercícios, peça liberação ao seu médico.']);
  if (yes('cirurgia_recente')) al.push(['danger', 'Cirurgia nos últimos 3 meses: exercícios só depois da liberação médica.']);
  if (Number(a.sono_despertares) > 2) al.push(['', 'Você acorda mais de 2 vezes por noite. Vale conversar com seu médico: pode ter relação com glicose, próstata ou apneia.']);
  if (has('sono_motivo', 'Suor') || has('sono_motivo', 'Fome')) al.push(['', 'Acordar com suor ou fome pode ser glicose baixa de madrugada. Fale com seu médico.']);
  if (yes('ronco') || has('cond_pulmao', 'Apneia do sono')) al.push(['', 'Ronco forte ou pausas na respiração podem indicar apneia do sono. Fale com seu médico.']);
  if (a.alcool === 'Todo dia' && has('habitos', 'Álcool') && a.habitos_meta === 'Parar') al.push(['danger', 'Quem bebe todo dia não deve parar de uma vez sem orientação: procure um médico antes.']);
  if (has('sex_dificuldade', 'Dificuldade de ereção') && a.sex_tempo && a.sex_tempo !== 'Menos de 3 meses') al.push(['', 'Dificuldade de ereção há mais de 3 meses merece consulta médica, principalmente com diabetes, pressão ou colesterol alto.']);
  if (Number(a.fin_preocupa) >= 7 || yes('fin_dividas') || yes('fin_falta')) {
    al.push(['', 'A preocupação com dinheiro pesa na saúde, no sono e no humor. O app vai priorizar alimentos mais baratos e trazer dicas de economia na cozinha.']);
    sug.push('Finanças: usar proteínas mais baratas (ovos, frango, fígado, sardinha em lata, panga), comprar frutas e verduras da estação, cozinhar em quantidade e congelar porções, levar marmita e fazer lista de compras semanal.');
  }
  if (a.orcamento === 'Econômico') sug.push('Orçamento econômico: priorizar ovos, frango, fígado, sardinha em lata e legumes da estação.');
  if (diab) sug.push('Diabetes: pouco açúcar, carboidrato controlado e distribuído, proteína e verduras em toda refeição; movimento depois das refeições.');
  if (has('cond_coracao', 'Pressão alta') || has('cond_coracao', 'Pré-hipertensão')) sug.push('Pressão: padrão DASH, menos sal, embutidos e ultraprocessados; mais frutas, verduras, leite e castanhas.');
  if (has('cond_coracao', 'Colesterol ou triglicerídeos altos')) sug.push('Colesterol: menos frituras e gordura saturada (bacon), mais peixe, azeite e fibras.');
  if (a.perda_musculo && a.perda_musculo !== 'Não' && !has('cond_rins', 'Doença renal crônica')) sug.push('Perda de músculo: proteína em todas as refeições e treino de força 2 a 3 vezes por semana.');
  if (has('cond_ossos', 'Osteoporose')) sug.push('Osteoporose: mais cálcio (leite, iogurte, queijo, sardinha com espinha), sol pela manhã, exercícios de força e equilíbrio.');
  if (has('cond_digest', 'Gastrite ou refluxo')) sug.push('Gastrite e refluxo: refeições menores, evitar frituras e não deitar até 2 horas depois de comer.');
  if (has('cond_digest', 'Intestino preso')) sug.push('Intestino preso: mais fibras, frutas com casca, verduras e água; caminhada diária.');
  if (has('cond_metab', 'Gota ou ácido úrico alto')) sug.push('Gota: menos miúdos, frutos do mar, álcool e bebidas açucaradas; mais água.');
  if (has('alergias', 'Lactose') || has('cond_digest', 'Intolerância à lactose')) sug.push('Lactose: trocar leite, iogurte e queijos por versões sem lactose.');
  if (has('alergias', 'Glúten') || has('cond_digest', 'Doença celíaca')) sug.push('Glúten: retirar trigo, cevada e centeio do plano.');
  if (Number(a.estresse) >= 7 || has('cond_mental', 'Ansiedade') || has('cond_mental', 'Depressão')) sug.push('Estresse: começar o programa emocional de 10 semanas, manter lazer diário e leitura antes de dormir.');
  if (Number(a.redes_horas) >= 2 || ['Ansioso', 'Triste ou se comparando', 'Irritado'].includes(a.redes_efeito)) sug.push('Redes sociais: limitar a 1 hora por dia com o timer do celular, desativar notificações, deixar de seguir perfis que trazem comparação ou ansiedade e trocar parte desse tempo por lazer ao vivo.');
  if (a.redes_noite === 'Sim' || a.celular_acordar === 'Sim') sug.push('Celular: sem tela na última hora antes de dormir e nos primeiros 30 minutos depois de acordar; carregar o celular fora do quarto.');
  if (a.noticias === 'Mais de 1 hora' || a.noticias === '30 a 60 min') sug.push('Notícias: escolher um horário fixo e no máximo 20 minutos por dia; o excesso aumenta o estresse.');
  if (Number(a.sentado_horas) >= 8 || a.pausas === 'Quase nunca') sug.push('Tempo sentado: levantar e andar 2 a 3 minutos a cada hora; isso também ajuda a glicose e a pressão.');
  if (a.sol !== undefined && Number(a.sol) < 3) sug.push('Sol: 15 minutos de sol nos braços pela manhã, pelo menos 3 dias por semana.');
  if (a.comer_tela === 'Quase sempre') sug.push('Refeições: comer sem tela, devagar e prestando atenção na fome e na saciedade.');
  if (Number(a.trabalho_horas) >= 10) sug.push('Trabalho: jornada longa pede pausas curtas, marmita pronta na véspera e um momento de descanso fixo à noite.');
  if (a.convivio === 'Raramente' || Number(a.solidao) >= 7) sug.push('Convívio: marcar um encontro por semana com amigos ou família; a solidão afeta o humor, o sono e o coração.');
  if (a.postura_dor === 'Sim') sug.push('Postura: tela na altura dos olhos e alongamento de pescoço e costas nas pausas.');
  if (a.higiene_bucal === 'Não') sug.push('Saúde bucal: escovar e passar fio dental todo dia; a gengiva inflamada piora a glicose e o coração.');
  if (a.tela_cama === 'Sim') sug.push('Sono: trocar o celular na cama por leitura em papel 30 minutos antes de dormir.');
  return { al, sug };
}

function alertasHTML() {
  const { al } = regrasAvaliacao(S.assess?.answers);
  return al.map(([c, t]) => `<div class="alert ${c}">${esc(t)}</div>`).join('');
}

// ---------- HOJE ----------
async function renderHoje() {
  const dia = S.dia, wd = weekday(dia);
  $('#app').innerHTML = '<div class="card">Carregando…</div>';
  const [{ data: itens }, { data: logs }, sono, agua, treino, rotina, emoc, hab] = await Promise.all([
    sb.from('plan_items').select('*').eq('weekday', wd).eq('ativo', true).order('ordem'),
    sb.from('meal_logs').select('*').eq('dia', dia),
    getDaily(dia, 'sono'), getDaily(dia, 'agua'), getDaily(dia, 'treino'), getDaily(dia, 'rotina'), getDaily(dia, 'emocional'), getDaily(dia, 'habitos')
  ]);
  const logPorItem = {}; (logs || []).forEach((l) => { if (l.plan_item_id) logPorItem[l.plan_item_id] = l; });
  let h = `<div class="card row" style="justify-content:space-between"><button class="s" id="dprev">◀</button><b>${fmtDia(dia)}</b><button class="s" id="dnext">▶</button></div>`;
  if (!itens || !itens.length) h += `<div class="alert">Seu plano ainda está vazio. Vá em <b>Plano</b> para carregar o plano modelo ou montar o seu.</div>`;

  // Sono
  h += `<div class="card"><h2>Como foi o sono desta noite</h2>
  <div class="row"><div style="flex:1"><div class="mut">Deitou</div><input type="time" id="s_deitou" value="${esc(sono.deitou || '')}"></div>
  <div style="flex:1"><div class="mut">Pegou no sono</div><input type="time" id="s_dormiu" value="${esc(sono.dormiu || '')}"></div>
  <div style="flex:1"><div class="mut">Acordou</div><input type="time" id="s_acordou" value="${esc(sono.acordou || '')}"></div></div>
  <div class="row" style="margin-top:8px"><div style="flex:1"><div class="mut">Vezes que acordou</div><input type="number" min="0" id="s_vezes" value="${esc(sono.vezes ?? '')}"></div>
  <div style="flex:1"><div class="mut">Qualidade (0-10)</div><input type="number" min="0" max="10" id="s_qual" value="${esc(sono.qualidade ?? '')}"></div>
  <div style="flex:1"><div class="mut">Descansado (0-10)</div><input type="number" min="0" max="10" id="s_desc" value="${esc(sono.descansado ?? '')}"></div></div>
  <div class="q" style="margin-top:8px"><div class="mut">Por que acordou</div><div class="opts">${['Urinar', 'Fome', 'Suor', 'Calor', 'Frio', 'Barulho', 'Ronco', 'Ansiedade', 'Dor', 'Não sei'].map((o) => `<label><input type="checkbox" class="s_mot" value="${o}" ${(sono.motivos || []).includes(o) ? 'checked' : ''}>${o}</label>`).join('')}</div></div>
  <div class="row"><div style="flex:1"><div class="mut">Glicose ao acordar (se mediu)</div><input type="number" id="s_gli" value="${esc(sono.glicose ?? '')}"></div>
  <div style="flex:2"><div class="mut">Observações</div><input id="s_obs" value="${esc(sono.obs || '')}"></div></div>
  <div style="margin-top:8px"><button class="b" id="s_save">Salvar sono</button></div></div>`;

  // Refeições
  for (const r of D.REFEICOES) {
    const its = (itens || []).filter((i) => i.meal === r.key);
    const extras = (logs || []).filter((l) => l.meal === r.key && l.tipo !== 'plano');
    if (!its.length && !extras.length) continue;
    h += `<div class="card"><h2>${r.nome} <span class="mut">${esc(its[0]?.hora || r.hora)}</span></h2>`;
    its.forEach((i) => {
      const l = logPorItem[i.id];
      h += `<div class="it"><div>${esc(i.alimento)}<div class="plan">Planejado: ${i.qtd ?? '-'} ${esc(i.unidade || '')}</div></div>
      <input type="number" step="any" inputmode="decimal" class="ml" data-id="${i.id}" data-meal="${r.key}" data-nome="${esc(i.alimento)}" data-un="${esc(i.unidade || '')}" placeholder="comi" value="${l ? l.qtd ?? '' : ''}">
      <span class="mut">${esc(i.unidade || '')}</span></div>`;
    });
    extras.forEach((l) => { h += `<div class="it"><div>${esc(l.alimento)}<div class="plan">${l.tipo === 'troca' ? 'Troca' : 'Fora do plano'}</div></div><div>${l.qtd ?? ''} ${esc(l.unidade || '')}</div><button class="s del" data-id="${l.id}" aria-label="Apagar">✕</button></div>`; });
    h += `<div class="row" style="margin-top:8px"><button class="s addx" data-meal="${r.key}" data-tipo="troca">Troquei por outro</button><button class="s addx" data-meal="${r.key}" data-tipo="extra">Adicionar fora do plano</button></div></div>`;
  }
  h += `<div class="card"><h2>Fora de qualquer refeição</h2><button class="s addx" data-meal="avulso" data-tipo="extra">Adicionar o que comi</button>
  ${(logs || []).filter((l) => l.meal === 'avulso').map((l) => `<div class="it"><div>${esc(l.alimento)}</div><div>${l.qtd ?? ''} ${esc(l.unidade || '')}</div><button class="s del" data-id="${l.id}">✕</button></div>`).join('')}</div>`;
  h += `<div class="card"><button class="b" id="ml_save" style="width:100%">Salvar refeições</button></div>`;

  // Água e sucos
  h += `<div class="card"><h2>Água e sucos</h2><p class="mut">Meta: cerca de 2,5 litros de água (10 copos de 250 ml), concentrada até o fim da tarde.</p>
  <div class="row" style="justify-content:space-around"><div class="cnt"><button class="s cnt-b" data-k="copos" data-d="-1">−</button><b id="c_copos">${agua.copos || 0}</b><button class="s cnt-b" data-k="copos" data-d="1">+</button> copos de água</div>
  <div class="cnt"><button class="s cnt-b" data-k="sucos" data-d="-1">−</button><b id="c_sucos">${agua.sucos || 0}</b><button class="s cnt-b" data-k="sucos" data-d="1">+</button> sucos</div></div></div>`;

  // Treino
  const ex = treino.ex || {};
  h += `<div class="card"><h2>Treino (05:35)</h2><div class="row"><span class="mut">Voltas feitas</span><input type="number" min="0" id="t_voltas" style="width:80px" value="${esc(treino.voltas ?? '')}"></div>
  ${D.EXERCICIOS.map((e, k) => `<div class="it"><div>${e.nome}<div class="plan">Meta: ${e.meta}</div></div><input type="number" min="0" class="t_ex" data-k="${k}" placeholder="feitas" value="${esc(ex[k] ?? '')}"><span class="mut">rep.</span></div>`).join('')}
  <div class="q"><div class="mut">Como se sentiu / observações</div><input id="t_obs" value="${esc(treino.obs || '')}"></div>
  <button class="b" id="t_save">Salvar treino</button></div>`;

  // Rotina: leitura e lazer
  h += `<div class="card"><h2>Leitura e lazer</h2><div class="row"><div style="flex:1"><div class="mut">Minutos de leitura</div><input type="number" min="0" id="r_leit" value="${esc(rotina.leitura ?? '')}"></div>
  <div style="flex:2"><div class="mut">Lazer do dia</div><input id="r_lazer" value="${esc(rotina.lazer || '')}" placeholder="ex.: filme em família"></div></div>
  <div class="row" style="margin-top:8px"><div style="flex:1"><div class="mut">Horas em redes sociais</div><input type="number" step="0.5" min="0" id="r_redes" value="${esc(rotina.redes ?? '')}"></div>
  <div style="flex:1"><div class="mut">Minutos de sol</div><input type="number" min="0" id="r_sol" value="${esc(rotina.sol ?? '')}"></div>
  <div style="flex:1"><div class="mut">Horas sentado</div><input type="number" step="0.5" min="0" id="r_sent" value="${esc(rotina.sentado ?? '')}"></div></div>
  <div class="opts" style="margin-top:6px"><label><input type="checkbox" id="r_semtela" ${rotina.semtela ? 'checked' : ''}>Sem celular na última hora antes de dormir</label><label><input type="checkbox" id="r_pausas" ${rotina.pausas ? 'checked' : ''}>Fiz pausas para levantar</label></div>
  <div class="q" style="margin-top:8px"><div class="mut">O que fiz de diferente do plano hoje</div><textarea id="r_dif" rows="2">${esc(rotina.diferente || '')}</textarea></div>
  <button class="b" id="r_save">Salvar</button></div>`;

  // Emocional e finanças
  h += `<div class="card"><h2>Humor, estresse e finanças</h2><div class="row"><div style="flex:1"><div class="mut">Humor (0-10)</div><input type="number" min="0" max="10" id="e_humor" value="${esc(emoc.humor ?? '')}"></div>
  <div style="flex:1"><div class="mut">Estresse (0-10)</div><input type="number" min="0" max="10" id="e_estr" value="${esc(emoc.estresse ?? '')}"></div>
  <div style="flex:1"><div class="mut">Preocupação com dinheiro (0-10)</div><input type="number" min="0" max="10" id="e_fin" value="${esc(emoc.financas ?? '')}"></div></div>
  <div class="q" style="margin-top:8px"><div class="mut">O que causou estresse</div><input id="e_causa" value="${esc(emoc.causa || '')}"></div>
  <div class="q"><div class="mut">O que fiz para lidar</div><div class="opts">${['Respiração', 'Caminhada', 'Conversa', 'Leitura', 'Lazer', 'Música', 'Nada'].map((o) => `<label><input type="checkbox" class="e_lid" value="${o}" ${(emoc.lidar || []).includes(o) ? 'checked' : ''}>${o}</label>`).join('')}</div></div>
  <div class="q"><div class="mut">Gratidão do dia</div><input id="e_grat" value="${esc(emoc.gratidao || '')}"></div>
  <button class="b" id="e_save">Salvar</button>
  <p class="mut">Se estiver muito triste ou pensando em se machucar, ligue para o CVV: 188 (24 horas, gratuito), ou procure o CAPS ou um pronto-atendimento.</p></div>`;

  // Hábitos
  h += `<div class="card"><h2>Hábitos (confidencial)</h2><div class="row"><div style="flex:2"><div class="mut">Hábito</div><input id="h_hab" value="${esc(hab.habito || '')}" placeholder="ex.: doces, cigarro, celular"></div>
  <div style="flex:1"><div class="mut">Teve impulso?</div><select id="h_imp"><option value="">-</option><option ${hab.impulso === 'Sim' ? 'selected' : ''}>Sim</option><option ${hab.impulso === 'Não' ? 'selected' : ''}>Não</option></select></div>
  <div style="flex:1"><div class="mut">Cedeu?</div><select id="h_ced"><option value="">-</option><option ${hab.cedeu === 'Sim' ? 'selected' : ''}>Sim</option><option ${hab.cedeu === 'Não' ? 'selected' : ''}>Não</option></select></div></div>
  <div class="row" style="margin-top:8px"><div style="flex:1"><div class="mut">Quanto</div><input id="h_qtd" value="${esc(hab.quanto || '')}"></div><div style="flex:2"><div class="mut">Gatilho / o que fiz no lugar</div><input id="h_gat" value="${esc(hab.gatilho || '')}"></div></div>
  <div style="margin-top:8px"><button class="b" id="h_save">Salvar</button></div>
  <p class="mut">Ajuda: CAPS AD (SUS), Alcoólicos Anônimos, Narcóticos Anônimos, Jogadores Anônimos, programa de tabagismo na unidade de saúde.</p></div>`;

  $('#app').innerHTML = h;

  const cb = $('#campBtn'); if (cb) cb.onclick = renderPesquisa;
  const sbn = $('#semBtn'); if (sbn) sbn.onclick = renderSemanal;
  $('#dprev').onclick =() => { S.dia = addDias(S.dia, -1); renderHoje(); };
  $('#dnext').onclick = () => { S.dia = addDias(S.dia, 1); renderHoje(); };
  $('#s_save').onclick = () => setDaily(dia, 'sono', { deitou: $('#s_deitou').value, dormiu: $('#s_dormiu').value, acordou: $('#s_acordou').value, vezes: num($('#s_vezes').value), qualidade: num($('#s_qual').value), descansado: num($('#s_desc').value), motivos: [...document.querySelectorAll('.s_mot:checked')].map((x) => x.value), glicose: num($('#s_gli').value), obs: $('#s_obs').value }).then(() => toast('Sono salvo')).catch(err);
  $('#ml_save').onclick = async () => {
    try {
      const ins = [], delIds = [];
      document.querySelectorAll('.ml').forEach((inp) => {
        const id = inp.dataset.id, old = logPorItem[id], v = inp.value.trim();
        if (old) delIds.push(old.id);
        if (v !== '') ins.push({ user_id: S.user.id, dia, meal: inp.dataset.meal, plan_item_id: id, tipo: 'plano', alimento: inp.dataset.nome, qtd: Number(v), unidade: inp.dataset.un });
      });
      if (delIds.length) { const { error } = await sb.from('meal_logs').delete().in('id', delIds); if (error) throw error; }
      if (ins.length) { const { error } = await sb.from('meal_logs').insert(ins); if (error) throw error; }
      toast('Refeições salvas'); renderHoje();
    } catch (e) { err(e); }
  };
  document.querySelectorAll('.addx').forEach((b) => (b.onclick = () => dialogoExtra(dia, b.dataset.meal, b.dataset.tipo)));
  document.querySelectorAll('.del').forEach((b) => (b.onclick = async () => { const { error } = await sb.from('meal_logs').delete().eq('id', b.dataset.id); if (error) return err(error); renderHoje(); }));
  document.querySelectorAll('.cnt-b').forEach((b) => (b.onclick = async () => {
    agua[b.dataset.k] = Math.max(0, (agua[b.dataset.k] || 0) + Number(b.dataset.d));
    $('#c_' + b.dataset.k).textContent = agua[b.dataset.k];
    setDaily(dia, 'agua', agua).catch(err);
  }));
  $('#t_save').onclick = () => { const exs = {}; document.querySelectorAll('.t_ex').forEach((i) => { if (i.value !== '') exs[i.dataset.k] = Number(i.value); }); setDaily(dia, 'treino', { voltas: num($('#t_voltas').value), ex: exs, obs: $('#t_obs').value }).then(() => toast('Treino salvo')).catch(err); };
  $('#r_save').onclick = () => setDaily(dia, 'rotina', { leitura: num($('#r_leit').value), lazer: $('#r_lazer').value, redes: num($('#r_redes').value), sol: num($('#r_sol').value), sentado: num($('#r_sent').value), semtela: $('#r_semtela').checked, pausas: $('#r_pausas').checked, diferente: $('#r_dif').value }).then(() => toast('Salvo')).catch(err);
  $('#e_save').onclick = () => {
    const d = { humor: num($('#e_humor').value), estresse: num($('#e_estr').value), financas: num($('#e_fin').value), causa: $('#e_causa').value, lidar: [...document.querySelectorAll('.e_lid:checked')].map((x) => x.value), gratidao: $('#e_grat').value };
    setDaily(dia, 'emocional', d).then(() => { toast('Salvo'); if (d.humor !== null && d.humor <= 2) alertaCrise(); }).catch(err);
  };
  $('#h_save').onclick = () => setDaily(dia, 'habitos', { habito: $('#h_hab').value, impulso: $('#h_imp').value, cedeu: $('#h_ced').value, quanto: $('#h_qtd').value, gatilho: $('#h_gat').value }).then(() => toast('Salvo')).catch(err);
}
function num(v) { return v === '' || v == null ? null : Number(v); }

function alertaCrise() {
  const div = document.createElement('div');
  div.className = 'alert danger';
  div.innerHTML = 'Seu humor está muito baixo hoje. Você não precisa passar por isso sozinho: converse com alguém de confiança ou ligue para o CVV no 188 (24 horas, gratuito). Se estiver em perigo, procure um pronto-atendimento.';
  $('#app').prepend(div);
  window.scrollTo(0, 0);
}

function dialogoExtra(dia, meal, tipo) {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `<h3>${tipo === 'troca' ? 'Troquei por outro' : 'Adicionar fora do plano'}</h3>
  <div class="row"><div style="flex:2"><input id="x_nome" placeholder="Alimento"></div><div style="flex:1"><input id="x_qtd" type="number" step="any" placeholder="Qtd"></div>
  <div style="flex:1"><select id="x_un"><option>g</option><option>ml</option><option>un</option><option>fatia</option><option>col.</option><option>copo</option></select></div></div>
  <div class="row" style="margin-top:8px"><button class="b" id="x_ok">Adicionar</button><button class="s" id="x_no">Cancelar</button></div>`;
  $('#app').prepend(box); window.scrollTo(0, 0);
  $('#x_no').onclick = () => box.remove();
  $('#x_ok').onclick = async () => {
    const nome = $('#x_nome').value.trim(); if (!nome) return toast('Informe o alimento');
    const { error } = await sb.from('meal_logs').insert({ user_id: S.user.id, dia, meal, tipo, alimento: nome, qtd: num($('#x_qtd').value), unidade: $('#x_un').value });
    if (error) return err(error);
    renderHoje();
  };
}

// ---------- PLANO ----------
async function renderPlano() {
  const { data: itens } = await sb.from('plan_items').select('*').order('weekday').order('ordem');
  const { data: sugs } = await sb.from('plan_suggestions').select('*').eq('status', 'pendente').order('created_at', { ascending: false });
  let h = '';
  if (sugs && sugs.length) {
    h += `<div class="card"><h2>Sugestões de mudança</h2><p class="mut">Nada muda sem você confirmar. Ao aceitar, ajuste os itens abaixo conforme a sugestão.</p>`;
    sugs.forEach((s) => { h += `<div class="alert"><div>${esc(s.texto)}</div><div class="mut">${esc(s.origem || '')}</div><div class="row" style="margin-top:6px"><button class="s sg" data-id="${s.id}" data-st="aceita">Aceitar</button><button class="s sg" data-id="${s.id}" data-st="recusada">Recusar</button></div></div>`; });
    h += '</div>';
  }
  h += `<div class="card"><h2>Seu plano semanal</h2>
  ${!itens || !itens.length ? `<p>Seu plano está vazio.</p><button class="b" id="p_modelo">Carregar plano modelo (cardápio do Norton)</button>` : '<p class="mut">Toque em um dia para ver e editar.</p>'}</div>`;
  for (const wd of [1, 2, 3, 4, 5, 6, 0]) {
    const its = (itens || []).filter((i) => i.weekday === wd);
    h += `<details class="card"><summary><b>${D.DIAS[wd]}</b> <span class="mut">(${its.length} itens)</span></summary>`;
    for (const r of D.REFEICOES) {
      const ri = its.filter((i) => i.meal === r.key);
      h += `<h3>${r.nome}</h3>`;
      ri.forEach((i) => { h += `<div class="it"><div>${esc(i.alimento)}</div><div>${i.qtd ?? ''} ${esc(i.unidade || '')}</div><button class="s pdel" data-id="${i.id}">✕</button></div>`; });
      h += `<div class="row"><input class="pn" data-wd="${wd}" data-meal="${r.key}" placeholder="Novo alimento" style="flex:2"><input class="pq" type="number" step="any" placeholder="Qtd" style="flex:1"><select class="pu" style="flex:1"><option>g</option><option>ml</option><option>un</option><option>fatia</option><option>col.</option></select><button class="s padd">+</button></div>`;
    }
    h += '</details>';
  }
  h += `<div class="card"><button class="s" id="sair">Sair da conta</button></div>`;
  $('#app').innerHTML = h;
  const pm = $('#p_modelo'); if (pm) pm.onclick = carregarModelo;
  $('#sair').onclick = () => sb.auth.signOut();
  document.querySelectorAll('.sg').forEach((b) => (b.onclick = async () => { const { error } = await sb.from('plan_suggestions').update({ status: b.dataset.st }).eq('id', b.dataset.id); if (error) return err(error); renderPlano(); }));
  document.querySelectorAll('.pdel').forEach((b) => (b.onclick = async () => { const { error } = await sb.from('plan_items').delete().eq('id', b.dataset.id); if (error) return err(error); renderPlano(); }));
  document.querySelectorAll('.padd').forEach((b) => (b.onclick = async () => {
    const row = b.parentElement, n = row.querySelector('.pn');
    if (!n.value.trim()) return toast('Informe o alimento');
    const r = D.REFEICOES.find((x) => x.key === n.dataset.meal);
    const { error } = await sb.from('plan_items').insert({ user_id: S.user.id, weekday: Number(n.dataset.wd), meal: n.dataset.meal, hora: r.hora, alimento: n.value.trim(), qtd: num(row.querySelector('.pq').value), unidade: row.querySelector('.pu').value, ordem: 99 });
    if (error) return err(error);
    renderPlano();
  }));
}

async function carregarModelo() {
  const rows = [];
  for (const wd of Object.keys(D.PLANO_MODELO)) {
    const dia = D.PLANO_MODELO[wd];
    for (const r of D.REFEICOES) {
      (dia[r.key] || []).forEach(([alimento, qtd, unidade], k) => rows.push({ user_id: S.user.id, weekday: Number(wd), meal: r.key, hora: r.hora, alimento, qtd, unidade, ordem: k }));
    }
  }
  const { error } = await sb.from('plan_items').insert(rows);
  if (error) return err(error);
  toast('Plano modelo carregado'); renderPlano();
}

// ---------- AVALIAÇÃO ----------
function renderAvaliacao() {
  const a = S.assess?.answers || {};
  let h = `<div class="card"><h2>Questionário de avaliação</h2><p class="mut">Responda o que souber; pode deixar em branco. Refaça a cada 30 dias.${S.assess ? ' Última avaliação: ' + new Date(S.assess.created_at).toLocaleDateString('pt-BR') + '.' : ''}</p></div>`;
  h += alertasHTML();
  D.QUESTIONARIO.forEach((sec, si) => {
    h += `<details class="card" ${si === 0 ? 'open' : ''}><summary><b>${sec.sec}</b>${sec.reav ? ' <span class="tag">mensal</span>' : ''}</summary>`;
    sec.q.forEach(([id, t, tp, opts]) => {
      const v = a[id];
      let inp = '';
      if (tp === 'n') inp = `<input type="number" step="any" data-q="${id}" value="${esc(v ?? '')}">`;
      else if (tp === 'e') inp = `<input type="number" min="0" max="10" data-q="${id}" value="${esc(v ?? '')}" placeholder="0 a 10">`;
      else if (tp === 'h') inp = `<input type="time" data-q="${id}" value="${esc(v ?? '')}">`;
      else if (tp === 'd') inp = `<input type="date" data-q="${id}" value="${esc(v ?? '')}">`;
      else if (tp === 't') inp = `<input data-q="${id}" value="${esc(v ?? '')}">`;
      else if (tp === 's') inp = `<div class="opts">${['Sim', 'Não'].map((o) => `<label><input type="radio" name="${id}" data-q="${id}" value="${o}" ${v === o ? 'checked' : ''}>${o}</label>`).join('')}</div>`;
      else if (tp === 'u') inp = `<div class="opts">${opts.map((o) => `<label><input type="radio" name="${id}" data-q="${id}" value="${esc(o)}" ${v === o ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div>`;
      else if (tp === 'm') inp = `<div class="opts">${opts.map((o) => `<label><input type="checkbox" data-qm="${id}" value="${esc(o)}" ${(v || []).includes(o) ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div>`;
      h += `<div class="q"><div>${esc(t)}</div>${inp}</div>`;
    });
    h += '</details>';
  });
  h += `<div class="card"><button class="b" id="a_save" style="width:100%">Salvar avaliação e gerar sugestões</button></div>`;
  $('#app').innerHTML = h;
  $('#a_save').onclick = async () => {
    const ans = {};
    document.querySelectorAll('[data-q]').forEach((el) => {
      if (el.type === 'radio') { if (el.checked) ans[el.dataset.q] = el.value; }
      else if (el.value !== '') ans[el.dataset.q] = el.type === 'number' ? Number(el.value) : el.value;
    });
    document.querySelectorAll('[data-qm]').forEach((el) => { if (el.checked) (ans[el.dataset.qm] = ans[el.dataset.qm] || []).push(el.value); });
    try {
      const { data, error } = await sb.from('assessments').insert({ user_id: S.user.id, answers: ans }).select().single();
      if (error) throw error;
      S.assess = data;
      if (ans.nome || ans.nascimento || ans.sexo) await sb.from('profiles').update({ nome: ans.nome || S.profile.nome, nascimento: ans.nascimento || null, sexo: ans.sexo || null }).eq('id', S.user.id);
      const { sug } = regrasAvaliacao(ans);
      if (sug.length) await sb.from('plan_suggestions').insert(sug.map((t) => ({ user_id: S.user.id, origem: 'Avaliação de ' + new Date().toLocaleDateString('pt-BR'), texto: t })));
      toast('Avaliação salva' + (sug.length ? ' — veja as sugestões em Plano' : ''));
      renderAvaliacao();
    } catch (e) { err(e); }
  };
}

// ---------- EXAMES ----------
async function renderExames() {
  const { data: ex } = await sb.from('exam_results').select('*').order('data_coleta', { ascending: false });
  let h = `<div class="card"><h2>Registrar exame</h2>
  <div class="q"><div>Exame</div><select id="x_ex">${D.EXAMES.map((e) => `<option>${e[0]}</option>`).join('')}<option value="__outro">Outro…</option></select><input id="x_outro" placeholder="Nome do exame" style="display:none;margin-top:6px"></div>
  <div class="row"><div style="flex:1"><div class="mut">Data da coleta</div><input type="date" id="x_data" value="${hojeISO()}"></div><div style="flex:1"><div class="mut">Valor</div><input type="number" step="any" id="x_val"></div><div style="flex:1"><div class="mut">Unidade</div><input id="x_un"></div></div>
  <div class="row" style="margin-top:8px"><div style="flex:1"><div class="mut">Referência mínima (do laudo)</div><input type="number" step="any" id="x_min"></div><div style="flex:1"><div class="mut">Referência máxima (do laudo)</div><input type="number" step="any" id="x_max"></div></div>
  <div style="margin-top:8px"><button class="b" id="x_save">Salvar exame</button></div>
  <p class="mut">Use sempre a referência do seu laudo. O app sugere mudanças só em alimentação e exercícios; nunca remédios ou suplementos.</p></div>`;
  const porExame = {};
  (ex || []).forEach((e) => (porExame[e.exame] = porExame[e.exame] || []).push(e));
  h += `<div class="card"><h2>Histórico</h2>${!ex || !ex.length ? '<p class="mut">Nenhum exame registrado.</p>' : ''}`;
  for (const nome of Object.keys(porExame)) {
    const lst = porExame[nome];
    h += `<h3>${esc(nome)}</h3><table><tr><th>Data</th><th>Valor</th><th>Situação</th><th>Evolução</th></tr>`;
    lst.forEach((e, k) => {
      const ant = lst[k + 1];
      const st = e.ref_max != null && e.valor > e.ref_max ? '<b style="color:var(--dtx)">Alto</b>' : e.ref_min != null && e.valor < e.ref_min ? '<b style="color:var(--dtx)">Baixo</b>' : '<span class="ok">Na faixa</span>';
      const ev = ant ? (e.valor > ant.valor ? '▲ subiu' : e.valor < ant.valor ? '▼ desceu' : '= igual') : '';
      h += `<tr><td>${new Date(e.data_coleta + 'T12:00:00').toLocaleDateString('pt-BR')}</td><td>${e.valor} ${esc(e.unidade || '')}</td><td>${st}</td><td>${ev}</td></tr>`;
    });
    h += '</table>';
  }
  h += '</div>';
  $('#app').innerHTML = h;
  const sel = $('#x_ex');
  const fill = () => { const e = D.EXAMES.find((x) => x[0] === sel.value); $('#x_outro').style.display = sel.value === '__outro' ? 'block' : 'none'; $('#x_un').value = e ? e[1] : ''; $('#x_min').value = e && e[2] != null ? e[2] : ''; $('#x_max').value = e && e[3] != null && e[3] !== 999 ? e[3] : ''; };
  sel.onchange = fill; fill();
  $('#x_save').onclick = async () => {
    const nome = sel.value === '__outro' ? $('#x_outro').value.trim() : sel.value;
    const valor = num($('#x_val').value);
    if (!nome || valor === null) return toast('Informe exame e valor');
    const rmin = num($('#x_min').value), rmax = num($('#x_max').value);
    const { error } = await sb.from('exam_results').insert({ user_id: S.user.id, data_coleta: $('#x_data').value, exame: nome, valor, unidade: $('#x_un').value, ref_min: rmin, ref_max: rmax });
    if (error) return err(error);
    const regra = D.EXAMES.find((x) => x[0] === nome);
    let texto = null;
    if (regra && rmax != null && valor > rmax && regra[4]) texto = `${nome} alto (${valor}): ${regra[4]}`;
    if (regra && rmin != null && valor < rmin && regra[5]) texto = `${nome} baixo (${valor}): ${regra[5]}`;
    if (texto) { await sb.from('plan_suggestions').insert({ user_id: S.user.id, origem: 'Exame de ' + new Date($('#x_data').value + 'T12:00:00').toLocaleDateString('pt-BR'), texto }); toast('Exame salvo — há uma sugestão em Plano'); }
    else toast('Exame salvo');
    renderExames();
  };
}

// ---------- EMOCIONAL ----------
async function renderEmocional() {
  const cfg = S.profile.config || {};
  const inicio = cfg.emoc_inicio;
  let h = `<div class="card"><h2>Programa de saúde emocional</h2><p class="mut">10 semanas, uma característica por semana. Uma lição, uma habilidade e um exercício diário. Não substitui psicólogo ou psiquiatra.</p>`;
  if (!inicio) h += `<button class="b" id="em_ini">Começar o programa hoje</button></div>`;
  else {
    const sem = Math.min(10, Math.floor((new Date(hojeISO()) - new Date(inicio)) / 86400000 / 7) + 1);
    const w = D.SEMANAS_EMOCIONAL[sem - 1];
    const notas = cfg.emoc_notas || {};
    h += `<div class="tag">Semana ${sem} de 10</div><h3>${w.c}</h3><p><b>Habilidade:</b> ${w.h}</p><p><b>Exercício diário:</b> ${w.e}</p>
    <div class="row"><div style="flex:1"><div class="mut">Quanto tenho essa característica no início (0-10)</div><input type="number" min="0" max="10" id="em_a" value="${esc(notas[sem]?.ini ?? '')}"></div>
    <div style="flex:1"><div class="mut">E no fim da semana (0-10)</div><input type="number" min="0" max="10" id="em_b" value="${esc(notas[sem]?.fim ?? '')}"></div></div>
    <div class="q" style="margin-top:8px"><div class="mut">Meu compromisso da semana</div><input id="em_c" value="${esc(notas[sem]?.comp || '')}"></div>
    <button class="b" id="em_save">Salvar</button> <button class="s" id="em_reset">Recomeçar</button></div>`;
    h += `<div class="card"><h2>Todas as semanas</h2><table><tr><th>#</th><th>Característica</th><th>Início</th><th>Fim</th></tr>${D.SEMANAS_EMOCIONAL.map((x, k) => `<tr><td>${k + 1}</td><td>${x.c}</td><td>${notas[k + 1]?.ini ?? ''}</td><td>${notas[k + 1]?.fim ?? ''}</td></tr>`).join('')}</table></div>`;
    $('#app').innerHTML = h;
    $('#em_save').onclick = () => { notas[sem] = { ini: num($('#em_a').value), fim: num($('#em_b').value), comp: $('#em_c').value }; saveConfig({ emoc_notas: notas }).then(() => toast('Salvo')).catch(err); };
    $('#em_reset').onclick = () => saveConfig({ emoc_inicio: hojeISO(), emoc_notas: {} }).then(renderEmocional).catch(err);
    return;
  }
  $('#app').innerHTML = h;
  $('#em_ini').onclick = () => saveConfig({ emoc_inicio: hojeISO() }).then(renderEmocional).catch(err);
}

// ---------- RELATÓRIOS ----------
async function renderRelatorio(dias = 7) {
  const ini = addDias(hojeISO(), -(dias - 1));
  const [{ data: itens }, { data: logs }, { data: daily }] = await Promise.all([
    sb.from('plan_items').select('*').eq('ativo', true),
    sb.from('meal_logs').select('*').gte('dia', ini),
    sb.from('daily_logs').select('*').gte('dia', ini)
  ]);
  const linhas = [];
  let somaAd = 0, nAd = 0;
  for (let k = 0; k < dias; k++) {
    const dia = addDias(ini, k), wd = weekday(dia);
    const plan = (itens || []).filter((i) => i.weekday === wd && i.qtd);
    const lg = (logs || []).filter((l) => l.dia === dia);
    const dl = (c) => (daily || []).find((x) => x.dia === dia && x.categoria === c)?.dados || {};
    let ad = null;
    if (lg.length && plan.length) {
      let s = 0; plan.forEach((p) => { const l = lg.find((x) => x.plan_item_id === p.id); s += l && p.qtd ? Math.min(1, (l.qtd || 0) / p.qtd) : 0; });
      ad = Math.round((s / plan.length) * 100); somaAd += ad; nAd++;
    }
    const fora = lg.filter((l) => l.tipo !== 'plano').length;
    const sono = dl('sono'), agua = dl('agua'), tr = dl('treino'), em = dl('emocional'), ro = dl('rotina');
    linhas.push({ dia, ad, fora, vezes: sono.vezes, qual: sono.qualidade, copos: agua.copos, treino: tr.voltas, humor: em.humor, estresse: em.estresse, fin: em.financas, leit: ro.leitura, redes: ro.redes, semtela: ro.semtela });
  }
  const media = (k) => { const v = linhas.map((l) => l[k]).filter((x) => x != null && x !== ''); return v.length ? (v.reduce((a, b) => a + Number(b), 0) / v.length).toFixed(1) : '-'; };
  const treinos = linhas.filter((l) => l.treino > 0).length;
  let h = `<div class="card"><button class="b" id="rel_sem" style="width:100%">Ver relatório da semana</button></div><div class="card row"><button class="s rp" data-d="7">7 dias</button><button class="s rp" data-d="30">30 dias</button></div>
  <div class="card"><h2>Resumo dos últimos ${dias} dias</h2>
  <p>Cumprimento do plano alimentar: <b>${nAd ? Math.round(somaAd / nAd) + '%' : '-'}</b></p><div class="bar"><i style="width:${nAd ? Math.round(somaAd / nAd) : 0}%"></i></div>
  <table style="margin-top:10px"><tr><td>Itens fora do plano</td><td><b>${linhas.reduce((a, l) => a + l.fora, 0)}</b></td></tr>
  <tr><td>Dias com treino</td><td><b>${treinos}</b></td></tr>
  <tr><td>Média de copos de água</td><td><b>${media('copos')}</b></td></tr>
  <tr><td>Despertares por noite (média)</td><td><b>${media('vezes')}</b></td></tr>
  <tr><td>Qualidade do sono (média 0-10)</td><td><b>${media('qual')}</b></td></tr>
  <tr><td>Humor (média 0-10)</td><td><b>${media('humor')}</b></td></tr>
  <tr><td>Estresse (média 0-10)</td><td><b>${media('estresse')}</b></td></tr>
  <tr><td>Preocupação com dinheiro (média 0-10)</td><td><b>${media('fin')}</b></td></tr>
  <tr><td>Leitura (média de minutos)</td><td><b>${media('leit')}</b></td></tr>
  <tr><td>Redes sociais (média de horas)</td><td><b>${media('redes')}</b></td></tr></table></div>`;
  const comTreino = linhas.filter((l) => l.treino > 0 && l.qual != null), semTreino = linhas.filter((l) => !(l.treino > 0) && l.qual != null);
  const m = (a, k) => a.length ? (a.reduce((s, l) => s + Number(l[k]), 0) / a.length).toFixed(1) : '-';
  h += `<div class="card"><h2>Impacto</h2><p class="mut">Comparações simples entre os dias. Quanto mais você registra, mais confiáveis ficam.</p>
  <table><tr><td>Sono nos dias com treino</td><td><b>${m(comTreino, 'qual')}</b></td></tr><tr><td>Sono nos dias sem treino</td><td><b>${m(semTreino, 'qual')}</b></td></tr>
  <tr><td>Sono nas noites sem celular antes de dormir</td><td><b>${m(linhas.filter((l) => l.semtela && l.qual != null), 'qual')}</b></td></tr>
  <tr><td>Sono nas noites com celular antes de dormir</td><td><b>${m(linhas.filter((l) => !l.semtela && l.qual != null), 'qual')}</b></td></tr>
  <tr><td>Humor nos dias com até 1 h de redes</td><td><b>${m(linhas.filter((l) => l.redes != null && l.redes <= 1 && l.humor != null), 'humor')}</b></td></tr>
  <tr><td>Humor nos dias com mais de 1 h de redes</td><td><b>${m(linhas.filter((l) => l.redes > 1 && l.humor != null), 'humor')}</b></td></tr>
  <tr><td>Humor nos dias com plano acima de 80%</td><td><b>${m(linhas.filter((l) => l.ad >= 80 && l.humor != null), 'humor')}</b></td></tr>
  <tr><td>Humor nos dias com plano abaixo de 80%</td><td><b>${m(linhas.filter((l) => l.ad != null && l.ad < 80 && l.humor != null), 'humor')}</b></td></tr></table></div>`;
  h += `<div class="card"><h2>Dia a dia</h2><div style="overflow-x:auto"><table><tr><th>Dia</th><th>Plano</th><th>Fora</th><th>Água</th><th>Treino</th><th>Desp.</th><th>Sono</th><th>Humor</th></tr>
  ${linhas.map((l) => `<tr><td>${new Date(l.dia + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td><td>${l.ad ?? '-'}${l.ad != null ? '%' : ''}</td><td>${l.fora}</td><td>${l.copos ?? '-'}</td><td>${l.treino ?? '-'}</td><td>${l.vezes ?? '-'}</td><td>${l.qual ?? '-'}</td><td>${l.humor ?? '-'}</td></tr>`).join('')}</table></div></div>`;
  $('#app').innerHTML = h;
  document.querySelectorAll('.rp').forEach((b) => (b.onclick = () => renderRelatorio(Number(b.dataset.d))));
  $('#rel_sem').onclick = renderSemanal;
}

init();
