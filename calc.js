const MAX_RESULTS = 5;
const results = [];

document.getElementById("calcBtn").addEventListener("click", () => {
  const v = getInputValues();
  const calculated = calculateAll(v);
  saveResult(calculated);
  renderResults();
});

/* ================= 입력값 읽기 ================= */

function getInputValues() {
  const get = id => parseFloat(document.getElementById(id).value) || 0;

  return {
    atk: get("atk"),
    critRate: get("critRate"),
    critDmg: get("critDmg"),
    atkSpeed: get("atkSpeed"),
    mainStat: get("mainStat"),
    dmg: get("dmg"),
    dmgAmp: get("dmgAmp"),
    ignoreDef: get("ignoreDef"),
    bossDmg: get("bossDmg"),
    normalDmg: get("normalDmg"),
    minMul: get("minMul"),
    maxMul: get("maxMul"),
    finalDmg: get("finalDmg"),
    cubeMain: get("cubeMain")
  };
}

/* ================= 계산 로직 ================= */

function calculateAll(v) {
  /* ---- 스텟 비율 ---- */
  const statRatio = {};

  statRatio.critical =
    v.critRate < 100
      ? (v.critRate * v.critDmg) / 10000
      : (100 * v.critDmg) / 10000;

  statRatio.attackSpeed = v.atkSpeed / 100;
  statRatio.mainStat = v.mainStat / 100;
  statRatio.damage = v.dmg / 100;
  statRatio.bossDamage = v.bossDmg / 100;
  statRatio.normalDamage = v.normalDmg / 100;
  statRatio.damageMultiplier =
    (v.minMul + v.maxMul) / 200 - 1;

  /* ---- 효율 비율 ---- */
  const effRatio = {};

  effRatio.critical =
    statRatio.critical *
    (0.1 / (v.critDmg / 100)) /
    0.14;

  effRatio.attackSpeed =
    statRatio.attackSpeed *
    (1.50965 / (1.5 - v.atkSpeed / 100)) *
    0.1 /
    0.14;

  effRatio.mainStat =
    statRatio.mainStat *
    1000 /
    (1200 * (1 + v.cubeMain / 100) * 1.001);

  effRatio.damage = statRatio.damage * 10 / 25;
  effRatio.bossDamage = statRatio.bossDamage * 10 / 25;
  effRatio.normalDamage = statRatio.normalDamage * 10 / 25;
  effRatio.damageMultiplier =
    statRatio.damageMultiplier * 10 / 12.5;

  /* ---- 평균 데미지 ---- */
  const avgDps =
    v.atk *
    (1 + v.critRate * v.critDmg / 10000) *
    (1 + v.atkSpeed / 100) *
    (1 + v.mainStat / 100) *
    (1 + v.dmg / 100) *
    (1 + v.dmgAmp / 100) *
    (1 + v.finalDmg / 100) *
    (v.minMul + v.maxMul) / 200;

  const avgBoss =
    avgDps * (1 + v.bossDmg / 100);

  const avgNormal =
    avgDps * (1 + v.normalDmg / 100);

  return {
    statRatio,
    effRatio,
    damage: {
      avgDps,
      avgBoss,
      avgNormal,
      ignoreDef: v.ignoreDef
    }
  };
}

/* ================= 결과 저장 ================= */

function saveResult(result) {
  results.unshift(result);
  if (results.length > MAX_RESULTS) {
    results.pop();
  }
}

/* ================= 결과 렌더링 ================= */

function renderResults() {
  const boxes = document.querySelectorAll(".result-box");

  boxes.forEach((box, index) => {
    if (!results[index]) {
      box.innerHTML = `<div class="result-title">결과 #${index + 1} (비어있음)</div>`;
      return;
    }

    const r = results[index];

    box.innerHTML = `
      <div class="result-title">결과 #${index + 1}</div>

      <div class="section-title">스텟 비율 / 효율 비율</div>
      <table>
        <tr><th>항목</th><th>스텟 비율</th><th>효율 비율</th></tr>
        ${row("크리티컬", r.statRatio.critical, r.effRatio.critical)}
        ${row("공격속도", r.statRatio.attackSpeed, r.effRatio.attackSpeed)}
        ${row("주스텟", r.statRatio.mainStat, r.effRatio.mainStat)}
        ${row("데미지", r.statRatio.damage, r.effRatio.damage)}
        ${row("보스 데미지", r.statRatio.bossDamage, r.effRatio.bossDamage)}
        ${row("일반 데미지", r.statRatio.normalDamage, r.effRatio.normalDamage)}
        ${row("데미지 배율", r.statRatio.damageMultiplier, r.effRatio.damageMultiplier)}
      </table>

      <div class="section-title">데미지 계산 결과</div>
      <table>
        <tr><th>항목</th><th>값</th></tr>
        <tr><td>초당 평균 데미지</td><td>${fmt(r.damage.avgDps)}</td></tr>
        <tr><td>평균 보스 데미지</td><td>${fmt(r.damage.avgBoss)}</td></tr>
        <tr><td>평균 일반 데미지</td><td>${fmt(r.damage.avgNormal)}</td></tr>
        <tr><td>방어 관통 (%)</td><td>${fmt(r.damage.ignoreDef)}</td></tr>
      </table>
    `;
  });
}

/* ================= 유틸 ================= */

function row(name, stat, eff) {
  return `
    <tr>
      <td>${name}</td>
      <td>${fmt(stat)}</td>
      <td>${fmt(eff)}</td>
    </tr>
  `;
}

function fmt(n) {
  return isFinite(n) ? n.toFixed(4) : "-";
}
