document.addEventListener("DOMContentLoaded", () => {
    const game = document.getElementById("game");
    let authors = {};

    initialize();

    async function initialize() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/stevensoyuz/how-to-train-your-librarian/main/resources/authors.json');
            const data = await response.json();
            authors = data.authors.reduce((acc, author) => {
                const key = `${author.firstname} ${author.lastname}`;
                acc[key] = author;
                return acc;
            }, {});

        } catch (error) {
            console.error("Error fetching authors:", error);
        }
        createGame();
    }  
    
    function createGame() {
        generateTermElement("bot");
        generateTermElement("top");

        const result = document.getElementById("result");

        function handleChoice(choice) {
            const correct = choice 
                ? document.querySelector(".bot:not(.expire)").textContent.localeCompare(document.querySelector(".top").textContent) <= 0 
                : document.querySelector(".bot:not(.expire)").textContent.localeCompare(document.querySelector(".top").textContent) >= 0;
            if (correct) {
                result.textContent = "Correct!";
                appendTerm();
            } else {
                result.textContent = "Incorrect.";
            }
            result.style.animation = "none"
            result.offsetHeight;
            result.style.animation = ""
        }

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
                handleChoice(choice.getAttribute("id") == "after");
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

    function appendTerm() {
        do {
            const removedTerm = document.querySelector(".bot:not(.expire)");
            removeTermElement(removedTerm);
            const currentTerm = document.querySelector(".top");
            currentTerm.classList.replace("top", "bot");
            generateTermElement("top");
        } while (!document.querySelector(".bot:not(.expire)"))
    }

    function generateTermElement(index) {
        let generated = document.createElement("div");
        game.appendChild(generated);
        generated.classList.add("term", index);
        generated.textContent = generateTerm();
    }

    function generateTerm() {
        const keys = Object.keys(authors);
        let term;
        do {
            term = keys[Math.floor(Math.random() * keys.length)]
        } while (term == document.querySelector(".bot:not(.expire)").textContent)
        return term;
    }

    function removeTermElement(term) {
        term.classList.add("expire");
        term.addEventListener("animationend", () => {
            term.remove();
        })
    }

});
