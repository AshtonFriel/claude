package com.satoshi.financetracker.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.satoshi.financetracker.data.db.entity.DebtEntity
import com.satoshi.financetracker.data.db.entity.HoldingEntity
import com.satoshi.financetracker.data.db.entity.SnapshotEntity
import com.satoshi.financetracker.data.repository.FinanceRepository
import com.satoshi.financetracker.data.repository.Result
import com.satoshi.financetracker.domain.model.DebtCategory
import com.satoshi.financetracker.domain.model.HoldingType
import com.satoshi.financetracker.domain.model.Quote
import com.satoshi.financetracker.domain.model.toHolding
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val hasAnyData: Boolean = false,
    val netWorth: Double = 0.0,
    val totalAssets: Double = 0.0,
    val totalDebts: Double = 0.0,
    val assetsByType: List<Pair<HoldingType, Double>> = emptyList(),
    val debtsByCategory: List<Pair<DebtCategory, Double>> = emptyList(),
    val snapshots: List<SnapshotEntity> = emptyList()
)

@HiltViewModel
class DashboardViewModel @Inject constructor(private val repo: FinanceRepository) : ViewModel() {

    private val refreshTrigger = MutableStateFlow(0)
    private val _state = MutableStateFlow(DashboardUiState())
    val state: StateFlow<DashboardUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            repo.observeSnapshots().collect { snaps ->
                _state.update { it.copy(snapshots = snaps) }
            }
        }
        viewModelScope.launch {
            combine(
                repo.observeHoldings().distinctUntilChanged(),
                repo.observeDebts().distinctUntilChanged(),
                refreshTrigger
            ) { holdings, debts, _ -> holdings to debts }
                .collectLatest { (holdings, debts) -> recompute(holdings, debts) }
        }
    }

    fun refresh() {
        refreshTrigger.update { it + 1 }
    }

    private suspend fun recompute(holdings: List<HoldingEntity>, debts: List<DebtEntity>) {
        _state.update { it.copy(isLoading = true, error = null) }

        val symbols = holdings.mapNotNull { it.quoteSymbol }
        var error: String? = null
        val quotes: Map<String, Quote> = when (val result = repo.getQuotes(symbols)) {
            is Result.Success -> result.data
            is Result.Error -> {
                error = result.message
                emptyMap()
            }
        }

        val joined = holdings.map { it.toHolding(quotes) }
        val totalAssets = joined.sumOf { it.currentValue }
        val totalDebts = debts.sumOf { it.balance }
        val hasAnyData = holdings.isNotEmpty() || debts.isNotEmpty()

        if (hasAnyData && error == null) {
            repo.recordSnapshot(totalAssets, totalDebts)
        }

        _state.update { s ->
            s.copy(
                isLoading = false,
                error = error,
                hasAnyData = hasAnyData,
                netWorth = totalAssets - totalDebts,
                totalAssets = totalAssets,
                totalDebts = totalDebts,
                assetsByType = joined.groupBy { it.type }
                    .mapValues { (_, list) -> list.sumOf { it.currentValue } }
                    .toList()
                    .sortedByDescending { it.second },
                debtsByCategory = debts.groupBy { it.category }
                    .mapValues { (_, list) -> list.sumOf { it.balance } }
                    .toList()
                    .sortedByDescending { it.second }
            )
        }
    }
}
