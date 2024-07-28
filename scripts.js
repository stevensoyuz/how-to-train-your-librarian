document.addEventListener("DOMContentLoaded", () => {
    const game = document.getElementById("content");
    let terms = {};
    let currentList = "authors";
    let format = "";

    initialize();

    async function initialize() {
        await loadTerms(currentList);
        createGame();
        initializeEventListeners();
    }

    async function loadTerms(list) {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/stevensoyuz/how-to-train-your-librarian/main/resources/${list}.json`);
            const data = await response.json();
            format = data.format;
            terms = data[list].reduce((acc, term) => {
                const key = formatTerm(term, format);
                acc[key] = term;
                return acc;
            }, {});
        } catch (error) {
            console.error("Error fetching terms:", error);
        }
    }

    function formatTerm(term, format) {
        switch (format) {
            case "default":
                return `${term.item}`;
            case "lastname, firstname":
                return `${term.lastname}, ${term.firstname}`;
            default:
                return "";
        }
    }

    document.getElementById("term-type").addEventListener("change", async (event) => {
        currentList = event.target.value;
        await loadTerms(currentList);
        createGame();
    });

    function createGame() {
        clearGame();
        generateTermElement("bot");
        generateTermElement("top");
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
        const keys = Object.keys(terms);
        let term;
        do {
            term = keys[Math.floor(Math.random() * keys.length)];
        } while (term === document.querySelector(".bot:not(.expire)").textContent);
        return term;
    }

    function removeTermElement(term) {
        term.classList.add("expire");
        term.addEventListener("animationend", () => {
            term.remove();
        });
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

    function initializeEventListeners() {
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
