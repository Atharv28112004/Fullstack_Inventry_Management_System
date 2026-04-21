package com.smartinventory.service;

import com.smartinventory.dto.DashboardSummary;
import com.smartinventory.model.Product;
import com.smartinventory.model.Sale;
import com.smartinventory.model.Supplier;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class InventoryService {
    private final Map<Long, Product> products = new LinkedHashMap<>();
    private final Map<Long, Supplier> suppliers = new LinkedHashMap<>();
    private final Map<Long, Sale> sales = new LinkedHashMap<>();

    private final AtomicLong productIds = new AtomicLong(100);
    private final AtomicLong supplierIds = new AtomicLong(10);
    private final AtomicLong saleIds = new AtomicLong(500);

    @PostConstruct
    void seedData() {
        Supplier global = saveSupplier(new Supplier(null, "Global Office Supply", "Maya Rao",
                "maya@globaloffice.example", "+91 98765 11001", "Excellent"));
        Supplier apex = saveSupplier(new Supplier(null, "Apex Electronics", "Rohan Mehta",
                "rohan@apex.example", "+91 98765 22002", "Reliable"));
        Supplier fresh = saveSupplier(new Supplier(null, "FreshPack Logistics", "Sara Khan",
                "sara@freshpack.example", "+91 98765 33003", "Watchlist"));

        saveProduct(new Product(null, "Barcode Scanner Pro", "BCS-4021", "Electronics", 18, 8,
                new BigDecimal("6200.00"), apex.getId()));
        saveProduct(new Product(null, "Thermal Label Roll", "TLR-1180", "Packaging", 6, 12,
                new BigDecimal("320.00"), fresh.getId()));
        saveProduct(new Product(null, "Inventory Ledger Book", "ILB-7780", "Stationery", 42, 10,
                new BigDecimal("180.00"), global.getId()));
        saveProduct(new Product(null, "RFID Tag Bundle", "RFID-900", "Electronics", 9, 15,
                new BigDecimal("1450.00"), apex.getId()));

        recordSale(new Sale(null, 101L, null, 3, LocalDate.now().minusDays(1), null, "Retail"));
        recordSale(new Sale(null, 103L, null, 5, LocalDate.now().minusDays(2), null, "Online"));
        recordSale(new Sale(null, 102L, null, 2, LocalDate.now().minusDays(4), null, "Distributor"));
    }

    public List<Product> findProducts() {
        return products.values().stream()
                .sorted(Comparator.comparing(Product::getName))
                .toList();
    }

    public Product saveProduct(Product product) {
        ensureSupplierExists(product.getSupplierId());
        if (product.getId() == null) {
            product.setId(productIds.incrementAndGet());
        }
        products.put(product.getId(), product);
        return product;
    }

    public Product updateProduct(Long id, Product product) {
        if (!products.containsKey(id)) {
            throw new IllegalArgumentException("Product not found");
        }
        ensureSupplierExists(product.getSupplierId());
        product.setId(id);
        products.put(id, product);
        return product;
    }

    public void deleteProduct(Long id) {
        if (products.remove(id) == null) {
            throw new IllegalArgumentException("Product not found");
        }
    }

    public List<Product> lowStockProducts() {
        return products.values().stream()
                .filter(Product::isLowStock)
                .sorted(Comparator.comparingInt(Product::getQuantity))
                .toList();
    }

    public List<Supplier> findSuppliers() {
        return new ArrayList<>(suppliers.values());
    }

    public Supplier saveSupplier(Supplier supplier) {
        if (supplier.getId() == null) {
            supplier.setId(supplierIds.incrementAndGet());
        }
        suppliers.put(supplier.getId(), supplier);
        return supplier;
    }

    public List<Sale> findSales() {
        return sales.values().stream()
                .sorted(Comparator.comparing(Sale::getSaleDate).reversed())
                .toList();
    }

    public Sale recordSale(Sale sale) {
        Product product = products.get(sale.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("Product not found");
        }
        if (sale.getQuantitySold() > product.getQuantity()) {
            throw new IllegalArgumentException("Cannot sell more units than available stock");
        }

        product.setQuantity(product.getQuantity() - sale.getQuantitySold());
        sale.setId(saleIds.incrementAndGet());
        sale.setProductName(product.getName());
        sale.setRevenue(product.getUnitPrice().multiply(BigDecimal.valueOf(sale.getQuantitySold())));
        if (sale.getChannel() == null || sale.getChannel().isBlank()) {
            sale.setChannel("Retail");
        }
        sales.put(sale.getId(), sale);
        return sale;
    }

    public DashboardSummary summary() {
        int totalUnits = products.values().stream().mapToInt(Product::getQuantity).sum();
        BigDecimal inventoryValue = products.values().stream()
                .map(Product::getInventoryValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal salesRevenue = sales.values().stream()
                .map(Sale::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardSummary(
                products.size(),
                lowStockProducts().size(),
                totalUnits,
                inventoryValue,
                salesRevenue,
                suppliers.size()
        );
    }

    private void ensureSupplierExists(Long supplierId) {
        if (supplierId == null || !suppliers.containsKey(supplierId)) {
            throw new IllegalArgumentException("Supplier not found");
        }
    }
}
