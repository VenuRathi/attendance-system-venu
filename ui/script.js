const API_URL = "https://attendance-system-ul60.onrender.com/attendance";

let lastCount = 0;
let lastUID = "";

let chart;
let chartData = {};

function formatTime(ts) {
    const date = new Date(ts);
    return date.toLocaleString(); // auto local time
}

function updateChart(data) {
    chartData = {};

    data.forEach(item => {
        chartData[item.name] = (chartData[item.name] || 0) + 1;
    });

    const labels = Object.keys(chartData);
    const values = Object.values(chartData);

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Attendance Count",
                data: values
            }]
        }
    });
}

async function fetchData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        document.getElementById("total").innerText = data.length;

        const unique = new Set(data.map(i => i.uid));
        document.getElementById("unique").innerText = unique.size;

        // 🔥 real-time detection
        if (data.length > lastCount) {
            document.getElementById("status").innerText = "🟢 New Scan!";
        } else {
            document.getElementById("status").innerText = "🟢 Live";
        }

        lastCount = data.length;

        let table = "";

        data.slice().reverse().forEach(item => {
            table += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.uid}</td>
                    <td>${formatTime(item.timestamp)}</td>
                </tr>
            `;
        });

        document.getElementById("table-body").innerHTML = table;

        // 🔥 duplicate detection (simple)
        if (data.length > 0) {
            const latest = data[data.length - 1];

            if (latest.uid === lastUID) {
                document.getElementById("alert").innerText =
                    "⚠️ Duplicate Scan: " + latest.name;
            } else {
                document.getElementById("alert").innerText = "";
            }

            lastUID = latest.uid;
        }

        updateChart(data);

    } catch (err) {
        document.getElementById("status").innerText = "🔴 Error";
    }
}

// refresh every 2 sec
setInterval(fetchData, 2000);
fetchData();