document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selectors ---
    const splashScreen = document.getElementById('splash-screen');
    const mainTerminal = document.getElementById('main-terminal');
    const scrambleTextElement = document.getElementById('scramble-text');
    const clickPrompt = document.getElementById('click-prompt');
    const clockElement = document.getElementById('clock');
    const terminalInput = document.getElementById('terminal-input');
    const userInputText = document.getElementById('user-input-text');
    const suggestionText = document.getElementById('suggestion-text');
    const terminalBody = document.getElementById('terminal-body');
    const terminalOutput = document.getElementById('terminal-output');
    const crtScreen = document.querySelector('.crt-screen');


    // --- State Variables ---
    let inactivityTimer;
    const TYPING_SPEED = 10;
    let commandHistory = [];
    let historyIndex = 0;
    let tempInput = "";

    // --- PORTFOLIO DATA & COMMAND LIST CACHE ---
    const commandData = {
        'about': {
            description: 'Who I am?',
            output: `Hi, I'm Priyansh Vashishtha!
        
I'm a Final Year Student loves to just make things, designing scalable backend architectures and automating cloud infrastructure. I’m well-versed in tools like Docker, Kubernetes, GitHub Actions, and AWS, and I specialize in building RESTful APIs using Python and Django. 

Would love to explain but it will take a lot of time.
        
When not working, I love to, I love a lot of things. Maybe a bit of everything. Trying new things for now, whatever works out.`
        },
        'education': {
            description: 'Where I have learned?',
            output: `B.Tech Computer science Engineering from World College of Technology and Management, Farukhnagar.
- Got to learn about Artificial Intelligence, Data Science, Cloud Computing and all the secrets.
- Through my course: AWS, SDKs, CCNA, Machine Learning and more.
        
Additional Learning:
- Self-taught in web development, currently building skills in full-stack technologies with a strong focus on backend.
- Pursuing self-guided study in DevOps, emphasizing AWS, cloud infrastructure, containerization, and CI/CD pipelines.
- Regular participation in organizing events and coding challenges`
        },
        'certifications': {
            description: 'What I have achieved?',
            output: `Technical Certifications:
- Udemy:AWS Cloud practitioner 
- Udemy:AWS Certified Solutions Architect - Associate
- Udemy:Python with Django Bootcamp
Campus Certifications:
- Tech Fest: 2nd Runner-up in Tech Fest '24

Soft Skills Certifications:
- Great Learning: Product Management
- Great Learning: Leadership and Management`
        },
        'leadership': {
            description: 'Where I have mentored?',
            output: `Through my College:
Coordinated — Tech Fest '24
Coordinated — Small Venture(@thecelestialsoul)
Volunteered — Multiple Workshops
Volunteered — Game Day '23

Mentorship :
Conducted a small workhop on Python for beginners.
Assisted in organizing and mentoring college events, including Game Day and Club Fiesta.`
        },
        'skills': {
            description: 'What tricks I can do?',
            output: `Programming Languages: 
- Python
- JavaScript

Libraries/Frameworks:
- NumPy
- Pandas
- Matplotlib
- Scikit-learn
- Django

Database Management:
- MySQL
- PostgreSQL

Cloud Platforms:
- AWS (EC2, S3, Lambda)
- Cloud Functions

DevOps Tools:
- Docker
- Git
- Jenkins
- Kubernetes
- Terraform
- CI/CD Pipelines

Web Dev Skills: 
- Full-stack Development
- HTML
- CSS
- Responsive Design

Operating Systems:
- Linux(Ubuntu, CentOS, AlmaLinux)
- Windows
- MacOS

Extras:
- Social Media Management
- Modelling
- Canva

Soft Skills:
- Leadership
- Time Management
- Team Collaboration
- Innovation
- Problem Solving

Languages:
- English (Fluent),
- Hindi (Native)`
        },
        'projects': {
            description: 'What I have built?',
            output: `For that my friend, you can directly check out my Github Profile. You can find the link in the Conatct section.`
        },
        'experience': {
            description: 'Where I have contributed?',
            output: `Well, check out my LinkedIn profile by clicking the icon in the upper right corner. I have worked on some projects, but nothing too big yet.  `
        },
        'contact': {
            description: 'How to get in touch?'
            // Output is handled by special logic in processCommand
        },
        'socials': {
            description: 'Where I try to be active?'
            // Output is handled by special logic in processCommand
        },
        'help': {
            description: 'Shows a list of commands.'
        },
        'clear': {
            description: 'Cleans up the screen.'
        }
    };
    const commandList = Object.keys(commandData);

    // --- MOBILE VIEWPORT HEIGHT FIX ---
    const setAppHeight = () => {
        const doc = document.documentElement;
        doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // --- TEXT SCRAMBLE EFFECT CLASS ---
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '`~!@#$%^&*()[]{}<>?-_=+\\|/;:\",./';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            this.promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 100);
                const end = start + Math.floor(Math.random() * 100);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return this.promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="scrambling">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }


    // --- ROBUST HTML-AWARE TYPEWRITER EFFECT ---
    async function typewriterEffect(element, htmlString, callback) {
        const source = document.createElement('div');
        source.innerHTML = htmlString;

        async function animateNode(sourceNode, targetElement) {
            for (const child of sourceNode.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent;
                    for (const char of text) {
                        targetElement.appendChild(document.createTextNode(char));
                        scrollTerminalToBottom();
                        await new Promise(resolve => setTimeout(resolve, TYPING_SPEED));
                    }
                } 
                else if (child.nodeType === Node.ELEMENT_NODE) {
                    const newElement = document.createElement(child.tagName);
                    for (const attr of child.attributes) {
                        newElement.setAttribute(attr.name, attr.value);
                    }
                    targetElement.appendChild(newElement);
                    await animateNode(child, newElement);
                }
            }
        }

        await animateNode(source, element);

        if (callback) callback();
    }


    // --- COMMAND PROCESSING LOGIC ---
    async function processCommand(command) {
        if (command && command !== commandHistory[commandHistory.length - 1]) {
            commandHistory.push(command);
        }
        historyIndex = commandHistory.length;
        tempInput = "";

        const lowerCaseCommand = command.toLowerCase();

        if (lowerCaseCommand === 'clear') {
            terminalOutput.innerHTML = '';
            scrollTerminalToBottom();
            return;
        }

        const block = document.createElement('div');
        block.classList.add('output-block');

        const outputLine = document.createElement('div');
        outputLine.classList.add('terminal-output-line');
        outputLine.innerHTML = `<span class="prompt">idd:\\user\\itspriyansh></span><span class="command-input">${command}</span>`;

        const outputTextElement = document.createElement('div');
        outputTextElement.classList.add('output-text'); 

        block.appendChild(outputLine);
        block.appendChild(outputTextElement);
        terminalOutput.appendChild(block);

        // --- Handle Special Commands and Regular Commands ---
        if (lowerCaseCommand === 'contact') {
           await typewriterEffect(outputTextElement, "pvashisht761@gmail.com | Priyansh0412");
           await new Promise(resolve => setTimeout(resolve, 200));
           outputTextElement.innerHTML = `
           <a href="mailto:pvashisht761@gmail.com" target="_blank">Mail</a>
           <a href="https://www.github.com/priyansh0412/" target="_blank">Github</a>`;
           scrollTerminalToBottom();
        } else if (lowerCaseCommand === 'github') {
           await typewriterEffect(outputTextElement, "Priyansh0412");
           await new Promise(resolve => setTimeout(resolve, 200));
           outputTextElement.innerHTML = `<a href="https://www.github.com/priyansh0412/" target="_blank" rel="noopener noreferrer">Github</a>`;
           scrollTerminalToBottom();

        } else if (lowerCaseCommand === 'socials') {
            await typewriterEffect(outputTextElement, "@pvashishtt_");
            await new Promise(resolve => setTimeout(resolve, 200)); // Short pause
            outputTextElement.innerHTML = `<a href="https://www.instagram.com/pvashishtt_/" target="_blank" rel="noopener noreferrer">Instagram</a>`;
            scrollTerminalToBottom();
        } else {
            let outputText = '';
            if (lowerCaseCommand === 'help') {
                let helpContent = 'commands you can play around with:\n\n';
                for (const key in commandData) {
                    const spacing = ' '.repeat(Math.max(0, 15 - key.length));
                    helpContent += `${key}${spacing}-  ${commandData[key].description}\n`;
                }
                helpContent += `\nType anything you wish to...`;
                outputText = helpContent;

            } else if (commandData[lowerCaseCommand]) {
                outputText = commandData[lowerCaseCommand].output;
            } else {
                const sanitizedCommand = command.replace(/</g, "<").replace(/>/g, ">");
                outputText = 
                    `<span class="output-error-red">ACCESS DENIED: Command </span>` +
                    `<span class="output-error-command">'${sanitizedCommand}'</span>` +
                    `<span class="output-error-red"> not recognized in this kernel. Refer to </span>` +
                    `<span class="output-error-help">'help'</span>` +
                    `<span class="output-error-red"> protocol.</span>`;
            }
            typewriterEffect(outputTextElement, outputText, scrollTerminalToBottom);
        }
    }

    // --- AUTOCOMPLETE LOGIC ---
    function handleAutocomplete() {
        const inputValue = terminalInput.value.toLowerCase();
        if (inputValue.length < 2) {
            suggestionText.textContent = '';
            return;
        }

        const match = commandList.find(command => command.startsWith(inputValue));

        if (match && match !== inputValue) {
            const originalCaseMatch = commandList.find(c => c.toLowerCase() === match);
            suggestionText.textContent = originalCaseMatch.substring(inputValue.length);
        } else {
            suggestionText.textContent = '';
        }
    }

    function acceptSuggestion() {
        if (suggestionText.textContent) {
            terminalInput.value += suggestionText.textContent;
            userInputText.textContent = terminalInput.value;
            suggestionText.textContent = '';
            scrollTerminalToBottom();
        }
    }


    // --- INACTIVITY PROMPT LOGIC ---
    function showInactivityPrompt() {
        crtScreen.classList.add('inactive-blur');
    }

    function hideInactivityPrompt() {
        clearTimeout(inactivityTimer);
        crtScreen.classList.remove('inactive-blur');
    }

    function startInactivityTimer() {
        hideInactivityPrompt();
        inactivityTimer = setTimeout(showInactivityPrompt, 3000);
    }

    // --- Update Click Prompt Text on Resize ---
    function updateClickPromptText() {
        if (window.innerWidth <= 768) {
            clickPrompt.textContent = "Tap to Continue";
        } else {
            clickPrompt.textContent = "Click to Continue";
        }
    }

    // --- SCROLL MANAGEMENT ---
    function scrollTerminalToBottom() {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }


    // --- INITIALIZATION ---
    function init() {
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        
        const fx = new TextScramble(scrambleTextElement);
        const textToScramble = "Priyansh Vashishtha";

        crtScreen.addEventListener('animationend', (event) => {
            if (event.animationName === 'turn-on') {
                scrambleTextElement.style.opacity = 1;
                fx.setText(textToScramble).then(() => {
                    updateClickPromptText();
                    window.addEventListener('resize', updateClickPromptText);
                    startInactivityTimer();
                });
            }
        });

        scrambleTextElement.addEventListener('mouseenter', hideInactivityPrompt);
        scrambleTextElement.addEventListener('mouseleave', startInactivityTimer);

        scrambleTextElement.addEventListener('click', () => {
            clearTimeout(inactivityTimer);
            window.removeEventListener('resize', updateClickPromptText);
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                mainTerminal.classList.remove('visually-hidden');
                mainTerminal.classList.add('loaded');
                updateClock();
                setInterval(updateClock, 1000);
                terminalInput.focus();
            }, 250);
        }, { once: true });

        // --- Main Input Event Listeners ---
        terminalInput.addEventListener('input', () => {
            userInputText.textContent = terminalInput.value;
            handleAutocomplete();
            scrollTerminalToBottom();
        });

        terminalBody.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                terminalInput.focus();
            }
        });

        terminalInput.addEventListener('keydown', (e) => {
            if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestionText.textContent) {
                e.preventDefault();
                acceptSuggestion();
                return;
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    if (historyIndex === commandHistory.length) {
                        tempInput = terminalInput.value;
                    }
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex];
                    userInputText.textContent = terminalInput.value;
                    handleAutocomplete();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                    userInputText.textContent = terminalInput.value;
                } else {
                    historyIndex = commandHistory.length;
                    terminalInput.value = tempInput;
                    userInputText.textContent = tempInput;
                }
                 handleAutocomplete();
            }
            
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const command = terminalInput.value.trim();
                // To prevent executing an empty command when history is restored
                if (command) {
                    processCommand(command);
                }
                terminalInput.value = '';
                userInputText.textContent = '';
                suggestionText.textContent = '';
                scrollTerminalToBottom();
            }
        });
        
        suggestionText.addEventListener('click', () => {
            acceptSuggestion();
            terminalInput.focus();
        });

        const commandLinks = document.querySelectorAll('nav.command-list span');
        commandLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const command = e.target.textContent.trim();
                if (command) {
                    terminalInput.value = '';
                    userInputText.textContent = '';
                    suggestionText.textContent = '';
                    processCommand(command);
                }
            });
        });

        updateClock();
    }


    // --- LIVE CLOCK FUNCTION ---
    function updateClock() {
        if (clockElement) {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            const formatter = new Intl.DateTimeFormat('en-GB', options);
            const parts = formatter.formatToParts(now);
            const day = parts.find(p => p.type === 'day').value;
            const month = parts.find(p => p.type === 'month').value;
            const year = parts.find(p => p.type === 'year').value;
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour12: true
            });
            clockElement.textContent = `${day}/${month}/${year}, ${timeString}`;
        }
    }

    // --- Start the application ---
    init();

});