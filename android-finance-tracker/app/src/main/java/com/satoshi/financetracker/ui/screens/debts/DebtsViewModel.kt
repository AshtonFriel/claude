package com.satoshi.financetracker.ui.screens.debts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.financetracker.data.db.entity.DebtEntity
import com.satoshi.financetracker.data.repository.FinanceRepository
import com.satoshi.financetracker.domain.DebtMath
import com.satoshi.financetracker.domain.model.Debt
import com.satoshi.financetracker.domain.model.DebtCategory
import com.satoshi.financetracker.domain.model.toDebt
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DebtRow(
    val debt: Debt,
    /** Payoff at minimum payment; null when the minimum never retires the debt. */
    val projection: DebtMath.PayoffProjection?
)

data class DebtsUiState(
    val isLoading: Boolean = true,
    val rows: List<DebtRow> = emptyList(),
    val totalBalance: Double = 0.0,
    val totalMinimumPayment: Double = 0.0
)

@HiltViewModel
class DebtsViewModel @Inject constructor(private val repo: FinanceRepository) : ViewModel() {

    private val _state = MutableStateFlow(DebtsUiState())
    val state: StateFlow<DebtsUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            repo.observeDebts().collect { entities ->
                val rows = entities.map { entity ->
                    val debt = entity.toDebt()
                    DebtRow(
                        debt = debt,
                        projection = DebtMath.projectPayoff(debt.balance, debt.aprPercent, debt.minimumPayment)
                    )
                }
                _state.value = DebtsUiState(
                    isLoading = false,
                    rows = rows,
                    totalBalance = rows.sumOf { it.debt.balance },
                    totalMinimumPayment = rows.sumOf { it.debt.minimumPayment }
                )
            }
        }
    }

    fun saveDebt(
        id: Long?,
        name: String,
        category: DebtCategory,
        balance: Double,
        aprPercent: Double,
        minimumPayment: Double
    ) {
        viewModelScope.launch {
            repo.upsertDebt(
                DebtEntity(
                    id = id ?: 0,
                    name = name,
                    category = category,
                    balance = balance,
                    aprPercent = aprPercent,
                    minimumPayment = minimumPayment
                )
            )
        }
    }

    fun deleteDebt(id: Long) {
        viewModelScope.launch { repo.deleteDebt(id) }
    }
}
