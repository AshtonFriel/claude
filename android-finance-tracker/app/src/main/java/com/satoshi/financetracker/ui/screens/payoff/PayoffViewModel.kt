package com.satoshi.financetracker.ui.screens.payoff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.financetracker.data.repository.FinanceRepository
import com.satoshi.financetracker.domain.DebtMath
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PayoffUiState(
    val isLoading: Boolean = true,
    val hasDebts: Boolean = false,
    val extraInput: String = "",
    /** Everything at minimum payments only (no extra). */
    val baseline: DebtMath.SimResult? = null,
    val avalanche: DebtMath.SimResult? = null,
    val snowball: DebtMath.SimResult? = null
)

@HiltViewModel
class PayoffViewModel @Inject constructor(private val repo: FinanceRepository) : ViewModel() {

    private val extraInput = MutableStateFlow("")
    private val _state = MutableStateFlow(PayoffUiState())
    val state: StateFlow<PayoffUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            combine(repo.observeDebts(), extraInput) { debts, extraText ->
                val simDebts = debts
                    .filter { it.balance > 0 }
                    .map { DebtMath.SimDebt(it.name, it.balance, it.aprPercent, it.minimumPayment) }
                val extra = extraText.toDoubleOrNull()?.coerceAtLeast(0.0) ?: 0.0
                PayoffUiState(
                    isLoading = false,
                    hasDebts = simDebts.isNotEmpty(),
                    extraInput = extraText,
                    baseline = DebtMath.simulate(simDebts, 0.0, DebtMath.Strategy.AVALANCHE),
                    avalanche = DebtMath.simulate(simDebts, extra, DebtMath.Strategy.AVALANCHE),
                    snowball = DebtMath.simulate(simDebts, extra, DebtMath.Strategy.SNOWBALL)
                )
            }.collect { newState -> _state.update { newState } }
        }
    }

    fun setExtra(text: String) {
        extraInput.value = text
    }
}
