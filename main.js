// Main JavaScript for gamified course

// Course structure data
let courseStructure = {};
let currentCourse = [];

// Move these to the top, right after courseStructure declaration
let currentModule = 0;
let currentPretest = 0;
let currentPosttest = 0;
let currentQuestionIndex = 0;

// Timing variables
let pretestStart = null, pretestEnd = null, moduleStart = null, moduleEnd = null, posttestStart = null, posttestEnd = null;

// Initialize userData object
let userData = {
    name: '',
    pretest: [],
    posttest: [],
    moduleProgress: [],
    badges: [],
    points: 0,
    startTime: null,
    endTime: null,
    feedback: '',
    pretestTime: 0,
    posttestTime: 0,
    proficiencyLevel: '', // 'beginner' or 'intermediate'
    coursePath: []
};

// Load course structure from JSON
async function loadCourseStructure() {
    try {
        const response = await fetch('course-structure.json');
        courseStructure = await response.json();
        console.log('Course structure loaded:', courseStructure);
    } catch (error) {
        console.error('Error loading course structure:', error);
        // Fallback to default structure if JSON fails to load
        courseStructure = {
            beginner: [
                { id: "welcome-beginner", title: "Welcome to AI Fundamentals", objective: "Introduce beginners to AI" },
                { id: "what-is-ai", title: "What is AI?", objective: "Learn AI basics" },
                { id: "generative-ai-intro", title: "Generative AI Intro", objective: "Understand generative AI" },
                { id: "agentive-ai-basics", title: "Agentive AI Basics", objective: "Learn about agentive AI" },
                { id: "codex-introduction", title: "Meet Codex AI", objective: "Discover Codex capabilities" },
                { id: "codex-demo", title: "Codex Demo", objective: "Experience Codex in action" },
                { id: "reflection", title: "Course Reflection", objective: "Complete the course" },
                { id: "escape-room", title: "AI Knowledge Challenge", objective: "Test understanding" } // Added missing module
            ],
            intermediate: [
                { id: "welcome-intermediate", title: "Advanced AI Deep Dive", objective: "Advanced AI concepts" },
                { id: "ai-industry-cases", title: "AI in Industry", objective: "Real-world applications" },
                { id: "generative-ai-advanced", title: "Advanced Generative AI", objective: "Enterprise applications" },
                { id: "agentive-ai-deep-dive", title: "Agentive AI Deep Dive", objective: "Technical architecture" },
                { id: "github-copilot-deep-dive", title: "GitHub Copilot Professional", objective: "Professional development" },
                { id: "codex-advanced", title: "Advanced Codex", objective: "Production usage" },
                { id: "ai-strategy-case-study", title: "AI Strategy Case Study", objective: "Implementation strategies" }
            ]
        };
    }
}

// Determine proficiency level based on pretest results
function determineProficiencyLevel() {
    const correctAnswers = userData.pretest.filter(x => x.correct).length;
    const advancedQuestions = userData.pretest.filter((x, index) => 
        pretestQuestions[index].difficulty === 'advanced' && x.correct
    ).length;
    const intermediateQuestions = userData.pretest.filter((x, index) => 
        pretestQuestions[index].difficulty === 'intermediate' && x.correct
    ).length;
    
    console.log(`Total correct: ${correctAnswers}, Advanced: ${advancedQuestions}, Intermediate: ${intermediateQuestions}`);
    
    // Logic for determining level
    if (correctAnswers <= 4 || (advancedQuestions <= 1 && intermediateQuestions <= 2)) {
        userData.proficiencyLevel = 'beginner';
        console.log('Assigned to BEGINNER course');
        shuffledPosttestQuestions = shuffledBeginnerPosttest; // ← ADD THIS
    } else {
        userData.proficiencyLevel = 'intermediate'; 
        console.log('Assigned to INTERMEDIATE course');
        shuffledPosttestQuestions = shuffledIntermediatePosttest; // ← ADD THIS
    }
    
    // Set the current course based on proficiency
    currentCourse = courseStructure[userData.proficiencyLevel];
    userData.coursePath = userData.proficiencyLevel;
}

// Initialize course when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadCourseStructure();
        
        // Add small delay to ensure DOM is fully loaded
        setTimeout(() => {
            // Get DOM elements after they're loaded
            const nameSection = document.getElementById('name-section');
            const pretestSection = document.getElementById('pretest-section');
            const courseSection = document.getElementById('course-section');
            const posttestSection = document.getElementById('posttest-section');
            const highscoreSection = document.getElementById('highscore-section');
            const progressBarContainer = document.getElementById('progress-bar-container');
            const progressBar = document.getElementById('progress-bar');
            
            // Add the start button handler
            const startBtn = document.getElementById('start-btn');
            if (startBtn) {
                startBtn.onclick = () => {
                    console.log('Start button clicked!'); // Debug log
                    
                    const name = document.getElementById('username').value.trim();
                    if (name) {
                        userData.name = name;
                        userData.startTime = Date.now();
                        pretestStart = Date.now();
                        
                        console.log('User data set:', userData); // Debug log
                        
                        // Hide name section and show progress bar
                        if (nameSection) nameSection.style.display = 'none';
                        if (progressBarContainer) progressBarContainer.style.display = 'block';
                        
                        // Start the pretest
                        startPretest();
                    } else {
                        alert('Please enter your name to continue');
                    }
                };
                console.log('Start button handler attached'); // Debug log
            } else {
                console.error('Start button not found!');
            }
        }, 200); // Increased delay
        
        console.log('Course initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

function updateGameHeaderForCourse() {
    const levelIndicator = document.getElementById('level-indicator');
    if (levelIndicator && currentCourse.length > 0) {
        const courseType = userData.proficiencyLevel === 'beginner' ? 'Beginner' : 'Intermediate';
        levelIndicator.textContent = `${courseType} Course - Module 1 of ${currentCourse.length}`;
    }
}

// Function to shuffle array and return new correct answer index
function shuffleOptions(question) {
    const originalOptions = [...question.options];
    const originalCorrectAnswer = question.answer;
    
    // Create array of indices to shuffle
    const indices = originalOptions.map((_, index) => index);
    
    // Fisher-Yates shuffle algorithm
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Create shuffled options array
    const shuffledOptions = indices.map(index => originalOptions[index]);
    
    // Find new correct answer index
    const newCorrectAnswer = indices.indexOf(originalCorrectAnswer);
    
    return {
        ...question,
        options: shuffledOptions,
        answer: newCorrectAnswer
    };
}

// Updated Pretest Questions to assess AI knowledge level
let pretestQuestions = [
    {q: '1. What is Artificial Intelligence (AI)?', options: ['A computer program that can think like humans', 'A robot that looks like a human', 'A type of smartphone app', 'A video game character'], answer: 0, difficulty: 'basic'},
    {q: '2. Which of these is an example of AI you might use daily?', options: ['Voice assistants like Siri or Alexa', 'A calculator', 'A microwave oven', 'A bicycle'], answer: 0, difficulty: 'basic'},
    {q: '3. What is Generative AI?', options: ['AI that creates new content like text or images', 'AI that only reads information', 'AI that controls robots', 'AI that solves math problems'], answer: 0, difficulty: 'intermediate'},
    {q: '4. Which of these is an example of Generative AI?', options: ['ChatGPT creating text responses', 'A calculator doing math', 'A GPS giving directions', 'A thermostat controlling temperature'], answer: 0, difficulty: 'intermediate'},
    {q: '5. What is Agentive AI?', options: ['AI that acts on behalf of users to complete tasks', 'AI that only generates content', 'AI that plays video games', 'AI that translates languages'], answer: 0, difficulty: 'advanced'},
    {q: '6. Which is the main difference between Generative and Agentive AI?', options: ['Generative creates content, Agentive takes actions', 'They are the same thing', 'Generative is newer than Agentive', 'Agentive is only for robots'], answer: 0, difficulty: 'advanced'},
    {q: '7. What is GitHub Copilot?', options: ['An AI tool that helps write code', 'A type of airplane pilot', 'A social media platform', 'A video editing software'], answer: 0, difficulty: 'advanced'},
    {q: '8. What should you always do with AI-generated code?', options: ['Review and test it before using', 'Use it immediately without checking', 'Delete it right away', 'Share it with everyone'], answer: 0, difficulty: 'advanced'},
    {q: '9. In which industries is AI currently being used?', options: ['Healthcare, finance, transportation, and many others', 'Only in technology companies', 'Only in manufacturing', 'Only in entertainment'], answer: 0, difficulty: 'intermediate'},
    {q: '10. What is a potential risk of using AI?', options: ['It may make mistakes or have biases', 'It will definitely replace all human jobs', 'It will become conscious and take over', 'It only works on expensive computers'], answer: 0, difficulty: 'advanced'}
];

// Shuffle questions
let shuffledPretestQuestions = pretestQuestions.map(q => shuffleOptions(q));

// Beginner and Intermediate Posttest Questions
let beginnerPosttestQuestions = [
    {q: '1. What is Artificial Intelligence (AI)?', options: ['Computer systems that can perform tasks requiring human intelligence', 'A type of robot', 'A smartphone app', 'A video game'], answer: 0},
    {q: '2. Which is an example of AI you might use daily?', options: ['Voice assistants like Siri or Alexa', 'A regular calculator', 'A printed newspaper', 'A mechanical clock'], answer: 0},
    {q: '3. What does Generative AI do?', options: ['Creates new content like text, images, or music', 'Only stores information', 'Controls robots', 'Solves math problems only'], answer: 0},
    {q: '4. Which is an example of Generative AI?', options: ['ChatGPT writing a story', 'A GPS giving directions', 'A calculator doing math', 'A light switch turning on'], answer: 0},
    {q: '5. What is the main purpose of Agentive AI?', options: ['To complete tasks and take actions for users', 'To only create content', 'To play video games', 'To display information'], answer: 0},
    {q: '6. How is Agentive AI different from Generative AI?', options: ['Agentive does tasks, Generative creates content', 'They are exactly the same', 'Agentive is newer technology', 'Generative is only for phones'], answer: 0},
    {q: '7. What is Codex AI designed to help with?', options: ['Writing and understanding computer code', 'Cooking recipes', 'Playing music', 'Drawing pictures'], answer: 0},
    {q: '8. When using AI-generated code, you should always:', options: ['Review and test it before using', 'Use it immediately without checking', 'Delete it right away', 'Share it publicly'], answer: 0},
    {q: '9. AI can be helpful in daily life by:', options: ['Recommending movies, organizing photos, assisting with tasks', 'Replacing all human activities', 'Only working on computers', 'Making everything more complicated'], answer: 0},
    {q: '10. What should you remember about AI?', options: ['It\'s a helpful tool that can make mistakes', 'It\'s perfect and never wrong', 'It\'s dangerous to use', 'It only works for experts'], answer: 0}
];

let intermediatePosttestQuestions = [
    {q: '1. What is a key advantage of multi-agent AI systems?', options: ['Multiple AI agents coordinate to solve complex problems', 'They cost less than single AI systems', 'They work faster than humans always', 'They never need maintenance'], answer: 0},
    {q: '2. In Netflix\'s AI strategy, what was the most important success factor?', options: ['Starting simple and continuously improving with data', 'Using the most expensive technology available', 'Hiring only PhD researchers', 'Copying competitors exactly'], answer: 0},
    {q: '3. What is a major ethical concern with advanced Generative AI?', options: ['Potential for creating misleading or fake content', 'It consumes too much electricity', 'It only works in certain languages', 'It requires special hardware'], answer: 0},
    {q: '4. For production use of AI-generated code, what is the most critical practice?', options: ['Always review and test before deploying', 'Use it immediately to save time', 'Only use it for simple programs', 'Avoid it in business applications'], answer: 0},
    {q: '5. What ROI benefit does predictive maintenance AI typically provide?', options: ['30% reduction in downtime and significant cost savings', 'Makes equipment look better', 'Increases energy consumption', 'Replaces all maintenance staff'], answer: 0},
    {q: '6. Which industry application demonstrates AI\'s impact on healthcare?', options: ['Medical imaging AI detecting diseases with 90%+ accuracy', 'AI replacing all doctors', 'AI only organizing patient files', 'AI controlling hospital temperature'], answer: 0},
    {q: '7. What is the primary business value of Agentive AI in enterprises?', options: ['Automating complex business processes', 'Creating marketing content', 'Improving website design', 'Managing social media'], answer: 0},
    {q: '8. In AI strategy implementation, what should drive technical decisions?', options: ['User experience and business objectives', 'Latest technology trends', 'Competitor actions', 'Cost reduction only'], answer: 0},
    {q: '9. What characterizes advanced Generative AI workflows?', options: ['Integration with business processes and human oversight', 'Fully automated with no human input', 'Only text generation capabilities', 'Simple question-answer interactions'], answer: 0},
    {q: '10. What is essential for successful AI deployment in organizations?', options: ['Phased implementation with pilot testing', 'Immediate company-wide rollout', 'Technology-first approach', 'Minimal planning and training'], answer: 0}
];

// Shuffle both posttest sets
let shuffledBeginnerPosttest = beginnerPosttestQuestions.map(q => shuffleOptions(q));
let shuffledIntermediatePosttest = intermediatePosttestQuestions.map(q => shuffleOptions(q));

// Current posttest questions (will be set based on course level)
let shuffledPosttestQuestions = [];

// Remove old question arrays and replace with new module content
let moduleContent = {
    // BEGINNER COURSE MODULES
    "welcome-beginner": {
        type: 'welcome',
        content: `
            <div class="module-content">
                <h2>🌟 Welcome to AI Fundamentals!</h2>
                <p>Don't worry if you're new to AI - we'll start from the very beginning!</p>
                <div class="objectives">
                    <h3>🎯 What You'll Learn:</h3>
                    <ul>
                        <li>What AI really is (in simple terms!)</li>
                        <li>Different types of AI and how they work</li>
                        <li>How AI can help you in daily life</li>
                        <li>Try AI yourself with hands-on activities</li>
                    </ul>
                </div>
                <div class="learning-path">
                    <h3>📚 Your Learning Path:</h3>
                    <p>We've designed this course specifically for beginners. Take your time and enjoy the journey!</p>
                    <p><strong>🃏 Interactive Learning:</strong> Each lesson uses flashcards to help you remember key concepts!</p>
                </div>
            </div>
        `
    },    "what-is-ai": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🤖 What is Artificial Intelligence?</h2>
                    
                    <div class="concept-explanation">
                        <h3>💡 Simple Definition</h3>
                        <p><strong>AI is like giving computers the ability to think and learn, similar to how humans do.</strong></p>
                        
                        <h3>🔍 Key Characteristics of AI</h3>
                        <ul>
                            <li><strong>🧠 Learning:</strong> AI systems can improve from experience</li>
                            <li><strong>🎯 Problem-solving:</strong> They can find solutions to complex challenges</li>
                            <li><strong>📊 Pattern recognition:</strong> AI spots trends humans might miss</li>
                            <li><strong>🤖 Decision-making:</strong> They can choose the best option from many choices</li>
                        </ul>
                    </div>
                    
                    <div class="daily-life-examples">
                        <h3>🏠 AI in Your Daily Life</h3>
                        <div class="examples-grid">
                            <div class="example-card">
                                <h4>📱 Your Phone</h4>
                                <ul>
                                    <li>Voice assistants (Siri, Google Assistant)</li>
                                    <li>Photo recognition and organization</li>
                                    <li>Predictive text when typing</li>
                                    <li>Face unlock feature</li>
                                </ul>
                            </div>
                            <div class="example-card">
                                <h4>🎵 Entertainment</h4>
                                <ul>
                                    <li>Netflix movie recommendations</li>
                                    <li>Spotify music suggestions</li>
                                    <li>YouTube video recommendations</li>
                                </ul>
                            </div>
                            <div class="example-card">
                                <h4>🛒 Shopping</h4>
                                <ul>
                                    <li>Amazon product recommendations</li>
                                    <li>Price comparison tools</li>
                                    <li>Personalized ads</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="video-section">
                    <h3>🎬 Watch: AI in Action</h3>
                    <div class="video-placeholder">
                        <div class="video-thumb">
                            <span class="play-icon">▶️</span>
                            <p><strong>Video:</strong> "What is AI? Examples in Everyday Life"</p>
                            <p><em>Duration: 3-4 minutes</em></p>
                        </div>
                        <p class="video-description">This video will show real examples of AI working in smartphones, smart homes, and online services you use every day.</p>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "Which of these do you use that has AI?",
            options: [
                "Netflix recommending movies you might like",
                "A simple calculator doing math",
                "A printed book",
                "A bicycle"
            ],
            answer: 0
        }
    },
    "generative-ai-intro": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🎨 Introduction to Generative AI</h2>
                    
                    <div class="concept-explanation">
                        <h3>✨ What is Generative AI?</h3>
                        <p><strong>Generative AI creates new things from scratch!</strong> Think of it as a creative assistant that can make original content based on your instructions.</p>
                        
                        <h3>🎯 What Generative AI Creates</h3>
                        <ul>
                            <li><strong>📝 Text:</strong> Stories, essays, emails, poems, scripts</li>
                            <li><strong>🖼️ Images:</strong> Artwork, photos, logos, designs</li>
                            <li><strong>🎵 Audio:</strong> Music, sound effects, voice recordings</li>
                            <li><strong>💻 Code:</strong> Computer programs and scripts</li>
                            <li><strong>🎬 Video:</strong> Short clips and animations</li>
                        </ul>
                    </div>
                    
                    <div class="popular-examples">
                        <h3>🌟 Popular Generative AI Tools</h3>
                        <div class="tools-grid">
                            <div class="tool-card">
                                <h4>💬 ChatGPT</h4>
                                <p><strong>Creates:</strong> Text and conversations</p>
                                <p><strong>Use cases:</strong> Writing assistance, answering questions, homework help, creative writing</p>
                            </div>
                            <div class="tool-card">
                                <h4>🎨 DALL-E & Midjourney</h4>
                                <p><strong>Creates:</strong> Images and artwork</p>
                                <p><strong>Use cases:</strong> Creating pictures from descriptions, logo design, artistic images</p>
                            </div>
                            <div class="tool-card">
                                <h4>🎵 AI Music Generators</h4>
                                <p><strong>Creates:</strong> Music and songs</p>
                                <p><strong>Use cases:</strong> Background music, jingles, custom soundtracks</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="how-it-works">
                        <h3>🔄 How It Works (Simply)</h3>
                        <div class="process-steps">
                            <div class="step">1. <strong>You give a prompt:</strong> "Draw a cat wearing a space helmet"</div>
                            <div class="step">2. <strong>AI processes:</strong> Understands your request</div>
                            <div class="step">3. <strong>AI creates:</strong> Generates new, original content</div>
                            <div class="step">4. <strong>You receive:</strong> The finished creation!</div>
                        </div>
                    </div>
                </div>
                
                <div class="video-section">
                    <h3>🎬 Watch: Generative AI Demonstration</h3>
                    <div class="video-placeholder">
                        <div class="video-thumb">
                            <span class="play-icon">▶️</span>
                            <p><strong>Video:</strong> "Generative AI in Action - Creating Text and Images"</p>
                            <p><em>Duration: 4-5 minutes</em></p>
                        </div>
                        <p class="video-description">See live demonstrations of ChatGPT writing content and DALL-E creating images from text prompts.</p>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What does Generative AI do?",
            options: [
                "Creates new content like text and images",
                "Only plays video games",
                "Just stores information",
                "Only works on phones"
            ],
            answer: 0
        }
    },
    "agentive-ai-basics": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🤝 Understanding Agentive AI</h2>
                    
                    <div class="concept-explanation">
                        <h3>🎯 What is Agentive AI?</h3>
                        <p><strong>Agentive AI does things FOR you - like a helpful assistant that takes action!</strong></p>
                        <p>While Generative AI creates content, Agentive AI actually completes tasks and takes actions on your behalf.</p>
                    </div>
                    
                    <div class="comparison-section">
                        <h3>🔄 Key Difference: Generative vs Agentive</h3>
                        <div class="comparison-grid">
                            <div class="ai-type-card generative">
                                <h4>🎨 Generative AI = CREATES</h4>
                                <p><strong>What it does:</strong> Makes new content</p>
                                <p><strong>Example:</strong> "Write me a poem" → AI writes a poem</p>
                                <p><strong>Result:</strong> You get creative content</p>
                            </div>
                            <div class="ai-type-card agentive">
                                <h4>🤝 Agentive AI = ACTS</h4>
                                <p><strong>What it does:</strong> Takes action and completes tasks</p>
                                <p><strong>Example:</strong> "Schedule a meeting" → AI actually books the meeting</p>
                                <p><strong>Result:</strong> Tasks get completed automatically</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="real-examples">
                        <h3>🏠 Real-World Agentive AI Examples</h3>
                        <div class="examples-list">
                            <div class="example-item">
                                <h4>🏠 Smart Home Systems</h4>
                                <ul>
                                    <li>Automatically adjusts temperature based on weather</li>
                                    <li>Turns lights on when you arrive home</li>
                                    <li>Orders supplies when running low</li>
                                </ul>
                            </div>
                            <div class="example-item">
                                <h4>📱 Virtual Assistants</h4>
                                <ul>
                                    <li>Siri booking restaurant reservations</li>
                                    <li>Google Assistant controlling smart devices</li>
                                    <li>Alexa ordering products from Amazon</li>
                                </ul>
                            </div>
                            <div class="example-item">
                                <h4>💼 Business Applications</h4>
                                <ul>
                                    <li>Email filtering and automatic responses</li>
                                    <li>Calendar management and scheduling</li>
                                    <li>Automated customer service interactions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="video-section">
                    <h3>🎬 Watch: Agentive AI in Smart Homes</h3>
                    <div class="video-placeholder">
                        <div class="video-thumb">
                            <span class="play-icon">▶️</span>
                            <p><strong>Video:</strong> "How Agentive AI Automates Your Home"</p>
                            <p><em>Duration: 3-4 minutes</em></p>
                        </div>
                        <p class="video-description">See how Agentive AI systems work together in smart homes to automate daily tasks and make decisions.</p>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What's the main job of Agentive AI?",
            options: [
                "To complete tasks and take actions for users",
                "To only create artwork",
                "To play music",
                "To do mathematical calculations"
            ],
            answer: 0
        }
    },
    "codex-introduction": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>💻 Meet Codex AI</h2>
                    
                    <div class="concept-explanation">
                        <h3>🤖 What is Codex AI?</h3>
                        <p><strong>Codex is AI that helps write computer code!</strong> Think of it as a smart coding assistant that understands both human language and programming languages.</p>
                        <p><strong>Don't worry if you don't know coding!</strong> You can still understand how amazing this technology is.</p>
                    </div>
                    
                    <div class="capabilities-section">
                        <h3>💻 What Codex Can Do</h3>
                        <div class="capabilities-grid">
                            <div class="capability-card">
                                <h4>✍️ Write Code</h4>
                                <p>You describe what you want in plain English, and Codex writes the actual computer code</p>
                            </div>
                            <div class="capability-card">
                                <h4>🔍 Explain Code</h4>
                                <p>Shows you what existing code does in simple terms you can understand</p>
                            </div>
                            <div class="capability-card">
                                <h4>🐛 Fix Problems</h4>
                                <p>Helps find and fix errors in computer programs</p>
                            </div>
                            <div class="capability-card">
                                <h4>💡 Suggest Improvements</h4>
                                <p>Recommends better ways to write code</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="who-benefits">
                        <h3>👥 Who Benefits from Codex?</h3>
                        <div class="benefits-list">
                            <div class="benefit-group">
                                <h4>👶 Complete Beginners</h4>
                                <ul>
                                    <li>Learn coding by seeing examples</li>
                                    <li>Understand what code does</li>
                                    <li>Get started with programming</li>
                                </ul>
                            </div>
                            <div class="benefit-group">
                                <h4>👨‍💻 Experienced Developers</h4>
                                <ul>
                                    <li>Write code much faster</li>
                                    <li>Reduce typing and errors</li>
                                    <li>Focus on creative problem-solving</li>
                                </ul>
                            </div>
                            <div class="benefit-group">
                                <h4>🏢 Businesses</h4>
                                <ul>
                                    <li>Speed up software development</li>
                                    <li>Reduce development costs</li>
                                    <li>Help teams be more productive</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="example-demo">
                        <h3>🌟 Real Example</h3>
                        <div class="demo-box">
                            <p><strong>🗣️ You say:</strong> "Create a program that counts from 1 to 10"</p>
                            <p><strong>🤖 Codex writes:</strong></p>
                            <div class="code-example">
                                <code>
                                    for i in range(1, 11):<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;print(i)
                                </code>
                            </div>
                            <p><strong>✨ That's it!</strong> You described what you wanted in plain English, and Codex wrote the actual computer code!</p>
                        </div>
                    </div>
                </div>
                
                <div class="video-section">
                    <h3>🎬 Watch: Codex Writing Code Live</h3>
                    <div class="video-placeholder">
                        <div class="video-thumb">
                            <span class="play-icon">▶️</span>
                            <p><strong>Video:</strong> "Codex AI: From English to Code"</p>
                            <p><em>Duration: 4-5 minutes</em></p>
                        </div>
                        <p class="video-description">Watch live demonstrations of Codex turning natural language descriptions into working computer code.</p>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What is Codex AI designed to help with?",
            options: [
                "Writing and understanding computer code",
                "Cooking recipes",
                "Playing sports",
                "Gardening"
            ],
            answer: 0
        }
    },// INTERMEDIATE COURSE MODULES  
    "welcome-intermediate": {
        type: 'welcome',
        content: `
            <div class="module-content">
                <h2>🚀 Advanced AI Deep Dive</h2>
                <p>Ready to explore the technical depths of Agentive AI and GitHub Copilot!</p>
                <div class="objectives">
                    <h3>🎯 What You'll Master:</h3>
                    <ul>
                        <li>How Agentive AI systems operate as autonomous agents</li>
                        <li>GitHub Copilot's architecture and capabilities</li>
                        <li>Advanced code suggestion and completion techniques</li>
                        <li>Professional development workflows with AI</li>
                    </ul>
                </div>
                <div class="advanced-path">
                    <h3>💼 Your Technical Journey:</h3>
                    <p>This course dives deep into the mechanics, architecture, and professional applications of cutting-edge AI systems.</p>
                    <p><strong>🃏 Interactive Flashcards:</strong> Master complex concepts through detailed technical explanations!</p>
                </div>
            </div>
        `
    },    "ai-industry-cases": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🏭 AI in Industry: Real-World Applications</h2>
                    
                    <div class="concept-explanation">
                        <h3>💼 How AI Transforms Industries</h3>
                        <p><strong>AI is revolutionizing every major industry with practical, measurable results.</strong></p>
                    </div>
                    
                    <div class="industry-examples">
                        <h3>🏥 Healthcare AI Applications</h3>
                        <div class="application-card">
                            <h4>🔬 Medical Imaging</h4>
                            <ul>
                                <li>AI detects cancer with 90%+ accuracy</li>
                                <li>Faster diagnosis than human radiologists</li>
                                <li>Early detection saves lives and costs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What is a key benefit of AI in healthcare?",
            options: [
                "Early detection and improved diagnosis accuracy",
                "Replacing all doctors",
                "Only organizing patient files",
                "Making hospitals look modern"
            ],
            answer: 0
        }
    },
    "generative-ai-advanced": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🚀 Advanced Generative AI Use Cases</h2>
                    
                    <div class="concept-explanation">
                        <h3>💼 Enterprise Generative AI Applications</h3>
                        <p><strong>Advanced Generative AI goes beyond simple content creation to transform business workflows.</strong></p>
                    </div>
                    
                    <div class="advanced-applications">
                        <h3>📊 Business Process Integration</h3>
                        <div class="application-examples">
                            <div class="example-card">
                                <h4>📝 Content Creation Workflows</h4>
                                <ul>
                                    <li>Automated report generation</li>
                                    <li>Marketing content at scale</li>
                                    <li>Personalized customer communications</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What characterizes advanced Generative AI in business?",
            options: [
                "Integration with business processes and automated workflows",
                "Only creating simple text",
                "Working without any human oversight",
                "Replacing all human creativity"
            ],
            answer: 0
        }
    },
    "agentive-ai-deep-dive": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🤖 How Agentive AI Systems Act as Autonomous Agents</h2>
                    
                    <div class="concept-explanation">
                        <h3>🧠 Agent Architecture Fundamentals</h3>
                        <p><strong>Agentive AI systems are built like autonomous agents with four core components:</strong></p>
                        
                        <div class="architecture-grid">
                            <div class="component-card">
                                <h4>👁️ Perception</h4>
                                <p>Sensors and data inputs that help the AI understand its environment and current situation</p>
                            </div>
                            <div class="component-card">
                                <h4>🧠 Knowledge Base</h4>
                                <p>Stored information, learned patterns, and rules that guide decision-making</p>
                            </div>
                            <div class="component-card">
                                <h4>⚡ Reasoning Engine</h4>
                                <p>Decision-making algorithms that process information and plan actions</p>
                            </div>
                            <div class="component-card">
                                <h4>🔧 Action Mechanism</h4>
                                <p>Tools and interfaces that allow the AI to interact with and modify the world</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="agent-cycle">
                        <h3>🔄 The Agent Cycle</h3>
                        <p><strong>Every agentive AI follows this continuous cycle:</strong></p>
                        <div class="cycle-steps">
                            <div class="cycle-step">1. <strong>Observe:</strong> Gather information from environment</div>
                            <div class="cycle-step">2. <strong>Think/Plan:</strong> Process data and decide on actions</div>
                            <div class="cycle-step">3. <strong>Act:</strong> Execute the planned actions</div>
                            <div class="cycle-step">4. <strong>Learn:</strong> Update knowledge based on results</div>
                        </div>
                        <p><strong>Key Characteristic:</strong> Autonomous decision-making without constant human input</p>
                    </div>
                    
                    <div class="agent-types">
                        <h3>🔧 Types of Agentive AI Agents</h3>
                        <div class="types-list">
                            <div class="agent-type">
                                <h4>🎯 Reactive Agents</h4>
                                <p>Respond to immediate stimuli</p>
                                <p><strong>Example:</strong> Smart thermostats, automated trading alerts</p>
                            </div>
                            <div class="agent-type">
                                <h4>🧠 Deliberative Agents</h4>
                                <p>Plan actions based on goals</p>
                                <p><strong>Example:</strong> AI personal assistants, route planners</p>
                            </div>
                            <div class="agent-type">
                                <h4>🤝 Collaborative Agents</h4>
                                <p>Work with other agents or humans</p>
                                <p><strong>Example:</strong> Multi-agent supply chain systems</p>
                            </div>
                            <div class="agent-type">
                                <h4>🎓 Learning Agents</h4>
                                <p>Improve performance through experience</p>
                                <p><strong>Example:</strong> Recommendation engines, adaptive UIs</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="real-world-systems">
                        <h3>🌍 Real-World Agent-Based Systems</h3>
                        <div class="systems-examples">
                            <div class="system-example">
                                <h4>🏠 Smart Home Ecosystems</h4>
                                <p>Multiple AI agents coordinate: lighting, security, HVAC, entertainment</p>
                                <p><strong>Agent Behavior:</strong> Learn patterns, optimize energy, predict needs</p>
                            </div>
                            <div class="system-example">
                                <h4>🚗 Autonomous Vehicle Networks</h4>
                                <p>Vehicle agents communicate with traffic infrastructure agents</p>
                                <p><strong>Agent Behavior:</strong> Route optimization, hazard avoidance, traffic flow</p>
                            </div>
                            <div class="system-example">
                                <h4>💼 Enterprise Process Automation</h4>
                                <p>Document processing, approval routing, compliance monitoring</p>
                                <p><strong>Agent Behavior:</strong> Workflow optimization, exception handling, reporting</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="video-section">
                    <h3>🎬 Watch: Multi-Agent Systems in Action</h3>
                    <div class="video-placeholder">
                        <div class="video-thumb">
                            <span class="play-icon">▶️</span>
                            <p><strong>Video:</strong> "How AI Agents Coordinate in Smart Cities"</p>
                            <p><em>Duration: 6-7 minutes</em></p>
                        </div>
                        <p class="video-description">See how multiple AI agents work together in smart city systems to manage traffic, energy, and services autonomously.</p>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What is the key characteristic that makes AI 'agentive'?",
            options: [
                "Autonomous decision-making and action-taking on behalf of users",
                "Ability to generate creative content",
                "Processing large amounts of data quickly",
                "Working only with human supervision"
            ],
            answer: 0
        }
    },
    "github-copilot-deep-dive": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🤖 GitHub Copilot: Professional Development</h2>
                    
                    <div class="concept-explanation">
                        <h3>💡 What is GitHub Copilot?</h3>
                        <p><strong>GitHub Copilot is an AI-powered code completion tool that acts as your pair programming partner.</strong></p>
                        
                        <div class="best-practices">
                            <h3>💼 Professional Best Practices</h3>
                            <ul>
                                <li>Always review generated code for logic errors</li>
                                <li>Verify security implications</li>
                                <li>Test thoroughly before deployment</li>
                                <li>Use clear, descriptive comments for better suggestions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What is the most important practice when using GitHub Copilot professionally?",
            options: [
                "Always review and test generated code before using in production",
                "Accept all suggestions without modification",
                "Only use it for simple functions",
                "Avoid using it for business applications"
            ],
            answer: 0
        }
    },

    // SHARED MODULES (used in both courses)
    "codex-demo": {
    type: 'interactive',
    content: `
        <div class="module-content">
            <div class="reading-section">
                <h2>🎮 Interactive Codex Demonstration</h2>
                
                <div class="demo-explanation">
                    <h3>🚀 Experience Codex AI in Action</h3>
                    <p><strong>This interactive demo shows how Codex transforms natural language into working code.</strong></p>
                    
                    <div class="demo-container">
                        <h4>💡 Try These Examples:</h4>
                        <div class="demo-examples">
                            <div class="example-card">
                                <h5>Example 1: Data Processing</h5>
                                <p><strong>Input:</strong> "Create a function to find the average of a list of numbers"</p>
                                <div class="code-output">
                                    <pre><code>def calculate_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

# Example usage
data = [10, 20, 30, 40, 50]
result = calculate_average(data)
print(f"Average: {result}")</code></pre>
                                </div>
                            </div>
                            
                            <div class="example-card">
                                <h5>Example 2: Web API</h5>
                                <p><strong>Input:</strong> "Create a REST API endpoint to get user information"</p>
                                <div class="code-output">
                                    <pre><code>from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    # Simulate database lookup
    user_data = {
        'id': user_id,
        'name': f'User {user_id}',
        'email': f'user{user_id}@example.com'
    }
    return jsonify(user_data)</code></pre>
                                </div>
                            </div>
                            
                            <div class="example-card">
                                <h5>Example 3: Algorithm</h5>
                                <p><strong>Input:</strong> "Implement binary search algorithm"</p>
                                <div class="code-output">
                                    <pre><code>def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Target not found</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="interactive-section">
                    <h3>🎯 Key Demonstration Points</h3>
                    <div class="demo-points">
                        <div class="point-card">
                            <h4>🧠 Natural Language Understanding</h4>
                            <p>Codex interprets human instructions and converts them into precise code logic.</p>
                        </div>
                        <div class="point-card">
                            <h4>⚡ Multiple Language Support</h4>
                            <p>Generates code in Python, JavaScript, Java, C++, and many other programming languages.</p>
                        </div>
                        <div class="point-card">
                            <h4>🔧 Context Awareness</h4>
                            <p>Understands project context and generates appropriate code with proper imports and structure.</p>
                        </div>
                        <div class="point-card">
                            <h4>🚀 Production Ready</h4>
                            <p>Creates well-structured code with error handling and best practices.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="video-section">
                <h3>🎬 Watch: Live Codex Demonstration</h3>
                <div class="video-placeholder">
                    <div class="video-thumb">
                        <span class="play-icon">▶️</span>
                        <p><strong>Video:</strong> "Codex AI: From Idea to Code in Seconds"</p>
                        <p><em>Duration: 6-8 minutes</em></p>
                    </div>
                    <p class="video-description">See real-time demonstrations of Codex generating complex algorithms, web applications, and data processing scripts from natural language descriptions.</p>
                </div>
            </div>
        </div>
    `,
    quiz: {
        question: "What makes Codex particularly powerful for developers?",
        options: [
            "It only works with Python programming",
            "It converts natural language descriptions into working code across multiple programming languages",
            "It can only create simple functions",
            "It requires extensive coding knowledge to use"
        ],
        answer: 1
    }
},
    "escape-room": {
        type: 'game',
        content: `
            <div class="module-content">
                <h2>🔓 AI Knowledge Challenge</h2>
                <div class="escape-room">
                    <div id="room-status">Challenge 1 of 3</div>
                    <div id="room-content">
                        <h3>🏠 Challenge 1: The Smart Home</h3>
                        <p>You need to set up a smart home system. Which type of AI would be best?</p>
                        <div class="puzzle">
                            <p><strong>Scenario:</strong> You want an AI that can automatically adjust temperature, turn lights on/off, and order groceries when you're running low.</p>
                            <p><strong>Question:</strong> What type of AI would be most suitable for this?</p>
                            <input type="text" id="escape-answer" placeholder="Type your answer..." />
                            <button onclick="checkEscapeAnswer(1)">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    "reflection": {
        type: 'reflection',
        content: `
            <div class="module-content">
                <h2>🎯 Course Reflection & Completion</h2>
                <div class="progress-summary" id="progress-summary"></div>
                <div class="feedback-section">
                    <h3>📝 Your Feedback</h3>
                    <div class="feedback-questions">
                        <label>What did you enjoy most about this course?</label>
                        <textarea id="enjoy-feedback" rows="3" placeholder="Tell us what you found most interesting or valuable..."></textarea>
                        <label>What could we improve to make this course better?</label>
                        <textarea id="improve-feedback" rows="3" placeholder="Any suggestions for improvement..."></textarea>
                        <button onclick="submitFeedback()">Submit Feedback & Complete Course</button>
                    </div>
                </div>
                <div class="certificate-section">
                    <button onclick="downloadCertificate()" class="certificate-btn">🏆 Download Your Certificate</button>
                </div>
            </div>
        `
    },
    "codex-advanced": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🚀 Advanced Codex Applications</h2>
                    
                    <div class="concept-explanation">
                        <h3>💼 Professional Codex Usage</h3>
                        <p><strong>Learn advanced techniques for using Codex in production environments.</strong></p>
                        
                        <div class="advanced-features">
                            <h4>🔧 Production Considerations</h4>
                            <ul>
                                <li>Code review and testing protocols</li>
                                <li>Security implications and best practices</li>
                                <li>Performance optimization techniques</li>
                                <li>Integration with development workflows</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What is most important when using Codex in production?",
            options: [
                "Thorough code review and testing",
                "Using it for all code without review",
                "Only using it for simple tasks",
                "Avoiding it completely"
            ],
            answer: 0
        }
    },

    "ai-strategy-case-study": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>📈 AI Strategy Case Study</h2>
                    
                    <div class="concept-explanation">
                        <h3>🎯 Netflix AI Transformation</h3>
                        <p><strong>How Netflix used AI strategy to become a global entertainment leader.</strong></p>
                        
                        <div class="case-study">
                            <h4>📊 Implementation Strategy</h4>
                            <ul>
                                <li>Started with simple movie recommendations</li>
                                <li>Collected user behavior data systematically</li>
                                <li>Improved suggestions over time with machine learning</li>
                                <li>Expanded to content creation and global markets</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What was key to Netflix's AI success?",
            options: [
                "Starting simple and continuously improving with data",
                "Using the most expensive technology",
                "Hiring only PhD researchers",
                "Copying competitors exactly"
            ],
            answer: 0
        }
    }
};

// Timing functions
function startTimer() {
    moduleStart = Date.now();
}

function endTimer() {
    moduleEnd = Date.now();
    const timeSpent = Math.round((moduleEnd - moduleStart) / 1000);
    userData.timeSpent = (userData.timeSpent || 0) + timeSpent;
}

// Name input handled in DOMContentLoaded event

function showPretest() {
    // Hide all other sections first
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show pretest section
    const pretestSection = document.getElementById('pretest-section');
    if (pretestSection) {
        pretestSection.style.display = 'block';
        console.log('Pretest section shown');
        
        // Initialize pretest questions if not already done
        if (!window.shuffledPretestQuestions) {
            initializePretestQuestions();
        }
        
        // Show first pretest question
        showPretestQuestion();
    } else {
        console.error('Pretest section not found in HTML');
        alert('Error: Pretest section not found');
    }
}

// Add this function to properly start the pretest
function startPretest() {
    console.log('Starting pretest...');
    
    // Hide all sections first
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show pretest section
    const pretestSection = document.getElementById('pretest-section');
    if (pretestSection) {
        pretestSection.style.display = 'block';
        console.log('Pretest section shown');
        
        // Initialize current question index
        currentQuestionIndex = 0;
        
        // Show first pretest question
        showPretestQuestion();
    } else {
        console.error('Pretest section not found in HTML');
        alert('Error: Pretest section not found');
    }
}

// Add this function to show pretest questions
function showPretestQuestion() {
    const quizDiv = document.getElementById('pretest-quiz');
    if (!quizDiv) {
        console.error('Pretest quiz div not found');
        return;
    }
    
    if (currentQuestionIndex >= shuffledPretestQuestions.length) {
        // Pretest complete
        completePretestAssessment();
        return;
    }
    
    const question = shuffledPretestQuestions[currentQuestionIndex];
    
    quizDiv.innerHTML = `
        <div class="question-container">
            <h3>Question ${currentQuestionIndex + 1} of ${shuffledPretestQuestions.length}</h3>
            <p class="question-text">${question.q}</p>
            <div class="options">
                ${question.options.map((option, index) => `
                    <button class="option-btn" onclick="selectPretestAnswer(${index})">${option}</button>
                `).join('')}
            </div>
        </div>
    `;
}

// Add this function to handle pretest answers
function selectPretestAnswer(selectedIndex) {
    const question = shuffledPretestQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.answer;
    
    // Store the answer
    userData.pretest.push({
        question: question.q,
        selectedAnswer: selectedIndex,
        correctAnswer: question.answer,
        correct: isCorrect,
        difficulty: question.difficulty
    });
    
    console.log(`Answer ${currentQuestionIndex + 1}:`, isCorrect ? 'Correct' : 'Incorrect');
    
    // Move to next question
    currentQuestionIndex++;
    
    // Small delay then show next question
    setTimeout(() => {
        showPretestQuestion();
    }, 500);
}

// Add this function to complete pretest assessment
function completePretestAssessment() {
    console.log('Pretest completed');
    
    // Determine proficiency level
    const correctAnswers = userData.pretest.filter(x => x.correct).length;
    const score = correctAnswers / shuffledPretestQuestions.length;
    
    if (score >= 0.8) {
        userData.proficiencyLevel = 'intermediate';
    } else {
        userData.proficiencyLevel = 'beginner';
    }
    
    console.log(`Proficiency level: ${userData.proficiencyLevel} (${correctAnswers}/${shuffledPretestQuestions.length})`);
    
    // Set current course
    determineProficiencyLevel();
    
    // Start the course modules
    setTimeout(() => {
        startCourseModules();
    }, 1000);
}

// Add this function to start course modules
function startCourseModules() {
    console.log('Starting course modules...');
    
    // Hide pretest section
    document.getElementById('pretest-section').style.display = 'none';
    
    // Show course section
    document.getElementById('course-section').style.display = 'block';
    
    // Initialize and show first module
    window.currentModule = 0;
    showModule();
}

function startCourse() {
    const courseSection = document.getElementById('course-section');
    if (courseSection) courseSection.style.display = 'block';
    showModule();
}

function showModule() {
    console.log('showModule called, currentModule:', currentModule);
    console.log('currentCourse:', currentCourse);
    console.log('currentCourse length:', currentCourse ? currentCourse.length : 'undefined');
    
    if (!currentCourse || currentModule >= currentCourse.length) {
        console.log('Course completed, showing posttest');
        const courseSection = document.getElementById('course-section');
        if (courseSection) courseSection.style.display = 'none';
        showPosttest();
        return;
    }
    
    const module = currentCourse[currentModule];
    console.log('Current module:', module);
    
    if (!module || !module.id) {
        console.error('Invalid module:', module);
        currentModule++;
        showModule();
        return;
    }
    
    const moduleData = moduleContent[module.id];
    console.log('Module data found for', module.id, ':', !!moduleData);
    
    if (!moduleData) {
        console.error(`Module data not found for: ${module.id}`);
        console.log('Available modules:', Object.keys(moduleContent));
        currentModule++;
        showModule();
        return;
    }
    
    const contentDiv = document.getElementById('course-content');
    const nextBtn = document.getElementById('course-next-btn');
    
    if (!contentDiv || !nextBtn) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // Make sure course section is visible
    const courseSection = document.getElementById('course-section');
    if (courseSection) courseSection.style.display = 'block';
    
    // Show the content
    // ✅ ADD ERROR HANDLING:
    try {
        contentDiv.innerHTML = `
            <div class="module-header">
                <h3>${module.title || 'Module Title'}</h3>
                <p class="module-objective">${module.objective || 'Module Objective'}</p>
                <div class="module-progress">Module ${currentModule + 1} of ${currentCourse.length}</div>
            </div>
            <div class="module-content">
                ${moduleData.content}
            </div>
        `;
    } catch (error) {
        console.error('Error displaying module content:', error);
        contentDiv.innerHTML = '<p>Error loading module content. Please try again.</p>';
    }
    
    console.log('Content set, showing next button');
    
    // Show and configure next button
    nextBtn.style.display = 'block';
    nextBtn.onclick = function() {
        console.log('Next button clicked');
        
        // Mark module as completed
        if (userData && !userData.moduleProgress.includes(module.id)) {
            userData.moduleProgress.push(module.id);
            userData.points += 10;
            
            if (typeof showScoreAnim === 'function') {
                showScoreAnim(10);
            }
            
            // Award badges based on progress
            if (userData.moduleProgress.length === 1) {
                if (typeof awardBadge === 'function') {
                    awardBadge("Course Starter");
                }
            } else if (userData.moduleProgress.length === Math.floor(currentCourse.length / 2)) {
                if (typeof awardBadge === 'function') {
                    awardBadge("Halfway Hero");
                }
            } else if (userData.moduleProgress.length === currentCourse.length) {
                if (typeof awardBadge === 'function') {
                    awardBadge("Course Completer");
                }
            }
        }
        
        // Move to next module
        currentModule++;
        if (typeof updateProgress === 'function') {
            updateProgress();
        }
        console.log('Moving to next module:', currentModule);
        showModule();
    };
    
    if (typeof updateProgress === 'function') {
        updateProgress();
    }
}

function showPosttest() {
    console.log('Starting posttest...');
    
    // Ensure posttest questions are set
    if (!shuffledPosttestQuestions || shuffledPosttestQuestions.length === 0) {
        console.error('Posttest questions not available');
        // Fallback to default based on current course
        if (userData.proficiencyLevel === 'beginner') {
            shuffledPosttestQuestions = shuffledBeginnerPosttest;
        } else {
            shuffledPosttestQuestions = shuffledIntermediatePosttest;
        }
        console.log('Set fallback posttest questions:', shuffledPosttestQuestions.length);
    }
    
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Set posttest timing
    posttestStart = Date.now();
    
    // Reset posttest counter
    currentPosttest = 0;
    
    // Show posttest section
    const posttestSection = document.getElementById('posttest-section');
    if (posttestSection) {
        posttestSection.style.display = 'block';
        showPosttestQuestion();
    } else {
        console.error('Posttest section not found');
    }
}

function showPosttestQuestion() {
    console.log(`Showing posttest question ${currentPosttest + 1} of ${shuffledPosttestQuestions.length}`);
    
    const quizDiv = document.getElementById('posttest-quiz');
    quizDiv.innerHTML = '';
    
    if (currentPosttest < shuffledPosttestQuestions.length) {
        const q = shuffledPosttestQuestions[currentPosttest];
        quizDiv.innerHTML = `<p>Question ${currentPosttest+1} of ${shuffledPosttestQuestions.length}</p><p>${q.q}</p>` + q.options.map((opt, i) => `<button class='option-btn' onclick='selectPosttest(${i})'>${opt}</button>`).join('');
    } else {
        console.log('Posttest completed! Moving to reflection...');
        posttestEnd = Date.now();
        userData.posttestTime = Math.round((posttestEnd-posttestStart)/1000);
        const posttestSection = document.getElementById('posttest-section');
        if (posttestSection) posttestSection.style.display = 'none';
        showReflectionFeedback();
    }
}

window.selectPosttest = function(i) {
    userData.posttest.push({q: shuffledPosttestQuestions[currentPosttest].q, selected: i, correct: i === shuffledPosttestQuestions[currentPosttest].answer});
    currentPosttest++;
    updateProgress();
    showPosttestQuestion();
};

function showReflectionFeedback() {
    console.log('Starting reflection feedback...');
    
    // Create and show reflection section
    const reflectionSection = document.createElement('section');
    reflectionSection.id = 'reflection-section';
    reflectionSection.innerHTML = `
        ${moduleContent.reflection.content}
    `;
    
    console.log('Reflection section created');
    
    // Insert after posttest section
    const posttestSection = document.getElementById('posttest-section');
    if (posttestSection) {
        posttestSection.insertAdjacentElement('afterend', reflectionSection);
        console.log('Reflection section inserted after posttest');
    } else {
        document.getElementById('main-container').appendChild(reflectionSection);
        console.log('Reflection section appended to main container');
    }
    reflectionSection.style.display = 'block';
    
    console.log('Reflection section displayed');
    
    // Update progress summary
    updateProgressSummary();
}

function updateProgressSummary() {
    const progressSummary = document.getElementById('progress-summary');
    if (progressSummary) {
        const pretestScore = userData.pretest.filter(x => x.correct).length;
        const posttestScore = userData.posttest.filter(x => x.correct).length;
        const modulesCompleted = userData.moduleProgress.length;
        
        progressSummary.innerHTML = `
            <div class="progress-summary-content">
                <h3>📊 Your Learning Journey</h3>
                <div class="summary-stats">
                    <div class="summary-item">
                        <span class="label">📝 Pretest Score:</span>
                        <span class="value">${pretestScore}/${shuffledPretestQuestions.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">📚 Modules Completed:</span>
                        <span class="value">${modulesCompleted}/${currentCourse.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">🏆 Badges Earned:</span>
                        <span class="value">${userData.badges.length} badges</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">⭐ Points Collected:</span>
                        <span class="value">${userData.points} points</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">📋 Posttest Score:</span>
                        <span class="value">${posttestScore}/${shuffledPosttestQuestions.length}</span>
                    </div>
                </div>
                <div class="improvement-indicator">
                    <h4>📈 Knowledge Improvement:</h4>
                    <p>From ${pretestScore}/${shuffledPretestQuestions.length} to ${posttestScore}/${shuffledPosttestQuestions.length} 
                    ${posttestScore > pretestScore ? '📈 Great improvement!' : posttestScore === pretestScore ? '📊 Maintained knowledge level' : '📉 Review recommended'}</p>
                </div>
            </div>
        `;
    }
}

// Helper functions for new course structure
function awardBadge(badgeName) {
    if (!userData.badges.includes(badgeName)) {
        userData.badges.push(badgeName);
        showBadge(`🏆 ${badgeName}`);
        userData.points += 20;
    }
}

function updateModuleProgress() {
    const levelIndicator = document.getElementById('level-indicator');
    if (levelIndicator && currentCourse.length > 0) {
        const courseType = userData.proficiencyLevel === 'beginner' ? 'Beginner' : 'Intermediate';
        levelIndicator.textContent = `${courseType} Course - Module ${currentModule + 1} of ${currentCourse.length}`;
    }
}

// Fix evaluatePrompt function:
window.evaluatePrompt = function() {
    const prompt = document.getElementById('challenge-prompt').value;
    const feedbackDiv = document.getElementById('prompt-feedback');
    
    let score = 0;
    let feedback = "";
    
    // Simple evaluation logic
    if (prompt.length > 10) {
        score = 5;
        feedback = "Great prompt! You provided good detail.";
    } else {
        score = 2;
        feedback = "Try to be more specific in your prompt.";
    }
    
    feedbackDiv.innerHTML = `<p><strong>Score:</strong> ${score}/5</p><p>${feedback}</p>`;
    userData.points += score;
    showScoreAnim(score);
};
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 16px;
        z-index: 1000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function exportToGoogleSheets() {
    const pretestScore = userData.pretest.filter(x => x.correct).length;
    const posttestScore = userData.posttest.filter(x => x.correct).length;
    const modulesCompleted = userData.moduleProgress.length;
    const totalTime = userData.endTime ? Math.round((userData.endTime - userData.startTime) / 1000) : 0;
    
    // Format data for Google Sheets
    const startDate = new Date(userData.startTime);
    const endDate = new Date(userData.endTime || Date.now());
    const dateStr = startDate.toLocaleDateString();
    const startTimeStr = startDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const endTimeStr = endDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const timestampFormat = `${dateStr}|${startTimeStr} to ${endTimeStr}`;
    
    const exportData = {
        'Timestamp': timestampFormat,
        'Name': userData.name,
        'Course Path': userData.proficiencyLevel,
        'Pre-test Score': `${pretestScore}/${shuffledPretestQuestions.length}`,
        'Post-test Score': `${posttestScore}/${shuffledPosttestQuestions.length}`,
        'Modules Completed': `${modulesCompleted}/${currentCourse ? currentCourse.length : 0}`,
        'High Score': userData.points,
        'Badges Earned': userData.badges.join(', '),
        'Total Time (seconds)': totalTime,
        'Pretest Time (seconds)': userData.pretestTime || 0,
        'Posttest Time (seconds)': userData.posttestTime || 0,
        'Improvement Feedback': userData.feedback?.improvements || '',
        'Enjoyment Feedback': userData.feedback?.enjoyed || ''
    };
    
    console.log('Exporting data to Google Sheets:', exportData);
    
    const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxth09pVHpw9Cwg_oF1Ay8jh9kUOQWs_0G9aGsSiG_B4uWS7uVn_LF74CQWcYWRPTYDRA/exec';
    
    // Show loading message
    showNotification('📤 Saving data to Google Sheets...');
    
    // Use FormData instead of JSON for better compatibility with Google Apps Script
    const formData = new FormData();
    Object.keys(exportData).forEach(key => {
        formData.append(key, exportData[key]);
    });
    
    fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors', // This helps with CORS issues
        body: formData
    })
    .then(response => {
        // With no-cors mode, we can't read the response, so assume success
        console.log('Request sent to Google Sheets');
        showNotification('✅ Data sent to Google Sheets!');
    })
    .catch(error => {
        console.error('Error saving to Google Sheets:', error);
        
        // Fallback: Try with different approach
        console.log('Trying alternative method...');
        
        // Create a form and submit it (this often works better with Google Apps Script)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_SHEETS_ENDPOINT;
        form.target = '_blank';
        form.style.display = 'none';
        
        Object.keys(exportData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = exportData[key];
            form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        showNotification('✅ Data submitted to Google Sheets via form!');
    });
}

function saveToLocalStorage(data) {
    try {
        // ✅ FIXED: Correct parentheses placement
        let localData = JSON.parse(localStorage.getItem('courseData') || '[]');
        localData.push(data);
        localStorage.setItem('courseData', JSON.stringify(localData));
        console.log('Data saved to localStorage:', data);
        showNotification('💾 Data saved locally as backup');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showNotification('❌ Error saving data locally');
    }
}

function showBadge(badgeText) {
    // Remove any existing badge elements and styles
    const existingBadges = document.querySelectorAll('[data-badge-element]');
    existingBadges.forEach(badge => badge.remove());
    
    const existingStyles = document.querySelectorAll('style[data-badge-style]');
    existingStyles.forEach(style => style.remove());
    
    // Create new style with identifier
    const style = document.createElement('style');
    style.setAttribute('data-badge-style', 'true');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: translate(-50%, -50%) scale(0); }
            50% { transform: translate(-50%, -50%) scale(1.2); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    const badgeDiv = document.createElement('div');
    badgeDiv.setAttribute('data-badge-element', 'true'); // Add identifier
    badgeDiv.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #FF9800, #FF5722);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 20px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        animation: bounceIn 0.6s ease-out;
    `;
    badgeDiv.textContent = badgeText;
    document.body.appendChild(badgeDiv);
    
    setTimeout(() => {
        badgeDiv.remove();
        style.remove();
    }, 3000);
}

// Add these missing functions:
window.submitFeedback = function() {
    const enjoyFeedback = document.getElementById('enjoy-feedback');
    const improveFeedback = document.getElementById('improve-feedback');
    
    if (!enjoyFeedback || !improveFeedback) {
        console.error('Feedback elements not found');
        return;
    }
    
    // Store feedback in userData
    userData.feedback = {
        enjoyed: enjoyFeedback.value,
        improvements: improveFeedback.value
    };
    
    // Set end time
    userData.endTime = Date.now();
    
    console.log('Feedback submitted:', userData.feedback);
    
    // Show completion message
    showNotification('✅ Thank you for your feedback!');
    
    // Immediately export to Google Sheets
    exportToGoogleSheets();
    
    // Show final results after a delay
    setTimeout(() => {
        showResults();
    }, 2000);
};

window.downloadCertificate = function() {
    // Create a simple certificate
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Draw certificate background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 800, 600);
    
    // Add border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 5;
    ctx.strokeRect(20, 20, 760, 560);
    
    // Add text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', 400, 150);

    
    ctx.font = '24px Arial';
    ctx.fillText('This certifies that', 400, 220);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#2196F3';
    ctx.fillText(userData.name || 'Student', 400, 280);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('has successfully completed the', 400, 330);
    
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`${userData.proficiencyLevel.toUpperCase()} AI Course`, 400, 380);
    
    // Add score
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333';
    const pretestScore = userData.pretest.filter(x => x.correct).length;
    const posttestScore = userData.posttest.filter(x => x.correct).length;
    ctx.fillText(`Final Score: ${posttestScore}/${shuffledPosttestQuestions.length}`, 400, 430);
    ctx.fillText(`Total Points: ${userData.points}`, 400, 460);
    
    // Add date
    const date = new Date().toLocaleDateString();
    ctx.fillText(`Completed on: ${date}`, 400, 520);
    
    // Download the certificate
    const link = document.createElement('a');
    link.download = `${userData.name}_AI_Certificate.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showNotification('🏆 Certificate downloaded!');
};

function showResults() {
    // Hide all other sections
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none'; // ← ADD MISSING LINE
    });
    
    // Show results section
    const resultsSection = document.getElementById('highscore-section');
    const resultsDiv = document.getElementById('results');
    

    
    const pretestScore = userData.pretest.filter(x => x.correct).length;
    const posttestScore = userData.posttest.filter(x => x.correct).length;
    const improvement = posttestScore - pretestScore;
    
    resultsDiv.innerHTML = `
        <div class="results-summary">
            <h3>📊 Your Final Results</h3>
            <div class="score-card">
                <p><strong>🎯 Pretest Score:</strong> ${pretestScore}/${shuffledPretestQuestions.length}</p>
                <p><strong>🎯 Posttest Score:</strong> ${posttestScore}/${shuffledPosttestQuestions.length}</p>
                <p><strong>📈 Improvement:</strong> ${improvement > 0 ? '+' : ''}${improvement} points</p>
                <p><strong>📚 Course Level:</strong> ${userData.proficiencyLevel}</p>
                <p><strong>✅ Modules Completed:</strong> ${userData.moduleProgress.length}/${currentCourse.length}</p>
                <p><strong>🏆 Badges Earned:</strong> ${userData.badges.join(', ') || 'None'}</p>
                <p><strong>⭐ Total Points:</strong> ${userData.points}</p>
            </div>
        </div>
    `;
    
    resultsSection.style.display = 'block';
}

// Timing functions
function startTimer() {
    moduleStart = Date.now();
}

function endTimer() {
    moduleEnd = Date.now();
    const timeSpent = Math.round((moduleEnd - moduleStart) / 1000);
    userData.timeSpent = (userData.timeSpent || 0) + timeSpent;
}

function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) {
        console.error('Progress bar element not found');
        return;
    }
    
    const total = shuffledPretestQuestions.length + (currentCourse ? currentCourse.length : 7) + shuffledPosttestQuestions.length;
    const completed = userData.pretest.length + userData.moduleProgress.length + userData.posttest.length;
    const percentage = Math.round((completed / total) * 100);
    
    progressBar.style.width = percentage + '%';
}

function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) {
        console.error('Progress bar element not found');
        return;
    }
    
    const total = shuffledPretestQuestions.length + (currentCourse ? currentCourse.length : 7) + shuffledPosttestQuestions.length;
    const completed = userData.pretest.length + userData.moduleProgress.length + userData.posttest.length;
    const percentage = Math.round((completed / total) * 100);
    
    progressBar.style.width = percentage + '%';
}

function showScoreAnim(points) {
    const scoreDiv = document.createElement('div');
    scoreDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #4CAF50;
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1000;
        animation: bounce 0.5s ease-in-out;
    `;
    scoreDiv.textContent = `+${points} points!`;
    document.body.appendChild(scoreDiv);
    
    setTimeout(() => {
        scoreDiv.remove();
    }, 2000);
}

// Add missing checkEscapeAnswer function for escape room module
window.checkEscapeAnswer = function(challengeNumber) {
    const answerInput = document.getElementById('escape-answer');
    if (!answerInput) {
        console.error('Answer input not found');
        return;
    }
    
    const answer = answerInput.value.toLowerCase();
    
    if (answer.includes('agentive') || answer.includes('agent')) {
        showNotification('✅ Correct! Agentive AI is perfect for smart home automation!');
        userData.points += 20;
        showScoreAnim(20);
        
        // Mark current module as completed
        const currentModuleId = currentCourse[currentModule]?.id;
        if (currentModuleId && !userData.moduleProgress.includes(currentModuleId)) {
            userData.moduleProgress.push(currentModuleId);
        }
        
        // Move to next module
        currentModule++;
        showModule();
    } else {
        showNotification('❌ Try again! Think about AI that takes actions for you.');
    }
};