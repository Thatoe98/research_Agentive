// Main JavaScript for gamified course

// Course structure data
let courseStructure = {};
let currentCourse = [];
let currentModuleIndex = 0;

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
                {
                    "id": "welcome-beginner",
                    "title": "Welcome to AI Fundamentals",
                    "objective": "Introduce complete beginners to the world of AI.",
                    "activities": ["AI basics explanation", "Simple definitions and examples"],
                    "outcome": "Understanding of what AI is"
                }
            ],
            intermediate: [
                {
                    "id": "welcome-intermediate", 
                    "title": "Advanced AI Applications",
                    "objective": "Dive deeper into AI applications and use cases.",
                    "activities": ["Advanced concepts overview", "Industry applications"],
                    "outcome": "Ready for advanced learning"
                }
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
    } else {
        userData.proficiencyLevel = 'intermediate'; 
        console.log('Assigned to INTERMEDIATE course');
    }
    
    // Set the current course based on proficiency
    currentCourse = courseStructure[userData.proficiencyLevel];
    userData.coursePath = userData.proficiencyLevel;
}

// Initialize course when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadCourseStructure();
    initializeGameHeader();
});

function initializeGameHeader() {
    const header = document.createElement('div');
    header.id = 'game-header';
    header.innerHTML = `<div id='avatar'>🤖</div><div id='level-indicator'>Proficiency Assessment</div>`;
    document.getElementById('main-container').prepend(header);
}

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

// Variables for state
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
    },    "agentive-ai-deep-dive": {
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
                    <h2>🤖 GitHub Copilot: Your AI Programming Partner</h2>
                    
                    <div class="concept-explanation">
                        <h3>💡 What is GitHub Copilot?</h3>
                        <p><strong>GitHub Copilot is an AI-powered code completion tool that acts as your pair programming partner.</strong></p>
                        
                        <div class="architecture-overview">
                            <h4>🧠 Based on OpenAI Codex:</h4>
                            <ul>
                                <li>Large language model trained on billions of lines of public code</li>
                                <li>Understands context from comments and existing code</li>
                                <li>Generates human-like code suggestions in real-time</li>
                            </ul>
                            
                            <h4>⚡ Real-time Integration:</h4>
                            <ul>
                                <li>Works in VS Code, Neovim, JetBrains IDEs</li>
                                <li>Analyzes current file and project context</li>
                                <li>Provides suggestions as you type</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="suggestion-mechanisms">
                        <h3>💡 How GitHub Copilot Provides Code Suggestions</h3>
                        <div class="mechanisms-grid">
                            <div class="mechanism-card">
                                <h4>🔄 Autocomplete Suggestions</h4>
                                <p>Real-time completions as you type</p>
                                <p>Predicts next lines based on context</p>
                                <p>Multiple suggestion options (Tab to accept)</p>
                            </div>
                            <div class="mechanism-card">
                                <h4>📝 Comment-to-Code</h4>
                                <p>Write descriptive comments</p>
                                <p>Copilot generates corresponding code</p>
                                <p><strong>Example:</strong> "// Create a function to calculate fibonacci"</p>
                            </div>
                            <div class="mechanism-card">
                                <h4>🔧 Function Generation</h4>
                                <p>Start function signature, Copilot completes body</p>
                                <p>Understands function names and parameters</p>
                                <p>Generates appropriate logic and error handling</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="advanced-features">
                        <h3>🚀 Advanced Code Completion Capabilities</h3>
                        <div class="features-list">
                            <div class="feature-group">
                                <h4>🎯 Context-Aware Completion</h4>
                                <ul>
                                    <li>Analyzes entire file and imports</li>
                                    <li>Understands variable types and scope</li>
                                    <li>Suggests contextually appropriate code</li>
                                </ul>
                            </div>
                            <div class="feature-group">
                                <h4>🔧 Multi-Language Support</h4>
                                <ul>
                                    <li>Python, JavaScript, TypeScript, Ruby, Go, C#</li>
                                    <li>Framework-specific suggestions (React, Django, etc.)</li>
                                    <li>Cross-language pattern recognition</li>
                                </ul>
                            </div>
                            <div class="feature-group">
                                <h4>🧩 Complex Code Generation</h4>
                                <ul>
                                    <li>Complete algorithm implementations</li>
                                    <li>Database query builders</li>
                                    <li>API endpoint handlers</li>
                                    <li>Test suite generation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="best-practices">
                        <h3>💼 Professional Best Practices</h3>
                        <div class="practices-grid">
                            <div class="practice-card">
                                <h4>✅ Code Review Protocol</h4>
                                <ul>
                                    <li>Always review generated code for logic errors</li>
                                    <li>Verify security implications</li>
                                    <li>Ensure coding standards compliance</li>
                                    <li>Test thoroughly before deployment</li>
                                </ul>
                            </div>
                            <div class="practice-card">
                                <h4>🎯 Effective Prompting</h4>
                                <ul>
                                    <li>Write clear, descriptive comments</li>
                                    <li>Provide context about requirements</li>
                                    <li>Specify error handling needs</li>
                                    <li>Include performance considerations</li>
                                </ul>
                            </div>
                            <div class="practice-card">
                                <h4>📈 Productivity Benefits</h4>
                                <ul>
                                    <li>30-50% faster initial code writing</li>
                                    <li>Reduced boilerplate code time</li>
                                    <li>Learning new APIs and patterns</li>
                                    <li>Focus on architecture vs. syntax</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="video-section">
                    <h3>🎬 Watch: GitHub Copilot in Professional Development</h3>
                    <div class="video-placeholder">
                        <div class="video-thumb">
                            <span class="play-icon">▶️</span>
                            <p><strong>Video:</strong> "GitHub Copilot: Code Suggestions and Completion Demo"</p>
                            <p><em>Duration: 8-10 minutes</em></p>
                        </div>
                        <p class="video-description">Watch real developers using GitHub Copilot for code completion, function generation, and complex programming tasks.</p>
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
    "codex-advanced": {
        type: 'reading',
        content: `
            <div class="module-content">
                <div class="reading-section">
                    <h2>🧠 Codex: Understanding Advanced Code Generation</h2>
                    
                    <div class="concept-explanation">
                        <h3>🔤 How Codex Understands and Generates Code</h3>
                        <p><strong>Codex uses a sophisticated neural architecture to understand and generate code:</strong></p>
                        
                        <div class="architecture-details">
                            <div class="architecture-component">
                                <h4>🧠 Transformer Model</h4>
                                <ul>
                                    <li>Based on GPT-3 architecture (12 billion parameters)</li>
                                    <li>Attention mechanisms understand code relationships</li>
                                    <li>Contextual embedding of programming concepts</li>
                                </ul>
                            </div>
                            <div class="architecture-component">
                                <h4>📚 Training Process</h4>
                                <ul>
                                    <li>Trained on GitHub public repositories</li>
                                    <li>Code documentation and Stack Overflow</li>
                                    <li>Programming language specifications</li>
                                    <li>Code comment associations</li>
                                </ul>
                            </div>
                            <div class="architecture-component">
                                <h4>🎯 Understanding Mechanisms</h4>
                                <ul>
                                    <li>Syntax pattern recognition</li>
                                    <li>Semantic meaning extraction</li>
                                    <li>Context flow analysis</li>
                                    <li>Intent inference from comments</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="generation-capabilities">
                        <h3>⚡ Advanced Code Generation Features</h3>
                        <div class="capabilities-list">
                            <div class="capability-section">
                                <h4>🔧 Multi-Modal Code Generation</h4>
                                <ul>
                                    <li>Natural language to code translation</li>
                                    <li>Code-to-code transformation</li>
                                    <li>Cross-language porting</li>
                                    <li>Pseudocode to implementation</li>
                                </ul>
                            </div>
                            <div class="capability-section">
                                <h4>🧩 Complex Algorithm Implementation</h4>
                                <ul>
                                    <li>Sorting and searching algorithms</li>
                                    <li>Data structure implementations</li>
                                    <li>Mathematical computations</li>
                                    <li>Graph and tree algorithms</li>
                                </ul>
                            </div>
                            <div class="capability-section">
                                <h4>🏗️ Application Architecture</h4>
                                <ul>
                                    <li>Class and interface definitions</li>
                                    <li>Database schema generation</li>
                                    <li>API endpoint creation</li>
                                    <li>Configuration file generation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="language-support">
                        <h3>🌐 Multi-Language Proficiency</h3>
                        <div class="languages-grid">
                            <div class="language-category">
                                <h4>💪 Strong Performance Languages</h4>
                                <ul>
                                    <li><strong>Python:</strong> 98% accuracy for common tasks</li>
                                    <li><strong>JavaScript/TypeScript:</strong> Excellent React/Node.js support</li>
                                    <li><strong>Java:</strong> Strong enterprise pattern recognition</li>
                                    <li><strong>C#:</strong> .NET framework integration</li>
                                </ul>
                            </div>
                            <div class="language-category">
                                <h4>🎯 Framework Awareness</h4>
                                <ul>
                                    <li>Recognizes framework-specific patterns</li>
                                    <li>Generates appropriate boilerplate code</li>
                                    <li>Understands library conventions</li>
                                    <li>Applies best practices per framework</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="limitations">
                        <h3>⚠️ Important Limitations & Considerations</h3>
                        <div class="limitations-grid">
                            <div class="limitation-card">
                                <h4>🔒 Security Concerns</h4>
                                <ul>
                                    <li>May suggest vulnerable code patterns</li>
                                    <li>No built-in security scanning</li>
                                    <li>Requires manual security review</li>
                                    <li>May expose sensitive patterns from training</li>
                                </ul>
                            </div>
                            <div class="limitation-card">
                                <h4>📊 Quality Variations</h4>
                                <ul>
                                    <li>Accuracy decreases with complexity</li>
                                    <li>May generate syntactically correct but logically flawed code</li>
                                    <li>Performance optimization not guaranteed</li>
                                    <li>Edge case handling may be incomplete</li>
                                </ul>
                            </div>
                            <div class="limitation-card">
                                <h4>⚖️ Ethical Considerations</h4>
                                <ul>
                                    <li>Potential copyright concerns</li>
                                    <li>Bias from training data</li>
                                    <li>Over-reliance reducing learning</li>
                                    <li>Need for human oversight</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="video-section">
                    <h3>🎬 Watch: Advanced Codex Capabilities</h3>
                    <div class="video-placeholder">
                        <div class="video-thumb">
                            <span class="play-icon">▶️</span>
                            <p><strong>Video:</strong> "Codex Code Generation: From Simple to Complex"</p>
                            <p><em>Duration: 10-12 minutes</em></p>
                        </div>
                        <p class="video-description">Explore advanced Codex capabilities including multi-language support, complex algorithms, and professional development workflows.</p>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What is a key limitation to consider when using Codex for production code?",
            options: [
                "It may generate syntactically correct but logically flawed or insecure code",
                "It only works with Python",
                "It cannot generate more than 10 lines of code",
                "It requires internet connection for every suggestion"
            ],
            answer: 0
        }
    },

    // SHARED MODULES (used in both courses)
    "codex-demo": {
        type: 'interactive',
        content: `
            <div class="module-content">
                <h2>💻 Hands-On: Code Generation Experience</h2>
                <div class="demo-section">
                    <h3>🎮 Try It Yourself!</h3>
                    <p>Enter a description of what you want the code to do, and watch AI generate it for you!</p>
                    <div class="prompt-demo">
                        <label for="prompt-input">Describe what you want the code to do:</label>
                        <input type="text" id="prompt-input" placeholder="e.g., 'Create a function that calculates the area of a circle'" />
                        <button onclick="generateCode()">Generate Code</button>
                        <div id="generated-code"></div>
                    </div>
                    <div class="tips">
                        <h4>💡 Try these examples:</h4>
                        <ul>
                            <li>"Create a loop that prints numbers 1 to 10"</li>
                            <li>"Make a function that finds the largest number in a list"</li>
                            <li>"Write code to sort a list of names alphabetically"</li>
                            <li>"Create a simple calculator that adds two numbers"</li>
                        </ul>
                    </div>
                </div>
            </div>
        `,
        quiz: {
            question: "What should you always do with AI-generated code?",
            options: [
                "Test it to make sure it works correctly",
                "Use it immediately without checking",
                "Delete it and write your own",
                "Share it on social media"
            ],
            answer: 0
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
    }
};

let currentModule = 0;
let currentPretest = 0;
let currentPosttest = 0;

// Timing variables
let pretestStart = null, pretestEnd = null, moduleStart = null, moduleEnd = null, posttestStart = null, posttestEnd = null;

// DOM Elements
const nameSection = document.getElementById('name-section');
const pretestSection = document.getElementById('pretest-section');
const courseSection = document.getElementById('course-section');
const posttestSection = document.getElementById('posttest-section');
const highscoreSection = document.getElementById('highscore-section');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');

// Name input
const startBtn = document.getElementById('start-btn');
startBtn.onclick = () => {
    const name = document.getElementById('username').value.trim();
    if (name) {
        userData.name = name;
        userData.startTime = Date.now();
        pretestStart = Date.now();
        nameSection.style.display = 'none';
        progressBarContainer.style.display = 'block';
        showPretest();
    }
};

function showPretest() {
    pretestSection.style.display = 'block';
    showPretestQuestion();
}

function showPretestQuestion() {
    const quizDiv = document.getElementById('pretest-quiz');
    quizDiv.innerHTML = '';
    if (currentPretest < shuffledPretestQuestions.length) {
        const q = shuffledPretestQuestions[currentPretest];
        quizDiv.innerHTML = `<p>Question ${currentPretest+1} of ${shuffledPretestQuestions.length}</p><p>${q.q}</p>` + q.options.map((opt, i) => `<button class='option-btn' onclick='selectPretest(${i})'>${opt}</button>`).join('');
    } else {
        pretestEnd = Date.now();
        userData.pretestTime = Math.round((pretestEnd-pretestStart)/1000);
        
        // Determine proficiency level based on pretest results
        determineProficiencyLevel();
        
        // Show proficiency level result
        showProficiencyResult();
    }
}

function showProficiencyResult() {
    const quizDiv = document.getElementById('pretest-quiz');
    const correctAnswers = userData.pretest.filter(x => x.correct).length;
    const recommendedLevel = userData.proficiencyLevel;
    const recommendedCourse = recommendedLevel === 'beginner' ? 'Beginner' : 'Intermediate';
    const alternativeCourse = recommendedLevel === 'beginner' ? 'Intermediate' : 'Beginner';
    
    quizDiv.innerHTML = `
        <div class="proficiency-result">
            <h3>📊 Assessment Complete!</h3>
            <p><strong>Your Score:</strong> ${correctAnswers}/${shuffledPretestQuestions.length}</p>
            
            <div class="course-recommendation">
                <h4>🎯 Recommended Course</h4>
                <div class="recommended-course-card">
                    <h5>✨ ${recommendedCourse} Level (Recommended)</h5>
                    <p>${recommendedLevel === 'beginner' 
                        ? 'Perfect for getting started! We\'ll cover AI fundamentals with clear explanations and practical examples.' 
                        : 'Great for diving deeper! We\'ll explore advanced AI concepts, technical details, and real-world applications.'}</p>
                    <button onclick="startCourse('${recommendedLevel}')" class="start-course-btn recommended">
                        🚀 Start ${recommendedCourse} Course (Recommended)
                    </button>
                </div>
            </div>
            
            <div class="alternative-course">
                <h4>🔄 Alternative Option</h4>
                <div class="alternative-course-card">
                    <h5>${alternativeCourse} Level</h5>
                    <p>${recommendedLevel === 'beginner' 
                        ? 'Want a challenge? This covers advanced AI applications, technical depth, and professional use cases.' 
                        : 'Prefer the basics? This starts from fundamentals with simple explanations and beginner-friendly examples.'}</p>
                    <button onclick="startCourse('${recommendedLevel === 'beginner' ? 'intermediate' : 'beginner'}')" class="start-course-btn alternative">
                        📚 Choose ${alternativeCourse} Course Instead
                    </button>
                </div>
            </div>
            
            <div class="course-preview">
                <p><em>💡 You can always adjust your learning path as you progress!</em></p>
            </div>
        </div>
    `;
}

window.startCourse = function(chosenLevel) {
    // Update user data with their chosen level
    userData.proficiencyLevel = chosenLevel;
    userData.coursePath = chosenLevel;
    
    // Set the current course based on chosen level
    currentCourse = courseStructure[chosenLevel];
    
    // Set the appropriate posttest based on course level
    if (chosenLevel === 'beginner') {
        shuffledPosttestQuestions = shuffledBeginnerPosttest;
    } else {
        shuffledPosttestQuestions = shuffledIntermediatePosttest;
    }
    
    // Hide pretest section and start course
    pretestSection.style.display = 'none';
    moduleStart = Date.now();
    updateGameHeaderForCourse();
    courseSection.style.display = 'block';
    showModule();
};

// Keep the old function for compatibility but redirect to new one
window.startAdaptiveCourse = function() {
    startCourse(userData.proficiencyLevel);
};

window.selectPretest = function(i) {
    userData.pretest.push({q: shuffledPretestQuestions[currentPretest].q, selected: i, correct: i === shuffledPretestQuestions[currentPretest].answer});
    currentPretest++;
    updateProgress();
    showPretestQuestion();
};

function startCourse() {
    courseSection.style.display = 'block';
    showModule();
}

function showModule() {
    if (currentModule < currentCourse.length) {
        const module = currentCourse[currentModule];
        const moduleData = moduleContent[module.id];
        
        const contentDiv = document.getElementById('course-content');
        const nextBtn = document.getElementById('course-next-btn');
        
        // Scroll to top when showing new module
        window.scrollTo(0, 0);
        
        // Check if this module uses single-page navigation (all reading modules now use pages)
        if (moduleData.type === 'reading') {
            showModuleWithPages(module, moduleData, contentDiv, nextBtn);
        } else {
            // Display full module content for non-reading modules (welcome, interactive, game, reflection)
            contentDiv.innerHTML = `
                <div class="module-header">
                    <h1>${module.title}</h1>
                    <p class="objective"><strong>Objective:</strong> ${module.objective}</p>
                </div>
                ${moduleData.content}
            `;
            
            // Show quiz if module has one
            if (moduleData.quiz) {
                contentDiv.innerHTML += `
                    <div class="quiz-section">
                        <h3>📝 Quick Check</h3>
                        <p>${moduleData.quiz.question}</p>
                        ${moduleData.quiz.options.map((opt, i) => 
                            `<button class='option-btn' onclick='selectModuleAnswer(${i})'>${opt}</button>`
                        ).join('')}
                    </div>
                `;
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
            }
        }
        
        updateProgress();
        updateModuleProgress();
    } else {
        // All modules completed, go to posttest
        moduleEnd = Date.now();
        courseSection.style.display = 'none';
        posttestStart = Date.now();
        showPosttest();
    }
}

function showModuleWithPages(module, moduleData, contentDiv, nextBtn) {
    let currentPage = 0;
    let totalPages = 0;
    let modulePages = [];
    
    // Parse the module content into pages
    const parser = new DOMParser();
    const doc = parser.parseFromString(moduleData.content, 'text/html');
    const readingSection = doc.querySelector('.reading-section');
    const videoSection = doc.querySelector('.video-section');
      if (readingSection) {
        // Split reading section into logical pages based on content sections
        const sections = readingSection.querySelectorAll('.concept-explanation, .comparison-section, .real-examples, .capabilities-section, .who-benefits, .example-demo, .suggestion-mechanisms, .advanced-features, .best-practices, .agent-cycle, .agent-types, .real-world-systems, .generation-capabilities, .language-support, .limitations, .daily-life-examples, .popular-examples, .how-it-works, .architecture-overview');
        
        // If no specific sections found, split by main content divs
        if (sections.length === 0) {
            const allDivs = readingSection.querySelectorAll('div');
            allDivs.forEach((section, index) => {
                if (section.children.length > 0) {
                    modulePages.push({
                        type: 'content',
                        content: `
                            <div class="module-header">
                                <h1>${module.title}</h1>
                                <p class="objective"><strong>Objective:</strong> ${module.objective}</p>
                            </div>
                            <div class="reading-section">
                                ${section.outerHTML}
                            </div>
                        `
                    });
                }
            });
        } else {
            // Use the found sections
            sections.forEach((section, index) => {
                modulePages.push({
                    type: 'content',
                    content: `
                        <div class="module-header">
                            <h1>${module.title}</h1>
                            <p class="objective"><strong>Objective:</strong> ${module.objective}</p>
                        </div>
                        <div class="reading-section">
                            ${section.outerHTML}
                        </div>
                    `
                });
            });
        }
    }
    
    // Add video page if exists
    if (videoSection) {
        modulePages.push({
            type: 'video',
            content: `
                <div class="module-header">
                    <h1>${module.title}</h1>
                    <p class="objective"><strong>Objective:</strong> ${module.objective}</p>
                </div>
                ${videoSection.outerHTML}
            `
        });
    }
    
    // Add quiz page
    if (moduleData.quiz) {
        modulePages.push({
            type: 'quiz',
            content: `
                <div class="module-header">
                    <h1>${module.title}</h1>
                    <p class="objective"><strong>Objective:</strong> ${module.objective}</p>
                </div>
                <div class="quiz-section">
                    <h3>📝 Quick Check</h3>
                    <p>${moduleData.quiz.question}</p>
                    ${moduleData.quiz.options.map((opt, i) => 
                        `<button class='option-btn' onclick='selectModuleAnswer(${i})'>${opt}</button>`
                    ).join('')}
                </div>
            `
        });
    }
    
    totalPages = modulePages.length;
    
    function renderCurrentPage() {
        const page = modulePages[currentPage];
        contentDiv.innerHTML = `
            ${page.content}
            <div class="page-navigation">
                <div class="page-indicator">
                    Page ${currentPage + 1} of ${totalPages}
                </div>
                <div class="page-controls">
                    ${currentPage > 0 ? '<button onclick="previousPage()" class="nav-btn prev-btn">← Previous</button>' : ''}
                    ${currentPage < totalPages - 1 ? '<button onclick="nextPage()" class="nav-btn next-btn">Next →</button>' : ''}
                </div>
            </div>
        `;
        
        // Hide the main next button for page navigation
        if (page.type === 'quiz') {
            nextBtn.style.display = 'none';
        } else if (currentPage === totalPages - 1) {
            nextBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'none';
        }
    }
      // Page navigation functions
    window.nextPage = function() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderCurrentPage();
            window.scrollTo(0, 0);
        }
    };
    
    window.previousPage = function() {
        if (currentPage > 0) {
            currentPage--;
            renderCurrentPage();
            window.scrollTo(0, 0);
        }
    };
    
    // Initial render
    renderCurrentPage();
}

window.selectModuleAnswer = function(selectedIndex) {
    const module = currentCourse[currentModule];
    const moduleData = moduleContent[module.id];
    const isCorrect = selectedIndex === moduleData.quiz.answer;
    
    // Record answer
    userData.moduleProgress.push({
        moduleId: module.id,
        moduleTitle: module.title,
        completed: true,
        quizCorrect: isCorrect,
        timestamp: Date.now()
    });
    
    if (isCorrect) {
        userData.points += 10;
        showScoreAnim(10);
        
        // Award badge based on module outcome
        if (module.outcome && module.outcome.includes('Badge:')) {
            const badgeName = module.outcome.split('Badge: ')[1].split(',')[0];
            awardBadge(badgeName);
        }
    }
    
    // Disable all quiz buttons to prevent multiple submissions
    const quizButtons = document.querySelectorAll('.option-btn');
    quizButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.onclick && btn.onclick.toString().includes(`selectModuleAnswer(${selectedIndex})`)) {
            btn.style.background = isCorrect ? '#4CAF50' : '#f44336';
            btn.style.color = 'white';
        }
    });
    
    // Show correct answer if wrong
    if (!isCorrect) {
        quizButtons[moduleData.quiz.answer].style.background = '#4CAF50';
        quizButtons[moduleData.quiz.answer].style.color = 'white';
    }
    
    // Move to next module after delay
    setTimeout(() => {
        currentModule++;
        updateProgress();
        showModule();
    }, 2000);
};

document.getElementById('course-next-btn').onclick = () => {
    const module = currentCourse[currentModule];
    
    // Record module completion without quiz
    userData.moduleProgress.push({
        moduleId: module.id,
        moduleTitle: module.title,
        completed: true,
        timestamp: Date.now()
    });
    
    // Award badge for completion
    if (module.outcome && module.outcome.includes('Badge:')) {
        const badgeName = module.outcome.split('Badge: ')[1].split(',')[0];
        awardBadge(badgeName);
    }
    
    currentModule++;
    updateProgress();
    showModule();
};

function showPosttest() {
    posttestSection.style.display = 'block';
    showPosttestQuestion();
}

function showPosttestQuestion() {
    const quizDiv = document.getElementById('posttest-quiz');
    quizDiv.innerHTML = '';
    if (currentPosttest < shuffledPosttestQuestions.length) {
        const q = shuffledPosttestQuestions[currentPosttest];
        quizDiv.innerHTML = `<p>Question ${currentPosttest+1} of ${shuffledPosttestQuestions.length}</p><p>${q.q}</p>` + q.options.map((opt, i) => `<button class='option-btn' onclick='selectPosttest(${i})'>${opt}</button>`).join('');
    } else {
        posttestEnd = Date.now();
        userData.posttestTime = Math.round((posttestEnd-posttestStart)/1000);
        posttestSection.style.display = 'none';
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
    // Create and show reflection section
    const reflectionSection = document.createElement('section');
    reflectionSection.id = 'reflection-section';
    reflectionSection.innerHTML = `
        <h2>🎯 Course Reflection & Feedback</h2>
        <div class="reflection-content">
            ${moduleContent.reflection.content}
        </div>
    `;
    
    // Insert after posttest section
    posttestSection.insertAdjacentElement('afterend', reflectionSection);
    reflectionSection.style.display = 'block';
    
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
                        <span class="value">${modulesCompleted}/${courseStructure.length}</span>
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
    }
}

function updateModuleProgress() {
    const levelIndicator = document.getElementById('level-indicator');
    if (levelIndicator && currentCourse.length > 0) {
        const courseType = userData.proficiencyLevel === 'beginner' ? 'Beginner' : 'Intermediate';
        levelIndicator.textContent = `${courseType} Course - Module ${currentModule + 1} of ${currentCourse.length}`;
    }
}

// Interactive functions for modules
window.generateCode = function() {
    const prompt = document.getElementById('prompt-input').value;
    const codeDiv = document.getElementById('generated-code');
    
    // Mock code generation
    const mockCode = `
# Generated code for: "${prompt}"
for i in range(1, 11):
    print(f"Number: {i}")
    `;
    
    codeDiv.innerHTML = `<pre><code>${mockCode}</code></pre>`;
    userData.points += 5;
    showScoreAnim(5);
};

window.evaluatePrompt = function() {
    const prompt = document.getElementById('challenge-prompt').value;
    const feedbackDiv = document.getElementById('prompt-feedback');
    
    let score = 0;
    let feedback = "";
    
    if (prompt.length > 50) score += 20;
    if (prompt.includes('function') || prompt.includes('class')) score += 20;
    if (prompt.includes('example') || prompt.includes('comment')) score += 20;
    
    if (score >= 40) {
        feedback = "🌟 Excellent prompt! Clear, detailed, and well-structured.";
        awardBadge("Prompt Wizard");
    } else if (score >= 20) {
        feedback = "👍 Good prompt! Could be more detailed.";
    } else {
        feedback = "💡 Try to be more specific and detailed in your prompt.";
    }
    
    userData.points += score;
    feedbackDiv.innerHTML = `<p>${feedback}</p><p>Points earned: ${score}</p>`;
    showScoreAnim(score);
};

window.checkEscapeAnswer = function(room) {
    const answer = document.getElementById('escape-answer').value.toLowerCase();
    const roomContent = document.getElementById('room-content');
    
    if (room === 1 && answer.includes('agentive')) {
        userData.points += 30;
        showScoreAnim(30);
        roomContent.innerHTML = `
            <h3>🎉 Room 1 Unlocked!</h3>
            <p>Correct! Agentive AI would be perfect for automatically organizing emails.</p>
            <button onclick="nextEscapeRoom()">Next Room</button>
        `;
    } else {
        roomContent.innerHTML += `<p style="color: red;">Try again! Think about AI that acts on your behalf.</p>`;
    }
};

window.nextEscapeRoom = function() {
    // For now, just award the completion badge and move on
    awardBadge("Escape Master");
    currentModule++;
    showModule();
};

window.submitFeedback = function() {
    const enjoyFeedback = document.getElementById('enjoy-feedback').value;
    const improveFeedback = document.getElementById('improve-feedback').value;
    
    userData.feedback = {
        enjoyed: enjoyFeedback,
        improvements: improveFeedback
    };
    
    // Set end time here since this is the actual completion
    userData.endTime = Date.now();
    
    showBadge("🎓 Course Complete!");
    
    // Hide reflection section and show results
    document.getElementById('reflection-section').style.display = 'none';
    setTimeout(() => showResults(), 2000);
};

window.downloadCertificate = function() {
    const certificate = `
🏆 CERTIFICATE OF COMPLETION 🏆

This certifies that ${userData.name} has successfully completed
the Agentive AI & Codex Learning Adventure

Modules Completed: ${userData.moduleProgress.length}
Badges Earned: ${userData.badges.join(', ')}
Total Points: ${userData.points}

Date: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userData.name}_AI_Certificate.txt`;
    a.click();
};

// Google Sheets endpoint (replace with your actual endpoint)
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZrzC_6T07J-uGXbPwFL5bD4yxrXelVgAoogXmhvZaDx6cExNzT_MIP9qVVsY2UbWW/exec';

function exportToGoogleSheets() {
    // Calculate the required data
    const pretestScore = userData.pretest.filter(x => x.correct).length;
    const posttestScore = userData.posttest.filter(x => x.correct).length;
    const modulesCompleted = userData.moduleProgress.length;
    const highScore = userData.points;
    const improvement = userData.feedback.improvements || '';
    const enjoyment = userData.feedback.enjoyed || '';
      // Format data according to Google Sheets headers
    const exportData = {
        Timestamp: new Date().toISOString(),
        Name: userData.name,
        "Course Path": userData.proficiencyLevel,
        "Pre-test Score": `${pretestScore}/${shuffledPretestQuestions.length}`,
        "Post-test Score": `${posttestScore}/${shuffledPosttestQuestions.length}`,
        "Modules Completed": `${modulesCompleted}/${currentCourse.length}`,
        "High Score": highScore,
        Improvement: improvement,
        Enjoyment: enjoyment
    };
    
    console.log('Sending data to Google Sheets:', exportData);
    
    // Primary method: POST with JSON
    fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData)
    }).then(response => {
        console.log('Primary method response:', response);
        return response.text();
    }).then(data => {
        console.log('Response data:', data);
        try {
            const parsed = JSON.parse(data);
            if (parsed.status === 'success') {
                console.log('Data sent successfully via primary method');
                showBadge('📊 Data Saved to Sheets!');
            } else {
                throw new Error('Server returned error: ' + parsed.message);
            }
        } catch (e) {
            console.log('Primary method failed, trying alternative...');
            sendViaFormMethod(exportData);
        }
    }).catch(error => {
        console.error('Primary method error:', error);
        console.log('Trying alternative form method...');
        sendViaFormMethod(exportData);
    });
}

function sendViaFormMethod(exportData) {
    // Alternative method: Form submission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_SHEETS_ENDPOINT;
    form.style.display = 'none';
    
    // Create hidden inputs for each data field
    Object.keys(exportData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = exportData[key];
        form.appendChild(input);
    });
    
    // Add form to body, submit, then remove
    document.body.appendChild(form);
    
    // Create iframe to handle response without page redirect
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    form.target = 'hidden_iframe';
    
    form.submit();
    
    // Clean up after submission
    setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        console.log('Form method completed');
        showBadge('📊 Data Sent via Form!');
    }, 3000);
}

function saveData() {
    // Save to localStorage for now, can be exported for analysis
    let dataset = JSON.parse(localStorage.getItem('dataset') || '[]');
    dataset.push(userData);
    localStorage.setItem('dataset', JSON.stringify(dataset));
}

// Analytics for module completion
function updateAnswerAnalytics() {
    if (!localStorage.getItem('moduleAnalytics')) {
        let analytics = {modules: []};
        analytics.modules = courseStructure.map(module => ({
            id: module.id,
            completions: 0,
            avgScore: 0
        }));
        localStorage.setItem('moduleAnalytics', JSON.stringify(analytics));
    }
    
    let analytics = JSON.parse(localStorage.getItem('moduleAnalytics'));
    userData.moduleProgress.forEach((progress, idx) => {
        if (analytics.modules[idx]) {
            analytics.modules[idx].completions++;
        }
    });
    localStorage.setItem('moduleAnalytics', JSON.stringify(analytics));
}

function showResults() {
    highscoreSection.style.display = 'block';
    const resultsDiv = document.getElementById('results');
    const modulesCompleted = userData.moduleProgress.length;
    const quizScore = userData.moduleProgress.filter(m => m.quizCorrect).length;
    const pretestScore = userData.pretest.filter(x => x.correct).length;
    const posttestScore = userData.posttest.filter(x => x.correct).length;
    const totalTime = Math.round((userData.endTime - userData.startTime) / 1000);
    
    resultsDiv.innerHTML = `
        <div class="results-summary">
            <h2>🎉 Congratulations ${userData.name}!</h2>
            <div class="stats">
                <div class="stat">
                    <h3>📝 Pretest Score</h3>
                    <p>${pretestScore} / ${shuffledPretestQuestions.length} (Time: ${userData.pretestTime}s)</p>
                </div>
                <div class="stat">
                    <h3>📚 Modules Completed</h3>
                    <p>${modulesCompleted} / ${courseStructure.length}</p>
                </div>
                <div class="stat">
                    <h3>🏆 Badges Earned</h3>
                    <p>${userData.badges.join(', ') || 'None yet'}</p>
                </div>
                <div class="stat">
                    <h3>⭐ Total Points</h3>
                    <p>${userData.points}</p>
                </div>
                <div class="stat">
                    <h3>📝 Module Quiz Score</h3>
                    <p>${quizScore} / ${userData.moduleProgress.filter(m => m.quizCorrect !== undefined).length}</p>
                </div>
                <div class="stat">
                    <h3>📋 Posttest Score</h3>
                    <p>${posttestScore} / ${shuffledPosttestQuestions.length} (Time: ${userData.posttestTime}s)</p>
                </div>
                <div class="stat">
                    <h3>⏱️ Total Time</h3>
                    <p>${totalTime} seconds</p>
                </div>
            </div>
        </div>
    `;
    
    saveData();
    updateAnswerAnalytics();
    exportToGoogleSheets();
    showConfetti();
}

function updateProgress() {
    // Calculate progress: pretest + modules + posttest  
    const totalSteps = shuffledPretestQuestions.length + (currentCourse.length || 1) + shuffledPosttestQuestions.length;
    const completedSteps = currentPretest + currentModule + currentPosttest;
    const progress = (completedSteps / totalSteps) * 100;
    progressBar.style.width = progress + '%';
}

function updateLevel() {
    updateModuleProgress();
}

// Score animation
function showScoreAnim(points) {
    const anim = document.createElement('div');
    anim.className = 'score-anim';
    anim.textContent = `+${points}`;
    document.body.appendChild(anim);
    setTimeout(() => anim.remove(), 1000);
}

// Badge animation
function showBadge(text) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    document.getElementById('main-container').prepend(badge);
    setTimeout(() => badge.remove(), 2000);
}

// Confetti animation
function showConfetti() {
    const confetti = document.createElement('canvas');
    confetti.className = 'confetti';
    confetti.width = window.innerWidth;
    confetti.height = window.innerHeight;
    document.body.appendChild(confetti);
    // Simple confetti effect
    const ctx = confetti.getContext('2d');
    let pieces = Array.from({length: 80}, () => ({x: Math.random()*confetti.width, y: Math.random()*confetti.height, r: Math.random()*8+4, c: `hsl(${Math.random()*360},80%,60%)`, v: Math.random()*2+1}));
    let frame = 0;
    function draw() {
        ctx.clearRect(0,0,confetti.width,confetti.height);
        pieces.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
            ctx.fillStyle = p.c;
            ctx.fill();
            p.y += p.v;
            if (p.y > confetti.height) p.y = -10;
        });
        frame++;
        if (frame < 80) requestAnimationFrame(draw);
        else confetti.remove();
    }
    draw();
}

// Sound effects
const correctSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c3e.mp3');
const wrongSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4c3e.mp3');