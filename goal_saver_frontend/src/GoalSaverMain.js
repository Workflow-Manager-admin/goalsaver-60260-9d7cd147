import React, { useState, useEffect } from "react";

// =======================
// Custom Color Variables
// =======================
const COLORS = {
  primary: "#4CAF50",
  secondary: "#FFC107",
  accent: "#2196F3",
  background: "#F7FAFC",
  card: "#FFFFFF",
  border: "#E0E0E0",
  text: "#28313a",
  textSecondary: "#626262",
  progressBg: "#e5e5ec",
  reminderDot: "#B39DDB",
};

// =======================
// Utility Functions
// =======================

// PUBLIC_INTERFACE
function formatCurrency(amount) {
  /** Formats a number as INR currency */
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

// PUBLIC_INTERFACE
function calculateProgress(goal, now = new Date()) {
  /**
   * Calculates the savings progress for a goal.
   * Returns: { percent, saved, needToSavePerPeriod, periodsLeft }
   */
  const target = Number(goal.targetAmount || 0);
  const saved = Number(goal.savedAmount || 0);

  const percent = target === 0 ? 0 : Math.min(100, Math.round((saved / target) * 100));
  // Calculate months/weeks left
  const endDate = new Date(goal.targetDate);
  const diffDays = Math.ceil((endDate - now) / (1000 * 3600 * 24));
  const periodsLeft = diffDays > 30 ? Math.ceil(diffDays / 30) : diffDays;
  const amountLeft = Math.max(0, target - saved);
  const needToSavePerPeriod = periodsLeft > 0 ? amountLeft / periodsLeft : amountLeft;
  return {
    percent,
    saved,
    needToSavePerPeriod,
    periodsLeft,
  };
}

// PUBLIC_INTERFACE
function suggestContribution(goal, income, expenses) {
  /**
   * Suggest smart contribution for a goal given user's income/expenses.
   * Simple version: save X% of discretionary budget to this goal.
   */
  const discretionary = income - expenses;
  // Recommend 20% of discretionary per period if possible
  if (!goal || !goal.targetAmount) return 0;
  const { needToSavePerPeriod } = calculateProgress(goal);
  const suggested = Math.min(needToSavePerPeriod, Math.max(0, Math.round(discretionary * 0.2)));
  return suggested;
}

// =======================
// Goal APIS (placeholders; replace with real backend later)
// =======================

/**
 * Simulated API: get all goals for user.
 */
function api_listGoals() {
  // In real app, GET /goals
  // Here: just use localStorage for demo
  let data = window.localStorage.getItem("goalsaver-goals");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
/**
 * Simulated API: save all goals.
 */
function api_saveGoals(goals) {
  window.localStorage.setItem("goalsaver-goals", JSON.stringify(goals));
}
/**
 * Simulated API: manage preferences.
 */
function api_getUserPrefs() {
  let data = window.localStorage.getItem("goalsaver-prefs");
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}
function api_saveUserPrefs(prefs) {
  window.localStorage.setItem("goalsaver-prefs", JSON.stringify(prefs));
}

/**
 * Simulated API: set reminders (just stores in local storage).
 */
function api_getReminders() {
  let data = window.localStorage.getItem("goalsaver-reminders");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
function api_saveReminders(reminders) {
  window.localStorage.setItem("goalsaver-reminders", JSON.stringify(reminders));
}

// =====================================================
// MAIN CONTAINER COMPONENT
// =====================================================

// PUBLIC_INTERFACE
export default function GoalSaverMain() {
  /**
   * Main container for the GoalSaver dashboard app.
   * Houses all features: goals planner, calculator, reminders, progress tracking.
   */
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [prefs, setPrefs] = useState({ income: "", expenses: "" });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editGoalObj, setEditGoalObj] = useState(null);
  const [reminders, setReminders] = useState([]);

  // Load goals and prefs on mount
  useEffect(() => {
    setGoals(api_listGoals());
    setPrefs(api_getUserPrefs());
    setReminders(api_getReminders());
  }, []);

  // Save prefs on change
  useEffect(() => {
    api_saveUserPrefs(prefs);
  }, [prefs]);

  // ----- UI controls -----
  function handleAddGoal(goal) {
    // Add new goal
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      savedAmount: 0,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const newGoals = [...goals, newGoal];
    setGoals(newGoals);
    api_saveGoals(newGoals);
    setShowGoalForm(false);
    setSelectedGoalId(newGoal.id);
  }
  function handleEditGoal(goal) {
    // Update existing goal
    const newGoals = goals.map((g) => (g.id === goal.id ? { ...goal, updated: new Date().toISOString() } : g));
    setGoals(newGoals);
    api_saveGoals(newGoals);
    setShowGoalForm(false);
    setEditGoalObj(null);
  }
  function handleDeleteGoal(id) {
    if (!window.confirm("Delete this goal?")) return;
    const newGoals = goals.filter((g) => g.id !== id);
    setGoals(newGoals);
    api_saveGoals(newGoals);
    if (selectedGoalId === id) setSelectedGoalId(null);
  }
  function handleSelectGoal(id) {
    setSelectedGoalId(id);
  }
  function handleAddSavings(goalId, amount) {
    if (!amount || isNaN(amount)) return;
    const newGoals = goals.map((g) =>
      g.id === goalId
        ? {
            ...g,
            savedAmount: Math.min(Number(g.savedAmount || 0) + Number(amount), Number(g.targetAmount || 0)),
            updated: new Date().toISOString(),
          }
        : g
    );
    setGoals(newGoals);
    api_saveGoals(newGoals);
  }
  function handleSetReminders(goalId, schedule) {
    // Store reminders per-goal
    const newReminders = reminders.filter((r) => r.goalId !== goalId);
    newReminders.push({ goalId, schedule });
    setReminders(newReminders);
    api_saveReminders(newReminders);
  }
  function handlePrefsChange(obj) {
    setPrefs((prev) => ({ ...prev, ...obj }));
  }

  // Get currently selected goal for details view
  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // ----- RENDER -----
  return (
    <div style={styles.wrapper}>
      <header style={{ ...styles.navbar, borderBottom: `2px solid ${COLORS.secondary}` }}>
        <div style={styles.logo}>
          <span style={{ ...styles.logoIcon, color: COLORS.primary }}>💰</span>GoalSaver
        </div>
        <div>
          <button style={styles.addGoalBtn} onClick={() => { setShowGoalForm(true); setEditGoalObj(null); }}>+ New Goal</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.dashboard}>
          <section style={styles.sideColumn}>
            <GoalList
              goals={goals}
              selectedGoalId={selectedGoalId}
              onSelect={handleSelectGoal}
              onDelete={handleDeleteGoal}
              onEdit={(goal) => { setShowGoalForm(true); setEditGoalObj(goal); }}
              accentColor={COLORS.accent}
            />
            <SmartContributionCalculator
              prefs={prefs}
              onPrefsChange={handlePrefsChange}
              selectedGoal={selectedGoal}
            />
          </section>

          <section style={styles.detailColumn}>
            {showGoalForm && (
              <GoalForm
                onSubmit={editGoalObj ? handleEditGoal : handleAddGoal}
                onCancel={() => { setShowGoalForm(false); setEditGoalObj(null); }}
                initial={editGoalObj}
                secondaryColor={COLORS.secondary}
                accentColor={COLORS.accent}
              />
            )}

            {!showGoalForm && selectedGoal && (
              <GoalDetail
                goal={selectedGoal}
                onSaveAmount={handleAddSavings}
                onSetReminders={handleSetReminders}
                reminder={reminders.find((r) => r.goalId === selectedGoal.id)}
                prefs={prefs}
                smartSuggested={suggestContribution(selectedGoal, prefs.income, prefs.expenses)}
                colors={COLORS}
              />
            )}

            {!showGoalForm && !selectedGoal && (
              <div style={styles.placeholderDetail}>
                <h2 style={{ color: COLORS.primary, marginBottom: 12 }}>Welcome to GoalSaver!</h2>
                <p style={{ color: COLORS.textSecondary }}>
                  Select a goal to view details and track your progress.<br/>
                  Or click <span style={{ fontWeight: 500 }}>+ New Goal</span> to get started.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// =====================================================
// COMPONENTS
// =====================================================

/**
 * GoalList - Sidebar showing multiple goal cards.
 */
// PUBLIC_INTERFACE
function GoalList({ goals, selectedGoalId, onSelect, onDelete, onEdit, accentColor }) {
  return (
    <div>
      <h3 style={{margin: "0 0 12px 0"}}>Your Goals</h3>
      <div>
        {goals.length === 0 && (
          <div style={{color: "#aaa", marginTop: 12, fontSize: "1rem"}}>No goals yet.</div>
        )}
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            style={{
              ...styles.goalCard,
              borderColor: goal.id === selectedGoalId ? accentColor : COLORS.border,
              background: goal.id === selectedGoalId ? "#f0f6ff" : COLORS.card,
            }}
          >
            <div style={{fontWeight: 600, color: COLORS.text, fontSize: "1.1em"}}>{goal.name}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
              {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
            </div>
            <div style={{marginTop: 4, fontSize: 12, color: "#888"}}>
              By {goal.targetDate}
            </div>
            <div style={{ display: "flex", marginTop: 8, gap: "8px" }}>
              <button style={styles.cardBtn} onClick={e => {e.stopPropagation(); onEdit(goal);}}>Edit</button>
              <button style={styles.cardBtnDelete} onClick={e => {e.stopPropagation(); onDelete(goal.id);}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * GoalForm - Add/Edit Goal
 */
// PUBLIC_INTERFACE
function GoalForm({ onSubmit, onCancel, initial, secondaryColor, accentColor }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      targetAmount: "",
      targetDate: "",
      description: "",
    }
  );
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    // Validate
    if (!form.name || !form.targetAmount || !form.targetDate) {
      setError("Please fill all required fields.");
      return;
    }
    if (Number(form.targetAmount) <= 0) {
      setError("Enter a valid target amount.");
      return;
    }
    onSubmit({ ...initial, ...form });
  }
  return (
    <div style={styles.formCard}>
      <h2 style={{margin: 0, color: accentColor}}>{initial ? "Edit Goal" : "Add New Goal"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Goal Name*</label>
          <input
            name="name"
            style={styles.formInput}
            value={form.name}
            maxLength={32}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Target Amount (₹)*</label>
          <input
            name="targetAmount"
            type="number"
            style={styles.formInput}
            min={1}
            value={form.targetAmount}
            onChange={handleChange}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Target Date*</label>
          <input
            name="targetDate"
            type="date"
            style={styles.formInput}
            value={form.targetDate}
            onChange={handleChange}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Description</label>
          <textarea
            name="description"
            rows={2}
            maxLength={120}
            style={styles.formInput}
            value={form.description}
            onChange={handleChange}
          />
        </div>
        {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
        <div style={{display: "flex", gap: 14, marginTop: 8}}>
          <button type="submit" style={{...styles.primaryBtn, background: accentColor}}>
            {initial ? "Save Changes" : "Add Goal"}
          </button>
          <button type="button" style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

/**
 * SmartContributionCalculator - Form for setting income/expenses and shows suggestion.
 */
// PUBLIC_INTERFACE
function SmartContributionCalculator({ prefs, onPrefsChange, selectedGoal }) {
  // Format suggestion preview
  let suggestionMsg = "";
  if (selectedGoal && prefs.income && prefs.expenses) {
    const amount = suggestContribution(selectedGoal, prefs.income, prefs.expenses);
    suggestionMsg =
      "Smart Save Suggestion: " +
      (amount > 0
        ? `${formatCurrency(amount)} (${selectedGoal.name})`
        : "No room to save this period.");
  }
  return (
    <div style={{...styles.sideCard, borderColor: COLORS.primary}}>
      <h4 style={{margin: 0, color: COLORS.primary}}>Smart Contribution Calculator</h4>
      <div style={{margin: "4px 0 8px 0", fontSize: 13, color: COLORS.textSecondary}}>
        Adjust goals based on monthly income and spending.
      </div>
      <div style={{display: "flex", gap: 8, alignItems: "center"}}>
        <input
          type="number"
          placeholder="Monthly Income (₹)"
          style={{...styles.formInput, maxWidth: 110, background: "#fafdff"}}
          value={prefs.income}
          onChange={(e) => onPrefsChange({ income: e.target.value })}
          min={0}
        />
        <input
          type="number"
          placeholder="Monthly Expenses (₹)"
          style={{...styles.formInput, maxWidth: 110, background: "#fafdff"}}
          value={prefs.expenses}
          onChange={(e) => onPrefsChange({ expenses: e.target.value })}
          min={0}
        />
      </div>
      {suggestionMsg && (
        <div style={{marginTop: 7, color: COLORS.accent, fontWeight: 500, fontSize: 14}}>
          {suggestionMsg}
        </div>
      )}
    </div>
  );
}

/**
 * GoalDetail - shows individual goal stats, progress tracker, reminders.
 */
// PUBLIC_INTERFACE
function GoalDetail({ goal, onSaveAmount, onSetReminders, reminder, prefs, smartSuggested, colors }) {
  const [savings, setSavings] = useState("");
  const [errors, setErrors] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const prog = calculateProgress(goal);

  function handleSave(e) {
    e.preventDefault();
    if (!savings || Number(savings) < 1) {
      setErrors("Enter a valid amount to save.");
      return;
    }
    onSaveAmount(goal.id, savings);
    setSavings("");
    setErrors("");
  }

  return (
    <div style={styles.detailCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{margin: 0, color: colors.primary, fontSize: "2rem"}}>{goal.name}</h2>
          <div style={{fontWeight: 400, color: colors.textSecondary, margin: "3px 0 8px"}}>
            {goal.description}
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#666" }}>
          <span role="img" aria-label="calendar">📅</span> Target: {goal.targetDate}
        </div>
      </div>
      <div style={{margin: "18px 0 8px"}}>
        <ProgressBar percent={prog.percent} colors={colors} />
      </div>
      <div style={{display: "flex", gap: "32px", marginBottom: 16, fontSize: 16}}>
        <div><b>{formatCurrency(goal.savedAmount)}</b> / {formatCurrency(goal.targetAmount)} saved</div>
        <div>Milestone: <b>{prog.percent}%</b></div>
        <div>Left: <b>{formatCurrency(goal.targetAmount - goal.savedAmount)}</b></div>
      </div>
      <form style={{marginBottom: 10}} onSubmit={handleSave}>
        <label style={styles.formLabel}>Add To Savings</label>
        <div style={{display: "flex", alignItems: "center", gap: 8, marginTop: 4}}>
          <input
            type="number"
            style={{...styles.formInput, maxWidth: 120}}
            placeholder="Amount (₹)"
            min={1}
            max={goal.targetAmount - goal.savedAmount}
            value={savings}
            onChange={e => setSavings(e.target.value)}
          />
          <button style={{...styles.primaryBtn, background: colors.accent}} type="submit">
            Save
          </button>
        </div>
        {smartSuggested > 0 && (
          <div style={{marginTop: 4, color: colors.accent, fontWeight: 500, fontSize: 13}}>
            Suggest Save: {formatCurrency(smartSuggested)} this period
          </div>
        )}
        {errors && <div style={{ color: "crimson", fontSize: 13 }}>{errors}</div>}
      </form>
      <div style={styles.detailRow}>
        <div>
          {prog.periodsLeft > 0 && (
            <span>
              You need to save <b>{formatCurrency(prog.needToSavePerPeriod)}</b> per {prog.periodsLeft > 30 ? "month" : "day"} to reach goal on time.
            </span>
          )}
        </div>
      </div>
      <div style={{marginTop: 18}}>
        <button style={{...styles.secondaryBtn, background: "#f9f9fc", color: colors.primary, border: `1px solid ${colors.primary}`}}
          onClick={() => setShowReminder(!showReminder)}>
          {showReminder ? "Hide Reminders" : "Auto Reminders & Habit Builder"}
        </button>
      </div>
      {showReminder && (
        <ReminderSetter
          goal={goal}
          reminder={reminder}
          onSetReminders={onSetReminders}
          accentColor={colors.accent}
        />
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function ProgressBar({ percent, colors }) {
  // Simple colored bar
  return (
    <div style={{
      height: 16,
      background: COLORS.progressBg,
      borderRadius: 8,
      overflow: "hidden"
    }}>
      <div style={{
        width: percent + "%",
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
        height: "100%",
        borderRadius: 8,
        transition: "width 0.5s cubic-bezier(0.56,0,0.21,1)"
      }} />
    </div>
  );
}

/**
 * ReminderSetter - allows setting up a reminder (simulated habit builder).
 */
// PUBLIC_INTERFACE
function ReminderSetter({ goal, reminder, onSetReminders, accentColor }) {
  // Let's offer daily, weekly, custom frequencies
  const [freq, setFreq] = useState(reminder?.schedule?.frequency || "weekly");
  const [when, setWhen] = useState(reminder?.schedule?.time || "08:00");
  const [msg, setMsg] = useState(reminder?.schedule?.message || "");
  function handleSave(e) {
    e.preventDefault();
    onSetReminders(goal.id, { frequency: freq, time: when, message: msg });
  }
  return (
    <form style={{marginTop: 18, background: "#fafbfc", padding: 12, borderRadius: 8, border: `1px solid ${accentColor}`}} onSubmit={handleSave}>
      <div style={{fontWeight: 600, color: accentColor, marginBottom: 6}}>Set a Habit Reminder</div>
      <div style={{display: "flex", gap: 16, alignItems: "center"}}>
        <span>Remind me to save</span>
        <select style={styles.formInput} value={freq} onChange={e => setFreq(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <span>at</span>
        <input style={styles.formInput} type="time" value={when} onChange={e => setWhen(e.target.value)} />
      </div>
      <div style={{marginTop: 10}}>
        <input
          style={{...styles.formInput, width: "100%"}}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Custom message (e.g. 'Just ₹50 for that trip!')"
          maxLength={40}
        />
      </div>
      <button type="submit" style={{marginTop: 10, ...styles.primaryBtn, background: accentColor}}>
        Save Reminder
      </button>
      {reminder && (
        <div style={{marginTop: 8, fontSize: 13, color: "#5a97fc"}}>
          ✔️ Active: {reminder.schedule.frequency} at {reminder.schedule.time}
          {reminder.schedule.message ? " - " + reminder.schedule.message : ""}
        </div>
      )}
      <div style={{marginTop: 8, fontSize: 12, color: "#aaa"}}>
        <i>Reminders appear as notifications when you check this app. (No backend integration yet.)</i>
      </div>
    </form>
  );
}

// =====================================================
// Inline Styles (would typically go in a CSS module)
// =====================================================
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: COLORS.background,
    color: COLORS.text,
    fontFamily: "Inter, Arial, sans-serif",
  },
  navbar: {
    background: COLORS.card,
    height: 56,
    padding: "0 2vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 40,
  },
  logo: {
    fontWeight: 700,
    fontSize: "1.3rem",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    color: COLORS.primary,
    gap: 6,
  },
  logoIcon: {
    fontSize: 25,
    fontWeight: 900,
    marginRight: 2,
  },
  addGoalBtn: {
    background: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    fontWeight: 500,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 1px 4px #d9e6da40",
    transition: "background 0.2s"
  },
  main: {
    marginTop: 68,
    minHeight: "calc(100vh - 68px)",
    background: COLORS.background,
    padding: "0 0 48px 0",
  },
  dashboard: {
    display: "flex",
    gap: 44,
    alignItems: "flex-start",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 12px 0 12px",
    boxSizing: "border-box",
  },
  sideColumn: {
    flex: "1 1 310px",
    minWidth: 270,
    marginRight: 6,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  detailColumn: {
    flex: "4 1 1",
    minWidth: 380,
    maxWidth: 650,
    alignSelf: "stretch",
    padding: "4px 0 0 0",
  },
  goalCard: {
    border: `2px solid ${COLORS.border}`,
    borderRadius: 9,
    padding: "14px 16px",
    marginBottom: 14,
    cursor: "pointer",
    background: COLORS.card,
    transition: "border .18s, background .2s",
    boxShadow: "0 1px 2px #f1f2f3",
    boxSizing: "border-box"
  },
  cardBtn: {
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    padding: "4px 11px",
    cursor: "pointer"
  },
  cardBtnDelete: {
    background: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    padding: "4px 11px",
    cursor: "pointer"
  },
  sideCard: {
    background: "#fff",
    padding: "14px 15px 11px",
    border: `1.5px solid ${COLORS.primary}`,
    borderRadius: 10,
    marginTop: 12,
    fontSize: 15,
    boxShadow: "0 2px 5px #d4dff315"
  },
  detailCard: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px #8be7c30f",
    padding: "30px 32px 22px",
    marginTop: 3,
    marginBottom: 18,
    minHeight: 280,
  },
  placeholderDetail: {
    marginTop: 50,
    background: "#ffffffcb",
    borderRadius: 16,
    padding: "54px 28px",
    minHeight: 200,
    textAlign: "center",
    boxShadow: "0 1px 12px #9bdaf027"
  },
  formCard: {
    padding: "26px 30px",
    marginTop: 8,
    background: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 2px 8px #034c2140",
    minWidth: 350,
    maxWidth: 500,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 600,
    marginBottom: 3,
    display: "block"
  },
  formInput: {
    width: "100%",
    border: `1.2px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: "8px 10px",
    fontSize: 15,
    marginTop: 3,
    color: COLORS.text,
    background: "#f8fafc",
    outline: "none"
  },
  primaryBtn: {
    background: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "7px 22px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 1px 6px #c9ecc980",
    transition: "background 0.2s"
  },
  secondaryBtn: {
    background: COLORS.secondary,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 18px",
    fontWeight: 500,
    fontSize: 15,
    cursor: "pointer",
    transition: "background 0.18s"
  },
  detailRow: {
    margin: "9px 0 4px",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};
