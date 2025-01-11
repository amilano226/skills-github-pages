  function displayGeneralData(data) {
    const totalYards = data.reduce((sum, row) => sum + (parseInt(row["GN/LS"]|| 0)), 0);
    const totalPlays = data.length;
    const runPlays = data.filter((row) => row["PLAY TYPE"] === "Run");
    const passPlays = data.filter((row) => row["PLAY TYPE"] === "Pass");
    const interceptions = passPlays.filter((row) => row["RESULT"] === "Interception").length;
    const fumbles = runPlays.filter((row) => row["RESULT"]=== "Fumble").length;
    const rushingTouchdowns = runPlays.filter((row) => row["RESULT"]=== "Rush, TD").length;
    const passingTouchdowns = passPlays.filter((row) => row["RESULT"] === "Complete, TD").length;
    totalYardsElem.textContent = totalYards;
    rushingYards.textContent = runPlays.reduce((sum, row) => sum + (parseInt(row["GN/LS"] || 0)), 0);
    passingYards.textContent = passPlays.reduce((sum, row) => sum + (parseInt(row["GN/LS"] || 0)), 0);
    yardsPerRunElem.textContent = (
      runPlays.reduce((sum, row) => sum + (parseInt(row["GN/LS"] || 0)), 0) / runPlays.length || 0
    ).toFixed(2);
    yardsPerPassElem.textContent = (
      passPlays.reduce((sum, row) => sum + (parseInt(row["GN/LS"] || 0)), 0) / passPlays.length || 0
    ).toFixed(2);
    rushingTouchdownsElem.textContent = rushingTouchdowns;
    passingTouchdownsElem.textContent = passingTouchdowns;
    totalTouchdownsElem.textContent = rushingTouchdowns + passingTouchdowns;
    const yardsPerPlay = totalPlays > 0 ? (totalYards / totalPlays).toFixed(2) : 0;
    fumblesElem.textContent = fumbles;
    interceptionsElem.textContent = interceptions;
    turnoversElem.textContent = fumbles + interceptions;
    document.getElementById("yardsPerPlay").textContent = yardsPerPlay;
  }

  //
  // Display Run and Pass Effectiveness Charts
  //
  function displayRunEffectivenessChart(data) {
    const runPlays = data.filter((row) => row["PLAY TYPE"] === "Run");
    const effectiveRuns = runPlays.filter((row) => parseInt(row["GN/LS"]) >= 4).length;
    const ineffectiveRuns = runPlays.length - effectiveRuns;
    const runEffectivenessData = {
      labels: ["Effective Runs", "Ineffective Runs"],
      datasets: [
        {
          data: [effectiveRuns, ineffectiveRuns],
          backgroundColor: ["#4caf50", "#f44336"], // Green for Yes, Red for No
        },
      ],
    };
    //
    // Run Effectiveness
    //
    new Chart(document.getElementById("runEffectivenessChart"), {
      type: "pie",
      data: runEffectivenessData,
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#e0e0e0" } },
          datalabels: {
            color: "#ffffff",
            formatter: (value, context) => {
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              return `${value} (${((value / total) * 100).toFixed(1)}%)`;
            },
          },
        },
      },
    });
  }
  //
  // Pass Effectiveness
  //
  function displayPassEffectivenessChart(data) {
    const passPlays = data.filter((row) => row["PLAY TYPE"] === "Pass");
    const effectivePass = passPlays.filter((row) => parseInt(row["GN/LS"]) >= 7).length;
    const ineffectivePass = passPlays.length - effectivePass;

    const passEffectivenessData = {
      labels: ["Effective Passes", "Ineffective Passes"],
      datasets: [
        {
          data: [effectivePass, ineffectivePass],
          backgroundColor: ["#4caf50", "#f44336"], // Green for Yes, Red for No
        },
      ],
    };

    new Chart(document.getElementById("passEffectivenessChart"), {
      type: "pie",
      data: passEffectivenessData,
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#e0e0e0" } },
          datalabels: {
            color: "#ffffff",
            formatter: (value, context) => {
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              return `${value} (${((value / total) * 100).toFixed(1)}%)`;
            },
          },
        },
      },
    });
  }
  //
  // favorite formations data
  //
  function populateFavoriteFormationsTable(data) {
    const formationCounts = {};
    data.forEach((row) => {
      if (row["OFF FORM"]) {
        formationCounts[row["OFF FORM"]] = (formationCounts[row["OFF FORM"]] || 0) + 1;
      }
    });
    const totalPlays = data.length;
    const sortedFormations = Object.entries(formationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    favoriteFormationsTable.innerHTML = sortedFormations
      .map(
        ([formation, count]) =>
          `<tr>
            <td>${formation}</td>
            <td>${count}</td>
            <td>${((count / totalPlays) * 100).toFixed(2)}%</td>
          </tr>`
      )
      .join("");
  }
  function populateTopPlaysByFormation(data) {
  // Check if data is valid
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error("Data is empty or invalid.");
    return;
  }

  // Count formations
  const formationCounts = {};
  data.forEach((row) => {
    if (!row["OFF FORM"] || !row["OFF PLAY"]) {
      console.warn("Missing OFF FORM or OFF PLAY field in row:", row);
      return;
    }
    formationCounts[row["OFF FORM"]] = (formationCounts[row["OFF FORM"]] || 0) + 1;
  });

  // Get top 10 formations
  const topFormations = Object.entries(formationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  console.log("Top Formations:", topFormations);

  // Get the container for tables
  const playsByFormationContainer = document.getElementById("playsByFormationContainer");
  if (!playsByFormationContainer) {
    console.error("#playsByFormationContainer not found in the DOM.");
    return;
  }

  // Clear any existing content
  playsByFormationContainer.innerHTML = "";

  // Generate a table for each top formation
  topFormations.forEach(([formation]) => {
    // Get plays for this formation
    const plays = data.filter((row) => row["OFF FORM"] === formation);
    if (!plays.length) {
      console.warn(`No plays found for formation: ${formation}`);
      return;
    }

    const playCounts = {};
    plays.forEach((row) => {
      playCounts[row["OFF PLAY"]] = (playCounts[row["OFF PLAY"]] || 0) + 1;
    });

    // Get top 6 plays for this formation
    const topPlays = Object.entries(playCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    console.log(`Top Plays for ${formation}:`, topPlays);

    // Create a table for this formation
    const tableHTML = `
      <div class="table-container">
        <h3>${formation} - Top Plays</h3>
        <table>
          <thead>
            <tr>
              <th>Play</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${topPlays
              .map(
                ([play, count]) => `
                <tr>
                  <td>${play}</td>
                  <td>${count}</td>
                  <td>${((count / plays.length) * 100).toFixed(2)}%</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    // Append the table to the container
    playsByFormationContainer.innerHTML += tableHTML;
  });
}


Chart.register(ChartDataLabels);
function displayRunPassSplitByDownCharts(data) {
  const downs = [1, 2, 3, 4];
  const chartContexts = [
    firstDownChartCtx,
    secondDownChartCtx,
    thirdDownChartCtx,
    fourthDownChartCtx,
  ];
  const charts = [firstDownChart, secondDownChart, thirdDownChart, fourthDownChart];

  downs.forEach((down, index) => {
    const plays = data.filter((row) => parseInt(row["DN"]) === down);
    const runs = plays.filter((row) => row["PLAY TYPE"] === "Run").length;
    const passes = plays.filter((row) => row["PLAY TYPE"] === "Pass").length;

    const totalPlays = runs + passes;

    // Skip chart creation if there are no plays for this down
    if (totalPlays === 0) {
      return;
    }

    // Destroy existing chart if it exists
    if (charts[index]) {
      charts[index].destroy();
    }

    // Create the chart
    charts[index] = new Chart(chartContexts[index], {
      type: "pie",
      data: {
        labels: ["Run", "Pass"],
        datasets: [
          {
            data: [runs, passes],
            backgroundColor: ["#2196f3", "#ff9800"], // Blue for Run, Orange for Pass
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#e0e0e0", // Adjust label color for dark theme
            },
          },
          datalabels: {
            display: true, // Always display labels
            color: "#ffffff", // Label color
            font: {
              size: 14, // Font size
              weight: "bold",
            },
            formatter: (value, context) => {
              const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
              const percentage = ((value / total) * 100).toFixed(1); // Calculate percentage
              return `${percentage}%`; // Show value and percentage
            },
          },
        },
      },
    });
  });
}
    //
    // Defensive Information
    //
   function displayCoverageAndFrontsByDownAndDistance(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Data is empty or invalid.");
      return;
    }

    // Filter data to include only rows with ODK === "D" and valid fields
    const filteredData = data.filter(
      (row) =>
        row["ODK"] === "O" &&
        row["DN"] &&
        row["DIST"] &&
        row["COVERAGE"] &&
        row["DEF FRONT"]
    );

    if (filteredData.length === 0) {
      console.warn("No valid data found for Down, Distance, Coverage, and Def Front.");
      return;
    }

    const downGroups = { 1: [], 2: [], 3: [], 4: [] };

    // Group data by Down
    filteredData.forEach((row) => {
      const down = parseInt(row["DN"], 10);
      if (down >= 1 && down <= 4) {
        downGroups[down].push(row);
      }
    });

    // Generate charts for each Down
    Object.keys(downGroups).forEach((down) => {
      const plays = downGroups[down];

      const coverageCounts = {};
      const frontCounts = {};

      // Count occurrences for COVERAGE and DEF FRONT
      plays.forEach((row) => {
        coverageCounts[row["COVERAGE"]] = (coverageCounts[row["COVERAGE"]] || 0) + 1;
        frontCounts[row["DEF FRONT"]] = (frontCounts[row["DEF FRONT"]] || 0) + 1;
      });

      // Generate COVERAGE chart
      const coverageChartCtx = document.getElementById(`coverageDown${down}Chart`).getContext("2d");
      new Chart(coverageChartCtx, {
        type: "bar",
        data: {
          labels: Object.keys(coverageCounts),
          datasets: [
            {
              label: `COVERAGE (Down ${down})`,
              data: Object.values(coverageCounts),
              backgroundColor: generateColors(Object.keys(coverageCounts).length),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            datalabels: {
              color: "#ffffff",
              anchor: "end",
              align: "top",
              formatter: (value) => value,
            },
          },
          scales: {
            x: { ticks: { color: "#e0e0e0" }, title: { display: true, text: "Coverage", color: "#e0e0e0" } },
            y: { ticks: { color: "#e0e0e0" }, title: { display: true, text: "Counts", color: "#e0e0e0" } },
          },
        },
      });

      // Generate DEF FRONT chart
      const frontChartCtx = document.getElementById(`frontDown${down}Chart`).getContext("2d");
      new Chart(frontChartCtx, {
        type: "bar",
        data: {
          labels: Object.keys(frontCounts),
          datasets: [
            {
              label: `DEF FRONT (Down ${down})`,
              data: Object.values(frontCounts),
              backgroundColor: generateColors(Object.keys(frontCounts).length),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            datalabels: {
              color: "#ffffff",
              anchor: "end",
              align: "top",
              formatter: (value) => value,
            },
          },
          scales: {
            x: { ticks: { color: "#e0e0e0" }, title: { display: true, text: "Def Front", color: "#e0e0e0" } },
            y: { ticks: { color: "#e0e0e0" }, title: { display: true, text: "Counts", color: "#e0e0e0" } },
          },
        },
      });
    });
  }

  // Generate distinct colors for chart categories
  function generateColors(count) {
    const colors = [
      "#4caf50", "#ff9800", "#2196f3", "#f44336", "#9c27b0", "#03a9f4", "#ffeb3b", "#795548",
    ];
    while (colors.length < count) {
      colors.push(
        `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
      );
    }
    return colors.slice(0, count);
  }

    //
    // Export to pdf
    //
  document.getElementById("exportToPdfBtn").addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

  try {
    // Select the container to capture
    const container = document.querySelector(".container");

    // PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Use html2canvas to capture the container as a canvas
    const canvas = await html2canvas(container, {
      backgroundColor: "#ffffff", // Set white background
      scale: 2, // High resolution for Retina displays
      useCORS: true, // Handle cross-origin images
      allowTaint: true, // Ensure tainted canvas support
    });

    // Dimensions of the rendered canvas
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate the scaling factor to fit the content within the PDF width
    const scaleFactor = pdfWidth / imgWidth;

    // Calculate the scaled height of the content
    const scaledHeight = imgHeight * scaleFactor;

    // Number of pages required
    const totalPages = Math.ceil(scaledHeight / pdfHeight);

    // Render each page
    for (let page = 0; page < totalPages; page++) {
      const yOffset = -page * pdfHeight / scaleFactor; // Calculate offset for each page

      // Add the canvas content to the PDF
      pdf.addImage(
        canvas,
        "PNG",
        0,
        yOffset,
        pdfWidth,
        scaledHeight
      );

      if (page < totalPages - 1) {
        pdf.addPage(); // Add a new page if not the last page
      }
    }

    // Save the PDF
    pdf.save("dashboard-report.pdf");
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("An error occurred while exporting the PDF. Please try again.");
  }
});
