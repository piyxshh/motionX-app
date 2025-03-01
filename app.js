// MotionX - Fitness Assistant App

// Constants
const STORAGE_KEY = 'motionx-data';

// Main app data structure
let appData = {
    user: {
        dailyCalorieGoal: 2000,
        dailyProteinGoal: 120,
        dailyCarbsGoal: 250,
        dailyFatGoal: 65
    },
    foodLog: [],
    workouts: {
        scheduled: [],
        history: []
    },
    reminders: []
};

// Utility to save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

// Initialize the app
function initApp() {
    loadData();
    setupTabNavigation();
    setupEventListeners();
    updateDashboard();
    updateNutritionTab();
    updateWorkoutTab();
    setupCharts();
    checkWorkoutReminders();
}

// Setup tab navigation
function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and tabs
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Quick action buttons
    document.getElementById('add-meal-btn').addEventListener('click', () => showModal('food-modal'));
    document.getElementById('log-workout-btn').addEventListener('click', () => showModal('log-workout-modal'));
    
    // Add food button
    document.getElementById('add-food-btn').addEventListener('click', () => showModal('food-modal'));
    
    // Add workout button
    document.getElementById('add-workout-btn').addEventListener('click', () => showModal('workout-modal'));
    
    // Form submissions
    document.getElementById('food-form').addEventListener('submit', handleFoodSubmit);
    document.getElementById('workout-form').addEventListener('submit', handleWorkoutSubmit);
    document.getElementById('log-workout-form').addEventListener('submit', handleLogWorkoutSubmit);
    
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => closeAllModals());
    });
    
    // Assistant chat
    document.getElementById('send-message-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

// Function to show a modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Function to close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Handle food form submission
function handleFoodSubmit(e) {
    e.preventDefault();
    
    const foodName = document.getElementById('food-name').value;
    const category = document.getElementById('food-category').value;
    const calories = parseInt(document.getElementById('food-calories').value);
    const protein = parseFloat(document.getElementById('food-protein').value);
    const carbs = parseFloat(document.getElementById('food-carbs').value);
    const fat = parseFloat(document.getElementById('food-fat').value);
    
    const foodItem = {
        id: Date.now(),
        name: foodName,
        category,
        calories,
        protein,
        carbs,
        fat,
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.foodLog.push(foodItem);
    saveData();
    updateNutritionTab();
    updateDashboard();
    
    // Reset form and close modal
    document.getElementById('food-form').reset();
    closeAllModals();
}

// Handle workout form submission
function handleWorkoutSubmit(e) {
    e.preventDefault();
    
    const workoutName = document.getElementById('workout-name').value;
    const day = document.getElementById('workout-day').value;
    const time = document.getElementById('workout-time').value;
    const duration = parseInt(document.getElementById('workout-duration').value);
    
    const workout = {
        id: Date.now(),
        name: workoutName,
        day,
        time,
        duration
    };
    
    appData.workouts.scheduled.push(workout);
    saveData();
    updateWorkoutTab();
    addWorkoutReminder(workout);
    
    // Reset form and close modal
    document.getElementById('workout-form').reset();
    closeAllModals();
}

// Handle logging a completed workout
function handleLogWorkoutSubmit(e) {
    e.preventDefault();
    
    const workoutName = document.getElementById('log-workout-name').value;
    const duration = parseInt(document.getElementById('log-workout-duration').value);
    const caloriesBurned = parseInt(document.getElementById('log-workout-calories').value);
    const notes = document.getElementById('log-workout-notes').value;
    
    const loggedWorkout = {
        id: Date.now(),
        name: workoutName,
        duration,
        caloriesBurned,
        notes,
        date: new Date().toISOString()
    };
    
    appData.workouts.history.push(loggedWorkout);
    saveData();
    updateWorkoutTab();
    updateDashboard();
    
    // Reset form and close modal
    document.getElementById('log-workout-form').reset();
    closeAllModals();
}

// Update dashboard with latest data
function updateDashboard() {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate calories and protein consumed today
    const todaysFoods = appData.foodLog.filter(food => food.date === today);
    const caloriesConsumed = todaysFoods.reduce((total, food) => total + food.calories, 0);
    const proteinConsumed = todaysFoods.reduce((total, food) => total + food.protein, 0);
    
    // Check if workout was done today
    const todaysWorkouts = appData.workouts.history.filter(workout => {
        const workoutDate = new Date(workout.date).toISOString().split('T')[0];
        return workoutDate === today;
    });
    
    // Update the dashboard stats
    document.getElementById('calories-today').textContent = caloriesConsumed;
    document.getElementById('protein-today').textContent = proteinConsumed + 'g';
    document.getElementById('workout-status').textContent = todaysWorkouts.length > 0 ? 'Completed' : 'Not done';
    
    // Update reminders list
    const remindersList = document.getElementById('reminders-list');
    remindersList.innerHTML = '';
    
    if (appData.reminders.length === 0) {
        remindersList.innerHTML = '<li>No reminders for today.</li>';
    } else {
        appData.reminders.forEach(reminder => {
            const li = document.createElement('li');
            li.textContent = reminder.message;
            remindersList.appendChild(li);
        });
    }
}

// Update nutrition tab with food log data
function updateNutritionTab() {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Filter today's food items
    const todaysFoods = appData.foodLog.filter(food => food.date === today);
    
    // Clear all meal lists
    document.getElementById('breakfast-list').innerHTML = '';
    document.getElementById('lunch-list').innerHTML = '';
    document.getElementById('dinner-list').innerHTML = '';
    document.getElementById('snacks-list').innerHTML = '';
    
    // Populate meal lists
    todaysFoods.forEach(food => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="food-name">${food.name}</span>
            <span class="food-calories">${food.calories} cal</span>
        `;
        
        document.getElementById(`${food.category}-list`).appendChild(li);
    });
    
    // Calculate nutrition totals
    const caloriesConsumed = todaysFoods.reduce((total, food) => total + food.calories, 0);
    const proteinConsumed = todaysFoods.reduce((total, food) => total + food.protein, 0);
    const carbsConsumed = todaysFoods.reduce((total, food) => total + food.carbs, 0);
    const fatConsumed = todaysFoods.reduce((total, food) => total + food.fat, 0);
    
    // Update progress bars
    document.getElementById('calories-bar').style.width = `${Math.min(100, (caloriesConsumed / appData.user.dailyCalorieGoal) * 100)}%`;
    document.getElementById('protein-bar').style.width = `${Math.min(100, (proteinConsumed / appData.user.dailyProteinGoal) * 100)}%`;
    document.getElementById('carbs-bar').style.width = `${Math.min(100, (carbsConsumed / appData.user.dailyCarbsGoal) * 100)}%`;
    document.getElementById('fat-bar').style.width = `${Math.min(100, (fatConsumed / appData.user.dailyFatGoal) * 100)}%`;
    
    // Update progress text
    document.getElementById('calories-progress').textContent = `${caloriesConsumed}/${appData.user.dailyCalorieGoal}`;
    document.getElementById('protein-progress').textContent = `${proteinConsumed}g/${appData.user.dailyProteinGoal}g`;
    document.getElementById('carbs-progress').textContent = `${carbsConsumed}g/${appData.user.dailyCarbsGoal}g`;
    document.getElementById('fat-progress').textContent = `${fatConsumed}g/${appData.user.dailyFatGoal}g`;
}

// Update workout tab with scheduled workouts and history
function updateWorkoutTab() {
    // Clear all day contents
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        document.getElementById(`${day}-workout`).innerHTML = '';
    });
    
    // Populate scheduled workouts
    appData.workouts.scheduled.forEach(workout => {
        const workoutElement = document.createElement('div');
        workoutElement.className = 'workout-item';
        workoutElement.innerHTML = `
            <span class="workout-time">${workout.time}</span>
            <span class="workout-name">${workout.name}</span>
            <span class="workout-duration">${workout.duration} min</span>
        `;
        
        document.getElementById(`${workout.day}-workout`).appendChild(workoutElement);
    });
    
    // Update workout history
    const historyList = document.getElementById('workout-history-list');
    historyList.innerHTML = '';
    
    // Sort workouts by date, most recent first
    const sortedHistory = [...appData.workouts.history].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedHistory.slice(0, 5).forEach(workout => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(workout.date);
        const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        historyItem.innerHTML = `
            <div class="workout-details">
                <div class="workout-name">${workout.name}</div>
                <div class="workout-date">${formattedDate}</div>
            </div>
            <div class="workout-stats">
                <span>${workout.duration} min</span>
                <span>${workout.caloriesBurned} cal</span>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// Setup charts for the dashboard
function setupCharts() {
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    
    // Get data for the last 7 days
    const dates = [];
    const caloriesData = [];
    const workoutData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dates.push(date.toLocaleDateString([], { weekday: 'short' }));
        
        // Get calories for this date
        const dayFoods = appData.foodLog.filter(food => food.date === dateString);
        const dayCalories = dayFoods.reduce((total, food) => total + food.calories, 0);
        caloriesData.push(dayCalories);
        
        // Get workout minutes for this date
        const dayWorkouts = appData.workouts.history.filter(workout => {
            const workoutDate = new Date(workout.date).toISOString().split('T')[0];
            return workoutDate === dateString;
        });
        const dayWorkoutMinutes = dayWorkouts.reduce((total, workout) => total + workout.duration, 0);
        workoutData.push(dayWorkoutMinutes);
    }
    
    // Create the chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Calories',
                    data: caloriesData,
                    backgroundColor: '#4f46e5',
                    borderColor: '#4f46e5',
                    yAxisID: 'y'
                },
                {
                    label: 'Workout (min)',
                    data: workoutData,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    yAxisID: 'y1',
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calories'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Workout (min)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Add a workout reminder
function addWorkoutReminder(workout) {
    // Format the message
    const message = `Workout: ${workout.name} at ${workout.time}`;
    
    // Add to reminders
    appData.reminders.push({
        id: workout.id,
        message,
        type: 'workout',
        workoutId: workout.id
    });
    
    saveData();
    updateDashboard();
}

// Check for workout reminders based on current time
// Check for workout reminders based on current time
function checkWorkoutReminders() {
    const now = new Date();
    // Fix: Use long format and convert to lowercase
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Find workouts scheduled for today
    const todaysWorkouts = appData.workouts.scheduled.filter(workout => workout.day === currentDay);
    
    // Rest of the function...

    todaysWorkouts.forEach(workout => {
        // Parse workout time
        const [hours, minutes] = workout.time.split(':').map(Number);
        const workoutTime = new Date();
        workoutTime.setHours(hours, minutes, 0);
        
        // Calculate time difference in minutes
        const timeDiff = (workoutTime - now) / (1000 * 60);
        
        // If workout is within the next hour
        if (timeDiff > 0 && timeDiff <= 60) {
            // Check if reminder already exists
            const reminderExists = appData.reminders.some(reminder => 
                reminder.type === 'workout' && reminder.workoutId === workout.id
            );
            
            if (!reminderExists) {
                addWorkoutReminder(workout);
                
                // Show notification if supported
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('MotionX Workout Reminder', {
                        body: `Your ${workout.name} workout is scheduled in ${Math.round(timeDiff)} minutes.`
                    });
                }
            }
        }
    });
    
    // Check again in 5 minutes
    setTimeout(checkWorkoutReminders, 5 * 60 * 1000);
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

// Send message to the assistant
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    userInput.value = '';
    
    // Get response locally
    const response = getFitnessResponse(message);
    
    // Add AI response to chat
    addMessageToChat(response, 'assistant');
}

// Add a message to the chat interface
function addMessageToChat(message, sender, className = '') {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender} ${className}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message;
    
    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Comprehensive local response system for fitness assistant
function getFitnessResponse(message) {
    const messageLower = message.toLowerCase();
    
    // Workout recommendations
    if (messageLower.includes('workout') && (messageLower.includes('recommend') || messageLower.includes('suggest'))) {
        return "For a balanced week, I'd recommend: 2 days of strength training, 2 days of cardio, 1 day of flexibility work like yoga, and 2 rest days. Start with 30-minute sessions and gradually increase duration as your fitness improves.";
    }
    
    // Beginner workout plans
    if ((messageLower.includes('beginner') || messageLower.includes('new')) && messageLower.includes('workout')) {
        return "Great beginner workout: Start with 3 days/week. Day 1: Full body strength (squats, push-ups, assisted pull-ups, 2 sets each). Day 2: 20-min walk/jog intervals. Day 3: Yoga or mobility work. Focus on form, not intensity, and gradually increase over 4-6 weeks.";
    }
    
    // Home workouts
    if (messageLower.includes('home') && messageLower.includes('workout')) {
        return "Effective home workout: 4 rounds of: 12 squats, 10 push-ups (modify on knees if needed), 10 walking lunges, 30-second plank, 30 jumping jacks. Rest 60 seconds between rounds. No equipment needed and it targets all major muscle groups.";
    }
    
    // Calorie and weight management
    if (messageLower.includes('calorie') && (messageLower.includes('burn') || messageLower.includes('deficit'))) {
        return "A safe calorie deficit is 500 calories per day, which leads to about 1 pound of weight loss per week. Combine reduced calorie intake with increased physical activity for best results.";
    }
    
    // Calculate calories
    if (messageLower.includes('calculate') && messageLower.includes('calories')) {
        return "To estimate daily calories: Multiply your weight (in pounds) by 15 if you're moderately active, 13 if sedentary, or 18 if very active. For weight loss, subtract 500 from this number. For weight gain, add 300-500 calories. Adjust based on results after 2-3 weeks.";
    }
    
    if (messageLower.includes('weight') && messageLower.includes('loss')) {
        return "Sustainable weight loss combines nutrition, exercise, and lifestyle changes. Aim for 1-2 pounds per week through a moderate calorie deficit and increased activity. Focus on whole foods and consistency rather than quick fixes.";
    }
    
    // Weight gain advice
    if (messageLower.includes('weight') && messageLower.includes('gain')) {
        return "For healthy weight gain, aim for a 300-500 calorie surplus daily. Focus on nutrient-dense foods like nuts, avocados, olive oil, whole grains, and lean proteins. Combine with strength training 3-4 times weekly to promote muscle growth. Track progress weekly.";
    }
    
    // Nutrition advice
    if (messageLower.includes('protein') || messageLower.includes('macros')) {
        return "For active individuals, aim for 1.6-2.2g of protein per kg of bodyweight daily. For a balanced macro split, try 40% carbs, 30% protein, and 30% fat to start, then adjust based on your specific goals and how your body responds.";
    }
    
    // Protein sources
    if (messageLower.includes('protein') && messageLower.includes('source')) {
        return "Top protein sources: Chicken breast (31g per 100g), Greek yogurt (10g per 100g), eggs (6g each), lentils (9g per 100g), tofu (8g per 100g), cottage cheese (11g per 100g), whey protein (25g per scoop), quinoa (4g per 100g cooked), tuna (25g per 100g), and tempeh (19g per 100g).";
    }
    
    // Vegetarian protein
    if ((messageLower.includes('vegetarian') || messageLower.includes('vegan')) && messageLower.includes('protein')) {
        return "Great plant-based proteins: Lentils (18g/cup), tofu (20g/cup), tempeh (31g/cup), seitan (25g/100g), edamame (17g/cup), chickpeas (15g/cup), quinoa (8g/cup), nutritional yeast (8g/2 tbsp), hemp seeds (10g/3 tbsp), and plant protein powders (20-30g/scoop).";
    }
    
    if (messageLower.includes('recipe') || messageLower.includes('meal')) {
        return "Quick high-protein meal: Grilled chicken breast (30g protein), 1 cup quinoa (8g protein), and roasted vegetables. Season with olive oil, garlic, and herbs. Takes 20 minutes to prepare and provides balanced nutrition.";
    }
    
    // Meal prep ideas
    if (messageLower.includes('meal prep') || messageLower.includes('prep')) {
        return "Efficient meal prep: Sunday batch cook: 1) Bake 6 chicken breasts with different seasonings, 2) Cook 2 cups quinoa and 2 cups brown rice, 3) Roast 2 trays of mixed vegetables, 4) Prepare overnight oats in 5 containers. Store in portions for grab-and-go meals all week.";
    }
    
    // Healthy snacks
    if (messageLower.includes('snack')) {
        return "Nutritious snacks under 200 calories: 1 apple with 1 tbsp almond butter, 1/4 cup hummus with vegetables, 1 hard-boiled egg with fruit, Greek yogurt with berries, 1/4 cup nuts, cottage cheese with pineapple, or a protein shake with berries and water.";
    }
    
    // Motivation and habits
    if (messageLower.includes('motivation') || messageLower.includes('habit')) {
        return "To build a fitness habit: 1) Start small (even just 10 minutes), 2) Schedule workouts like important meetings, 3) Find activities you enjoy, 4) Track your progress, 5) Reward yourself after consistency milestones, and 6) Find an accountability partner or community.";
    }
    
    // Tracking progress
    if (messageLower.includes('track') || messageLower.includes('progress')) {
        return "Track fitness progress using multiple metrics: 1) Workout performance (weights/reps/speed), 2) Body measurements (not just weight), 3) Progress photos (every 4 weeks), 4) Energy levels and mood, 5) Recovery quality, and 6) Fitness tests every 6-8 weeks.";
    }
    
    // Recovery advice
    if (messageLower.includes('recovery') || messageLower.includes('sore')) {
        return "Optimize recovery: 1) Ensure 7-9 hours of quality sleep, 2) Stay hydrated (aim for clear/light yellow urine), 3) Consume protein within 30-60 minutes post-workout, 4) Implement active recovery (light walking or yoga) between intense sessions, 5) Consider foam rolling for tight muscles.";
    }
    
    // Specific training types
    if (messageLower.includes('muscle') || messageLower.includes('strength')) {
        return "To build muscle, focus on progressive overload (gradually increasing weight/reps), consume sufficient protein (1.6-2g per kg bodyweight), ensure adequate recovery between workouts, and maintain a slight caloric surplus.";
    }
    
    // Specific muscle group: Chest
    if (messageLower.includes('chest') && messageLower.includes('exercise')) {
        return "Top chest exercises: 1) Bench press (flat, incline, decline), 2) Push-ups and variations, 3) Dumbbell flyes, 4) Cable crossovers, 5) Chest dips. For balanced development, include various angles (incline/decline) and both compound and isolation movements.";
    }
    
    // Specific muscle group: Legs
    if (messageLower.includes('leg') && messageLower.includes('exercise')) {
        return "Effective leg exercises: 1) Squats (back, front, goblet), 2) Deadlifts (conventional, Romanian), 3) Lunges (walking, reverse, lateral), 4) Leg press, 5) Hip thrusts, 6) Calf raises, 7) Bulgarian split squats. Include both hip-dominant and knee-dominant movements for complete development.";
    }
    
    // Specific muscle group: Back
    if (messageLower.includes('back') && messageLower.includes('exercise')) {
        return "Complete back workout: 1) Pull-ups or lat pulldowns, 2) Rows (bent-over, cable, seated), 3) Deadlifts, 4) Face pulls, 5) Reverse flyes. Aim to include vertical pulling, horizontal pulling, and rear deltoid work for balanced development.";
    }
    
    // Arms training
    if ((messageLower.includes('arm') || messageLower.includes('bicep') || messageLower.includes('tricep')) && messageLower.includes('exercise')) {
        return "Balanced arm workout: Biceps: 1) Barbell curls, 2) Hammer curls, 3) Incline dumbbell curls. Triceps: 1) Dips, 2) Skull crushers, 3) Pushdowns. Perform 3 sets of 8-12 reps for each. For best results, train arms 2x weekly with 48 hours recovery between.";
    }
    
    if (messageLower.includes('cardio') || messageLower.includes('running')) {
        return "Effective cardio training varies by fitness level. For beginners, try 20-30 minutes of moderate activity 3x weekly. Include a mix of steady-state cardio and interval training for optimal results. Always warm up properly to prevent injury.";
    }
    
    // HIIT workout
    if (messageLower.includes('hiit') || (messageLower.includes('high') && messageLower.includes('intensity'))) {
        return "Sample HIIT workout: Warm up 5 min, then 8 rounds of: 30s jumping squats, 30s mountain climbers, 30s burpees, 30s rest. Cool down 5 min. Total time: 25 min. Start with 4 rounds if you're new to HIIT, and ensure proper form throughout.";
    }
    
    // Stretching
    if (messageLower.includes('stretch') || messageLower.includes('flexibility')) {
        return "Daily stretching routine (10 mins): Hold each for 30s/side: 1) Standing hamstring stretch, 2) Quadriceps pull, 3) Chest doorway stretch, 4) Cat-cow for spine, 5) Hip flexor lunge, 6) Shoulder cross-body pull, 7) Seated spinal twist, 8) Downward dog for full body.";
    }
    
    // Injury prevention
    if (messageLower.includes('injury') || messageLower.includes('prevent')) {
        return "Prevent injuries by: 1) Always warming up properly (5-10 min), 2) Focusing on proper technique over heavy weights, 3) Increasing intensity gradually (5-10% weekly), 4) Balancing opposing muscle groups, 5) Taking adequate rest days, 6) Incorporating mobility work, 7) Listening to your body's signals.";
    }
    
    // Supplements
    if (messageLower.includes('supplement')) {
        return "Evidence-based supplements: 1) Protein powder (convenience for intake goals), 2) Creatine monohydrate (5g daily for strength/performance), 3) Vitamin D (if deficient/limited sun exposure), 4) Omega-3s (overall health, may reduce inflammation), 5) Caffeine (pre-workout performance). Always prioritize whole foods first.";
    }
    
    // Sleep and fitness
    if (messageLower.includes('sleep')) {
        return "Sleep significantly impacts fitness results. Aim for 7-9 quality hours nightly. Poor sleep increases stress hormones, reduces recovery, lowers workout performance, and can increase hunger hormones. Establish a consistent sleep schedule and limit screen time before bed.";
    }
    
    // Fasting and fitness
    // Fasting and fitness (continuing from the truncated portion)
if (messageLower.includes('fasting') || messageLower.includes('intermittent')) {
    return "Intermittent fasting can work with fitness goals. Common protocols include 16:8 (16hr fast, 8hr eating window) or 14:10. Schedule intense workouts during/near your eating window. Ensure adequate protein intake (1.6-2.2g/kg) within your eating window to support muscle maintenance and recovery.";
}

// Pre-workout nutrition
if (messageLower.includes('pre') && messageLower.includes('workout')) {
    return "Ideal pre-workout nutrition: Eat 1-3 hours before training with a meal containing carbs (for energy) and moderate protein. Close to workout time (30-60min), aim for easily digestible options like a banana with a small protein shake. Hydrate with 16-20oz of water in the 2 hours before exercise.";
}

// Post-workout nutrition
if (messageLower.includes('post') && messageLower.includes('workout')) {
    return "Post-workout, aim to consume protein (20-40g) and carbs within 30-60 minutes to optimize recovery. Good options include a protein shake with fruit, Greek yogurt with berries, or chicken with rice. This timing helps replenish glycogen stores and provides amino acids for muscle repair.";
}

// Weight plateau help
if ((messageLower.includes('plateau') || messageLower.includes('stuck')) && messageLower.includes('weight')) {
    return "To break through a weight plateau: 1) Recalculate your calorie needs (metabolism changes), 2) Track food intake meticulously for a week (portions often creep up), 3) Increase protein intake slightly, 4) Add more NEAT activity (daily walking), 5) Consider cycling calories (higher some days, lower others), 6) Change up your workout routine to create new stimulus.";
}

// Hydration advice
if (messageLower.includes('water') || messageLower.includes('hydration')) {
    return "Proper hydration improves performance by up to 25%. Aim for 0.5-1oz of water per pound of bodyweight daily, with additional 16-20oz for every hour of exercise. Signs of dehydration include dark urine, headaches, fatigue, and decreased performance. Electrolytes are important for intense or long-duration activities.";
}

// Weightlifting for beginners
if ((messageLower.includes('weight') || messageLower.includes('strength')) && messageLower.includes('beginner')) {
    return "Beginner weightlifting tips: 1) Start with compound movements (squat, deadlift, bench, row), 2) Begin with bodyweight or light weights to master form, 3) Follow a structured program (3 days/week is perfect), 4) Rest 48 hours between training the same muscle group, 5) Progressive overload by adding small weight increases (2.5-5lbs) when you can complete all reps with good form.";
}

// Morning workouts
if (messageLower.includes('morning') && messageLower.includes('workout')) {
    return "Morning workout tips: 1) Prepare workout clothes/equipment the night before, 2) Hydrate immediately upon waking, 3) Have a simple carb source if needed (banana or toast), 4) Do a thorough warm-up as your body is stiffer, 5) Start with dynamic movements rather than static stretches, 6) Consider caffeine 15-30 minutes pre-workout if tolerated.";
}

// Evening workouts
if ((messageLower.includes('evening') || messageLower.includes('night')) && messageLower.includes('workout')) {
    return "Evening workout advantages: Often higher natural strength, better hydration/nutrition status, and can help transition from work to home life. Tips: 1) Avoid intense exercise 1-2 hours before bed if sleep is affected, 2) Consider limiting caffeine if used pre-workout, 3) Have a light carb/protein meal 1-2 hours before, 4) Use as stress relief from the workday.";
}

// Rest days importance
if (messageLower.includes('rest') && messageLower.includes('day')) {
    return "Rest days are essential for progress. Benefits include: muscle repair, glycogen replenishment, nervous system recovery, hormonal balance, and injury prevention. Active recovery (light walking, swimming, yoga) can enhance recovery while maintaining activity. Most people benefit from 2-3 rest days weekly, depending on workout intensity.";
}

// Fitness for busy schedules
if (messageLower.includes('busy') || (messageLower.includes('no') && messageLower.includes('time'))) {
    return "Fitness for busy schedules: 1) High-intensity intervals (20min), 2) Supersetting exercises to save time, 3) Split workouts into 2 shorter sessions if possible (morning/evening), 4) Schedule workouts like meetings, 5) Prepare quick protein-rich meals in batch, 6) Mini-workouts throughout day (desk squats, walking meetings), 7) 7-minute scientific workout app for ultra-busy days.";
}

// Home gym essentials
if (messageLower.includes('home') && messageLower.includes('gym')) {
    return "Home gym essentials on a budget: 1) Adjustable dumbbells (most versatile), 2) Resistance bands set, 3) Pull-up bar (doorway), 4) Yoga/exercise mat, 5) Jump rope. With these items, you can train all major muscle groups effectively. Add a bench and kettlebells if budget allows.";
}

// Kettlebell workouts
if (messageLower.includes('kettlebell')) {
    return "Full-body kettlebell circuit: 3-5 rounds of: 1) 10 kettlebell swings, 2) 8 goblet squats, 3) 8 single-arm rows each side, 4) 10 overhead presses alternating sides, 5) 10 Russian twists each side. Rest 60s between rounds. One kettlebell provides an efficient full-body workout targeting strength, power, and cardiovascular fitness.";
}

// Bodyweight workouts
if (messageLower.includes('bodyweight') || messageLower.includes('no equipment')) {
    return "Advanced bodyweight workout: 4 rounds of: 1) 15 push-up variations, 2) 12 single-leg squats per leg, 3) 10 burpees, 4) 30s handstand or pike hold, 5) 20 mountain climbers, 6) 10 tuck jumps. Rest 90s between rounds. Bodyweight training can be scaled to any fitness level by modifying leverage and stability factors.";
}

// Mobility work
if (messageLower.includes('mobility')) {
    return "Daily 10-minute mobility routine: 1) Hip 90/90 transitions (1min), 2) Thoracic rotations (1min), 3) Shoulder CARs (1min), 4) Squat-to-stand (1min), 5) Ankle rocks (1min), 6) Wrist circles (30s), 7) Neck half-circles (30s), 8) Hip CARs (2min), 9) World's greatest stretch (2min). Movement quality trumps quantity - move slowly and mindfully.";
}

// Ab/core training
if (messageLower.includes('ab') || messageLower.includes('core')) {
    return "Functional core circuit: 3 rounds of: 1) Plank with shoulder taps (45s), 2) Dead bugs (45s), 3) Side planks (30s each), 4) Bird-dogs (45s), 5) Hollow body hold (30s). Rest 30s between exercises. Effective core training should include anti-rotation, anti-extension, and anti-lateral flexion movements, not just flexion (sit-ups).";
}

// How often to exercise
if (messageLower.includes('how') && messageLower.includes('often') && messageLower.includes('exercise')) {
    return "Exercise frequency depends on goals and recovery capacity. General guidelines: Strength training: 3-5x weekly with at least 48hrs between sessions for same muscle groups. Cardio: 2-5x weekly varying intensity. Beginners: Start with 3 total sessions/week (mix of cardio/strength) and gradually increase. Advanced: Up to 6 sessions with proper periodization.";
}

// Exercise during illness
if ((messageLower.includes('sick') || messageLower.includes('ill')) && messageLower.includes('exercise')) {
    return "Exercise when sick: Use the 'neck check' - symptoms only above the neck (mild cold, nasal congestion)? Reduce intensity to 50% and duration to 30-50% of normal. Symptoms below neck (fever, cough, body aches, stomach issues)? Rest completely until recovered. Always prioritize sleep and hydration when fighting illness.";
}

// Healthy weight range
if (messageLower.includes('healthy') && messageLower.includes('weight')) {
    return "Healthy weight varies by individual factors. BMI (18.5-24.9) provides general guidelines but doesn't account for muscle mass or body composition. Waist-to-height ratio (under 0.5) can be more useful. Focus on health markers like energy levels, sleep quality, and bloodwork rather than just scale weight.";
}

// Fiber information
if (messageLower.includes('fiber')) {
    return "Dietary fiber: Aim for 25-35g daily. Soluble fiber (oats, beans, fruits) helps with blood glucose and cholesterol. Insoluble fiber (whole grains, vegetables) supports digestion and regularity. Increase fiber intake gradually to avoid discomfort, and pair with adequate hydration. Top sources: chia seeds (10g/oz), beans (15g/cup), berries (8g/cup), avocados (10g/each), and whole grains.";
}

// Fat loss tips
if (messageLower.includes('fat') && messageLower.includes('loss')) {
    return "Optimize fat loss: 1) Maintain protein intake (0.8-1g per lb bodyweight), 2) Create moderate calorie deficit (15-20% below maintenance), 3) Preserve muscle with resistance training 3-4x weekly, 4) Include both HIIT and moderate-intensity cardio, 5) Prioritize sleep (poor sleep increases hunger hormones), 6) Manage stress levels (high cortisol can inhibit fat loss), 7) Stay consistent for at least 8-12 weeks.";
}

// Default response for unrecognized queries
return "I'm your fitness assistant. I can help with workout recommendations, nutrition advice, recovery tips, and more. What specific fitness information are you looking for today?";
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);