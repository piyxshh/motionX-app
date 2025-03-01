const STORAGE_KEY = 'motionx-data';

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

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

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

function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function setupEventListeners() {
    document.getElementById('add-meal-btn').addEventListener('click', () => showModal('food-modal'));
    document.getElementById('log-workout-btn').addEventListener('click', () => showModal('log-workout-modal'));
    
    document.getElementById('add-food-btn').addEventListener('click', () => showModal('food-modal'));
    
    document.getElementById('add-workout-btn').addEventListener('click', () => showModal('workout-modal'));
    
    document.getElementById('food-form').addEventListener('submit', handleFoodSubmit);
    document.getElementById('workout-form').addEventListener('submit', handleWorkoutSubmit);
    document.getElementById('log-workout-form').addEventListener('submit', handleLogWorkoutSubmit);
    
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => closeAllModals());
    });
    
    document.getElementById('send-message-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

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
    
    document.getElementById('food-form').reset();
    closeAllModals();
}

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
    
    document.getElementById('workout-form').reset();
    closeAllModals();
}

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
    
    document.getElementById('log-workout-form').reset();
    closeAllModals();
}

function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    const todaysFoods = appData.foodLog.filter(food => food.date === today);
    const caloriesConsumed = todaysFoods.reduce((total, food) => total + food.calories, 0);
    const proteinConsumed = todaysFoods.reduce((total, food) => total + food.protein, 0);
    
    const todaysWorkouts = appData.workouts.history.filter(workout => {
        const workoutDate = new Date(workout.date).toISOString().split('T')[0];
        return workoutDate === today;
    });
    
    document.getElementById('calories-today').textContent = caloriesConsumed;
    document.getElementById('protein-today').textContent = proteinConsumed + 'g';
    document.getElementById('workout-status').textContent = todaysWorkouts.length > 0 ? 'Completed' : 'Not done';
    
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

function updateNutritionTab() {
    const today = new Date().toISOString().split('T')[0];
    
    const todaysFoods = appData.foodLog.filter(food => food.date === today);
    
    document.getElementById('breakfast-list').innerHTML = '';
    document.getElementById('lunch-list').innerHTML = '';
    document.getElementById('dinner-list').innerHTML = '';
    document.getElementById('snacks-list').innerHTML = '';
    
    todaysFoods.forEach(food => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="food-name">${food.name}</span>
            <span class="food-calories">${food.calories} cal</span>
        `;
        
        document.getElementById(`${food.category}-list`).appendChild(li);
    });
    
    const caloriesConsumed = todaysFoods.reduce((total, food) => total + food.calories, 0);
    const proteinConsumed = todaysFoods.reduce((total, food) => total + food.protein, 0);
    const carbsConsumed = todaysFoods.reduce((total, food) => total + food.carbs, 0);
    const fatConsumed = todaysFoods.reduce((total, food) => total + food.fat, 0);
    
    document.getElementById('calories-bar').style.width = `${Math.min(100, (caloriesConsumed / appData.user.dailyCalorieGoal) * 100)}%`;
    document.getElementById('protein-bar').style.width = `${Math.min(100, (proteinConsumed / appData.user.dailyProteinGoal) * 100)}%`;
    document.getElementById('carbs-bar').style.width = `${Math.min(100, (carbsConsumed / appData.user.dailyCarbsGoal) * 100)}%`;
    document.getElementById('fat-bar').style.width = `${Math.min(100, (fatConsumed / appData.user.dailyFatGoal) * 100)}%`;
    
    document.getElementById('calories-progress').textContent = `${caloriesConsumed}/${appData.user.dailyCalorieGoal}`;
    document.getElementById('protein-progress').textContent = `${proteinConsumed}g/${appData.user.dailyProteinGoal}g`;
    document.getElementById('carbs-progress').textContent = `${carbsConsumed}g/${appData.user.dailyCarbsGoal}g`;
    document.getElementById('fat-progress').textContent = `${fatConsumed}g/${appData.user.dailyFatGoal}g`;
}

function updateWorkoutTab() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        document.getElementById(`${day}-workout`).innerHTML = '';
    });
    
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
    
    const historyList = document.getElementById('workout-history-list');
    historyList.innerHTML = '';
    
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

function setupCharts() {
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    
    const dates = [];
    const caloriesData = [];
    const workoutData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dates.push(date.toLocaleDateString([], { weekday: 'short' }));
        
        const dayFoods = appData.foodLog.filter(food => food.date === dateString);
        const dayCalories = dayFoods.reduce((total, food) => total + food.calories, 0);
        caloriesData.push(dayCalories);
        
        const dayWorkouts = appData.workouts.history.filter(workout => {
            const workoutDate = new Date(workout.date).toISOString().split('T')[0];
            return workoutDate === dateString;
        });
        const dayWorkoutMinutes = dayWorkouts.reduce((total, workout) => total + workout.duration, 0);
        workoutData.push(dayWorkoutMinutes);
    }
    
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

function addWorkoutReminder(workout) {
    const message = `Workout: ${workout.name} at ${workout.time}`;
    
    appData.reminders.push({
        id: workout.id,
        message,
        type: 'workout',
        workoutId: workout.id
    });
    
    saveData();
    updateDashboard();
}

function checkWorkoutReminders() {
    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    
    const todaysWorkouts = appData.workouts.scheduled.filter(workout => workout.day === currentDay);

    todaysWorkouts.forEach(workout => {
        const [hours, minutes] = workout.time.split(':').map(Number);
        const workoutTime = new Date();
        workoutTime.setHours(hours, minutes, 0);
        
        const timeDiff = (workoutTime - now) / (1000 * 60);
        
        if (timeDiff > 0 && timeDiff <= 60) {
            const reminderExists = appData.reminders.some(reminder => 
                reminder.type === 'workout' && reminder.workoutId === workout.id
            );
            
            if (!reminderExists) {
                addWorkoutReminder(workout);
                
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('MotionX Workout Reminder', {
                        body: `Your ${workout.name} workout is scheduled in ${Math.round(timeDiff)} minutes.`
                    });
                }
            }
        }
    });
    
    setTimeout(checkWorkoutReminders, 5 * 60 * 1000);
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    addMessageToChat(message, 'user');
    
    userInput.value = '';
    
    const response = getFitnessResponse(message);
    
    addMessageToChat(response, 'assistant');
}

function addMessageToChat(message, sender, className = '') {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender} ${className}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message;
    
    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getFitnessResponse(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('workout') && (messageLower.includes('recommend') || messageLower.includes('suggest'))) {
        return "For a balanced week, I'd recommend: 2 days of strength training, 2 days of cardio, 1 day of flexibility work like yoga, and 2 rest days. Start with 30-minute sessions and gradually increase duration as your fitness improves.";
    }
    
    if ((messageLower.includes('beginner') || messageLower.includes('new')) && messageLower.includes('workout')) {
        return "Great beginner workout: Start with 3 days/week. Day 1: Full body strength (squats, push-ups, assisted pull-ups, 2 sets each). Day 2: 20-min walk/jog intervals. Day 3: Yoga or mobility work. Focus on form, not intensity, and gradually increase over 4-6 weeks.";
    }
    
    if (messageLower.includes('home') && messageLower.includes('workout')) {
        return "Effective home workout: 4 rounds of: 12 squats, 10 push-ups (modify on knees if needed), 10 walking lunges, 30-second plank, 30 jumping jacks. Rest 60 seconds between rounds. No equipment needed and it targets all major muscle groups.";
    }
    
    if (messageLower.includes('calorie') && (messageLower.includes('burn') || messageLower.includes('deficit'))) {
        return "A safe calorie deficit is 500 calories per day, which leads to about 1 pound of weight loss per week. Combine reduced calorie intake with increased physical activity for best results.";
    }
    
    if (messageLower.includes('calculate') && messageLower.includes('calories')) {
        return "To estimate daily calories: Multiply your weight (in pounds) by 15 if you're moderately active, 13 if sedentary, or 18 if very active. For weight loss, subtract 500 from this number. For weight gain, add 300-500 calories. Adjust based on results after 2-3 weeks.";
    }
    
    if (messageLower.includes('weight') && messageLower.includes('loss')) {
        return "Sustainable weight loss combines nutrition, exercise, and lifestyle changes. Aim for 1-2 pounds per week through a moderate calorie deficit and increased activity. Focus on whole foods and consistency rather than quick fixes.";
    }
    
    if (messageLower.includes('weight') && messageLower.includes('gain')) {
        return "For healthy weight gain, aim for a 300-500 calorie surplus daily. Focus on nutrient-dense foods like nuts, avocados, olive oil, whole grains, and lean proteins. Combine with strength training 3-4 times weekly to promote muscle growth. Track progress weekly.";
    }
    
    if (messageLower.includes('protein') || messageLower.includes('macros')) {
        return "For active individuals, aim for 1.6-2.2g of protein per kg of bodyweight daily. For a balanced macro split, try 40% carbs, 30% protein, and 30% fat to start, then adjust based on your specific goals and how your body responds.";
    }
    
    if (messageLower.includes('protein') && messageLower.includes('source')) {
        return "Top protein sources: Chicken breast (31g per 100g), Greek yogurt (10g per 100g), eggs (6g each), lentils (9g per 100g), tofu (8g per 100g), cottage cheese (11g per 100g), whey protein (25g per scoop), quinoa (4g per 100g cooked), tuna (25g per 100g), and tempeh (19g per 100g).";
    }
    
    if ((messageLower.includes('vegetarian') || messageLower.includes('vegan')) && messageLower.includes('protein')) {
        return "Great plant-based proteins: Lentils (18g/cup), tofu (20g/cup), tempeh (31g/cup), seitan (25g/100g), edamame (17g/cup), chickpeas (15g/cup), quinoa (8g/cup), nutritional yeast (8g/2 tbsp), hemp seeds (10g/3 tbsp), and plant protein powders (20-30g/scoop).";
    }
    
    if (messageLower.includes('recipe') || messageLower.includes('meal')) {
        return "Quick high-protein meal: Grilled chicken breast (30g protein), 1 cup quinoa (8g protein), and roasted vegetables. Season with olive oil, garlic, and herbs. Takes 20 minutes to prepare and provides balanced nutrition.";
    }
    
    if (messageLower.includes('meal prep') || messageLower.includes('prep')) {
        return "Efficient meal prep: Sunday batch cook: 1) Bake 6 chicken breasts with different seasonings, 2) Cook 2 cups quinoa and 2 cups brown rice, 3) Roast 2 trays of mixed vegetables, 4) Prepare overnight oats in 5 containers. Store in portions for grab-and-go meals all week.";
    }
    
    if (messageLower.includes('snack')) {
        return "Nutritious snacks under 200 calories: 1 apple with 1 tbsp almond butter, 1/4 cup hummus with vegetables, 1 hard-boiled egg with fruit, Greek yogurt with berries, 1/4 cup nuts, cottage cheese with pineapple, or a protein shake with berries and water.";
    }
    
    if (messageLower.includes('motivation') || messageLower.includes('habit')) {
        return "To build a fitness habit: 1) Start small (even just 10 minutes), 2) Schedule workouts like important meetings, 3) Find activities you enjoy, 4) Track your progress, 5) Reward yourself after consistency milestones, and 6) Find an accountability partner or community.";
    }
    
    if (messageLower.includes('track') || messageLower.includes('progress')) {
        return "Track fitness progress using multiple metrics: 1) Workout performance (weights/reps/speed), 2) Body measurements (not just weight), 3) Progress photos (every 4 weeks), 4) Energy levels and mood, 5) Recovery quality, and 6) Fitness tests every 6-8 weeks.";
    }
    
    if (messageLower.includes('recovery') || messageLower.includes('sore')) {
        return "Optimize recovery: 1) Ensure 7-9 hours of quality sleep, 2) Stay hydrated (aim for clear/light yellow urine), 3) Consume protein within 30-60 minutes post-workout, 4) Implement active recovery (light walking or yoga) between intense sessions, 5) Consider foam rolling for tight muscles.";
    }
    
    if (messageLower.includes('muscle') || messageLower.includes('strength')) {
        return "To build muscle, focus on progressive overload (gradually increasing weight/reps), consume sufficient protein (1.6-2g per kg bodyweight), ensure adequate recovery between workouts, and maintain a slight caloric surplus.";
    }
    
    if (messageLower.includes('chest') && messageLower.includes('exercise')) {
        return "Top chest exercises: 1) Bench press (flat, incline, decline), 2) Push-ups and variations, 3) Dumbbell flyes, 4) Cable crossovers, 5) Chest dips. For balanced development, include various angles (incline/decline) and both compound and isolation movements.";
    }
    
    if (messageLower.includes('leg') && messageLower.includes('exercise')) {
        return "Effective leg exercises: 1) Squats (back, front, goblet), 2) Deadlifts (conventional, Romanian), 3) Lunges (walking, reverse, lateral), 4) Leg press, 5) Hip thrusts, 6) Calf raises, 7) Bulgarian split squats. Include both hip-dominant and knee-dominant movements for complete development.";
    }
    
    if (messageLower.includes('back') && messageLower.includes('exercise')) {
        return "Complete back workout: 1) Pull-ups or lat pulldowns, 2) Rows (bent-over, cable, seated), 3) Deadlifts, 4) Face pulls, 5) Reverse flyes. Aim to include vertical pulling, horizontal pulling, and rear deltoid work for balanced development.";
    }
    
    if ((messageLower.includes('arm') || messageLower.includes('bicep') || messageLower.includes('tricep')) && messageLower.includes('exercise')) {
        return "Balanced arm workout: Biceps: 1) Barbell curls, 2) Hammer curls, 3) Incline dumbbell curls. Triceps: 1) Dips, 2) Skull crushers, 3) Pushdowns. Perform 3 sets of 8-12 reps for each. For best results, train arms 2x weekly with 48 hours recovery between.";
    }
    
    if (messageLower.includes('cardio') || messageLower.includes('running')) {
        return "Effective cardio training varies by fitness level. For beginners, try 20-30 minutes of moderate activity 3x weekly. Include a mix of steady-state cardio and interval training for optimal results. Always warm up properly to prevent injury.";
    }
    
    if (messageLower.includes('hiit') || (messageLower.includes('high') && messageLower.includes('intensity'))) {
        return "Sample HIIT workout: Warm up 5 min, then 8 rounds of: 30s jumping squats, 30s mountain climbers, 30s burpees, 30s rest. Cool down 5 min. Total time: 25 min. Start with 4 rounds if you're new to HIIT, and ensure proper form throughout.";
    }
    
    if (messageLower.includes('stretch') || messageLower.includes('flexibility')) {
        return "Daily stretching routine (10 mins): Hold each for 30s/side: 1) Standing hamstring stretch, 2) Quadriceps pull, 3) Chest doorway stretch, 4) Cat-cow for spine, 5) Hip flexor lunge, 6) Shoulder cross-body pull, 7) Seated spinal twist, 8) Downward dog for full body.";
    }
    
    if (messageLower.includes('injury') || messageLower.includes('prevent')) {
        return "Prevent injuries by: 1) Always warming up properly (5-10 min), 2) Focusing on proper technique over heavy weights, 3) Increasing intensity gradually (5-10% weekly), 4) Balancing opposing muscle groups, 5) Taking adequate rest days, 6) Incorporating mobility work, 7) Listening to your body's signals.";
    }
    
    if (messageLower.includes('supplement')) {
        return "Evidence-based supplements: 1) Protein powder (convenience for intake goals), 2) Creatine monohydrate (5g daily for strength/performance), 3) Vitamin D (if deficient/limited sun exposure), 4) Omega-3s (overall health, may reduce inflammation), 5) Caffeine (pre-workout performance). Always prioritize whole foods first.";
    }
    
    if (messageLower.includes('sleep')) {
        return "Sleep significantly impacts fitness results. Aim for 7-9 quality hours nightly. Poor sleep increases stress hormones, reduces recovery, lowers workout performance, and can increase hunger hormones. Establish a consistent sleep schedule and limit screen time before bed.";
    }
    
    if (messageLower.includes('fasting') || messageLower.includes('intermittent')) {
        return "Intermittent fasting can work with fitness goals. Common protocols include 16:8 (16hr fast, 8hr eating window) or 14:10. Schedule intense workouts during/near your eating window. Ensure adequate protein intake (1.6-2.2g/kg) within your eating window to support muscle maintenance and recovery.";
    }

    if (messageLower.includes('pre') && messageLower.includes('workout')) {
        return "Ideal pre-workout nutrition: Eat 1-3 hours before training with a meal containing carbs (for energy) and moderate protein. Close to workout time (30-60min), aim for easily digestible options like a banana with a small protein shake. Hydrate with 16-20oz of water in the 2 hours before exercise.";
    }

    if (messageLower.includes('post') && messageLower.includes('workout')) {
        return "Post-workout, aim to consume protein (20-40g) and carbs within 30-60 minutes to optimize recovery. Good options include a protein shake with fruit, Greek yogurt with berries, or chicken with rice. This timing helps replenish glycogen stores and provides amino acids for muscle repair.";
    }

    if ((messageLower.includes('plateau') || messageLower.includes('stuck')) && messageLower.includes('weight')) {
        return "To break through a weight plateau: 1) Recalculate your calorie needs (metabolism changes), 2) Track food intake meticulously for a week (portions often creep up), 3) Increase protein intake slightly, 4) Add more NEAT activity (daily walking), 5) Consider cycling calories (higher some days, lower others), 6) Change up your workout routine to create new stimulus.";
    }

    if (messageLower.includes('water') || messageLower.includes('hydration')) {
        return "Proper hydration enhances performance and recovery. Aim for 0.5-1oz per pound of bodyweight daily. During workouts, drink 7-10oz every 10-20 minutes. Clear or light yellow urine indicates good hydration. Increase intake during hot weather or intense training sessions.";
    }
    
    if (messageLower.includes('muscle') && messageLower.includes('sore')) {
        return "For muscle soreness: 1) Gentle stretching and foam rolling, 2) Light activity to increase blood flow, 3) Contrast therapy (alternating hot and cold), 4) Ensure protein intake of 1.6-2g/kg daily, 5) Consider 5-10g BCAAs if recovery is consistently poor, 6) Get 7-9 hours of quality sleep, 7) Stay well-hydrated to flush metabolic waste products.";
    }
    
    if (messageLower.includes('nutrition') && (messageLower.includes('tip') || messageLower.includes('advice'))) {
        return "Top nutrition tips: 1) Prioritize whole foods over processed options, 2) Aim for protein in every meal, 3) Include a variety of colorful vegetables daily, 4) Stay hydrated throughout the day, 5) Time carbs around workouts for energy, 6) Don't fear healthy fats from nuts, avocados, and olive oil, 7) Plan and prep meals to avoid poor choices when hungry.";
    }
    
    if (messageLower.includes('mobility') || messageLower.includes('warm up')) {
        return "Effective 5-minute warm-up: 1) 1 minute light cardio (jumping jacks/marching), 2) 10 arm circles each direction, 3) 10 bodyweight squats, 4) 10 hip circles each direction, 5) 10 torso twists, 6) 5 inchworms, 7) 10 lunges with rotation. This increases core temperature and primes movement patterns for safer training.";
    }
    
    if (messageLower.includes('rest day') || messageLower.includes('active recovery')) {
        return "Productive rest day activities: 1) 20-30 minutes of walking, 2) Gentle yoga or stretching sessions, 3) Light swimming, 4) Foam rolling tight muscles for 10-15 minutes, 5) Mobility drills targeting stiff areas. These enhance recovery without taxing your system, promoting blood flow without creating additional fatigue.";
    }
    
    if (messageLower.includes('weight') && messageLower.includes('maintain')) {
        return "To maintain weight after reaching your goal: 1) Reverse diet by gradually adding 100-200 calories weekly until you find maintenance level, 2) Continue regular strength training to preserve muscle mass, 3) Weigh yourself weekly to catch small fluctuations early, 4) Maintain protein intake at 0.8-1g per pound of bodyweight, 5) Stay active daily with at least 7,000-10,000 steps.";
    }
    
    if ((messageLower.includes('morning') || messageLower.includes('evening')) && messageLower.includes('workout')) {
        return "Morning workouts enhance consistency and may improve focus throughout the day. Evening workouts allow potentially better performance with higher body temperature and fueled muscles. Choose based on your schedule consistency and when you feel most energetic. The best time is whenever you'll actually do it regularly.";
    }
    
    if (messageLower.includes('body') && messageLower.includes('fat') && messageLower.includes('percentage')) {
        return "Healthy body fat percentage ranges: For men: 10-20% (athletes 6-13%), for women: 18-28% (athletes 14-20%). Below these ranges can impact hormone function. Measurement methods vary in accuracy: DEXA scans are most accurate, bioelectrical impedance scales are convenient but less accurate, calipers require proper technique.";
    }
    
    if (messageLower.includes('fiber') || (messageLower.includes('digest') && messageLower.includes('health'))) {
        return "For digestive health, aim for 25-35g fiber daily. Increase gradually to avoid discomfort. Top sources: chia seeds (10g/oz), lentils (15g/cup), black beans (15g/cup), avocados (10g each), raspberries (8g/cup), pears with skin (5.5g each), oatmeal (4g/cup), and broccoli (5g/cup). Stay well-hydrated when increasing fiber intake.";
    }
    
    if (messageLower.includes('training') && messageLower.includes('split')) {
        return "Effective training splits: Beginners: 3-day full body. Intermediate: Upper/Lower split 4 days/week or Push/Pull/Legs split. Advanced: 5-6 day Push/Pull/Legs or body part splits. Choose based on your recovery ability and available training days. Ensure each muscle group is trained 2-3 times weekly for optimal results.";
    }
    
    if (messageLower.includes('overtraining') || messageLower.includes('too much')) {
        return "Signs of overtraining: 1) Persistent fatigue despite adequate sleep, 2) Decreased performance and strength, 3) Elevated resting heart rate, 4) Increased injury frequency, 5) Irritability and mood changes, 6) Poor sleep quality, 7) Reduced immunity. If experiencing multiple symptoms, increase recovery time and reduce training volume by 40-50% for 1-2 weeks.";
    }
    
    if (messageLower.includes('goal') && messageLower.includes('setting')) {
        return "Effective fitness goal setting: Use the SMART framework - Specific, Measurable, Achievable, Relevant, Time-bound. Example: Instead of 'get stronger,' try 'increase squat by 20 pounds in 8 weeks by following a progressive overload program and training legs twice weekly.' Track progress, celebrate small wins, and reassess every 8-12 weeks.";
    }
    
    if (messageLower.includes('mental') && (messageLower.includes('health') || messageLower.includes('benefit'))) {
        return "Exercise mental health benefits: 1) Reduces anxiety and depression symptoms through endorphin release, 2) Improves sleep quality, 3) Reduces stress via lower cortisol levels, 4) Enhances cognitive function and memory, 5) Increases BDNF levels supporting brain health, 6) Provides sense of accomplishment and improved self-efficacy, 7) Creates structure and routine benefiting overall wellbeing.";
    }
    
    if (messageLower.includes('body') && messageLower.includes('weight') && messageLower.includes('exercise')) {
        return "Top bodyweight exercises: 1) Push-up variations (standard, incline, decline, diamond), 2) Pull-ups and chin-ups, 3) Dips, 4) Squats and pistol squats, 5) Lunges, 6) Glute bridges, 7) Plank variations, 8) Mountain climbers, 9) Burpees. Full-body workout: 3 rounds of 45 seconds each exercise with 15s rest between.";
    }
    
    if (messageLower.includes('vitamin') || messageLower.includes('mineral') || messageLower.includes('micronutrient')) {
        return "Key micronutrients for fitness: 1) Vitamin D (supports bone health, immunity, hormone function), 2) Magnesium (muscle function, recovery, sleep), 3) Iron (oxygen transport, energy production), 4) Zinc (immunity, hormone production, recovery), 5) B vitamins (energy metabolism, red blood cell production). Prioritize whole food sources before supplements.";
    }
    
    if (messageLower.includes('budget') && (messageLower.includes('diet') || messageLower.includes('food'))) {
        return "Budget-friendly healthy eating: 1) Buy proteins in bulk and freeze portions, 2) Choose frozen fruits/vegetables (equally nutritious), 3) Use beans/lentils as affordable protein sources, 4) Buy in-season produce, 5) Meal prep to reduce waste, 6) Purchase whole grains in bulk, 7) Shop store perimeters for whole foods, 8) Consider less expensive cuts of meat like chicken thighs vs. breasts.";
    }
    
    if (messageLower.includes('abs') || messageLower.includes('core')) {
        return "Effective core training: 1) Planks and variations, 2) Dead bugs, 3) Bird dogs, 4) Cable rotations, 5) Hanging leg raises, 6) Ab wheel rollouts, 7) Russian twists. Train core 2-3x weekly with progressive overload. Remember that visible abs require both core strength and low body fat percentage (typically under 15% for men, 22% for women).";
    }
    
    if (messageLower.includes('form') && messageLower.includes('check')) {
        return "For a squat form check: 1) Feet shoulder-width apart, 2) Toes slightly turned out, 3) Knees tracking over toes, 4) Maintain neutral spine, 5) Weight in heels and midfoot, 6) Proper depth is thighs parallel or deeper, 7) Brace core throughout movement. Consider recording yourself from side angle or working with a qualified coach for personalized feedback.";
    }

    if (messageLower.includes('glute') && messageLower.includes('exercise')) {
        return "Top glute exercises: 1) Hip thrusts (barbell or band), 2) Bulgarian split squats, 3) Romanian deadlifts, 4) Glute bridges, 5) Sumo squats, 6) Cable kickbacks, 7) Frog pumps. For optimal glute development, train 2-3 times weekly with progressive overload and ensure mind-muscle connection by focusing on the squeeze at the top of each movement.";
    }
    
    if (messageLower.includes('shoulder') && messageLower.includes('exercise')) {
        return "Complete shoulder workout: 1) Overhead press (seated or standing), 2) Lateral raises, 3) Face pulls for rear delts, 4) Front raises, 5) Reverse flys, 6) Upright rows. Ensure balanced development across all three deltoid heads. Start with compound movements, then move to isolation exercises, 3 sets of 8-12 reps for each exercise.";
    }
    
    if (messageLower.includes('joint') && messageLower.includes('pain')) {
        return "For joint pain: 1) Prioritize proper warm-up (5-10 min), 2) Consider glucosamine/chondroitin supplements (1500mg/1200mg daily), 3) Include omega-3 fatty acids (2-4g daily), 4) Apply RICE (Rest, Ice, Compression, Elevation) for acute pain, 5) Modify exercises to pain-free ranges, 6) Strengthen supporting muscles, 7) Consult a physical therapist for persistent issues. Don't ignore pain that lasts more than a week.";
    }
    
    if (messageLower.includes('strength') && messageLower.includes('plateau')) {
        return "Breaking strength plateaus: 1) Implement periodization (vary volume/intensity systematically), 2) Try new techniques like drop sets, rest-pause, or supersets, 3) Ensure sufficient recovery (deload every 4-6 weeks), 4) Check nutrition (slight caloric surplus, 1.6-2g protein/kg), 5) Focus on weak points in the movement chain, 6) Consider changing rep ranges (switch to 3-5 reps if stuck at 8-12), 7) Log workouts to ensure progressive overload.";
    }
    
    if (messageLower.includes('gym') && messageLower.includes('etiquette')) {
        return "Gym etiquette essentials: 1) Re-rack weights after use, 2) Wipe down equipment with provided towels/spray, 3) Don't monopolize equipment during busy times (allow others to work in), 4) Limit rest times to 60-90 seconds during peak hours, 5) Avoid excessive phone use on equipment, 6) Keep grunting and noise to reasonable levels, 7) Respect personal space, especially during exercises, 8) Ask before adjusting someone's form unless you're their trainer.";
    }
    
    return "I'm your fitness assistant. Ask me about workouts, nutrition, or recovery strategies, and I'll provide specific, actionable advice tailored to your goals. For example, you can ask about workout plans, meal ideas, or how to break through plateaus.";
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    requestNotificationPermission();
});
