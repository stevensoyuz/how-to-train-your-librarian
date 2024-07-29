document.addEventListener("DOMContentLoaded", () => {
    const gameContent = document.getElementById("content");
    const defaultList = "authors";
    let formatPattern = ""; 
    let listContent = {};

    async function init() {
        // Event listener for changing the list
        document.getElementById("list").addEventListener("change", async (event) => {
            await loadList(event.target.value);
            createGame();
        });

        // Event listeners for user choice buttons
        document.querySelectorAll("button.choice").forEach(choice => {
            choice.addEventListener("mouseover", () => choice.classList.add("hover"));
            choice.addEventListener("mouseout", () => choice.classList.remove("hover"));
            choice.addEventListener("mousedown", () => choice.classList.add("active"));
            choice.addEventListener("mouseup", () => choice.classList.remove("active"));
            choice.addEventListener("click", () => handleUserChoice(choice.getAttribute("id") === "after"));
        });

        // Event listener for keyboard input
        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                handleUserChoice(false);
            }
            if (event.key === "ArrowRight") {
                handleUserChoice(true);
            }
        });

        await loadList(defaultList);
        createGame();
    }

    // Function to load the specified list
    async function loadList(newList) {
        try {
            const response = await fetch(`./resources/${newList}.json`);
            const data = await response.json();
            formatPattern = data.format; // Set the format pattern for the list
            listContent = data.elements || {}; // Set the elements of the list
        } catch (error) {
            console.error("Error fetching list elements:", error);
        }
    }

    // Function to create the game by clearing existing terms and generating new ones
    async function createGame() {
        // Clear existing terms
        document.querySelectorAll(".term").forEach(term => term.remove());

        // Generate new terms until a bottom term is present
        while (!document.querySelector(".bot:not(.expire)")) {
            appendNewTerm();
        }
    }

    // Function to append a new term to the game
    function appendNewTerm() {
        // Remove the current bottom term
        const bottomTerm = document.querySelector(".bot:not(.expire)");
        if (bottomTerm) {
            bottomTerm.classList.add("expire");
            bottomTerm.addEventListener("animationend", () => bottomTerm.remove());
        }

        // Move the top term to the bottom position
        const topTerm = document.querySelector(".top");
        if (topTerm) {
            topTerm.classList.replace("top", "bot");
        }

        // Generate and append a new top term
        const newTerm = document.createElement("div");
        gameContent.appendChild(newTerm);
        newTerm.classList.add("term", "top");
        newTerm.textContent = generateTerm();
    }

    // Function to generate a new term based on the list elements and format
    function generateTerm() {
        let term;
        const elements = Object.keys(listContent);
        do {
            const unformattedTerm = {};
            // Retrieves a random item from each element and appends it to termElements
            elements.forEach(key => {
                const items = listContent[key].items;
                unformattedTerm[key] = items[Math.floor(Math.random() * items.length)];
            });
            term = formatTerm(unformattedTerm, formatPattern);
        } while (term === document.querySelector(".bot:not(.expire)")?.textContent);
        return term;
    }

    // Function to format a term based on the format pattern and term parts
    function formatTerm(termElements, pattern) {
        let formattedTerm = pattern;
        // Iterate over each element of the term
        for (const [element, item] of Object.entries(termElements)) {
            let formattedElement = item; // e.g. "To Kill a Mockingbird" or 
            if (listContent[element].type === "custom") {
                formattedElement = listContent[element].format;
                // Replace placeholders in the custom format with actual values "{1}, {0}" -> "Fosse, Jon"
                item.forEach((value, index) => {
                    formattedElement = formattedElement.replace(`{${index}}`, value);
                });
            }
            // Replace the placeholder in the overall format pattern with the formatted part "{authors}" = "Fosse, Jon"
            formattedTerm = formattedTerm.replace(`{${element}}`, formattedElement);
        }
        return formattedTerm;
    }

    // Function to handle user choice and update the game accordingly
    function handleUserChoice(isAfter) {
        const resultElement = document.getElementById("result");
        const isCorrect = isAfter 
            ? document.querySelector(".bot:not(.expire)").textContent.localeCompare(document.querySelector(".top").textContent) <= 0 
            : document.querySelector(".bot:not(.expire)").textContent.localeCompare(document.querySelector(".top").textContent) >= 0;
        if (isCorrect) {
            resultElement.textContent = "Correct!";
            appendNewTerm();
        } else {
            resultElement.textContent = "Incorrect.";
        }
        resultElement.style.animation = "none";
        resultElement.offsetHeight; // Trigger reflow
        resultElement.style.animation = "";
    }

    init();
});
