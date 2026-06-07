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
  appName: "Our Expenses",
  tagline: "Shared 50/50, settled every month",

  nav: {
    dashboard: "Summary",
    addExpense: "Add expense",
    history: "History",
    types: "Categories",
  },

  dashboard: {
    title: "Monthly summary",
    totalLabel: "Total shared expenses",
    paidPersonallyLabel: "Paid personally",
    fairShareLabel: "Each person's share",
    transferTitle: "Transfer to the joint account",
    transferHelp:
      "What each person should move into the joint account so you've both covered an equal half.",
    settledTitle: "Direct settlement",
    settledNobody: "All square — nobody owes the other directly this month.",
    owesDirectly: (from: string, to: string, amount: string) =>
      `${from} owes ${to} ${amount} directly.`,
    nothingThisMonth: "No expenses logged for this month yet.",
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
    empty: "No expenses for this month.",
    cols: {
      date: "Date",
      type: "Category",
      paidBy: "Paid by",
      paidFrom: "Source",
      amount: "Amount",
      note: "Note",
      actions: "",
    },
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Delete this expense?",
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
