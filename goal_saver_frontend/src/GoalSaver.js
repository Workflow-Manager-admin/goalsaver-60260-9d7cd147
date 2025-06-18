import React, { useState } from "react";

/**
 * GoalSaver - Main container for the personal finance GoalSaver app.
 * Features: Multiple goals, smart calculator, habit builder, reminders, progress tracker.
 * No real-money transactions. Pure frontend demo with simulated APIs.
 */

// PUBLIC_INTERFACE
function GoalSaver() {
  // Simulated goal data state
  const [goals, setGoals] = useState([
    // Example starter
    {
      id: 1,
      name: "Emergency Fund",
      targetAmount: 5000,
      savedAmount: 1250,
      deadline: "2024-12-31",
      reminder: true,
      freq: "Weekly",
    },
    {
      id: 2,
      name: "Vacation - Japan",
      targetAmount: 3000,
      savedAmount: 800,
      deadline: "2025-06-30",
      reminder: false,
      freq: "Monthly",
    }
  ]);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", deadline: "" });
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState({ theme: "light" });

  // Helper: progress percent
  function getProgress(goal) {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.min(Math.round(100 * goal.savedAmount / goal.targetAmount), 100);
  }

  // Helper: smart monthly/weekly contribution calculator
  function getContributionSuggestion(goal) {
    if (!goal.targetAmount || !goal.deadline) return "-";
    const today = new Date();
    const end = new Date(goal.deadline);
    const remaining = Math.max(0, (end - today) / (1000 * 60 * 60 * 24)); // days
    if (remaining <= 1) return "Set future deadline";
    const remAmt = goal.targetAmount - goal.savedAmount;
    if (remAmt <= 0) return "Goal Reached!";
    const perWeek = remAmt / (remaining / 7);
    const perMonth = remAmt / ((remaining / 30) || 1);
    return `₹${Math.ceil(perWeek)} /week or ₹${Math.ceil(perMonth)} /month`;
  }

  // Simulated API: Add goal
  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      setMessage("Please fill all goal fields.");
      return;
    }
    setGoals([
      ...goals,
      {
        id: Date.now(),
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        savedAmount: 0,
        deadline: newGoal.deadline,
        reminder: false,
        freq: "Weekly"
      }
    ]);
    setNewGoal({ name: "", targetAmount: "", deadline: "" });
    setMessage("Goal added!");
    setTimeout(() => setMessage(""), 1200);
  };

  // Simulated API: Update goal
  const updateGoal = (id, updates) => {
    setGoals(goals.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  // Simulated API: Delete goal
  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // Simulated API: Increment savings
  const addSaving = (id, amt = 100) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, savedAmount: g.savedAmount + Number(amt) } : g
    ));
  };

  // Simulated API: User preferences
  const updatePreferences = (prefs) => setPreferences({ ...preferences, ...prefs });

  // Simulated API: Reminder toggle
  const toggleReminder = (id) => {
    setGoals(goals.map(g =>
      g.id === id ? { ...g, reminder: !g.reminder } : g
    ));
  };

  // THEME COLORS
  const colors = {
    primary: "#4CAF50",
    secondary: "#FFC107",
    accent: "#2196F3"
  };

  // Render
  return (
    <div style={{ minHeight: "100vh", background: "#fafbfc" }}>
      {/* NAVBAR */}
      <nav style={{
        background: colors.primary,
        padding: "18px 0 16px 0",
        boxShadow: "0 2px 8px #0001"
      }}>
        <div style={{
          maxWidth: 940,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          padding: "0 28px"
        }}>
          <div style={{ display: "flex", alignItems: "center", fontWeight: 700, fontSize: 23 }}>
            <span style={{ fontWeight: 900, marginRight: 8, color: colors.accent }}>💰</span>
            GoalSaver
          </div>
          <div>
            <select
              value={preferences.theme}
              style={{
                padding: "4px 10px",
                borderRadius: 18,
                border: "none",
                background: "#fff",
                color: colors.primary,
                marginRight: 12,
                fontWeight: 500
              }}
              onChange={e => updatePreferences({ theme: e.target.value })}
              aria-label="Theme selector"
            >
              <option value="light">🌞 Light</option>
              <option value="dark">🌜 Dark</option>
            </select>
          </div>
        </div>
      </nav>


      {/* MAIN Dashboard */}
      <main style={{
        maxWidth: 940,
        margin: "0 auto",
        marginTop: 36,
        padding: "30px 14px 50px 14px"
      }}>
        {/* HEADER */}
        <section style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{
            color: colors.accent, fontWeight: 600, fontSize: 17, marginBottom: 4
          }}>Plan. Save. Achieve 🎯</div>
          <h1 style={{
            fontSize: "2.9em",
            margin: "10px 0 16px 0",
            fontWeight: 800,
            lineHeight: 1.08
          }}>
            Your Personal<br />Goal Savings Dashboard
          </h1>
          <div style={{
            color: "#385564",
            fontSize: 18,
            maxWidth: 540,
            margin: "0 auto 14px"
          }}>
            Set goals, visualize your savings journey, calculate smart contributions, and build lifelong saving habits.
            <br />
            <span style={{color: colors.secondary, fontWeight: 500}}>No bank details required!</span>
          </div>
        </section>

        {/* GOAL CREATION FORM */}
        <section style={{
          background: "#fff",
          borderRadius: 15,
          boxShadow: "0 4px 12px 0 #2365c012, 0 1.5px 2px #0001",
          padding: "24px",
          marginBottom: 40,
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: colors.primary,
            marginBottom: 14,
            letterSpacing: 0.5
          }}>Add New Goal</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "end" }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: "block", fontWeight: 500, color: "#385564" }}>Goal Name</label>
              <input
                style={styles.input}
                placeholder="e.g. Buy a Bicycle"
                value={newGoal.name}
                onChange={e => setNewGoal(g => ({ ...g, name: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, color: "#385564" }}>Target (₹)</label>
              <input
                style={styles.input}
                type="number"
                min={0}
                placeholder="₹ amount"
                value={newGoal.targetAmount}
                onChange={e => setNewGoal(g => ({ ...g, targetAmount: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, color: "#385564" }}>Deadline</label>
              <input
                style={styles.input}
                type="date"
                value={newGoal.deadline}
                onChange={e => setNewGoal(g => ({ ...g, deadline: e.target.value }))}
              />
            </div>
            <button
              style={{
                ...styles.btn,
                marginLeft: 16,
                marginTop: 4,
                background: colors.primary,
                color: "#fff"
              }}
              onClick={addGoal}
            >
              Add Goal
            </button>
          </div>
          {message && (
            <div style={{
              marginTop: 9,
              color: colors.accent,
              fontWeight: 500,
              fontSize: 15
            }}>{message}</div>
          )}
        </section>

        {/* GOALS DASHBOARD */}
        <section>
          {goals.length === 0 ? (
            <div style={{ textAlign: "center", color: "#666", fontSize: 19, fontWeight: 500, marginTop: 34 }}>
              No goals yet! Add your first goal above.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 32
            }}>
              {goals.map(goal => (
                <div key={goal.id} style={{
                  background: "#fff",
                  borderRadius: 15,
                  boxShadow: "0 3px 8px #2365c012, 0 1.5px 2px #0001",
                  padding: "23px 22px 20px 22px",
                  position: "relative"
                }}>
                  {/* Goal Title and Actions */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 7
                  }}>
                    <div style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#1d3557"
                    }}>{goal.name}</div>
                    <button
                      aria-label="Delete Goal"
                      title="Delete Goal"
                      onClick={() => deleteGoal(goal.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#888",
                        fontSize: 21,
                        cursor: "pointer"
                      }}
                    >🗑️</button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{
                    height: 24,
                    width: "100%",
                    background: "#eee",
                    borderRadius: 12,
                    margin: "8px 0 12px 0",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: 24,
                      width: `${getProgress(goal)}%`,
                      background: colors.primary,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: goal.savedAmount > 0 ? "flex-end" : "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      transition: "width 0.4s cubic-bezier(0.38, 1.2, 0.23, 0.91)"
                    }}>
                      <span style={{
                        paddingRight: 10,
                        opacity: getProgress(goal) > 16 ? 0.99 : 0,
                        whiteSpace: "nowrap"
                      }}>{getProgress(goal)}%</span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#232e35", fontSize: 16 }}>
                        Saved: ₹{goal.savedAmount}
                      </div>
                      <div style={{ fontSize: 15, color: "#7d8592" }}>
                        Target: ₹{goal.targetAmount}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "#1d3557",
                      background: "#e9f6fc",
                      borderRadius: 7,
                      padding: "4px 12px",
                      fontWeight: 500,
                      border: `1px solid ${colors.accent}55`
                    }}>
                      Deadline: {goal.deadline}
                    </div>
                  </div>

                  {/* Contribution Calculator */}
                  <div style={{
                    fontSize: 15,
                    color: colors.primary,
                    marginTop: 14,
                    fontWeight: 500
                  }}>
                    <span style={{ color: colors.accent, fontWeight: 500 }}>Contribution: </span>
                    {getContributionSuggestion(goal)}
                  </div>

                  {/* Habit & Reminder */}
                  <div style={{
                    marginTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 17
                  }}>
                    <button
                      style={{
                        ...styles.btnSmall,
                        background: colors.accent,
                        color: "#fff"
                      }}
                      onClick={() => addSaving(goal.id, 100)}
                      title="Simulate ₹100 Saved"
                    >+ ₹100
                    </button>
                    <button
                      style={{
                        ...styles.btnSmall,
                        background: colors.secondary,
                        color: "#24292f"
                      }}
                      onClick={() => toggleReminder(goal.id)}
                    >
                      {goal.reminder ? "🔔 Reminders On" : "🔕 Reminders Off"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      {/* FOOTER */}
      <footer style={{
        fontSize: 15,
        color: "#888",
        background: "transparent",
        textAlign: "center",
        margin: "24px 0 20px 0"
      }}>
        GoalSaver &copy; {new Date().getFullYear()} &mdash; Demo, no financial advice provided.
      </footer>
    </div>
  );
}

const styles = {
  input: {
    width: "100%",
    padding: "7px 11px",
    marginTop: 4,
    fontSize: 15,
    borderRadius: 7,
    border: "1.3px solid #b5babe",
    outline: "none",
    marginBottom: 0,
    background: "#f7f8fa"
  },
  btn: {
    fontWeight: 600,
    border: "none",
    borderRadius: 7,
    padding: "10px 22px",
    background: "#4CAF50",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer"
  },
  btnSmall: {
    fontWeight: 600,
    border: "none",
    borderRadius: 20,
    padding: "7px 14px",
    fontSize: 15,
    cursor: "pointer",
    marginRight: 8,
    marginTop: 2
  }
};

export default GoalSaver;
