const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const plannerForm = document.getElementById('plannerForm');
const resultSection = document.getElementById('resultSection');
const bmiValue = document.getElementById('bmiValue');
const bmiStatus = document.getElementById('bmiStatus');
const calorieTarget = document.getElementById('calorieTarget');
const bmiMessage = document.getElementById('bmiMessage');
const dietPlan = document.getElementById('dietPlan');
const gymPlan = document.getElementById('gymPlan');
const authMessage = document.getElementById('authMessage');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const fullNameInput = document.getElementById('fullName');
const ageInput = document.getElementById('age');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const goalInput = document.getElementById('goal');
const workHoursInput = document.getElementById('workHours');
const experienceInput = document.getElementById('experience');

const STORAGE_KEY = 'ironHarborProfiles';
const CURRENT_USER_KEY = 'ironHarborCurrentUser';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const defaultProfiles = [
  {
    username: 'demo',
    password: '123456',
    fullName: 'Demo Athlete',
    age: 28,
    height: 175,
    weight: 72,
    goal: 'maintain',
    workHours: '8',
    experience: 'intermediate'
  }
];

function getProfiles() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfiles));
    return [...defaultProfiles];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfiles));
    return [...defaultProfiles];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

function setAuthMode(mode) {
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const buttons = document.querySelectorAll('.toggle-btn');

  const isLogin = mode === 'login';
  loginPanel.classList.toggle('hidden', !isLogin);
  signupPanel.classList.toggle('hidden', isLogin);

  buttons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });
}

function populateProfile(profile) {
  if (!profile) return;
  fullNameInput.value = profile.fullName || '';
  ageInput.value = profile.age || '';
  heightInput.value = profile.height || '';
  weightInput.value = profile.weight || '';
  goalInput.value = profile.goal || 'maintain';
  workHoursInput.value = profile.workHours || '8';
  experienceInput.value = profile.experience || 'beginner';
}

function calculateBMI(weight, heightCm) {
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function estimateCalories(weight, age, height, goal, workHours, experience) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const hoursFactor = Number(workHours);
  const activityMultiplier =
    hoursFactor <= 4 ? 1.3 : hoursFactor <= 6 ? 1.42 : hoursFactor <= 8 ? 1.55 : hoursFactor <= 10 ? 1.7 : 1.82;
  const baseCalories = Math.round(bmr * activityMultiplier);

  if (goal === 'bulk') {
    return Math.round(baseCalories + 250 + (experience === 'advanced' ? 180 : 0));
  }

  if (goal === 'cut') {
    return Math.round(baseCalories - 350 - (experience === 'beginner' ? 80 : 0));
  }

  return Math.round(baseCalories + 80);
}

function workoutLengthByHours(hours) {
  if (hours <= 4) return '50 min';
  if (hours <= 6) return '45 min';
  if (hours <= 8) return '40 min';
  if (hours <= 10) return '35 min';
  return '30 min';
}

function getMacroTargets(calories, weight, bmiState, goal) {
  const protein = Math.round(weight * (goal === 'bulk' ? 2.1 : 1.8));
  const fats = Math.round((calories * 0.28) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);

  const adjustment = bmiState === 'Obese' || bmiState === 'Overweight' ? 'lean carbs and high fiber' : bmiState === 'Underweight' ? 'higher calorie density' : 'balanced energy';

  return { protein, carbs, fats, adjustment };
}

function getBaseMealPlan(goal, bmiState) {
  const planMap = {
    underweight: {
      breakfast: 'Oats with banana, peanut butter, and Greek yogurt',
      lunch: 'Chicken rice bowl with avocado and mixed greens',
      dinner: 'Salmon, roasted potatoes, and spinach',
      snack: 'Smoothie with whey, fruit, and almond butter'
    },
    healthy: {
      breakfast: 'Eggs, toast, berries, and a protein shake',
      lunch: 'Chicken quinoa bowl with greens and olive oil',
      dinner: 'Turkey, brown rice, and roasted vegetables',
      snack: 'Greek yogurt with nuts and fruit'
    },
    overweight: {
      breakfast: 'Scrambled eggs, spinach, and berries',
      lunch: 'Grilled chicken salad with beans and leafy greens',
      dinner: 'Baked fish, cauliflower rice, and asparagus',
      snack: 'Protein yogurt and a sliced apple'
    },
    obese: {
      breakfast: 'Protein oats with chia and berries',
      lunch: 'Lean turkey bowl with greens and quinoa',
      dinner: 'Shrimp stir-fry with vegetables and brown rice',
      snack: 'Fruit with cottage cheese'
    }
  };

  const selected = planMap[bmiState.toLowerCase()] || planMap.healthy;

  if (goal === 'bulk') {
    return {
      breakfast: 'Egg scramble with oats, fruit, and whey protein',
      lunch: 'Chicken quinoa bowl with avocado and vegetables',
      dinner: 'Lean beef, potatoes, and green beans',
      snack: 'Banana smoothie with yogurt and nuts'
    };
  }

  if (goal === 'cut') {
    return {
      breakfast: 'Egg white scramble with spinach and avocado toast',
      lunch: 'Turkey salad with mixed greens and quinoa',
      dinner: 'Grilled tilapia, roasted veg, and sweet potato',
      snack: 'Cottage cheese with berries and almonds'
    };
  }

  return selected;
}

function buildWeeklyDiet(goal, bmiState, calories, weight) {
  const baseMeal = getBaseMealPlan(goal, bmiState);
  const macroTargets = getMacroTargets(calories, weight, bmiState, goal);
  const hydration = goal === 'cut' ? '2.2-2.8 L water' : '2.0-2.5 L water';

  return days.map((day, index) => {
    const meals = [
      `Breakfast: ${index % 2 === 0 ? baseMeal.breakfast : 'Protein smoothie with oats and berries'}`,
      `Lunch: ${index % 3 === 0 ? baseMeal.lunch : 'Chicken wrap with greens, rice, and avocado'}`,
      `Dinner: ${index % 2 === 0 ? baseMeal.dinner : 'Grilled fish or tofu with potatoes and vegetables'}`,
      `Snack: ${baseMeal.snack}`,
      `Hydration: ${hydration}`,
      `Macros: ${macroTargets.protein}g protein • ${macroTargets.carbs}g carbs • ${macroTargets.fats}g fats`
    ];

    return { day, meals };
  });
}

function buildWeeklyGymPlan(goal, bmiState, workHours, experience) {
  const workoutMinutes = workoutLengthByHours(Number(workHours));
  const intensityBoost =
    experience === 'advanced'
      ? 'Use 3-4 hard sets with controlled tempo.'
      : experience === 'intermediate'
        ? 'Keep moderate intensity and full range of motion.'
        : 'Focus on form and consistency, not speed.';

  const goalFocus = {
    cut: 'Maintain strong effort while keeping rest short and sessions efficient.',
    bulk: 'Prioritize progressive overload and quality reps to grow lean mass.',
    maintain: 'Balance performance, recovery, and steady consistency.'
  };

  const planMap = {
    underweight: {
      Monday: 'Upper body strength + 10 min incline walk',
      Tuesday: 'Lower body power + mobility flow',
      Wednesday: 'Core stability + low-impact cardio',
      Thursday: 'Chest and shoulder press circuit',
      Friday: 'Leg drive + rowing intervals',
      Saturday: 'Full body strength, moderate volume',
      Sunday: 'Active recovery walk and stretch'
    },
    healthy: {
      Monday: 'Push day: chest, shoulders, triceps',
      Tuesday: 'Pull day: back, biceps, rear delts',
      Wednesday: 'Lower body strength: squats and deadlifts',
      Thursday: 'Cardio intervals + core work',
      Friday: 'Upper body hypertrophy',
      Saturday: 'Leg day + mobility work',
      Sunday: 'Recovery walk + stretch'
    },
    overweight: {
      Monday: 'HIIT circuit + chest press',
      Tuesday: 'Lower body strength + core work',
      Wednesday: 'Rowing intervals + incline walk',
      Thursday: 'Upper body resistance + mobility',
      Friday: 'Full body circuit + abs',
      Saturday: 'Low-impact cardio + recovery stretch',
      Sunday: 'Rest day with light walking'
    },
    obese: {
      Monday: 'Low-impact cardio + upper body',
      Tuesday: 'Leg press + torso control',
      Wednesday: 'Bike intervals + core circuit',
      Thursday: 'Rowing + shoulder routine',
      Friday: 'Full body circuit',
      Saturday: 'Mobility and brisk walk',
      Sunday: 'Recovery and stretch'
    }
  };

  const plan = planMap[bmiState.toLowerCase()] || planMap.healthy;

  return days.map((day, index) => {
    const duration = index === 6 ? '20 min' : workoutMinutes;
    return {
      day,
      text: `${plan[day]} • ${duration} • ${goalFocus[goal]} • ${intensityBoost}`
    };
  });
}

function renderChart(svgId, bars, maxValue) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  svg.innerHTML = '';

  const width = 320;
  const height = 180;
  const leftPad = 28;
  const rightPad = 18;
  const topPad = 20;
  const bottomPad = 32;
  const chartHeight = height - topPad - bottomPad;
  const chartWidth = width - leftPad - rightPad;

  for (let i = 0; i <= 4; i += 1) {
    const y = topPad + (chartHeight / 4) * i;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', leftPad);
    line.setAttribute('y1', y);
    line.setAttribute('x2', width - rightPad);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(167,188,206,0.25)');
    svg.appendChild(line);
  }

  bars.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const x = leftPad + index * 80 + 20;
    const y = height - bottomPad - barHeight;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 42);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('rx', 6);
    rect.setAttribute('fill', item.color);
    svg.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + 21);
    label.setAttribute('y', height - 10);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', '#a7bcce');
    label.setAttribute('font-size', '10');
    label.textContent = item.label;
    svg.appendChild(label);

    const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    value.setAttribute('x', x + 21);
    value.setAttribute('y', y - 8);
    value.setAttribute('text-anchor', 'middle');
    value.setAttribute('fill', '#ebf6ff');
    value.setAttribute('font-size', '10');
    value.textContent = `${item.value}`;
    svg.appendChild(value);
  });
}

function renderPlan(data) {
  const { bmi, bmiState, goal, workHours, experience, age, height, weight, calories } = data;

  bmiValue.textContent = bmi;
  bmiStatus.textContent = bmiState;
  calorieTarget.textContent = `${calories} kcal`;

  const statusMessage = {
    Underweight: 'Your plan emphasizes adding healthy mass with calorie-dense nutrition and strength-focused training.',
    Healthy: 'You are in a balanced range. Focus on consistency, recovery, and steady body composition improvements.',
    Overweight: 'Your plan prioritizes fat loss with sustainable cardio, clean eating, and structured strength work.',
    Obese: 'Your plan is centered on gradual fat-loss progress, lower-impact training, and better daily consistency.'
  };

  const planBase = {
    Underweight: 'focus on lean mass gain',
    Healthy: 'maintain and improve performance',
    Overweight: 'reduce fat while preserving muscle',
    Obese: 'improve metabolic health and body composition'
  };

  const runtime = Number(workHours);
  bmiMessage.textContent = `${statusMessage[bmiState]} Goal: ${goal.toUpperCase()} • Work hours: ${runtime} • ${planBase[bmiState]}.`;

  const dietEntries = buildWeeklyDiet(goal, bmiState.toLowerCase(), calories, weight);
  const gymEntries = buildWeeklyGymPlan(goal, bmiState.toLowerCase(), workHours, experience);

  dietPlan.innerHTML = dietEntries
    .map(
      (entry) => `
        <article class="day-card">
          <h3>${entry.day}</h3>
          <ul>
            ${entry.meals.map((meal) => `<li>${meal}</li>`).join('')}
          </ul>
        </article>
      `
    )
    .join('');

  gymPlan.innerHTML = gymEntries
    .map(
      (entry) => `
        <article class="day-card">
          <h3>${entry.day}</h3>
          <ul>
            <li>${entry.text}</li>
          </ul>
        </article>
      `
    )
    .join('');

  const healthyLow = 18.5;
  const healthyHigh = 24.9;
  const bmiMax = Math.max(30, bmi, healthyHigh + 6);
  renderChart('bmiChart', [
    { label: 'BMI', value: bmi, color: '#7ef9d8' },
    { label: 'Low', value: healthyLow, color: '#ffd166' },
    { label: 'High', value: healthyHigh, color: '#7aa2ff' }
  ], bmiMax);

  const calorieMax = Math.max(3000, calories + 600);
  renderChart('calorieChart', [
    { label: 'Target', value: calories, color: '#7ef9d8' },
    { label: 'Min', value: Math.max(1500, calories - 300), color: '#a7bcce' },
    { label: 'Max', value: calories + 250, color: '#ffd166' }
  ], calorieMax);

  resultSection.classList.remove('hidden');
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveCurrentProfile(profileData) {
  const profiles = getProfiles();
  const index = profiles.findIndex((profile) => profile.username === profileData.username);

  if (index >= 0) {
    profiles[index] = { ...profiles[index], ...profileData };
  } else {
    profiles.push(profileData);
  }

  saveProfiles(profiles);
}

function handleLogin(username, password) {
  const profiles = getProfiles();
  const match = profiles.find((profile) => profile.username.toLowerCase() === username.toLowerCase() && profile.password === password);

  if (!match) {
    authMessage.textContent = 'Invalid username or password. Please try again or create an account.';
    return null;
  }

  localStorage.setItem(CURRENT_USER_KEY, match.username);
  authMessage.textContent = `Welcome back, ${match.fullName || match.username}.`;
  populateProfile(match);
  return match;
}

function handleSignup(name, username, password) {
  const profiles = getProfiles();

  if (!name || !username || !password) {
    authMessage.textContent = 'All sign-up fields are required.';
    return null;
  }

  if (password.length < 4) {
    authMessage.textContent = 'Password should be at least 4 characters.';
    return null;
  }

  const exists = profiles.some((profile) => profile.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    authMessage.textContent = 'This username already exists. Please choose another one.';
    return null;
  }

  const newProfile = {
    username: username.trim(),
    password,
    fullName: name.trim(),
    age: '',
    height: '',
    weight: '',
    goal: 'maintain',
    workHours: '8',
    experience: 'beginner'
  };

  profiles.push(newProfile);
  saveProfiles(profiles);
  localStorage.setItem(CURRENT_USER_KEY, newProfile.username);
  authMessage.textContent = `Account created for ${newProfile.fullName}. Please fill in your details.`;
  populateProfile(newProfile);
  setAuthMode('login');
  return newProfile;
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    authMessage.textContent = 'Please enter both username and password.';
    return;
  }

  const user = handleLogin(username, password);
  if (user) {
    if (user.fullName) {
      fullNameInput.value = user.fullName;
    }
    if (user.age) {
      ageInput.value = user.age;
    }
    if (user.height) {
      heightInput.value = user.height;
    }
    if (user.weight) {
      weightInput.value = user.weight;
    }
    if (user.goal) {
      goalInput.value = user.goal;
    }
    if (user.workHours) {
      workHoursInput.value = user.workHours;
    }
    if (user.experience) {
      experienceInput.value = user.experience;
    }
  }
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  handleSignup(name, username, password);
});

document.querySelectorAll('.toggle-btn').forEach((button) => {
  button.addEventListener('click', () => {
    setAuthMode(button.dataset.mode);
  });
});

plannerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const fullName = fullNameInput.value.trim();
  const age = Number(ageInput.value);
  const height = Number(heightInput.value);
  const weight = Number(weightInput.value);
  const goal = goalInput.value;
  const workHours = workHoursInput.value;
  const experience = experienceInput.value;

  if (!fullName || !age || !height || !weight) {
    bmiMessage.textContent = 'Please complete all personal details before generating your plan.';
    return;
  }

  const bmi = calculateBMI(weight, height);
  const bmiState = bmiCategory(bmi);
  const calories = estimateCalories(weight, age, height, goal, workHours, experience);
  const currentUser = localStorage.getItem(CURRENT_USER_KEY) || usernameInput.value.trim() || fullName;

  const planData = {
    username: currentUser,
    fullName,
    age,
    height,
    weight,
    goal,
    workHours,
    experience,
    bmi: bmi.toFixed(1),
    bmiState,
    calories
  };

  saveCurrentProfile(planData);
  renderPlan(planData);
});

const savedUser = localStorage.getItem(CURRENT_USER_KEY);
if (savedUser) {
  const profiles = getProfiles();
  const currentProfile = profiles.find((profile) => profile.username === savedUser);
  if (currentProfile) {
    populateProfile(currentProfile);
    authMessage.textContent = `Logged in as ${currentProfile.fullName || currentProfile.username}.`;
  }
}

setAuthMode('login');
