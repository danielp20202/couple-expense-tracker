/* ============================================================================
 * content.ts — ALL USER-FACING TEXT IN ONE PLACE
 * ----------------------------------------------------------------------------
 * WHAT TO CHANGE HERE:
 *   Every page title, button label, helper sentence, and empty-state message
 *   the app shows. Edit the strings below and the wording updates across the
 *   app — you never have to hunt through components to change copy.
 *
 *   `config` at the bottom controls currency + locale formatting and the two
 *   partners' fallback labels.
 * ========================================================================== */

export const content = {
  appName: "Laura & Daniel",
  tagline: "Our shared rent & expense tracker",

  nav: {
    dashboard: "Summary",
    addExpense: "Add expense",
    history: "History",
    fixedCosts: "Fixed costs",
    types: "Categories",
  },

  dashboard: {
    title: "Monthly summary",
    totalLabel: "Total shared expenses",
    paidPersonallyLabel: "Paid using a personal credit/debit card",
    fairShareLabel: "Each person's share",
    transferTitle: "Transfer to the joint account",
    transferHelp:
      "What each person should move into the joint account every month.",
    settledTitle: "Direct settlement",
    settledNobody: "All square — nobody owes the other directly this month.",
    owesDirectly: (from: string, to: string, amount: string) =>
      `${from} owes ${to} ${amount} directly.`,
    nothingThisMonth: "No expenses logged for this month yet.",
    addFixedCosts: "Add this month's fixed costs",
    fixedCostsAdded: (n: number) =>
      n === 0
        ? "This month's fixed costs are already in."
        : `Added ${n} fixed cost${n === 1 ? "" : "s"} to this month.`,
  },

  fixedCosts: {
    title: "Fixed costs",
    help: "Recurring monthly costs. Add them to a month from the Monthly summary, then edit or remove individual copies from History as needed.",
    addTitle: "Add a fixed cost",
    amount: "Amount",
    category: "Category",
    paidBy: "Who pays",
    paidFrom: "Paid from",
    personal: "Personal card",
    joint: "Joint account",
    add: "Add fixed cost",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    pause: "Pause",
    resume: "Resume",
    paused: "(paused)",
    confirmDelete:
      "Delete this fixed cost? It won't be added to future months. Expenses already created from it stay.",
    empty: "No fixed costs yet. Add your first one above.",
    noTypes: "Add a category first before creating fixed costs.",
  },

  expenseForm: {
    title: "Add an expense",
    amount: "Amount",
    type: "Category",
    paidBy: "Who paid",
    paidFrom: "Paid from",
    paidFromPersonal: "Personal card",
    paidFromJoint: "Joint account",
    date: "Date",
    note: "Note (optional)",
    notePlaceholder: "e.g. groceries at Metro",
    submit: "Save expense",
    saving: "Saving…",
    success: "Expense saved.",
    noTypes: "Add a category first before logging expenses.",
  },

  history: {
    title: "Expense history",
    empty: "No expenses found.",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Delete this expense?",
    // Settlement (transfer) records
    transfersTitle: "Transfers",
    confirmDeleteTransfer: "Delete this transfer record? It will change the running balance.",
    // Filters & controls
    monthFilterLabel: "Month",
    allMonths: "All months",
    perPageLabel: "Show",
    perPageSuffix: "entries",
    // Multi-select / bulk delete
    selectAll: "Select all",
    selectedCount: (n: number) => `${n} selected`,
    deleteSelected: "Delete selected",
    confirmDeleteSelected: (n: number) =>
      `Delete ${n} selected ${n === 1 ? "entry" : "entries"}? This can't be undone.`,
    clearSelection: "Clear",
    showingRecent: (n: number) => `Showing the ${n} most recent entries.`,
  },

  types: {
    title: "Categories",
    help: "Categories you can pick when logging an expense.",
    addPlaceholder: "New category name",
    add: "Add",
    rename: "Rename",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Delete this category? Expenses using it must be reassigned or removed first.",
    empty: "No categories yet. Add your first one above.",
  },

  profiles: {
    pickTitle: "Who's tracking?",
    pickSubtitle: "Choose your profile",
    switch: "Switch",
    greeting: (name: string) => `Hi, ${name}`,
    youTag: "You",
    // --- Settlement card: depositor (e.g. Daniel) ---
    yourTransferTitle: "What you deposit into the joint account",
    yourTransferHelp: "Deposit this into the joint account so the rent gets covered together.",
    depositNothing: "Nothing to deposit right now — you're all settled up.",
    youCoveredExtra: (amt: string) =>
      `You've covered ${amt} extra — transfer ${amt} less at the next rent.`,
    // --- Settlement card: rent holder (e.g. Laura) ---
    reclaimTitle: "Transfer back to your account",
    reclaimHelp: "Transfer this amount from the joint account into your personal account.",
    settleButton: (amt: string) => `I've transferred ${amt} to my account`,
    allSettled: "You're all settled up.",
    partnerCoveredExtra: (partner: string, amt: string) =>
      `${partner}'s covered ${amt} extra this cycle — it'll come off the next rent transfer.`,
    // History: a logged settlement row.
    transferRowLabel: "Transfer to personal account",
    // Profile photos, reused by the picker and the switcher. Falls back to initials if absent.
    photos: { Laura: "/images/laura_1.webp" } as Record<string, string>,
  },

  months: {
    prev: "‹ Prev",
    next: "Next ›",
  },

  // -- Formatting + partner config ------------------------------------------
  config: {
    locale: "en-CA",
    currency: "CAD",
    // Shown if a profile has no display_name set in the database.
    fallbackPersonA: "Person A",
    fallbackPersonB: "Person B",
  },
} as const;
