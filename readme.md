# MotionX Fitness Assistant

MotionX is a lightweight, easy-to-use fitness and nutrition assistant that helps you track your calories, monitor your workouts, and receive personalized fitness advice—all without requiring a database.

![MotionX Screenshot](screenshot.png)

## Features

- **Calorie Tracking**: Log your meals and track your daily calorie intake
- **Workout Planning**: Schedule and track your workouts
- **Intelligent Assistant**: Get advice on workouts, nutrition, and recipes
- **Progress Monitoring**: View your fitness journey with intuitive charts
- **Reminders**: Receive notifications for upcoming workouts
- **Works Offline**: Full functionality even without an internet connection
- **Zero Cost**: Free to use with no subscription fees

## Getting Started

### Prerequisites

- A modern web browser
- Node.js (optional, for local development)

### Quick Start

1. Clone this repository:
```bash
git clone https://github.com/yourusername/motionx.git
cd motionx
```

2. Install dependencies (optional, only if you want to run the local server):
```bash
npm install
```

3. Start the local server (optional):
```bash
npm start
```

4. Open `index.html` in your browser (or navigate to `http://localhost:8080` if using the server)

### Using MotionX

#### Tracking Calories
1. Click "Add Food" on the Nutrition tab
2. Enter the food details and nutritional information
3. Select which meal it belongs to (Breakfast, Lunch, Dinner, Snacks)
4. Click "Add Food" to save

#### Scheduling Workouts
1. Click "Add Workout" on the Workouts tab
2. Enter workout name, day, time, and duration
3. Click "Schedule Workout" to save
4. You'll receive reminders before your scheduled workouts

#### Logging Completed Workouts
1. Click "Log Workout" from the dashboard
2. Enter details about your completed workout
3. Click "Log Workout" to save your progress

#### Getting Advice
1. Navigate to the Assistant tab
2. Type your question about fitness, nutrition, or health
3. The AI assistant will provide personalized advice

## Technical Details

MotionX is built with:
- **HTML5**: Structure and content
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Core functionality
- **Chart.js**: Data visualization
- **Local Storage**: Data persistence without a database
- **Service Worker**: Offline functionality
- **Web Notifications API**: Reminders


## Customization

### Goals and Targets
Modify your nutritional goals in `
