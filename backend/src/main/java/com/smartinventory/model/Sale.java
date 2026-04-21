package com.smartinventory.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Sale {
    private Long id;

    @NotNull(message = "Product id is required")
    private Long productId;

    private String productName;

    @Min(value = 1, message = "Quantity sold must be at least 1")
    private int quantitySold;

    @NotNull(message = "Sale date is required")
    private LocalDate saleDate;

    private BigDecimal revenue;
    private String channel;

    public Sale() {
    }

    public Sale(Long id, Long productId, String productName, int quantitySold, LocalDate saleDate,
                BigDecimal revenue, String channel) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantitySold = quantitySold;
        this.saleDate = saleDate;
        this.revenue = revenue;
        this.channel = channel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }

    public LocalDate getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDate saleDate) {
        this.saleDate = saleDate;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }
}
