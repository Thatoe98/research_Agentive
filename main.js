// Main JavaScript for gamified course

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
    courseProgress: 0,
    highscore: 0,
    startTime: null,
    endTime: null
};
let pretestQuestions = [
    {q: '1. What is Agentive AI?', options: ['A type of AI that acts on behalf of users', 'A programming language', 'A hardware device', 'A game'], answer: 0},
    {q: '2. What is Codex AI?', options: ['A code generation AI', 'A search engine', 'A robot', 'A database'], answer: 0},
    {q: '3. Which of the following is NOT a feature of agentive AI?', options: ['Acts autonomously', 'Learns from data', 'Requires constant user input', 'Can make decisions'], answer: 2},
    {q: '4. Which programming language is commonly used with Codex AI?', options: ['Python', 'HTML', 'C++', 'Assembly'], answer: 0},
    {q: '5. What is the main benefit of agentive AI?', options: ['Reduces user workload', 'Increases manual tasks', 'Slows down processes', 'None of the above'], answer: 0},
    {q: '6. Agentive AI systems are designed to?', options: ['Automate user goals', 'Replace all humans', 'Only play games', 'Ignore user input'], answer: 0},
    {q: '7. Codex AI is mainly used for?', options: ['Generating code', 'Cooking', 'Driving', 'Painting'], answer: 0},
    {q: '8. Which is a good use case for agentive AI?', options: ['Automated scheduling', 'Manual data entry', 'Static websites', 'Paper filing'], answer: 0},
    {q: '9. Which language is Codex especially strong with?', options: ['Python', 'Pascal', 'COBOL', 'Fortran'], answer: 0},
    {q: '10. What should you do with Codex suggestions?', options: ['Review and test them', 'Use without checking', 'Ignore them', 'Delete them'], answer: 0}
];
let posttestQuestions = [
    {q: '1. Agentive AI is best described as?', options: ['Acts on behalf of users', 'A type of hardware', 'A search engine', 'A database'], answer: 0},
    {q: '2. Codex AI is mainly used for?', options: ['Generating code', 'Cooking', 'Driving', 'Painting'], answer: 0},
    {q: '3. Which of these is a limitation of Codex AI?', options: ['May generate incorrect code', 'Can only write in Java', 'Cannot be used online', 'Is not based on AI'], answer: 0},
    {q: '4. Agentive AI systems are designed to?', options: ['Automate user goals', 'Replace all humans', 'Only play games', 'Ignore user input'], answer: 0},
    {q: '5. Which is a good use case for agentive AI?', options: ['Automated scheduling', 'Manual data entry', 'Static websites', 'Paper filing'], answer: 0},
    {q: '6. Codex supports which of the following?', options: ['Multiple programming languages', 'Only HTML', 'Only C++', 'Only Assembly'], answer: 0},
    {q: '7. What is a key feature of agentive AI?', options: ['Autonomy', 'Manual operation', 'Static rules', 'No learning'], answer: 0},
    {q: '8. What is a risk of using Codex AI?', options: ['May generate insecure code', 'Always perfect', 'Never makes mistakes', 'Only works offline'], answer: 0},
    {q: '9. Which is NOT an application of agentive AI?', options: ['Manual data entry', 'Automated scheduling', 'Smart assistants', 'Productivity tools'], answer: 0},
    {q: '10. What should you always do with AI-generated code?', options: ['Review and test', 'Trust blindly', 'Ignore', 'Delete'], answer: 0}
];
let courseContent = [
    {type: 'video', content: 'https://www.youtube.com/embed/VIDEO_ID1', desc: 'Introduction to Agentive AI'},
    {type: 'reading', content: 'Agentive AI refers to systems that can act on behalf of users to accomplish goals. These systems can make decisions, learn from data, and automate tasks.\n\nAgentive AI is different from traditional automation because it adapts to user needs and can handle complex, changing environments. Examples include smart assistants, automated scheduling tools, and recommendation systems.'},
    {type: 'quiz', q: 'Which of these is an example of Agentive AI?', options: ['AI that books flights for you', 'A calculator', 'A text editor', 'A web browser'], answer: 0},
    {type: 'reading', content: 'Key features of agentive AI include: \n- Autonomy: The system can make decisions without constant user input.\n- Adaptability: It learns from user behavior and data.\n- Goal-oriented: It focuses on achieving user-defined objectives.\n\nAgentive AI is used in many fields, from healthcare to finance, to reduce repetitive work and improve efficiency.'},
    {type: 'quiz', q: 'Which feature is essential for agentive AI?', options: ['Autonomy', 'Manual operation', 'Static rules', 'No learning'], answer: 0},
    {type: 'video', content: 'https://www.youtube.com/embed/VIDEO_ID2', desc: 'Introduction to Codex AI'},
    {type: 'reading', content: 'Codex AI is an advanced language model developed by OpenAI that can generate code from natural language instructions. It powers tools like GitHub Copilot, helping developers write code faster and with fewer errors.\n\nCodex can understand dozens of programming languages and is especially strong with Python and JavaScript.'},
    {type: 'quiz', q: 'Codex AI can help with?', options: ['Writing code', 'Making coffee', 'Driving', 'Sleeping'], answer: 0},
    {type: 'reading', content: 'Codex supports multiple programming languages, including Python, JavaScript, TypeScript, Ruby, Go, and more.\n\nIt can generate code snippets, complete functions, and even write documentation. However, it is important to always review and test the code it generates.'},
    {type: 'quiz', q: 'Which language is Codex especially strong with?', options: ['Python', 'Pascal', 'COBOL', 'Fortran'], answer: 0},
    {type: 'reading', content: 'Limitations: Codex may generate incorrect or insecure code. It does not understand context perfectly and can make mistakes.\n\nAlways review, test, and validate any code generated by Codex before using it in production.'},
    {type: 'quiz', q: 'What should you do with Codex suggestions?', options: ['Review and test them', 'Use without checking', 'Ignore them', 'Delete them'], answer: 0},    {type: 'reading', content: 'Applications: Agentive AI and Codex can be used in automation, education, productivity tools, and more.\n\nFor example, agentive AI can automate scheduling meetings, while Codex can help students learn programming by generating code examples and explanations.'},
    {type: 'quiz', q: 'Which is a good application for agentive AI?', options: ['Automated scheduling', 'Manual data entry', 'Static websites', 'Paper filing'], answer: 0}
];

// Shuffle all questions at startup
let shuffledPretestQuestions = pretestQuestions.map(q => shuffleOptions(q));
let shuffledPosttestQuestions = posttestQuestions.map(q => shuffleOptions(q));
let shuffledCourseContent = courseContent.map(item => {
    if (item.type === 'quiz') {
        return shuffleOptions(item);
    }
    return item;
});

let currentPretest = 0, currentCourse = 0, currentPosttest = 0;

// Timing variables
let pretestStart = null, pretestEnd = null, courseStart = null, courseEnd = null, posttestStart = null, posttestEnd = null;

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
        pretestSection.style.display = 'none';
        courseStart = Date.now();
        showCourse();
    }
}
window.selectPretest = function(i) {
    userData.pretest.push({q: shuffledPretestQuestions[currentPretest].q, selected: i, correct: i === shuffledPretestQuestions[currentPretest].answer});
    currentPretest++;
    updateProgress();
    showPretestQuestion();
};
document.getElementById('pretest-next-btn').onclick = () => {
    currentPretest++;
    showPretestQuestion();
};
// ...existing code...
function showCourse() {
    courseSection.style.display = 'block';
    showCourseContent();
}
function showCourseContent() {
    const contentDiv = document.getElementById('course-content');
    const nextBtn = document.getElementById('course-next-btn');
    contentDiv.innerHTML = '';
    if (currentCourse < shuffledCourseContent.length) {
        const item = shuffledCourseContent[currentCourse];
        if (item.type === 'video') {
            contentDiv.innerHTML = `<p>${item.desc}</p><iframe width='560' height='315' src='${item.content}' frameborder='0' allowfullscreen></iframe>`;
            nextBtn.style.display = 'block';
        } else if (item.type === 'reading') {
            contentDiv.innerHTML = `<p>${item.content.replace(/\n/g,'<br>')}</p>`;
            nextBtn.style.display = 'block';
        } else if (item.type === 'quiz') {
            contentDiv.innerHTML = `<p>Quiz ${Math.floor(currentCourse/2)+1} of ${Math.ceil(shuffledCourseContent.length/2)}</p><p>${item.q}</p>` + item.options.map((opt, i) => `<button class='option-btn' onclick='selectCourseQuiz(${i})'>${opt}</button>`).join('');
            nextBtn.style.display = 'none';
        }
    } else {
        courseEnd = Date.now();
        userData.courseTime = Math.round((courseEnd-courseStart)/1000);
        courseSection.style.display = 'none';
        posttestStart = Date.now();
        showPosttest();
    }
}
window.selectCourseQuiz = function(i) {
    const item = shuffledCourseContent[currentCourse];
    if (!userData.courseQuizAnswers) userData.courseQuizAnswers = [];
    userData.courseQuizAnswers.push(i);
    if (i === item.answer) {
        userData.highscore += 10;
    }
    currentCourse++;
    updateProgress();
    showCourseContent();
};
document.getElementById('course-next-btn').onclick = () => {
    currentCourse++;
    showCourseContent();
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
        showHighscore();
    }
}
window.selectPosttest = function(i) {
    userData.posttest.push({q: shuffledPosttestQuestions[currentPosttest].q, selected: i, correct: i === shuffledPosttestQuestions[currentPosttest].answer});
    currentPosttest++;
    updateProgress();
    showPosttestQuestion();
};
document.getElementById('posttest-finish-btn').onclick = () => {
    currentPosttest++;
    showPosttestQuestion();
};
// Google Sheets endpoint (replace with your actual endpoint)
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyfJtW76P1G417E6zEBahcOVsTA9VLg0waTSXKAaVON-76J7cumzFd8mr2bL6o0VVVV/exec';

// Analytics for answer distribution
function updateAnswerAnalytics() {
    // Pretest
    if (!localStorage.getItem('answerAnalytics')) {
        let analytics = {pretest: [], posttest: [], course: []};
        analytics.pretest = pretestQuestions.map(q => Array(q.options.length).fill(0));
        analytics.posttest = posttestQuestions.map(q => Array(q.options.length).fill(0));
        analytics.course = courseContent.filter(q => q.type === 'quiz').map(q => Array(q.options.length).fill(0));
        localStorage.setItem('answerAnalytics', JSON.stringify(analytics));
    }
    let analytics = JSON.parse(localStorage.getItem('answerAnalytics'));
    userData.pretest.forEach((ans, idx) => { analytics.pretest[idx][ans.selected]++; });
    userData.posttest.forEach((ans, idx) => { analytics.posttest[idx][ans.selected]++; });
    let quizIdx = 0;
    courseContent.forEach((item, idx) => {
        if (item.type === 'quiz' && userData.courseQuizAnswers && userData.courseQuizAnswers[quizIdx] !== undefined) {
            analytics.course[quizIdx][userData.courseQuizAnswers[quizIdx]]++;
            quizIdx++;
        }
    });
    localStorage.setItem('answerAnalytics', JSON.stringify(analytics));
}

function showHighscore() {
    highscoreSection.style.display = 'block';
    userData.endTime = Date.now();
    const resultsDiv = document.getElementById('results');
    const preCorrect = userData.pretest.filter(x => x.correct).length;
    const postCorrect = userData.posttest.filter(x => x.correct).length;
    resultsDiv.innerHTML = `<p>Name: ${userData.name}</p><p>Pretest Score: ${preCorrect}/${pretestQuestions.length} (Time: ${userData.pretestTime}s)</p><p>Course Quiz Highscore: ${userData.highscore} (Time: ${userData.courseTime}s)</p><p>Posttest Score: ${postCorrect}/${posttestQuestions.length} (Time: ${userData.posttestTime}s)</p><p>Total Time: ${Math.round((userData.endTime-userData.startTime)/1000)} seconds</p>`;
    saveData();
    updateAnswerAnalytics();
    exportToGoogleSheets();
    showConfetti();
}

function exportToGoogleSheets() {
    // Send userData to Google Sheets
    fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userData: userData})
    }).then(response => {
        console.log('Data sent successfully (no-cors mode)');
    }).catch(error => {
        console.error('Error sending data:', error);
        // Try alternative method
        console.log('Trying alternative method...');
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_SHEETS_ENDPOINT;
        form.target = '_blank';
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = JSON.stringify({userData: userData});
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
}

function updateProgress() {
    let total = pretestQuestions.length + courseContent.length + posttestQuestions.length;
    let done = currentPretest + currentCourse + currentPosttest;
    progressBar.style.width = ((done/total)*100) + '%';
}

function saveData() {
    // Save to localStorage for now, can be exported for analysis
    let dataset = JSON.parse(localStorage.getItem('dataset') || '[]');
    dataset.push(userData);
    localStorage.setItem('dataset', JSON.stringify(dataset));
}

// Add game header (avatar and level)
document.addEventListener('DOMContentLoaded', () => {
    const header = document.createElement('div');
    header.id = 'game-header';
    header.innerHTML = `<div id='avatar'>🤖</div><div id='level-indicator'>Level 1</div>`;
    document.getElementById('main-container').prepend(header);
});

function updateLevel() {
    let level = 1;
    if (currentPretest >= pretestQuestions.length) level = 2;
    if (currentCourse >= courseContent.length) level = 3;
    if (currentPosttest >= posttestQuestions.length) level = 4;
    document.getElementById('level-indicator').textContent = `Level ${level}`;
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