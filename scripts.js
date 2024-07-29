document.addEventListener("DOMContentLoaded", () => {
    const game = document.getElementById("content");
    let terms = {};
    let currentList = "authors";
    let format = "";

    initialize();

    async function loadTerms(list) {
        try {
            const response = await fetch(`./resources/${list}.json`);
            const data = await response.json();
            format = data.format;
            terms = data.lists || {};
        } catch (error) {
            console.error("Error fetching terms:", error);
        }
    }

    function formatTerm(termParts, format) {
        let formattedTerm = format;
        for (const [listKey, item] of Object.entries(termParts)) {
            let formattedItem = item;
            if (terms[listKey].type === "custom") {
                const listFormat = terms[listKey].format;
                formattedItem = listFormat;
                item.forEach((value, index) => {
                    const placeholder = `{${index + 1}}`;
                    formattedItem = formattedItem.replace(placeholder, value);
                });
            }
            const placeholder = `{${listKey}}`;
            formattedTerm = formattedTerm.replace(placeholder, formattedItem);
        }
        return formattedTerm;
    }

    function appendTerm() {
        do {
            const removedTerm = document.querySelector(".bot:not(.expire)");
            removeTermElement(removedTerm);
            const currentTerm = document.querySelector(".top");
            currentTerm.classList.replace("top", "bot");
            generateTermElement("top");
        } while (!document.querySelector(".bot:not(.expire)"));
    }

    function generateTermElement(index) {
        let generated = document.createElement("div");
        game.appendChild(generated);
        generated.classList.add("term", index);
        generated.textContent = generateTerm();
    }

    function generateTerm() {
        let term;
        const listKeys = Object.keys(terms);
        do {
            const termParts = {};
            listKeys.forEach(listKey => {
                const items = terms[listKey].items;
                const randomIndex = Math.floor(Math.random() * items.length);
                termParts[listKey] = items[randomIndex];
            });
            term = formatTerm(termParts, format);
        } while (term === document.querySelector(".bot:not(.expire)")?.textContent);
        return term;
    }

    function removeTermElement(term) {
        term.classList.add("expire");
        term.addEventListener("animationend", () => {
            term.remove();
        });
    }

    function createGame() {
        clearGame();
        generateTermElement("bot");
        generateTermElement("top");
    }

    function clearGame() {
        const termElements = document.querySelectorAll(".term");
        termElements.forEach(element => element.remove());
    }

    function handleChoice(choice) {
        const result = document.getElementById("result");
        const correct = choice 
            ? document.querySelector(".bot:not(.expire)").textContent.localeCompare(document.querySelector(".top").textContent) <= 0 
            : document.querySelector(".bot:not(.expire)").textContent.localeCompare(document.querySelector(".top").textContent) >= 0;
        if (correct) {
            result.textContent = "Correct!";
            appendTerm();
        } else {
            result.textContent = "Incorrect.";
        }
        result.style.animation = "none";
        result.offsetHeight;
        result.style.animation = "";
    }

    async function initialize() {
        await loadTerms(currentList);
        createGame();
        initializeEventListeners();
    }

    function initializeEventListeners() {
        document.getElementById("term-type").addEventListener("change", async (event) => {
            currentList = event.target.value;
            await loadTerms(currentList);
            createGame();
        });
        const choices = document.querySelectorAll("button.choice");
        for (const choice of choices) {
            choice.addEventListener("mouseover", () => {
                choice.classList.add("hover");
            });
            choice.addEventListener("mouseout", () => {
                choice.classList.remove("hover");
            });
            choice.addEventListener("mousedown", () => {
                choice.classList.add("active");
            });
            choice.addEventListener("mouseup", () => {
                choice.classList.remove("active");
            });
            choice.addEventListener("click", () => {
                handleChoice(choice.getAttribute("id") === "after");
            });
        }
        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                handleChoice(false);
            }
            if (event.key === "ArrowRight") {
                handleChoice(true);
            }
        });
    }
});
