import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Bell, Check, ClipboardList, Clock3, LogOut, Package, Plus, RefreshCw, Settings as SettingsIcon, ShieldAlert, Trash2, Utensils, X } from "lucide-react";
import { Button, DemoTag, PageHeader, StateBlock, VegMark, fieldClass } from "@/components/site/ui";
import { isStoreOpen, storeClock, weeklyHours } from "@/domain/hours";
import { formatINR } from "@/domain/money";
import { canTransition, nextStatuses, STATUS_LABEL } from "@/domain/order-status";
import type { Category, MenuItem, Order, OrderStatus, StoreSettings } from "@/domain/types";
import { compressDemoImage } from "@/lib/image-compression";
import { adminAuth, menuRepo, orderRepo, settingsRepo } from "@/repositories";
import { pageMeta } from "@/lib/seo";
import { useCategories, useMenuItems, useOrders, useSettings } from "@/repositories/queries";
import { resetDemoData } from "@/repositories/demo";

export const Route = createFileRoute("/admin")({
  head: () => pageMeta("Owner dashboard", "Explore the owner dashboard in this browser-only restaurant portfolio demo.", { path: "/admin", noindex: true }),
  component: AdminPage,
});

type Tab = "orders" | "menu" | "categories" | "settings";
type StatusFilter = "all" | OrderStatus;

function todayString() {
  return storeClock(new Date(), "Asia/Kolkata").date;
}

function AdminPage() {
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    adminAuth.isSignedIn().then(setSignedIn).catch(() => setSignedIn(false));
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    const result = await adminAuth.signIn(email, password);
    setLoginBusy(false);
    if (!result.ok) setLoginError(result.message || "Could not open the demo dashboard.");
    else setSignedIn(true);
  }

  async function logout() {
    await adminAuth.signOut();
    setSignedIn(false);
    setTab("orders");
  }

  async function resetAll() {
    if (!window.confirm("Reset all local demo orders, menu edits, settings and cart data in this browser?")) return;
    resetDemoData();
    await queryClient.invalidateQueries();
    setNotice("This browser's demo data has been reset to the sample defaults.");
    setTab("orders");
  }

  if (signedIn === null) return <div className="container-page py-12"><StateBlock kind="loading" title="Opening owner demo" /></div>;

  if (!signedIn) {
    return (
      <>
        <PageHeader title="Owner dashboard" intro="A private-looking interface for exploring restaurant operations. Authentication is simulated in this demo." />
        <div className="container-page max-w-lg py-10">
          <div className="rounded-lg border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3"><ShieldAlert className="size-6 text-primary" /><div><h2 className="font-display text-2xl font-semibold">Demo owner sign in</h2><DemoTag>Not real authentication</DemoTag></div></div>
            <form onSubmit={login} className="mt-6 space-y-4">
              <label className="block"><span className="mb-1.5 block text-sm font-medium">Email</span><input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium">Demo password</span><input className={fieldClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
              {loginError && <p role="alert" className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" loading={loginBusy} className="w-full">Open demo dashboard</Button>
            </form>
            <p className="mt-4 rounded-md bg-warning/40 p-3 text-xs leading-5">For this portfolio preview, any valid email and non-empty password opens a session in this browser tab. This is not secure access control. Do not use real credentials.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Owner dashboard" intro="Manage simulated orders, the sample menu and configurable store details." />
      <div className="container-page py-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><DemoTag>Browser demo</DemoTag><span className="text-xs text-muted-foreground">Changes stay in this browser only.</span></div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetAll}><RefreshCw /> Reset demo data</Button>
            <Button size="sm" variant="outline" onClick={logout}><LogOut /> Sign out</Button>
          </div>
        </div>
        {notice && <p role="status" className="mb-4 rounded-md border border-veg/30 bg-veg/5 p-3 text-sm">{notice}</p>}
        <div role="tablist" aria-label="Owner dashboard sections" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ["orders", ClipboardList, "Orders"],
            ["menu", Utensils, "Menu"],
            ["categories", Package, "Categories"],
            ["settings", SettingsIcon, "Settings"],
          ] as const).map(([value, Icon, label]) => <button key={value} role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-semibold ${tab === value ? "border-primary bg-primary/5 text-primary" : "bg-card hover:bg-secondary"}`}><Icon className="size-4" />{label}</button>)}
        </div>
        {tab === "orders" && <OrdersPanel />}
        {tab === "menu" && <MenuPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "settings" && <SettingsPanel />}
      </div>
    </>
  );
}

function OrdersPanel() {
  const { data: orders = [], isLoading, refetch } = useOrders(6000);
  const { data: settings } = useSettings();
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "verified">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [newIds, setNewIds] = useState<string[]>([]);
  const previousIds = useRef<string[] | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const ids = orders.map((order) => order.id);
    if (previousIds.current) {
      const added = ids.filter((id) => !previousIds.current!.includes(id));
      if (added.length) {
        setNewIds((current) => [...added, ...current].slice(0, 20));
        if (soundEnabled) {
          try {
            const Audio = window.AudioContext;
            const audio = new Audio();
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            oscillator.connect(gain);
            gain.connect(audio.destination);
            oscillator.frequency.value = 880;
            gain.gain.value = 0.05;
            oscillator.start();
            oscillator.stop(audio.currentTime + 0.12);
            oscillator.onended = () => void audio.close();
          } catch { /* Browser sound can be unavailable or blocked. */ }
        }
      }
    }
    previousIds.current = ids;
  }, [orders, soundEnabled]);

  const today = todayString();
  const filtered = useMemo(() => orders.filter((order) => {
    const date = storeClock(new Date(order.createdAt), "Asia/Kolkata").date;
    if (dateFilter === "today" && date !== today) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (paymentFilter === "pending" && order.paymentStatus === "verified") return false;
    if (paymentFilter === "verified" && order.paymentStatus !== "verified") return false;
    const q = search.trim().toLowerCase();
    return !q || order.orderNumber.toLowerCase().includes(q) || order.customerPhone.includes(q);
  }), [orders, dateFilter, statusFilter, paymentFilter, search, today]);

  const selected = orders.find((order) => order.id === selectedId) ?? null;
  const todayOrders = orders.filter((order) => storeClock(new Date(order.createdAt), "Asia/Kolkata").date === today && order.status !== "cancelled");
  const pending = orders.filter((order) => order.status === "placed").length;
  const sales = todayOrders.reduce((sum, order) => sum + order.totalPaise, 0);

  useEffect(() => {
    const original = document.title;
    document.title = pending ? `(${pending}) New orders | Owner demo` : "Owner dashboard | Sharma's Kitchen";
    return () => { document.title = original; };
  }, [pending]);

  async function transition(order: Order, status: OrderStatus) {
    setActionError("");
    if (!canTransition(order.status, status, order.fulfilment)) {
      setActionError("That status change is not allowed.");
      return;
    }
    const reason = status === "cancelled" ? cancelReason.trim() : undefined;
    if (status === "cancelled" && !reason) {
      setActionError("Add a cancellation or rejection reason before continuing.");
      return;
    }
    try {
      await orderRepo.updateStatus(order.id, status, reason);
      setCancelReason("");
      setNewIds((current) => current.filter((id) => id !== order.id));
      await refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update the demo order.");
    }
  }

  async function verifyPayment(order: Order) {
    setActionError("");
    try {
      await orderRepo.markPaymentVerified(order.id);
      await refetch();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update payment status.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Pending orders" value={String(pending)} note="Awaiting owner action" />
        <Metric label="Today's orders" value={String(todayOrders.length)} note="Cancelled orders excluded" />
        <Metric label="Today's sample sales" value={formatINR(sales)} note="Demo totals, not revenue" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">New orders are checked every 6 seconds while this tab is open.</p>
        <Button size="sm" variant="outline" onClick={() => setSoundEnabled((value) => !value)}><Bell /> Sound {soundEnabled ? "on" : "off"}</Button>
      </div>
      <section className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block"><span className="mb-1 block text-xs font-medium">Date</span><select className={fieldClass} value={dateFilter} onChange={(event) => setDateFilter(event.target.value as "today" | "all")}><option value="today">Today</option><option value="all">All dates</option></select></label>
          <label className="block"><span className="mb-1 block text-xs font-medium">Order status</span><select className={fieldClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}><option value="all">All statuses</option>{Object.entries(STATUS_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-xs font-medium">Payment</span><select className={fieldClass} value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as "all" | "pending" | "verified")}><option value="all">All payments</option><option value="pending">Pending / unverified</option><option value="verified">Verified</option></select></label>
          <label className="block"><span className="mb-1 block text-xs font-medium">Search order or phone</span><input className={fieldClass} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="DEMO-… or mobile" /></label>
        </div>
      </section>

      {isLoading ? <StateBlock kind="loading" title="Loading orders" /> : filtered.length === 0 ? <StateBlock kind="empty" title="No orders match these filters">Sample checkouts placed in this browser appear here.</StateBlock> : (
        <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b p-4"><h2 className="font-display text-xl font-semibold">Order queue</h2><span className="text-xs text-muted-foreground">{filtered.length} orders</span></div>
            <ul className="divide-y">
              {filtered.map((order) => <li key={order.id}>
                <button type="button" onClick={() => { setSelectedId(order.id); setActionError(""); }} className={`flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-secondary/60 ${selectedId === order.id ? "bg-secondary" : ""} ${newIds.includes(order.id) ? "animate-pulse bg-warning/30" : ""}`}>
                  <span className="min-w-0"><span className="flex flex-wrap items-center gap-2 font-semibold">{order.orderNumber}{newIds.includes(order.id) && <span className="rounded-sm bg-warning px-1.5 py-0.5 text-[10px] uppercase">New</span>}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{order.customerName} · {order.fulfilment} · {order.items.length} lines</span><span className="mt-1 block text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span></span>
                  <span className="shrink-0 text-right"><strong className="block tabular-nums">{formatINR(order.totalPaise)}</strong><span className="mt-1 block text-xs text-muted-foreground">{STATUS_LABEL[order.status]}</span></span>
                </button>
              </li>)}
            </ul>
          </div>
          <div className="h-fit rounded-lg border bg-card p-5 xl:sticky xl:top-24">
            {selected ? <OrderDetail order={selected} settings={settings} cancelReason={cancelReason} setCancelReason={setCancelReason} error={actionError} onTransition={transition} onVerify={verifyPayment} /> : <StateBlock kind="info" title="Select an order">Customer information, items and valid next steps appear here.</StateBlock>}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Demo limitation: this dashboard polls local browser storage. It is not connected to a server, realtime channel, email, push notification or restaurant device.</p>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="rounded-lg border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></article>;
}

function OrderDetail({ order, settings, cancelReason, setCancelReason, error, onTransition, onVerify }: {
  order: Order;
  settings: StoreSettings;
  cancelReason: string;
  setCancelReason: (value: string) => void;
  error: string;
  onTransition: (order: Order, status: OrderStatus) => void;
  onVerify: (order: Order) => void;
}) {
  const next = nextStatuses(order.status, order.fulfilment);
  const customerMessage = `Your demo order ${order.orderNumber} status is ${STATUS_LABEL[order.status]}.`;
  const whatsapp = order.customerPhone ? `https://wa.me/91${order.customerPhone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(customerMessage)}` : null;
  return (
    <div>
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">Order detail</p><h2 className="mt-1 text-xl font-semibold">{order.orderNumber}</h2></div><span className="rounded-sm bg-secondary px-2 py-1 text-xs font-semibold">{STATUS_LABEL[order.status]}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{order.customerName}</p></div>
        <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{order.customerPhone}</p></div>
        <div><p className="text-xs text-muted-foreground">Fulfilment</p><p className="font-medium capitalize">{order.fulfilment}</p></div>
        <div><p className="text-xs text-muted-foreground">Placed at</p><p className="font-medium">{new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p></div>
      </div>
      {order.address && <div className="mt-4 rounded-md bg-secondary/60 p-3 text-sm"><p className="text-xs text-muted-foreground">Delivery address</p><p className="mt-1">{order.address.line}, {order.address.sector}, {order.address.pincode}</p>{order.address.landmark && <p className="text-xs text-muted-foreground">Near {order.address.landmark}</p>}</div>}
      {order.note && <div className="mt-3 rounded-md border p-3 text-sm"><p className="text-xs text-muted-foreground">Customer note</p>{order.note}</div>}
      <h3 className="mt-5 font-semibold">Items</h3>
      <ul className="mt-2 space-y-2 text-sm">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-2"><span>{item.quantity} × {item.nameSnapshot}</span><span>{formatINR(item.lineTotalPaise)}</span></li>)}</ul>
      <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(order.subtotalPaise)}</dd></div>
        <div className="flex justify-between"><dt>Delivery fee</dt><dd>{formatINR(order.deliveryFeePaise)}</dd></div>
        <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total</dt><dd>{formatINR(order.totalPaise)}</dd></div>
      </dl>
      <div className="mt-4 rounded-md border p-3 text-sm">
        <p><span className="text-muted-foreground">Payment: </span>{order.paymentMethod.toUpperCase()} · {order.paymentStatus}</p>
        {order.upiUtr && <p className="mt-1 break-all"><span className="text-muted-foreground">UTR: </span>{order.upiUtr}</p>}
        {order.paymentMethod === "upi" && order.paymentStatus !== "verified" && <Button className="mt-3 w-full" size="sm" onClick={() => onVerify(order)}>Mark paid after bank verification</Button>}
        {order.paymentStatus === "verified" && <p className="mt-2 text-xs text-veg">Marked paid in this demo.</p>}
      </div>
      {next.length > 0 && (
        <div className="mt-5 space-y-3">
          {next.includes("cancelled") && <label className="block"><span className="mb-1 block text-sm font-medium">Cancellation / rejection reason</span><textarea className={fieldClass + " h-20 py-2"} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} maxLength={200} placeholder="Reason required for cancelling this order" /></label>}
          <div className="grid gap-2 sm:grid-cols-2">{next.map((status) => <Button key={status} size="sm" variant={status === "cancelled" ? "danger" : "primary"} onClick={() => onTransition(order, status)}>{status === "cancelled" ? "Reject / cancel" : STATUS_LABEL[status]}</Button>)}</div>
        </div>
      )}
      {order.status === "cancelled" && order.cancelReason && <p className="mt-4 rounded-md bg-destructive/5 p-3 text-sm text-destructive">Reason: {order.cancelReason}</p>}
      {whatsapp && <a className="mt-4 block rounded-md border px-3 py-2 text-center text-sm font-medium hover:bg-secondary" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp customer (opens your app)</a>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <p className="mt-4 text-xs text-muted-foreground">Changing a demo status only changes this browser's local record.</p>
    </div>
  );
}

const emptyItem = (): Omit<MenuItem, "id"> => ({
  categoryId: "", name: "", description: "", pricePaise: 0, isVeg: true, isAvailable: true,
  imageKey: null, sortOrder: 99, isPopular: false, imageUrl: null,
});

function MenuPanel() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useMenuItems();
  const { data: categories = [] } = useCategories(true);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<Omit<MenuItem, "id">>(emptyItem());
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function edit(item: MenuItem) {
    setEditingId(item.id);
    setDraft({ ...item });
    setPrice((item.pricePaise / 100).toFixed(2));
    setError("");
    setSuccess("");
  }
  function reset() {
    setEditingId("");
    setDraft(emptyItem());
    setPrice("");
    setError("");
    setSuccess("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const rupees = Number(price);
    if (!draft.name.trim() || !draft.categoryId || !Number.isFinite(rupees) || rupees <= 0) {
      setError("Enter a dish name, category and valid price.");
      return;
    }
    setBusy(true);
    try {
      const payload = { ...draft, name: draft.name.trim(), description: draft.description.trim(), pricePaise: Math.round(rupees * 100) };
      if (editingId) await menuRepo.updateMenuItem(editingId, payload);
      else await menuRepo.createMenuItem(payload);
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      setSuccess(editingId ? "Menu item updated." : "Menu item added.");
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this menu item.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    try {
      const imageUrl = await compressDemoImage(file);
      setDraft((current) => ({ ...current, imageUrl, imageKey: null }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process this image.");
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      await menuRepo.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update availability."); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b p-4"><h2 className="font-display text-xl font-semibold">Menu items</h2><span className="text-xs text-muted-foreground">{items.length} items</span></div>
        <ul className="divide-y">
          {items.map((item) => <li key={item.id} className="flex items-center gap-3 p-3">
            {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-14 rounded-md object-cover" /> : <div className="flex size-14 items-center justify-center rounded-md bg-secondary"><Utensils className="size-5 text-muted-foreground" /></div>}
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{formatINR(item.pricePaise)} · {item.isVeg ? "Veg" : "Non-veg"}{item.isPopular ? " · Popular" : ""}</p><p className="text-xs">{item.isAvailable ? "Available" : "Archived / unavailable"}</p></div>
            <div className="flex flex-col gap-1"><Button size="sm" variant="outline" onClick={() => edit(item)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => toggleAvailability(item)}>{item.isAvailable ? "Archive" : "Restore"}</Button></div>
          </li>)}
        </ul>
      </section>
      <form onSubmit={save} className="h-fit space-y-4 rounded-lg border bg-card p-5 xl:sticky xl:top-24">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">{editingId ? "Edit menu item" : "Add menu item"}</h2>{editingId && <Button type="button" size="sm" variant="ghost" onClick={reset}><X /> Clear</Button>}</div>
        <label className="block"><span className="mb-1 block text-sm font-medium">Dish name</span><input className={fieldClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} maxLength={70} required /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Description</span><textarea className={fieldClass + " h-20 py-2"} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} maxLength={240} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-sm font-medium">Price (₹)</span><input className={fieldClass} type="number" min="1" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">Category</span><select className={fieldClass} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} required><option value="">Select</option>{categories.filter((cat) => cat.isActive).map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isVeg} onChange={(event) => setDraft({ ...draft, isVeg: event.target.checked })} /> Vegetarian</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(draft.isPopular)} onChange={(event) => setDraft({ ...draft, isPopular: event.target.checked })} /> Popular</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isAvailable} onChange={(event) => setDraft({ ...draft, isAvailable: event.target.checked })} /> Available</label>
        </div>
        <label className="block"><span className="mb-1 block text-sm font-medium">Dish image (JPG / PNG / WebP, max 2 MB)</span><input className="block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event.target.files?.[0])} /></label>
        {draft.imageUrl && <div className="flex items-center gap-3 rounded-md border p-2"><img src={draft.imageUrl} alt="Selected dish preview" className="size-16 rounded object-cover" /><Button type="button" size="sm" variant="ghost" onClick={() => setDraft({ ...draft, imageUrl: null, imageKey: null })}><Trash2 /> Remove image</Button></div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {success && <p role="status" className="text-sm text-veg">{success}</p>}
        <Button type="submit" className="w-full" loading={busy}><Plus /> {editingId ? "Save changes" : "Add dish"}</Button>
        <p className="text-xs text-muted-foreground">Items are archived by switching availability off. They are not permanently deleted. Images stay in this browser's local storage.</p>
      </form>
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "category";
}

function CategoriesPanel() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories(true);
  const { data: items = [] } = useMenuItems();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function saveCategory(category: Category) {
    setError("");
    try {
      await menuRepo.upsertCategory(category);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setSuccess("Category saved.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save category."); }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) return;
    const next: Omit<Category, "id"> = {
      slug: slugify(newName), name: newName.trim(), description: null,
      sortOrder: Math.max(0, ...categories.map((category) => category.sortOrder)) + 1, isActive: true,
    };
    try {
      await menuRepo.upsertCategory(next);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewName("");
      setSuccess("Category added.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not add category."); }
  }

  async function move(category: Category, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((entry) => entry.id === category.id);
    const other = sorted[index + direction];
    if (!other) return;
    await saveCategory({ ...category, sortOrder: other.sortOrder });
    await saveCategory({ ...other, sortOrder: category.sortOrder });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border bg-card">
        <div className="border-b p-4"><h2 className="font-display text-xl font-semibold">Category manager</h2><p className="mt-1 text-xs text-muted-foreground">Rename, reorder and hide categories. Categories containing dishes cannot be deleted.</p></div>
        <ul className="divide-y">
          {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((category, index, all) => {
            const count = items.filter((item) => item.categoryId === category.id).length;
            return <CategoryRow key={category.id} category={category} count={count} canUp={index > 0} canDown={index < all.length - 1} onSave={saveCategory} onMove={move} />;
          })}
        </ul>
      </section>
      <div className="space-y-4">
        <form onSubmit={addCategory} className="space-y-3 rounded-lg border bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Add category</h2>
          <label className="block"><span className="mb-1 block text-sm font-medium">Name</span><input className={fieldClass} value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={40} required /></label>
          <Button type="submit" className="w-full"><Plus /> Add category</Button>
        </form>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {success && <p role="status" className="text-sm text-veg">{success}</p>}
      </div>
    </div>
  );
}

function CategoryRow({ category, count, canUp, canDown, onSave, onMove }: {
  category: Category; count: number; canUp: boolean; canDown: boolean;
  onSave: (category: Category) => void; onMove: (category: Category, direction: -1 | 1) => void;
}) {
  const [name, setName] = useState(category.name);
  useEffect(() => setName(category.name), [category.name]);
  return (
    <li className="flex flex-wrap items-center gap-2 p-3">
      <div className="flex flex-col gap-1"><Button size="icon" variant="ghost" disabled={!canUp} aria-label={`Move ${category.name} up`} onClick={() => onMove(category, -1)}><ArrowUp /></Button><Button size="icon" variant="ghost" disabled={!canDown} aria-label={`Move ${category.name} down`} onClick={() => onMove(category, 1)}><ArrowDown /></Button></div>
      <input aria-label="Category name" className={fieldClass + " min-w-0 flex-1"} value={name} onChange={(event) => setName(event.target.value)} />
      <span className="text-xs text-muted-foreground">{count} dishes</span>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={category.isActive} onChange={(event) => onSave({ ...category, isActive: event.target.checked })} /> Visible</label>
      <Button size="sm" variant="outline" onClick={() => onSave({ ...category, name: name.trim(), slug: slugify(name) })}>Save</Button>
    </li>
  );
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function SettingsPanel() {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [openDays, setOpenDays] = useState<number[]>(settings.openingHours.map((window) => window.day));
  const [openTime, setOpenTime] = useState(settings.openingHours[0]?.open ?? "11:00");
  const [closeTime, setCloseTime] = useState(settings.openingHours[0]?.close ?? "23:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setDraft(settings);
    setOpenDays(settings.openingHours.map((window) => window.day));
    setOpenTime(settings.openingHours[0]?.open ?? "11:00");
    setCloseTime(settings.openingHours[0]?.close ?? "23:00");
  }, [settings]);

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const fee = Number(draft.deliveryFeePaise);
    const minimum = Number(draft.minimumOrderPaise);
    if (!Number.isFinite(fee) || fee < 0 || !Number.isFinite(minimum) || minimum < 0 || draft.deliveryRadiusKm < 0) {
      setError("Enter valid delivery and minimum-order values.");
      return;
    }
    setBusy(true);
    try {
      const openingHours = openDays.map((day) => ({ day: day as 0 | 1 | 2 | 3 | 4 | 5 | 6, open: openTime, close: closeTime }));
      await settingsRepo.updateSettings({
        ...draft,
        phone: draft.phone?.trim() || null,
        email: draft.email?.trim() || null,
        address: draft.address?.trim() || null,
        whatsapp: draft.whatsapp?.trim() || null,
        upiId: draft.upiId?.trim() || null,
        upiPayeeName: draft.upiPayeeName?.trim() || null,
        fssaiLicense: draft.fssaiLicense?.trim() || null,
        openingHours,
      });
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSuccess("Store settings saved in this browser.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save settings."); }
    finally { setBusy(false); }
  }

  async function uploadQr(file?: File) {
    if (!file) return;
    try { update("upiQrDataUrl", await compressDemoImage(file)); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not process QR image."); }
  }

  const setString = (key: "phone" | "email" | "address" | "whatsapp" | "upiId" | "upiPayeeName" | "fssaiLicense", value: string) => update(key, value || null);

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-lg border bg-card p-5">
        <div><h2 className="font-display text-xl font-semibold">Ordering and delivery</h2><p className="mt-1 text-xs text-muted-foreground">Demo settings only. They do not control a real kitchen.</p></div>
        <label className="flex items-center justify-between rounded-md border p-3"><span><strong className="block text-sm">Accepting orders</strong><span className="text-xs text-muted-foreground">Switch off to pause the sample checkout.</span></span><input type="checkbox" checked={draft.acceptingOrders} onChange={(event) => update("acceptingOrders", event.target.checked)} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-sm font-medium">Delivery fee (₹)</span><input className={fieldClass} type="number" min="0" step="0.01" value={draft.deliveryFeePaise / 100} onChange={(event) => update("deliveryFeePaise", Math.round(Number(event.target.value) * 100))} /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">Minimum order (₹)</span><input className={fieldClass} type="number" min="0" step="0.01" value={draft.minimumOrderPaise / 100} onChange={(event) => update("minimumOrderPaise", Math.round(Number(event.target.value) * 100))} /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">Delivery radius (km)</span><input className={fieldClass} type="number" min="0" max="100" step="0.5" value={draft.deliveryRadiusKm} onChange={(event) => update("deliveryRadiusKm", Number(event.target.value))} /></label>
          <label className="block"><span className="mb-1 block text-sm font-medium">Timezone</span><input className={fieldClass} value={draft.timezone} disabled /></label>
        </div>
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold">Opening days</h3>
          <div className="mt-3 flex flex-wrap gap-2">{DAY_NAMES.map((day, index) => <label key={day} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${openDays.includes(index) ? "border-primary bg-primary/5" : ""}`}><input type="checkbox" checked={openDays.includes(index)} onChange={(event) => setOpenDays((current) => event.target.checked ? [...current, index].sort() : current.filter((value) => value !== index))} />{day}</label>)}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block"><span className="mb-1 block text-sm font-medium">Opening time</span><input className={fieldClass} type="time" value={openTime} onChange={(event) => setOpenTime(event.target.value)} /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">Closing time</span><input className={fieldClass} type="time" value={closeTime} onChange={(event) => setCloseTime(event.target.value)} /></label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">All selected days use the same hours. Leave a day unchecked to keep it closed.</p>
          <div className="mt-3 rounded-md bg-secondary/60 p-3 text-xs">{weeklyHours(openDays.map((day) => ({ day: day as 0 | 1 | 2 | 3 | 4 | 5 | 6, open: openTime, close: closeTime }))).map((row) => `${row.day}: ${row.hours}`).join(" · ")}</div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-5">
        <div><h2 className="font-display text-xl font-semibold">Business contact and payment configuration</h2><p className="mt-1 text-xs text-muted-foreground">Keep fields blank until the business supplies verified details.</p></div>
        <label className="block"><span className="mb-1 block text-sm font-medium">Business name</span><input className={fieldClass} value={draft.name} onChange={(event) => update("name", event.target.value)} required /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Phone</span><input className={fieldClass} value={draft.phone ?? ""} onChange={(event) => setString("phone", event.target.value)} placeholder="Not configured" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">WhatsApp number (country code included)</span><input className={fieldClass} value={draft.whatsapp ?? ""} onChange={(event) => setString("whatsapp", event.target.value)} placeholder="Not configured" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Contact email</span><input className={fieldClass} type="email" value={draft.email ?? ""} onChange={(event) => setString("email", event.target.value)} placeholder="Not configured" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">Address</span><textarea className={fieldClass + " h-20 py-2"} value={draft.address ?? ""} onChange={(event) => setString("address", event.target.value)} placeholder="Not configured" /></label>
        <label className="block"><span className="mb-1 block text-sm font-medium">FSSAI licence (if applicable)</span><input className={fieldClass} value={draft.fssaiLicense ?? ""} onChange={(event) => setString("fssaiLicense", event.target.value)} /></label>
        <div className="border-t pt-4">
          <h3 className="font-semibold">UPI details</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="mb-1 block text-sm font-medium">UPI ID</span><input className={fieldClass} value={draft.upiId ?? ""} onChange={(event) => setString("upiId", event.target.value)} placeholder="Not configured" /></label>
            <label className="block"><span className="mb-1 block text-sm font-medium">Payee name</span><input className={fieldClass} value={draft.upiPayeeName ?? ""} onChange={(event) => setString("upiPayeeName", event.target.value)} placeholder="Not configured" /></label>
          </div>
          <label className="mt-3 block"><span className="mb-1 block text-sm font-medium">QR image (JPG / PNG / WebP, max 2 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadQr(event.target.files?.[0])} className="block w-full text-sm" /></label>
          {draft.upiQrDataUrl && <div className="mt-2 flex items-center gap-3"><img src={draft.upiQrDataUrl} alt="Configured demo UPI QR" className="size-24 object-contain" /><Button type="button" size="sm" variant="ghost" onClick={() => update("upiQrDataUrl", null)}>Remove QR</Button></div>}
          <p className="mt-2 text-xs text-muted-foreground">UPI checkout becomes available only when both UPI ID and payee name are configured. Payment is never verified automatically.</p>
        </div>
      </section>
      <div className="lg:col-span-2">
        {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
        {success && <p role="status" className="mb-3 text-sm text-veg">{success}</p>}
        <Button type="submit" loading={busy}>Save store settings</Button>
      </div>
    </form>
  );
}
