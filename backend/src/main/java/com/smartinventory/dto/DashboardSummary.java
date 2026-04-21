package com.smartinventory.dto;

import java.math.BigDecimal;

public record DashboardSummary(
        int totalProducts,
        int lowStockProducts,
        int totalUnits,
        BigDecimal inventoryValue,
        BigDecimal salesRevenue,
        int supplierCount
) {
}
