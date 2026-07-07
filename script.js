/* ==========================================================
   BEDB WORLD CUP CHALLENGE 2026
========================================================== */

// ===============================
// Demo Prediction Results
// ===============================

const predictionResults = [
    { team: "Spain", votes: 18 },
    { team: "Argentina", votes: 15 },
    { team: "France", votes: 10 },
    { team: "England", votes: 7 },
    { team: "Belgium", votes: 5 },
    { team: "Norway", votes: 4 },
    { team: "Morocco", votes: 3 },
    { team: "Switzerland", votes: 2 }
];

// ===============================
// Variables
// ===============================

const cards = document.querySelectorAll(".team-card");

const submitBtn = document.getElementById("submitPrediction");

const resultsContainer = document.getElementById("resultsContainer");

const winnerReveal = document.getElementById("winnerReveal");

let selectedTeam = null;

// ===============================
// Team Selection
// ===============================

cards.forEach(card => {

    card.addEventListener("click", () => {

        cards.forEach(c => c.classList.remove("selected"));

        card.classList.add("selected");

        selectedTeam = card.dataset.team;

        submitBtn.disabled = false;

    });

});

// Disable button initially

submitBtn.disabled = true;

// ===============================
// Submit Prediction
// ===============================

submitBtn.addEventListener("click", () => {

    const employee = document.getElementById("employeeName").value.trim();

    const division = document.getElementById("department").value;

    if(employee === ""){

        alert("Please enter your name.");
        return;

    }

    if(division === ""){

        alert("Please select your division.");
        return;

    }

    if(selectedTeam === null){

        alert("Please choose your champion.");
        return;

    }

    // Open Success Modal

    document.getElementById("modalName").textContent = employee;

    document.getElementById("modalDepartment").textContent = division;

    document.getElementById("modalTeam").textContent = "🏆 " + selectedTeam;

    document.getElementById("modalTime").textContent =
        new Date().toLocaleString();

    document.getElementById("successModal").classList.add("show");

});

// ===============================
// Load Demo Results
// ===============================

function loadResults(){

    const highestVote = Math.max(...predictionResults.map(x => x.votes));

    resultsContainer.innerHTML = "";

    predictionResults.forEach(item=>{

        const percent = (item.votes/highestVote)*100;

        resultsContainer.innerHTML += `

        <div class="result-row">

            <div class="result-header">

                <span>${item.team}</span>

                <span>${item.votes}</span>

            </div>

            <div class="progress">

                <div class="progress-bar"

                style="width:${percent}%">

                </div>

            </div>

        </div>

        `;

    });

}

loadResults();

// ===============================
// Winner Reveal
// ===============================

// Leave empty until World Cup ends.

const worldCupFinished = false;

if(worldCupFinished){

    winnerReveal.innerHTML = `

        <div style="font-size:70px;">
            🇦🇷
        </div>

        <h3>Argentina</h3>

        <p>

        Congratulations to everyone who predicted Argentina!

        </p>

    `;

}

// ===============================
// Future Integration
// ===============================

// Version 2
//
// Google Sheets
//
// Microsoft Lists
//
// SharePoint
//
// Power Automate
//
// Power Apps
//
// SQL Database
//
// Export CSV
//
// Admin Dashboard

console.log("BEDB World Cup Challenge Loaded Successfully.");

// =====================================
// Close Success Modal
// =====================================

document
.getElementById("closeModal")
.addEventListener("click", () => {

    document
    .getElementById("successModal")
    .classList.remove("show");

});
