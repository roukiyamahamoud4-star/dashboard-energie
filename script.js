const energyData = [
  { day: "Lun", kwh: 0 },
  { day: "Mar", kwh: 0 },
  { day: "Mer", kwh: 0 },
  { day: "Jeu", kwh: 0 },
  { day: "Ven", kwh: 0 },
  { day: "Sam", kwh: 0 },
  { day: "Dim", kwh: 0 }
];

let deviceData = [
  { name: "Refrigerateur", kwh: 0 },
  { name: "Climatiseur", kwh: 0 },
  { name: "Machine a laver", kwh: 0 }
];

const totalKwh = document.getElementById("totalKwh");
const averageKwh = document.getElementById("averageKwh");
const highestDay = document.getElementById("highestDay");
const highestValue = document.getElementById("highestValue");
const alertBox = document.getElementById("alertBox");
const chart = document.getElementById("chart");
const energyTable = document.getElementById("energyTable");
const thresholdInput = document.getElementById("thresholdInput");
const thresholdValue = document.getElementById("thresholdValue");
const themeToggle = document.getElementById("themeToggle");
const weekForm = document.getElementById("weekForm");
const saveWeekBtn = document.getElementById("saveWeekBtn");
const deviceCount = document.getElementById("deviceCount");
const deviceForm = document.getElementById("deviceForm");
const deviceResult = document.getElementById("deviceResult");
const topDevice = document.getElementById("topDevice");
const topDeviceValue = document.getElementById("topDeviceValue");
const monthlyPercent = document.getElementById("monthlyPercent");
const monthlyTargetText = document.getElementById("monthlyTargetText");
const monthInput = document.getElementById("monthInput");
const monthlyTargetInput = document.getElementById("monthlyTargetInput");
const monthlyProgressBar = document.getElementById("monthlyProgressBar");
const saveMonthBtn = document.getElementById("saveMonthBtn");
const saveStatus = document.getElementById("saveStatus");

function getTotalKwh() {
  return energyData.reduce((sum, item) => sum + item.kwh, 0);
}

function setCurrentMonth() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  monthInput.value = `${today.getFullYear()}-${month}`;
}

function renderWeekInputs() {
  weekForm.innerHTML = "";

  energyData.forEach((item, index) => {
    const field = document.createElement("div");
    field.className = "day-input";

    field.innerHTML = `
      <label for="day-${index}">${item.day}</label>
      <input id="day-${index}" type="number" min="0" value="${item.kwh}" data-index="${index}">
    `;

    weekForm.appendChild(field);
  });
}

function saveWeekConsumption() {
  const inputs = weekForm.querySelectorAll("input");

  inputs.forEach(input => {
    const index = Number(input.dataset.index);
    const value = Number(input.value);
    energyData[index].kwh = value >= 0 ? value : 0;
    input.value = energyData[index].kwh;
  });

  updateDashboard();
}

function renderDeviceInputs() {
  deviceForm.innerHTML = "";

  deviceData.forEach((device, index) => {
    const field = document.createElement("div");
    field.className = "device-input";

    field.innerHTML = `
      <label for="device-name-${index}">Nom appareil ${index + 1}</label>
      <input id="device-name-${index}" type="text" value="${device.name}" data-index="${index}" data-type="name">
      <label for="device-kwh-${index}">Consommation en kWh</label>
      <input id="device-kwh-${index}" type="number" min="0" value="${device.kwh}" data-index="${index}" data-type="kwh">
    `;

    deviceForm.appendChild(field);
  });
}

function updateDeviceCount() {
  const count = Math.max(1, Math.min(12, Number(deviceCount.value) || 1));
  deviceCount.value = count;

  while (deviceData.length < count) {
    deviceData.push({ name: `Appareil ${deviceData.length + 1}`, kwh: 0 });
  }

  deviceData = deviceData.slice(0, count);
  renderDeviceInputs();
  updateDeviceAnalysis();
}

function saveDeviceConsumption() {
  const inputs = deviceForm.querySelectorAll("input");

  inputs.forEach(input => {
    const index = Number(input.dataset.index);

    if (input.dataset.type === "name") {
      deviceData[index].name = input.value.trim() || `Appareil ${index + 1}`;
      return;
    }

    const value = Number(input.value);
    deviceData[index].kwh = value >= 0 ? value : 0;
    input.value = deviceData[index].kwh;
  });

  updateDeviceAnalysis();
}

function updateDeviceAnalysis() {
  const mostUsed = deviceData.reduce((max, device) => device.kwh > max.kwh ? device : max, deviceData[0]);

  if (!mostUsed || mostUsed.kwh === 0) {
    topDevice.textContent = "-";
    topDeviceValue.textContent = "0 kWh";
    deviceResult.textContent = "Ajoutez les consommations des appareils pour voir le resultat.";
    return;
  }

  topDevice.textContent = mostUsed.name;
  topDeviceValue.textContent = `${mostUsed.kwh} kWh`;
  deviceResult.innerHTML = `L'appareil qui consomme le plus est <strong>${mostUsed.name}</strong> avec <strong>${mostUsed.kwh} kWh</strong>.`;
}

function calculateStats() {
  const total = getTotalKwh();
  const average = total / energyData.length;
  const highest = energyData.reduce((max, item) => item.kwh > max.kwh ? item : max);

  totalKwh.textContent = `${total} kWh`;
  averageKwh.textContent = `${average.toFixed(1)} kWh`;
  highestDay.textContent = highest.day;
  highestValue.textContent = `${highest.kwh} kWh`;
}

function updateMonthlyPercentage() {
  const total = getTotalKwh();
  const target = Math.max(1, Number(monthlyTargetInput.value) || 1);
  const percent = Math.min(999, (total / target) * 100);
  const barPercent = Math.min(100, percent);

  monthlyPercent.textContent = `${percent.toFixed(1)}%`;
  monthlyTargetText.textContent = `Objectif : ${target} kWh`;
  monthlyProgressBar.style.width = `${barPercent}%`;
  monthlyProgressBar.classList.toggle("warning", percent >= 75 && percent < 100);
  monthlyProgressBar.classList.toggle("danger", percent >= 100);
}

function renderChart(threshold) {
  const maxKwh = Math.max(...energyData.map(item => item.kwh));
  chart.innerHTML = "";

  energyData.forEach(item => {
    const barHeight = maxKwh === 0 ? 12 : (item.kwh / maxKwh) * 230;
    const isHigh = item.kwh >= threshold;

    const barWrap = document.createElement("div");
    barWrap.className = "bar-wrap";

    barWrap.innerHTML = `
      <span class="bar-value">${item.kwh}</span>
      <div class="bar ${isHigh ? "high" : ""}" style="height: ${barHeight}px"></div>
      <span class="bar-label">${item.day}</span>
    `;

    chart.appendChild(barWrap);
  });
}

function renderTable(threshold) {
  energyTable.innerHTML = "";

  energyData.forEach(item => {
    const isHigh = item.kwh >= threshold;
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.day}</td>
      <td>${item.kwh} kWh</td>
      <td>
        <span class="status ${isHigh ? "high" : "ok"}">
          ${isHigh ? "Elevee" : "Normale"}
        </span>
      </td>
    `;

    energyTable.appendChild(row);
  });
}

function renderAlert(threshold) {
  const highDays = energyData.filter(item => item.kwh >= threshold);

  if (highDays.length === 0) {
    alertBox.classList.remove("show");
    alertBox.textContent = "";
    return;
  }

  const days = highDays.map(item => `${item.day} (${item.kwh} kWh)`).join(", ");
  alertBox.classList.add("show");
  alertBox.textContent = `Alerte : consommation elevee detectee sur ${days}.`;
}

function updateDashboard() {
  const threshold = Number(thresholdInput.value);
  thresholdValue.textContent = threshold;

  calculateStats();
  updateMonthlyPercentage();
  renderChart(threshold);
  renderTable(threshold);
  renderAlert(threshold);
  updateDeviceAnalysis();
}

async function saveMonthToMysql() {
  const target = Math.max(1, Number(monthlyTargetInput.value) || 1);
  const total = getTotalKwh();
  const percent = (total / target) * 100;

  const payload = {
    month: monthInput.value,
    targetKwh: target,
    totalKwh: total,
    percentUsed: Number(percent.toFixed(2)),
    weekData: energyData,
    devices: deviceData
  };

  try {
    const response = await fetch("http://localhost:3000/api/monthly-consumption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    saveStatus.textContent = "Donnees sauvegardees dans MySQL pour ce mois.";
  } catch (error) {
    saveStatus.textContent = "Impossible de sauvegarder : lancez le serveur Node.js et verifiez MySQL.";
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "Mode clair" : "Mode sombre";
});

thresholdInput.addEventListener("input", updateDashboard);
monthlyTargetInput.addEventListener("input", updateDashboard);
saveMonthBtn.addEventListener("click", saveMonthToMysql);
saveWeekBtn.addEventListener("click", saveWeekConsumption);
weekForm.addEventListener("input", saveWeekConsumption);
deviceCount.addEventListener("input", updateDeviceCount);
deviceForm.addEventListener("input", saveDeviceConsumption);

setCurrentMonth();
renderWeekInputs();
renderDeviceInputs();
updateDashboard();
