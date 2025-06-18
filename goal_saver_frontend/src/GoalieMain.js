import React, { useState, useEffect } from "react";

// =======================
// Custom Color Variables (modern light dashboard styling)
// =======================
const COLORS = {
  primary: "#32b875",
  secondary: "#ffd861",
  accent: "#6a5cff",
  bgGradient: "linear-gradient(135deg, #eefdea 0%, #ffffff 100%)",
  background: "#f6f8fa",
  card: "#ffffff",
  border: "#ecf0f7",
  text: "#21303b",
  textSecondary: "#657786",
  progressBg: "#eceeff",
  reminderDot: "#6a5cff",
  navbarBg: "#ffffffcc",
  shadow: "0 8px 32px 0 rgba(60,76,100,0.08)",
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
   * Save up to 20% of discretionary budget for this goal.
   */
  const discretionary = income - expenses;
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
  let data = window.localStorage.getItem("goalie-goals");
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
  window.localStorage.setItem("goalie-goals", JSON.stringify(goals));
}
/**
 * Simulated API: manage preferences.
 */
function api_getUserPrefs() {
  let data = window.localStorage.getItem("goalie-prefs");
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}
function api_saveUserPrefs(prefs) {
  window.localStorage.setItem("goalie-prefs", JSON.stringify(prefs));
}

/**
 * Simulated API: set reminders (just stores in local storage).
 */
function api_getReminders() {
  let data = window.localStorage.getItem("goalie-reminders");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
function api_saveReminders(reminders) {
  window.localStorage.setItem("goalie-reminders", JSON.stringify(reminders));
}

// =====================================================
// MAIN CONTAINER COMPONENT
// =====================================================

// PUBLIC_INTERFACE
export default function GoalieMain() {
  /**
   * Main container for the Goalie dashboard app.
   * Houses all features: goals planner, calculator, reminders, progress tracking.
   */
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [prefs, setPrefs] = useState({ income: "", expenses: "" });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editGoalObj, setEditGoalObj] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    setGoals(api_listGoals());
    setPrefs(api_getUserPrefs());
    setReminders(api_getReminders());
  }, []);

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
      <header style={styles.navbar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🥅</span>
          <span style={styles.logoText}>Goalie</span>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 18}}>
          <span style={{ color: COLORS.accent, fontWeight: 500, fontSize: 15, letterSpacing: "1.2px" }}>Smarter Savings Dashboard</span>
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
              accent={COLORS.accent}
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
                <h2 style={{ color: COLORS.primary, marginBottom: 12, fontWeight: 700, fontSize: 32 }}>Welcome to Goalie!</h2>
                <p style={{ color: COLORS.textSecondary, fontSize: 18, marginTop: 0 }}>
                  Manage your savings goals with a smart, easy dashboard.<br />
                  Select a goal or click <span style={{ fontWeight: 700 }}>+ New Goal</span> to get started.
                </p>
                <div style={{marginTop: 32, color: COLORS.accent, fontWeight: 500, fontSize: 20}}>
                  <span role="img" aria-label="goal">⚡️</span> Build savings habits. Achieve more goals!
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// =====================================================
// COMPONENTS (modernized dashboard style)
// =====================================================

/**
 * GoalList - Sidebar showing multiple goal cards.
 */
// PUBLIC_INTERFACE
function GoalList({ goals, selectedGoalId, onSelect, onDelete, onEdit, accentColor }) {
  return (
    <div>
      <h3 style={{margin: "0 0 18px 0", letterSpacing: "1px", fontWeight: 600, fontSize: 20, color: COLORS.primary}}>Your Goals</h3>
      <div>
        {goals.length === 0 && (
          <div style={{color: "#aaa", marginTop: 16, fontSize: "1.08rem", fontWeight: 400, letterSpacing: "0.5px"}}>No goals yet. Start your first!</div>
        )}
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            style={{
              ...styles.goalCard,
              borderColor: goal.id === selectedGoalId ? accentColor : COLORS.border,
              boxShadow: goal.id === selectedGoalId ? "0 8px 18px #6a5cff14" : COLORS.shadow,
              background: goal.id === selectedGoalId ? "#f8f7ff" : COLORS.card,
              position: "relative"
            }}
          >
            {goal.id === selectedGoalId && (
              <div style={{
                position: "absolute",
                top: -9,
                right: 14,
                width: 14,
                height: 14,
                background: accentColor,
                borderRadius: "50%",
                border: "2px solid #fff",
                boxShadow: "0 2px 8px #6a5cff4a"
              }} />
            )}
            <span style={{fontWeight: 700, color: COLORS.text, fontSize: "1.13em"}}>{goal.name}</span>
            <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
              {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
            </div>
            <div style={{marginTop: 4, fontSize: 12, color: "#90a0c0"}}>
              By {goal.targetDate}
            </div>
            <div style={{ display: "flex", marginTop: 10, gap: "10px" }}>
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
      <h2 style={{margin: 0, color: accentColor, fontSize: 23, letterSpacing: "0.6px", fontWeight: 700}}>{initial ? "Edit Goal" : "Add New Goal"}</h2>
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
        <div style={{display: "flex", gap: 16, marginTop: 11}}>
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
 * SmartContributionCalculator - Form for setting income/expenses and suggestion.
 */
// PUBLIC_INTERFACE
function SmartContributionCalculator({ prefs, onPrefsChange, selectedGoal, accent }) {
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
    <div style={{...styles.sideCard, borderColor: accent}}>
      <h4 style={{margin: 0, color: accent, fontWeight: 700, fontSize: 18, letterSpacing: "1px"}}>Smart Planner</h4>
      <div style={{margin: "6px 0 13px", fontSize: 14, color: COLORS.textSecondary}}>
        Adjust goals based on monthly income and spending.
      </div>
      <div style={{display: "flex", gap: 8, alignItems: "center"}}>
        <input
          type="number"
          placeholder="Monthly Income (₹)"
          style={{...styles.formInput, maxWidth: 110, background: "#fafbff"}}
          value={prefs.income}
          onChange={(e) => onPrefsChange({ income: e.target.value })}
          min={0}
        />
        <input
          type="number"
          placeholder="Monthly Expenses (₹)"
          style={{...styles.formInput, maxWidth: 110, background: "#fafbff"}}
          value={prefs.expenses}
          onChange={(e) => onPrefsChange({ expenses: e.target.value })}
          min={0}
        />
      </div>
      {suggestionMsg && (
        <div style={{marginTop: 7, color: accent, fontWeight: 500, fontSize: 14}}>
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
          <h2 style={{margin: 0, color: colors.primary, fontSize: "2.2rem", fontWeight: 700}}>{goal.name}</h2>
          <div style={{fontWeight: 400, color: colors.textSecondary, margin: "3px 0 8px", fontSize: 15}}>
            {goal.description}
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#8b92ad", background: "#f0f3fd", borderRadius: 8, padding: "2px 13px" }}>
          <span role="img" aria-label="calendar">📅</span> Target: {goal.targetDate}
        </div>
      </div>
      <div style={{margin: "22px 0 12px"}}>
        <ProgressBar percent={prog.percent} colors={colors} />
      </div>
      <div style={{display: "flex", gap: "32px", marginBottom: 16, fontSize: 16}}>
        <div><b>{formatCurrency(goal.savedAmount)}</b> / {formatCurrency(goal.targetAmount)} saved</div>
        <div>Milestone: <b>{prog.percent}%</b></div>
        <div>Left: <b>{formatCurrency(goal.targetAmount - goal.savedAmount)}</b></div>
      </div>
      <form style={{marginBottom: 10, marginTop: 2}} onSubmit={handleSave}>
        <label style={styles.formLabel}>Add To Savings</label>
        <div style={{display: "flex", alignItems: "center", gap: 9, marginTop: 3}}>
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
              You need to save <b>{formatCurrency(prog.needToSavePerPeriod)}</b> per {prog.periodsLeft > 30 ? "month" : "day"} to reach your goal on time.
            </span>
          )}
        </div>
      </div>
      <div style={{marginTop: 18}}>
        <button style={{...styles.secondaryBtn, background: "#f9f9fc", color: colors.accent, border: `1.2px solid ${colors.accent}`}}
          onClick={() => setShowReminder(!showReminder)}>
          {showReminder ? "Hide Reminders" : "⚡️ Auto Reminders & Habit Builder"}
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
  // Stylish colored bar
  return (
    <div style={{
      height: 17,
      background: COLORS.progressBg,
      borderRadius: 9,
      overflow: "hidden",
      border: `1.2px solid ${COLORS.border}`,
      boxShadow: "0 1px 5px #c4c8df2a"
    }}>
      <div style={{
        width: percent + "%",
        background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 70%)`,
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
    <form style={{marginTop: 18, background: "#fafbfc", padding: 14, borderRadius: 9, border: `1.5px solid ${accentColor}`, boxShadow: "0 1px 10px #b6bcf024"}} onSubmit={handleSave}>
      <div style={{fontWeight: 700, color: accentColor, marginBottom: 7, fontSize: 16, letterSpacing: "0.4px"}}>Set a Habit Reminder</div>
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
        <div style={{marginTop: 8, fontSize: 13, color: accentColor, fontWeight: 500}}>
          ✔️ Active: {reminder.schedule.frequency} at {reminder.schedule.time}
          {reminder.schedule.message ? " - " + reminder.schedule.message : ""}
        </div>
      )}
      <div style={{marginTop: 8, fontSize: 12, color: "#aaa"}}>
        <i>Reminders show as notifications when you visit Goalie.<br/> (No backend integration yet.)</i>
      </div>
    </form>
  );
}

// =====================================================
// Inline Styles (modernized with dashboard theme)
// =====================================================
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: COLORS.bgGradient,
    color: COLORS.text,
    fontFamily: "Inter, Arial, sans-serif",
  },
  navbar: {
    background: COLORS.navbarBg,
    height: 62,
    boxShadow: COLORS.shadow,
    padding: "0 3vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 42,
    borderBottom: `1.5px solid ${COLORS.border}`,
    transition: "box-shadow .26s"
  },
  logo: {
    fontWeight: 700,
    fontSize: "1.5rem",
    letterSpacing: "0.7px",
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: COLORS.primary,
    userSelect: "none"
  },
  logoIcon: {
    fontSize: 32,
    marginTop: 1,
    marginRight: 2,
    userSelect: "none"
  },
  logoText: {
    fontWeight: 700,
    letterSpacing: "1.6px",
    color: COLORS.primary
  },
  addGoalBtn: {
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "9px 20px",
    fontWeight: 600,
    fontSize: 17,
    cursor: "pointer",
    boxShadow: "0 1px 10px #babfff60",
    transition: "background 0.2s, box-shadow 0.15s"
  },
  main: {
    marginTop: 74,
    minHeight: "calc(100vh - 74px)",
    background: "none",
    padding: "0 0 58px 0",
  },
  dashboard: {
    display: "flex",
    gap: 49,
    alignItems: "flex-start",
    maxWidth: 1280,
    margin: "0 auto",
    padding: "40px 16px 0 16px",
    boxSizing: "border-box",
  },
  sideColumn: {
    flex: "1 1 320px",
    minWidth: 254,
    marginRight: 10,
    display: "flex",
    flexDirection: "column",
    gap: 25,
  },
  detailColumn: {
    flex: "4 1 1",
    minWidth: 385,
    maxWidth: 662,
    alignSelf: "stretch",
    padding: "6px 0 0 0",
  },
  goalCard: {
    border: `2.5px solid ${COLORS.border}`,
    borderRadius: 11,
    padding: "16px 18px 15px",
    marginBottom: 16,
    cursor: "pointer",
    background: COLORS.card,
    transition: "border .2s, box-shadow .22s, background .23s",
    boxShadow: COLORS.shadow,
    boxSizing: "border-box"
  },
  cardBtn: {
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: 5,
    fontSize: 13,
    padding: "5px 13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.17s"
  },
  cardBtnDelete: {
    background: "#fc5656",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    fontSize: 13,
    padding: "5px 13px",
    fontWeight: 500,
    cursor: "pointer"
  },
  sideCard: {
    background: "#fff",
    padding: "18px 16px 15px",
    border: `1.7px solid ${COLORS.accent}`,
    borderRadius: 12,
    marginTop: 13,
    fontSize: 15,
    boxShadow: COLORS.shadow
  },
  detailCard: {
    background: "#fff",
    borderRadius: 15,
    boxShadow: "0 2px 14px #6098ff0c, 0 10px 38px #c4ffe60c",
    padding: "34px 36px 23px",
    marginTop: 6,
    marginBottom: 20,
    minHeight: 302,
    border: `1.2px solid ${COLORS.border}`,
  },
  placeholderDetail: {
    marginTop: 46,
    background: "#fffffff9",
    borderRadius: 18,
    padding: "60px 32px 44px",
    minHeight: 210,
    textAlign: "center",
    boxShadow: "0 2px 13px #b3d0ff21",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  formCard: {
    padding: "34px 26px 24px",
    marginTop: 13,
    background: "#ffffff",
    borderRadius: 14,
    boxShadow: "0 2px 11px #034c213a, 0 4px 44px #61edaf10",
    minWidth: 340,
    maxWidth: 520,
    border: `1.2px solid ${COLORS.border}`,
  },
  formGroup: {
    marginBottom: 17,
  },
  formLabel: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: 700,
    marginBottom: 4,
    display: "block"
  },
  formInput: {
    width: "100%",
    border: `1.4px solid ${COLORS.border}`,
    borderRadius: 7,
    padding: "10px 13px",
    fontSize: 15,
    marginTop: 3,
    color: COLORS.text,
    background: "#fbfcff",
    outline: "none"
  },
  primaryBtn: {
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "7px 23px",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 1px 7px #8be7c330",
    transition: "background 0.2s"
  },
  secondaryBtn: {
    background: COLORS.secondary,
    color: "#4b4600",
    border: "none",
    borderRadius: 7,
    padding: "6px 20px",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    transition: "background 0.18s"
  },
  detailRow: {
    margin: "13px 0 7px",
    fontSize: 15,
    color: COLORS.textSecondary,
  },
};
