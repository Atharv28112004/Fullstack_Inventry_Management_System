import React from "react";
import ReactDOM from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Truck,
  WalletCards
} from "lucide-react";
import "./styles.css";

const API_URL = "http://localhost:8080/api";

const fallbackSuppliers = [
  {
    id: 11,
    name: "Global Office Supply",
    contactPerson: "Maya Rao",
    email: "maya@globaloffice.example",
    phone: "+91 98765 11001",
    reliability: "Excellent"
  },
  {
    id: 12,
    name: "Apex Electronics",
    contactPerson: "Rohan Mehta",
    email: "rohan@apex.example",
    phone: "+91 98765 22002",
    reliability: "Reliable"
  },
  {
    id: 13,
    name: "FreshPack Logistics",
    contactPerson: "Sara Khan",
    email: "sara@freshpack.example",
    phone: "+91 98765 33003",
    reliability: "Watchlist"
  }
];

const fallbackProducts = [
  {
    id: 101,
    name: "Barcode Scanner Pro",
    sku: "BCS-4021",
    category: "Electronics",
    quantity: 15,
    lowStockThreshold: 8,
    unitPrice: 6200,
    supplierId: 12
  },
  {
    id: 102,
    name: "Thermal Label Roll",
    sku: "TLR-1180",
    category: "Packaging",
    quantity: 4,
    lowStockThreshold: 12,
    unitPrice: 320,
    supplierId: 13
  },
  {
    id: 103,
    name: "Inventory Ledger Book",
    sku: "ILB-7780",
    category: "Stationery",
    quantity: 37,
    lowStockThreshold: 10,
    unitPrice: 180,
    supplierId: 11
  },
  {
    id: 104,
    name: "RFID Tag Bundle",
    sku: "RFID-900",
    category: "Electronics",
    quantity: 9,
    lowStockThreshold: 15,
    unitPrice: 1450,
    supplierId: 12
  }
];

const fallbackSales = [
  {
    id: 501,
    productId: 101,
    productName: "Barcode Scanner Pro",
    quantitySold: 3,
    saleDate: "2026-04-15",
    revenue: 18600,
    channel: "Retail"
  },
  {
    id: 502,
    productId: 103,
    productName: "Inventory Ledger Book",
    quantitySold: 5,
    saleDate: "2026-04-14",
    revenue: 900,
    channel: "Online"
  },
  {
    id: 503,
    productId: 102,
    productName: "Thermal Label Roll",
    quantitySold: 2,
    saleDate: "2026-04-12",
    revenue: 640,
    channel: "Distributor"
  }
];

const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  quantity: 0,
  lowStockThreshold: 5,
  unitPrice: 0,
  supplierId: 11
};

const emptySupplier = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  reliability: "Reliable"
};

const emptySale = {
  productId: 101,
  quantitySold: 1,
  saleDate: new Date().toISOString().slice(0, 10),
  channel: "Retail"
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

async function api(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function App() {
  const [products, setProducts] = React.useState(fallbackProducts);
  const [suppliers, setSuppliers] = React.useState(fallbackSuppliers);
  const [sales, setSales] = React.useState(fallbackSales);
  const [summary, setSummary] = React.useState(null);
  const [productForm, setProductForm] = React.useState(emptyProduct);
  const [supplierForm, setSupplierForm] = React.useState(emptySupplier);
  const [saleForm, setSaleForm] = React.useState(emptySale);
  const [editingId, setEditingId] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [notice, setNotice] = React.useState("Demo data loaded. Start the backend to sync changes.");
  const [isBackendLive, setIsBackendLive] = React.useState(false);

  const computedSummary = React.useMemo(() => {
    const inventoryValue = products.reduce(
      (total, product) => total + Number(product.unitPrice) * Number(product.quantity),
      0
    );
    const salesRevenue = sales.reduce((total, sale) => total + Number(sale.revenue || 0), 0);
    return {
      totalProducts: products.length,
      lowStockProducts: products.filter((product) => product.quantity <= product.lowStockThreshold).length,
      totalUnits: products.reduce((total, product) => total + Number(product.quantity), 0),
      inventoryValue,
      salesRevenue,
      supplierCount: suppliers.length
    };
  }, [products, sales, suppliers]);

  const dashboard = summary || computedSummary;

  const supplierName = React.useCallback(
    (id) => suppliers.find((supplier) => supplier.id === Number(id))?.name || "Unassigned",
    [suppliers]
  );

  const loadData = React.useCallback(async () => {
    try {
      const [nextSummary, nextProducts, nextSuppliers, nextSales] = await Promise.all([
        api("/summary"),
        api("/products"),
        api("/suppliers"),
        api("/sales")
      ]);
      setSummary(nextSummary);
      setProducts(nextProducts);
      setSuppliers(nextSuppliers);
      setSales(nextSales);
      setIsBackendLive(true);
      setNotice("Connected to Spring Boot API.");
      setProductForm((current) => ({
        ...current,
        supplierId: nextSuppliers[0]?.id || current.supplierId
      }));
      setSaleForm((current) => ({
        ...current,
        productId: nextProducts[0]?.id || current.productId
      }));
    } catch {
      setIsBackendLive(false);
      setSummary(null);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveProduct(event) {
    event.preventDefault();
    const payload = {
      ...productForm,
      quantity: Number(productForm.quantity),
      lowStockThreshold: Number(productForm.lowStockThreshold),
      unitPrice: Number(productForm.unitPrice),
      supplierId: Number(productForm.supplierId)
    };

    try {
      if (isBackendLive) {
        if (editingId) {
          await api(`/products/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        } else {
          await api("/products", { method: "POST", body: JSON.stringify(payload) });
        }
        await loadData();
      } else if (editingId) {
        setProducts((items) => items.map((item) => (item.id === editingId ? { ...payload, id: editingId } : item)));
      } else {
        setProducts((items) => [{ ...payload, id: Date.now() }, ...items]);
      }

      setNotice(editingId ? "Product updated." : "Product added.");
      setEditingId(null);
      setProductForm({ ...emptyProduct, supplierId: suppliers[0]?.id || 11 });
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function deleteProduct(productId) {
    try {
      if (isBackendLive) {
        await api(`/products/${productId}`, { method: "DELETE" });
        await loadData();
      } else {
        setProducts((items) => items.filter((item) => item.id !== productId));
      }
      setNotice("Product deleted.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function saveSupplier(event) {
    event.preventDefault();
    try {
      if (isBackendLive) {
        await api("/suppliers", { method: "POST", body: JSON.stringify(supplierForm) });
        await loadData();
      } else {
        setSuppliers((items) => [{ ...supplierForm, id: Date.now() }, ...items]);
      }
      setSupplierForm(emptySupplier);
      setNotice("Supplier added to tracking.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function recordSale(event) {
    event.preventDefault();
    const payload = {
      ...saleForm,
      productId: Number(saleForm.productId),
      quantitySold: Number(saleForm.quantitySold)
    };

    try {
      if (isBackendLive) {
        await api("/sales", { method: "POST", body: JSON.stringify(payload) });
        await loadData();
      } else {
        const product = products.find((item) => item.id === payload.productId);
        if (!product || payload.quantitySold > product.quantity) {
          throw new Error("Cannot sell more units than available stock");
        }
        setProducts((items) =>
          items.map((item) =>
            item.id === payload.productId ? { ...item, quantity: item.quantity - payload.quantitySold } : item
          )
        );
        setSales((items) => [
          {
            ...payload,
            id: Date.now(),
            productName: product.name,
            revenue: product.unitPrice * payload.quantitySold
          },
          ...items
        ]);
      }
      setSaleForm({ ...emptySale, productId: products[0]?.id || 101 });
      setNotice("Sale recorded and stock adjusted.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setProductForm(product);
    document.querySelector("#product-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filteredProducts = products.filter((product) => {
    const target = `${product.name} ${product.sku} ${product.category} ${supplierName(product.supplierId)}`.toLowerCase();
    return target.includes(query.toLowerCase());
  });

  const lowStockProducts = products.filter((product) => product.quantity <= product.lowStockThreshold);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Smart inventory management</p>
          <h1>Stock clarity for every shelf, supplier, and sale.</h1>
          <p className="hero-text">
            Track products, prevent stockouts, monitor suppliers, and record sales with business rules handled by a
            Spring Boot API.
          </p>
          <div className="hero-actions">
            <a href="#product-form" className="button primary">Add product</a>
            <a href="#alerts" className="button secondary">Review alerts</a>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80"
          alt="Organized warehouse shelves"
          className="hero-image"
        />
      </section>

      <section className="status-strip">
        <span className={isBackendLive ? "pulse live" : "pulse"}></span>
        <strong>{isBackendLive ? "API live" : "Offline demo"}</strong>
        <span>{notice}</span>
        <button type="button" onClick={loadData} className="link-button">
          <RefreshCw size={16} /> Sync
        </button>
      </section>

      <section className="metrics" aria-label="Inventory summary">
        <Metric icon={<PackageCheck />} label="Products" value={dashboard.totalProducts} />
        <Metric icon={<AlertTriangle />} label="Low stock" value={dashboard.lowStockProducts} tone="alert" />
        <Metric icon={<ClipboardList />} label="Units on hand" value={dashboard.totalUnits} />
        <Metric icon={<WalletCards />} label="Inventory value" value={currency(dashboard.inventoryValue)} />
        <Metric icon={<BarChart3 />} label="Sales revenue" value={currency(dashboard.salesRevenue)} />
        <Metric icon={<Truck />} label="Suppliers" value={dashboard.supplierCount} />
      </section>

      <section className="workspace">
        <div className="panel inventory-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Products</p>
              <h2>Inventory control</h2>
            </div>
            <label className="search">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory" />
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Supplier</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <span>{product.sku}</span>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <span className={product.quantity <= product.lowStockThreshold ? "stock low" : "stock"}>
                        {product.quantity} / min {product.lowStockThreshold}
                      </span>
                    </td>
                    <td>{supplierName(product.supplierId)}</td>
                    <td>{currency(Number(product.unitPrice) * Number(product.quantity))}</td>
                    <td className="row-actions">
                      <button type="button" onClick={() => editProduct(product)}>Edit</button>
                      <button type="button" onClick={() => deleteProduct(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form id="product-form" className="panel form-panel" onSubmit={saveProduct}>
          <p className="eyebrow">{editingId ? "Update product" : "New product"}</p>
          <h2>{editingId ? "Adjust inventory" : "Add inventory"}</h2>
          <div className="form-grid">
            <Field label="Name" value={productForm.name} onChange={(value) => setProductForm({ ...productForm, name: value })} />
            <Field label="SKU" value={productForm.sku} onChange={(value) => setProductForm({ ...productForm, sku: value })} />
            <Field label="Category" value={productForm.category} onChange={(value) => setProductForm({ ...productForm, category: value })} />
            <Field type="number" label="Quantity" value={productForm.quantity} onChange={(value) => setProductForm({ ...productForm, quantity: value })} />
            <Field type="number" label="Low stock min" value={productForm.lowStockThreshold} onChange={(value) => setProductForm({ ...productForm, lowStockThreshold: value })} />
            <Field type="number" label="Unit price" value={productForm.unitPrice} onChange={(value) => setProductForm({ ...productForm, unitPrice: value })} />
            <label>
              Supplier
              <select
                value={productForm.supplierId}
                onChange={(event) => setProductForm({ ...productForm, supplierId: event.target.value })}
              >
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </label>
          </div>
          <button className="button primary full" type="submit">
            <Plus size={16} /> {editingId ? "Save changes" : "Add product"}
          </button>
        </form>
      </section>

      <section className="lower-grid">
        <div className="panel" id="alerts">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Alerts</p>
              <h2>Low stock watchlist</h2>
            </div>
            <AlertTriangle className="accent-icon" />
          </div>
          <div className="alert-list">
            {lowStockProducts.map((product) => (
              <div className="alert-item" key={product.id}>
                <strong>{product.name}</strong>
                <span>{product.quantity} left, reorder at {product.lowStockThreshold}</span>
                <small>{supplierName(product.supplierId)}</small>
              </div>
            ))}
            {lowStockProducts.length === 0 && <p className="muted">No products are below threshold.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Suppliers</p>
              <h2>Supplier tracking</h2>
            </div>
            <Truck className="accent-icon" />
          </div>
          <form className="inline-form" onSubmit={saveSupplier}>
            <Field label="Company" value={supplierForm.name} onChange={(value) => setSupplierForm({ ...supplierForm, name: value })} />
            <Field label="Contact" value={supplierForm.contactPerson} onChange={(value) => setSupplierForm({ ...supplierForm, contactPerson: value })} />
            <Field label="Email" value={supplierForm.email} onChange={(value) => setSupplierForm({ ...supplierForm, email: value })} />
            <button className="button primary" type="submit">Add supplier</button>
          </form>
          <div className="supplier-list">
            {suppliers.map((supplier) => (
              <article key={supplier.id}>
                <strong>{supplier.name}</strong>
                <span>{supplier.contactPerson}</span>
                <small>{supplier.email} · {supplier.reliability}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="panel sales-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Sales</p>
              <h2>Sales history</h2>
            </div>
            <ShoppingCart className="accent-icon" />
          </div>
          <form className="sale-form" onSubmit={recordSale}>
            <label>
              Product
              <select value={saleForm.productId} onChange={(event) => setSaleForm({ ...saleForm, productId: event.target.value })}>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>
            <Field type="number" label="Quantity" value={saleForm.quantitySold} onChange={(value) => setSaleForm({ ...saleForm, quantitySold: value })} />
            <Field type="date" label="Date" value={saleForm.saleDate} onChange={(value) => setSaleForm({ ...saleForm, saleDate: value })} />
            <button className="button primary" type="submit">Record sale</button>
          </form>
          <div className="sales-list">
            {sales.map((sale) => (
              <article key={sale.id}>
                <div>
                  <strong>{sale.productName}</strong>
                  <span>{sale.quantitySold} units · {sale.channel}</span>
                </div>
                <div>
                  <strong>{currency(sale.revenue)}</strong>
                  <span>{sale.saleDate}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }) {
  return (
    <article className={`metric ${tone || ""}`}>
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
    </label>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
