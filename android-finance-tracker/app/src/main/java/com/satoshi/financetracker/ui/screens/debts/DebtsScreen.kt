package com.satoshi.financetracker.ui.screens.debts

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.satoshi.financetracker.domain.model.Debt
import com.satoshi.financetracker.domain.model.DebtCategory
import com.satoshi.financetracker.ui.components.EmptyState
import com.satoshi.financetracker.ui.components.StatCard
import com.satoshi.financetracker.ui.theme.LossRed
import com.satoshi.financetracker.util.formatMoney
import com.satoshi.financetracker.util.formatMoneyExact
import com.satoshi.financetracker.util.formatMonths
import com.satoshi.financetracker.util.monthsFromNowLabel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DebtsScreen(viewModel: DebtsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    var sheetOpen by remember { mutableStateOf(false) }
    var editing by remember { mutableStateOf<Debt?>(null) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Debts") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { editing = null; sheetOpen = true }) {
                Icon(Icons.Default.Add, contentDescription = "Add debt")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(
                        label = "Total debt",
                        value = state.totalBalance.formatMoney(),
                        valueColor = LossRed,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        label = "Monthly minimums",
                        value = state.totalMinimumPayment.formatMoney(),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            if (state.rows.isEmpty() && !state.isLoading) {
                item {
                    EmptyState(
                        icon = Icons.Default.CreditCard,
                        title = "No debts tracked",
                        subtitle = "Tap + to add credit cards, loans, or a mortgage and see payoff projections."
                    )
                }
            }

            items(state.rows, key = { it.debt.id }) { row ->
                DebtCard(row) { editing = row.debt; sheetOpen = true }
            }

            item { Spacer(Modifier.height(72.dp)) }
        }
    }

    if (sheetOpen) {
        DebtSheet(
            editing = editing,
            onDismiss = { sheetOpen = false },
            onSave = { id, name, category, balance, apr, minPayment ->
                viewModel.saveDebt(id, name, category, balance, apr, minPayment)
                sheetOpen = false
            },
            onDelete = { id ->
                viewModel.deleteDebt(id)
                sheetOpen = false
            }
        )
    }
}

@Composable
private fun DebtCard(row: DebtRow, onClick: () -> Unit) {
    val debt = row.debt
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(debt.name, style = MaterialTheme.typography.titleMedium)
                    Text(
                        debt.category.label,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    debt.balance.formatMoney(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = LossRed
                )
            }
            Text(
                "${String.format(java.util.Locale.US, "%.2f", debt.aprPercent)}% APR · ${debt.minimumPayment.formatMoneyExact()}/mo minimum",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            val projection = row.projection
            if (projection != null) {
                Text(
                    "Paid off ${projection.months.monthsFromNowLabel()} (${projection.months.formatMonths()}) · " +
                        "${projection.totalInterest.formatMoney()} interest",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else if (debt.balance > 0) {
                Text(
                    "Minimum payment never pays this off — interest outpaces it",
                    style = MaterialTheme.typography.bodySmall,
                    color = LossRed
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun DebtSheet(
    editing: Debt?,
    onDismiss: () -> Unit,
    onSave: (id: Long?, name: String, category: DebtCategory, balance: Double, apr: Double, minPayment: Double) -> Unit,
    onDelete: (Long) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var name by remember { mutableStateOf(editing?.name ?: "") }
    var category by remember { mutableStateOf(editing?.category ?: DebtCategory.CREDIT_CARD) }
    var balanceText by remember { mutableStateOf(editing?.balance?.toString() ?: "") }
    var aprText by remember { mutableStateOf(editing?.aprPercent?.toString() ?: "") }
    var minPaymentText by remember { mutableStateOf(editing?.minimumPayment?.toString() ?: "") }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier
                .padding(horizontal = 20.dp)
                .padding(bottom = 24.dp)
                .imePadding(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                if (editing == null) "Add debt" else "Edit debt",
                style = MaterialTheme.typography.titleLarge
            )

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Name (e.g. Visa, Car loan)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                DebtCategory.entries.forEach { c ->
                    FilterChip(
                        selected = category == c,
                        onClick = { category = c },
                        label = { Text(c.label) }
                    )
                }
            }

            OutlinedTextField(
                value = balanceText,
                onValueChange = { balanceText = it },
                label = { Text("Current balance") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = aprText,
                onValueChange = { aprText = it },
                label = { Text("APR %") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = minPaymentText,
                onValueChange = { minPaymentText = it },
                label = { Text("Minimum monthly payment") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            val balance = balanceText.toDoubleOrNull()
            val apr = aprText.toDoubleOrNull()
            val minPayment = minPaymentText.toDoubleOrNull()
            val canSave = name.isNotBlank() && balance != null && balance >= 0 &&
                apr != null && apr >= 0 && minPayment != null && minPayment >= 0

            Button(
                onClick = { onSave(editing?.id, name.trim(), category, balance!!, apr!!, minPayment!!) },
                enabled = canSave,
                modifier = Modifier.fillMaxWidth()
            ) { Text("Save") }

            if (editing != null) {
                OutlinedButton(
                    onClick = { onDelete(editing.id) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.height(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Delete", color = LossRed)
                }
            }
        }
    }
}
