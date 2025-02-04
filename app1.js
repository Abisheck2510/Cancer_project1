document.addEventListener('DOMContentLoaded', () => {
    const csvFile = document.getElementById('csvFile');
    const ipNumberInput = document.getElementById('ipNumber');
    const searchButton = document.getElementById('searchButton');
    const patientDetailsDiv = document.getElementById('patientDetails');
    const survivalChartCanvas = document.getElementById('survivalChart');
    let survivalChart = null; // Store the chart instance

    let csvData = [];

    csvFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            csvData = parseCSV(text);
            console.log('CSV Data:', csvData); // Log parsed data
            // Initially create the chart with all available data
            updateChart();
        };

        reader.readAsText(file);
    });

    searchButton.addEventListener('click', () => {
        const ipNumber = ipNumberInput.value.trim();
        displayPatientDetails(ipNumber);
        updateChart(ipNumber); // Update the chart based on the search
    });

    function parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(header => header.trim()); // Trim whitespace
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(value => value.trim()); // Trim whitespace
            if (values.length === headers.length) {  // Only process complete rows
                const row = {};
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j]] = values[j];
                }
                data.push(row);
            }
        }
        return data;
    }

    function displayPatientDetails(ipNumber) {
        const patient = csvData.find(row => row['IP NO'] === ipNumber);

        if (patient) {
            let detailsHTML = '<h3>Patient Details</h3>';
            for (const key in patient) {
                detailsHTML += `<p><b>${key}:</b> ${patient[key]}</p>`;
            }
            patientDetailsDiv.innerHTML = detailsHTML;
        } else {
            patientDetailsDiv.innerHTML = '<p>Patient not found.</p>';
        }
    }

    function updateChart(ipNumber = null) {
        let chartData = [];

        if (ipNumber) {
            // If IP Number is provided, filter the data for that patient only
            const patient = csvData.find(row => row['IP NO'] === ipNumber);
            if (patient) {
                chartData = [{
                    patientName: patient['PATIENT NAME'],
                    survivalRate: parseFloat(patient['PROBABILITY OF SURVIVAL RATE'].replace('%', ''))
                }];
            } else {
                // If patient not found, clear the chart or display a message
                if (survivalChart) {
                    survivalChart.destroy();
                    survivalChart = null;
                }
                survivalChartCanvas.innerHTML = '<p>Patient not found for chart.</p>';
                return;
            }
        } else {
            // If no IP Number is provided, use all available data
            chartData = csvData.map(row => ({
                patientName: row['PATIENT NAME'],
                survivalRate: parseFloat(row['PROBABILITY OF SURVIVAL RATE'].replace('%', ''))
            }));
        }

        // Prepare labels and data for the chart
        const labels = chartData.map(item => item.patientName);
        const data = chartData.map(item => item.survivalRate);

        // Destroy the previous chart if it exists
        if (survivalChart) {
            survivalChart.destroy();
        }

        // Create the bar chart
        survivalChart = new Chart(survivalChartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Probability of Survival Rate (%)',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Survival Rate (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Patient Name'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: ipNumber ? `Survival Rate for Patient with IP NO: ${ipNumber}` : 'Survival Rate for All Patients',
                        padding: 10,
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        display: false // Hide the legend
                    }
                }
            }
        });
    }

});