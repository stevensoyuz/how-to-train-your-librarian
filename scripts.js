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
        let termElementTop = document.querySelector(".term-top");
        let termElementBot = document.querySelector(".term-bot");

        termElementTop.textContent = termCompare;
        termElementBot.textContent = termReference;
        
        const result = document.getElementById("result");

        function handleChoice(choice) {
            const correct = choice 
                ? termElementBot.textContent.localeCompare(termElementTop.textContent) <= 0 
                : termElementBot.textContent.localeCompare(termElementTop.textContent) >= 0;
            if (correct) {
                result.textContent = "Correct!";
                termElementTop.className = "term term-bot"
                termElementBot.className = "term term-top"
                // termReference = termCompare;
                // termCompare = getRandomAuthor();
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
            termElementTop = document.querySelector(".term-top");
            termElementBot = document.querySelector(".term-bot");
            termElementTop.textContent = termCompare;
            termElementBot.textContent = termReference;

            termElementBot.style.transition = "0.5s ease" // DEFAULT
            termElementBot.style.transform = "translate(0em) scale(2,2)"

            setTimeout(() => {
                termElementBot.style.transform = "translate(0em) scale(1,1)"
            }, 100);
            
            // termElementBot.style.transition = "all 0s linear"
            // termElementBot.style.opacity = "0.1";
            // setTimeout(() => {
            //     termElementBot.style.transition = "0.5s ease"
            //     termElementBot.style.opacity = "1";
            // }, 100);
            
            termElementTop.style.transition = "all 0s linear"
            termElementTop.style.transform = "translateY(-6em)"
            termElementTop.style.opacity = "0";
            setTimeout(() => {
                termElementTop.style.transition = "0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s" // DEFAULT
                termElementTop.style.transform = "translate(0em)"
                termElementTop.style.opacity = "1";
            }, 0);
        }

        const beforeButton = document.getElementById("before-button")
        const afterButton = document.getElementById("after-button")

        beforeButton.addEventListener("mouseover", () => {
            termElementTop.style.transform = "translate(-1em) rotate(-10deg)"
            termElementBot.style.transform = "translate(0.5em) rotate(2deg)"
            document.getElementById("span-before").style.textDecoration = "underline";
        });
        beforeButton.addEventListener("mouseout", () => {
            termElementTop.style.transform = "translate(0em)"
            termElementBot.style.transform = "translate(0em)"
            document.getElementById("span-before").style.textDecoration = "";
        });
        afterButton.addEventListener("mouseover", () => {
            termElementTop.style.transform = "translate(1em) rotate(10deg)"
            termElementBot.style.transform = "translate(-0.5em) rotate(-2deg)"
            document.getElementById("span-after").style.textDecoration = "underline";
        });
        afterButton.addEventListener("mouseout", () => {
            termElementTop.style.transform = "translate(0em)"
            termElementBot.style.transform = "translate(0em)"
            document.getElementById("span-after").style.textDecoration = "";
        });

        beforeButton.addEventListener("click", () => handleChoice(false));
        afterButton.addEventListener("click", () => handleChoice(true));
    }
});
