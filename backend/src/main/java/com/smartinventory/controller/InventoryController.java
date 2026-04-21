package com.smartinventory.controller;

import com.smartinventory.dto.DashboardSummary;
import com.smartinventory.model.Product;
import com.smartinventory.model.Sale;
import com.smartinventory.model.Supplier;
import com.smartinventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/summary")
    public DashboardSummary summary() {
        return inventoryService.summary();
    }

    @GetMapping("/products")
    public List<Product> products() {
        return inventoryService.findProducts();
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.saveProduct(product));
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        return inventoryService.updateProduct(id, product);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        inventoryService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alerts/low-stock")
    public List<Product> lowStockAlerts() {
        return inventoryService.lowStockProducts();
    }

    @GetMapping("/suppliers")
    public List<Supplier> suppliers() {
        return inventoryService.findSuppliers();
    }

    @PostMapping("/suppliers")
    public ResponseEntity<Supplier> createSupplier(@Valid @RequestBody Supplier supplier) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.saveSupplier(supplier));
    }

    @GetMapping("/sales")
    public List<Sale> sales() {
        return inventoryService.findSales();
    }

    @PostMapping("/sales")
    public ResponseEntity<Sale> recordSale(@Valid @RequestBody Sale sale) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.recordSale(sale));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBusinessError(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationError(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation failed");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}
