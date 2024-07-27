document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector("#game");

    let authors = {};
    let termCompare;
    let termReference;

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

            termCompare = getNewTerm();
            termReference = getNewTerm();
            createGame();
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    }  
        
    function getNewTerm() {
        const keys = Object.keys(authors);
        let term;
        do {
            term = keys[Math.floor(Math.random() * keys.length)]
        } while (term == termCompare)
        return term;
    }
    
    function createGame() {
        let termElementTop = document.querySelector(".term.top");
        let termElementBot = document.querySelector(".term.bot");

        termElementTop.textContent = termCompare;
        termElementBot.textContent = termReference;
        
        const result = document.getElementById("result");

        function handleChoice(choice) {
            const correct = choice 
                ? termElementBot.textContent.localeCompare(termElementTop.textContent) <= 0 
                : termElementBot.textContent.localeCompare(termElementTop.textContent) >= 0;
            if (correct) {
                result.textContent = "Correct!";
                termElementTop.className = "term bot"
                termElementBot.className = "term top"
                refresh();
            } else {
                result.textContent = "Incorrect.";
            }
            result.style.transition = "none"
            result.style.opacity = "1";
            setTimeout(() => {
                result.style.transition = "opacity 2s ease"
                result.style.opacity = "0";
            }, 500);
        }

        function refresh() {
            termReference = termCompare;
            termCompare = getNewTerm();
            termElementTop = document.querySelector(".term.top");
            termElementBot = document.querySelector(".term.bot");
            termElementTop.textContent = termCompare;
            termElementBot.textContent = termReference;

            termElementBot.classList.add("animate");

            setTimeout(() => {
                termElementBot.classList.remove("animate");
            }, 50);
            
            termElementTop.classList.add("animate");
            setTimeout(() => {
                termElementTop.classList.remove("animate");
            }, 0);
        }

        const beforeButton = document.getElementById("before-button");
        const afterButton = document.getElementById("after-button");
        const beforeSpan = document.querySelector("#before");
        const afterSpan = document.querySelector("#after");

        beforeButton.addEventListener("mouseover", () => {
            termElementTop.classList.add("selected", "before");
            termElementBot.classList.add("selected", "before");
            beforeSpan.classList.add("selected");
            beforeButton.classList.add("hover");
        });
        beforeButton.addEventListener("mousedown", () => {
            beforeButton.classList.add("active");
        });
        beforeButton.addEventListener("mouseup", () => {
            beforeButton.classList.remove("active");
        });
        beforeButton.addEventListener("mouseout", () => {
            termElementTop.classList.remove("selected", "before");
            termElementBot.classList.remove("selected", "before");
            beforeSpan.classList.remove("selected");
            beforeButton.classList.remove("hover");
        });
        afterButton.addEventListener("mouseover", () => {
            termElementTop.classList.add("selected", "after");
            termElementBot.classList.add("selected", "after");
            afterSpan.classList.add("selected");
            afterButton.classList.add("hover");
        });
        afterButton.addEventListener("mousedown", () => {
            afterButton.classList.add("active");
        });
        afterButton.addEventListener("mouseup", () => {
            afterButton.classList.remove("active");
        });
        afterButton.addEventListener("mouseout", () => {
            termElementTop.classList.remove("selected", "after");
            termElementBot.classList.remove("selected", "after");
            afterSpan.classList.remove("selected");
            afterButton.classList.remove("hover");
        });

        beforeButton.addEventListener("click", () => handleChoice(false));
        afterButton.addEventListener("click", () => handleChoice(true));
    }
});
