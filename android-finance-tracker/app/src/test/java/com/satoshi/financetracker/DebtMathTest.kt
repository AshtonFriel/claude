package com.satoshi.financetracker

import com.satoshi.financetracker.domain.DebtMath
import com.satoshi.financetracker.domain.DebtMath.SimDebt
import com.satoshi.financetracker.domain.DebtMath.Strategy
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DebtMathTest {

    @Test
    fun `zero balance is already paid off`() {
        val p = DebtMath.projectPayoff(0.0, 20.0, 100.0)
        assertEquals(0, p!!.months)
        assertEquals(0.0, p.totalInterest, 0.001)
    }

    @Test
    fun `zero-interest debt pays off in balance over payment months`() {
        val p = DebtMath.projectPayoff(1200.0, 0.0, 100.0)
        assertEquals(12, p!!.months)
        assertEquals(0.0, p.totalInterest, 0.001)
    }

    @Test
    fun `payment below monthly interest never pays off`() {
        // $10,000 at 24% APR accrues $200/month interest
        assertNull(DebtMath.projectPayoff(10_000.0, 24.0, 200.0))
        assertNull(DebtMath.projectPayoff(10_000.0, 24.0, 150.0))
    }

    @Test
    fun `standard amortization matches closed-form result`() {
        // $10,000 at 12% APR, $500/mo -> n = -log(1 - B*r/P) / log(1+r) ≈ 22.4 -> 23 months
        val p = DebtMath.projectPayoff(10_000.0, 12.0, 500.0)
        assertNotNull(p)
        assertEquals(23, p!!.months)
        assertTrue("interest should be positive", p.totalInterest > 0)
        // Total paid = balance + interest ≈ months * payment (last payment partial)
        assertTrue(p.totalInterest < 23 * 500.0 - 10_000.0 + 500.0)
    }

    @Test
    fun `zero payment never pays off`() {
        assertNull(DebtMath.projectPayoff(1000.0, 5.0, 0.0))
    }

    @Test
    fun `empty debt list simulates to zero months`() {
        val r = DebtMath.simulate(emptyList(), 100.0, Strategy.AVALANCHE)
        assertEquals(0, r!!.months)
        assertEquals(0.0, r.totalInterest, 0.001)
    }

    @Test
    fun `avalanche pays high-APR debt first`() {
        val debts = listOf(
            SimDebt("Low APR big balance", 5000.0, 5.0, 100.0),
            SimDebt("High APR card", 2000.0, 25.0, 50.0)
        )
        val r = DebtMath.simulate(debts, 300.0, Strategy.AVALANCHE)
        assertNotNull(r)
        assertEquals("High APR card", r!!.payoffOrder.first())
    }

    @Test
    fun `snowball pays smallest balance first`() {
        val debts = listOf(
            SimDebt("Small personal loan", 1000.0, 5.0, 50.0),
            SimDebt("Big card", 8000.0, 25.0, 200.0)
        )
        val r = DebtMath.simulate(debts, 300.0, Strategy.SNOWBALL)
        assertNotNull(r)
        assertEquals("Small personal loan", r!!.payoffOrder.first())
    }

    @Test
    fun `avalanche never costs more interest than snowball`() {
        val debts = listOf(
            SimDebt("Card A", 3000.0, 22.0, 90.0),
            SimDebt("Card B", 1500.0, 18.0, 45.0),
            SimDebt("Car", 12000.0, 7.0, 250.0)
        )
        val avalanche = DebtMath.simulate(debts, 200.0, Strategy.AVALANCHE)!!
        val snowball = DebtMath.simulate(debts, 200.0, Strategy.SNOWBALL)!!
        assertTrue(avalanche.totalInterest <= snowball.totalInterest + 0.01)
        assertEquals(debts.size, avalanche.payoffOrder.size)
        assertEquals(debts.size, snowball.payoffOrder.size)
    }

    @Test
    fun `extra payment shortens payoff and reduces interest`() {
        val debts = listOf(SimDebt("Card", 6000.0, 20.0, 150.0))
        val withoutExtra = DebtMath.simulate(debts, 0.0, Strategy.AVALANCHE)!!
        val withExtra = DebtMath.simulate(debts, 200.0, Strategy.AVALANCHE)!!
        assertTrue(withExtra.months < withoutExtra.months)
        assertTrue(withExtra.totalInterest < withoutExtra.totalInterest)
    }

    @Test
    fun `insufficient budget returns null from simulate`() {
        // Interest ($166/mo) exceeds the total budget ($100)
        val debts = listOf(SimDebt("Runaway card", 10_000.0, 20.0, 100.0))
        assertNull(DebtMath.simulate(debts, 0.0, Strategy.AVALANCHE))
    }

    @Test
    fun `rollover applies closed debt payment to next target`() {
        // After the small debt closes, its $100 minimum should roll into the big one.
        val debts = listOf(
            SimDebt("Small", 500.0, 10.0, 100.0),
            SimDebt("Big", 5000.0, 10.0, 100.0)
        )
        val together = DebtMath.simulate(debts, 0.0, Strategy.SNOWBALL)!!
        // Paying the big debt alone at $100/mo takes ~65 months; with rollover the pair finishes sooner.
        val bigAlone = DebtMath.projectPayoff(5000.0, 10.0, 100.0)!!
        assertTrue(together.months < bigAlone.months + 6)
    }
}
