package com.satoshi.financetracker.domain

/** Pure debt amortization math, shared by the Debts and Payoff Plan screens. */
object DebtMath {

    /** Cap simulations at 100 years — anything longer counts as "never pays off". */
    const val MAX_MONTHS = 1200

    /** Balances below half a cent are considered paid off. */
    private const val EPSILON = 0.005

    enum class Strategy { AVALANCHE, SNOWBALL }

    data class PayoffProjection(val months: Int, val totalInterest: Double)

    data class SimDebt(
        val name: String,
        val balance: Double,
        val aprPercent: Double,
        val minimumPayment: Double
    )

    data class SimResult(
        val months: Int,
        val totalInterest: Double,
        /** Debt names in the order they get paid off. */
        val payoffOrder: List<String>
    )

    /**
     * Months and total interest to pay off a single debt at a fixed monthly payment.
     * Returns null when the payment never retires the debt (payment doesn't cover
     * monthly interest, or payoff would take longer than [MAX_MONTHS]).
     */
    fun projectPayoff(balance: Double, aprPercent: Double, monthlyPayment: Double): PayoffProjection? {
        if (balance <= 0) return PayoffProjection(0, 0.0)
        if (monthlyPayment <= 0) return null
        val monthlyRate = aprPercent / 100.0 / 12.0
        if (monthlyRate > 0 && monthlyPayment <= balance * monthlyRate) return null

        var remaining = balance
        var totalInterest = 0.0
        var months = 0
        while (remaining > EPSILON && months < MAX_MONTHS) {
            val interest = remaining * monthlyRate
            totalInterest += interest
            remaining += interest - monthlyPayment
            months++
        }
        return if (remaining > EPSILON) null else PayoffProjection(months, totalInterest)
    }

    /**
     * Month-by-month payoff simulation across all debts with a fixed total budget
     * (sum of minimum payments + [extraMonthly]). As each debt closes, its payment
     * rolls into the priority target: highest APR first for AVALANCHE, smallest
     * balance first for SNOWBALL. Returns null if the debts never get paid off.
     */
    fun simulate(debts: List<SimDebt>, extraMonthly: Double, strategy: Strategy): SimResult? {
        if (debts.isEmpty()) return SimResult(0, 0.0, emptyList())

        class State(val debt: SimDebt, var balance: Double)

        val states = debts.map { State(it, it.balance) }
        val budget = debts.sumOf { it.minimumPayment } + extraMonthly
        if (budget <= 0) return null

        val priority: Comparator<State> = when (strategy) {
            Strategy.AVALANCHE -> compareByDescending<State> { it.debt.aprPercent }.thenBy { it.balance }
            Strategy.SNOWBALL -> compareBy<State> { it.balance }.thenByDescending { it.debt.aprPercent }
        }

        var months = 0
        var totalInterest = 0.0
        val payoffOrder = mutableListOf<String>()

        while (states.any { it.balance > EPSILON } && months < MAX_MONTHS) {
            months++
            val open = states.filter { it.balance > EPSILON }

            open.forEach { s ->
                val interest = s.balance * s.debt.aprPercent / 100.0 / 12.0
                s.balance += interest
                totalInterest += interest
            }

            var available = budget
            open.forEach { s ->
                val payment = minOf(s.debt.minimumPayment, s.balance, available)
                s.balance -= payment
                available -= payment
            }
            for (s in open.sortedWith(priority)) {
                if (available <= 0) break
                val payment = minOf(available, s.balance)
                s.balance -= payment
                available -= payment
            }

            open.forEach { s ->
                if (s.balance <= EPSILON && s.debt.name !in payoffOrder) payoffOrder.add(s.debt.name)
            }
        }

        return if (states.any { it.balance > EPSILON }) null
        else SimResult(months, totalInterest, payoffOrder)
    }
}
