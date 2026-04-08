const API = "https://attendance-system-ul60.onrender.com/attendance";
const RESET_API = "https://attendance-system-ul60.onrender.com/reset";

let chart;

// SWITCH PAGES
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// FETCH DATA
function fetchData() {
  fetch(API)
    .then(res => res.json())
    .then(data => {

      const total = data.length;
      const present = data.filter(d => d.status === "present").length;
      const duplicate = data.filter(d => d.status === "duplicate").length;
      const invalid = data.filter(d => d.status === "invalid").length;

      document.getElementById("total").innerText = total;
      document.getElementById("present").innerText = present;
      document.getElementById("duplicate").innerText = duplicate;
      document.getElementById("invalid").innerText = invalid;

      // FEED
      const feed = document.getElementById("feed");
      feed.innerHTML = "";

      data.slice(-10).reverse().forEach(d => {
        feed.innerHTML += `
          <div class="feed-item">
            ${d.name} (${d.uid}) - ${d.status}
          </div>
        `;
      });

      updateChart(present, duplicate, invalid);
    });
}

// CHART
function updateChart(p, d, i) {
  const data = {
    labels: ["Present", "Duplicate", "Invalid"],
    datasets: [{ data: [p, d, i] }]
  };

  if (chart) {
    chart.data = data;
    chart.update();
  } else {
    chart = new Chart(document.getElementById("chart"), {
      type: "bar",
      data: data
    });
  }
}

// RESET
function resetData() {
  fetch(RESET_API, { method: "POST" })
    .then(() => {
      alert("System Reset");
      fetchData();
    });
}

// AUTO REFRESH
setInterval(fetchData, 2000);
fetchData();