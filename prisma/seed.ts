import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const url = (process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres")
  .replace(/sslmode=[^&]+/, "sslmode=no-verify");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// ponytail: deterministic-ish pseudo random so seed is reproducible per run.
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}
const r = rng(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
const int = (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;

const INDONESIAN_NAMES = ["Budi Santoso", "Siti Aminah", "Ahmad Fauzi", "Dewi Lestari", "Rizki Pratama", "Sari Wijaya", "Joko Susilo", "Nur Aisyah", "Agus Salim", "Maya Sari", "Eko Prasetyo", "Indah Permata", "Bayu Setiawan", "Rina Marlina", "Hendra Gunawan", "Fitri Handayani", "Doni Kusuma", "Yulia Rahma", "Fajar Nugroho", "Nova Anggraini"];
const STREETS = ["Jl. Merdeka", "Jl. Sudirman", "Jl. Diponegoro", "Jl. Gatot Subroto", "Jl. Ahmad Yani", "Jl. Pahlawan", "Jl. Pemuda", "Jl. Veteran"];

const CATEGORIES = ["Makanan", "Minuman", "Sembako", "Kebersihan", "Alat Tulis", "Kesehatan", "Rokok", "Snack", "Perlengkapan", "Lainnya"];
type SeedProduct = [name: string, cat: string, price: number, cost: number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PRODUCTS: SeedProduct[] = [
  ["Indomie Goreng", "Makanan", 3500, 2700], ["Indomie Ayam Bawang", "Makanan", 3500, 2700], ["Beras 5kg", "Sembako", 62000, 55000], ["Gula 1kg", "Sembako", 15000, 13000], ["Minyak Goreng 2L", "Sembako", 32000, 28000],
  ["Aqua 600ml", "Minuman", 3000, 2100], ["Aqua 1500ml", "Minuman", 6000, 4200], ["Teh Botol 350ml", "Minuman", 4000, 2800], ["Kopi Kapal Api", "Minuman", 1500, 1000], ["Susu Kental Manis", "Minuman", 11500, 9500],
  ["Sabun Cuci Piring", "Kebersihan", 9000, 7200], ["Deterjen 800g", "Kebersihan", 23000, 19000], ["Sikat Gigi", "Kebersihan", 7500, 5500], ["Pasta Gigi", "Kebersihan", 12000, 9200], ["Tissue 240", "Kebersihan", 14500, 11000],
  ["Pulpen", "Alat Tulis", 3000, 1800], ["Buku Tulis", "Alat Tulis", 6000, 4000], ["Pensil 2B", "Alat Tulis", 2500, 1500], ["Penghapus", "Alat Tulis", 1500, 800], ["Penggaris", "Alat Tulis", 4000, 2500],
  ["Paracetamol", "Kesehatan", 3000, 2000], ["Betadine", "Kesehatan", 18000, 14000], ["Vitamin C", "Kesehatan", 25000, 19000], ["Masker", "Kesehatan", 20000, 15000], ["Obat Batuk", "Kesehatan", 13000, 9500],
  ["Gudang Garam", "Rokok", 23000, 20000], ["Sampoerna", "Rokok", 26000, 22500], ["Djarum Super", "Rokok", 24000, 21000], ["LA Lights", "Rokok", 28000, 24500], ["Surya 12", "Rokok", 22000, 19500],
  ["Chitato", "Snack", 9000, 6500], ["Tic Tac", "Snack", 5000, 3200], ["Oreo", "Snack", 12000, 8500], ["Wafer", "Snack", 7000, 4800], ["Permen", "Snack", 2000, 1200],
  ["Bola Lampu", "Perlengkapan", 12000, 8500], ["Baterai AA", "Perlengkapan", 14000, 10000], ["Korek Api", "Perlengkapan", 2000, 1000], ["Kabel Roll", "Perlengkapan", 45000, 35000], ["Lilin", "Perlengkapan", 8000, 5500],
  ["Sabun Mandi", "Kebersihan", 6500, 4500], ["Shampo 170ml", "Kebersihan", 11000, 8000], ["Mie Sedap", "Makanan", 3500, 2700], ["Pop Mie", "Makanan", 7000, 5000], ["Kecap 135ml", "Sembako", 9000, 6500],
  ["Saos 200ml", "Sembako", 11000, 8000], ["Telur 1kg", "Sembako", 28000, 24000], ["Tepung 1kg", "Sembako", 12000, 9500], ["Kopi Susu", "Minuman", 6000, 4200], ["Fanta 350ml", "Minuman", 5000, 3500],
];

const PREFIXES = ["BR", "MM", "SK", "KL", "AT", "KS", "RT", "SN", "PL", "LN"];

async function main() {
  console.log("Clearing tables...");
  await prisma.payment.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const pwd = await bcrypt.hash("password123", 10);
  const [admin, manager, cashier] = await Promise.all([
    prisma.user.create({ data: { name: "Admin Koperasi", email: "admin@koperasihub.demo", password: pwd, role: "ADMIN" } }),
    prisma.user.create({ data: { name: "Manager Koperasi", email: "manager@koperasihub.demo", password: pwd, role: "MANAGER" } }),
    prisma.user.create({ data: { name: "Ahmad Kasir", email: "cashier@koperasihub.demo", password: pwd, role: "CASHIER" } }),
  ]);

  console.log("Creating categories...");
  const categories = await Promise.all(
    CATEGORIES.map((name) => prisma.category.create({ data: { name, description: `${name} untuk kebutuhan sehari-hari` } }))
  );
  const catBy = (name: string) => categories.find((c) => c.name === name)!;

  console.log("Creating products...");
  const products = await Promise.all(
    PRODUCTS.map(([name, cat, price, cost], i) =>
      prisma.product.create({
        data: {
          name,
          sku: `${pick(PREFIXES)}-${String(i + 1).padStart(4, "0")}`,
          description: `${name} kualitas terbaik`,
          categoryId: catBy(cat).id,
          price,
          costPrice: cost,
          stock: int(20, 200),
          minimumStock: 10,
        },
      })
    )
  );

  console.log("Creating customers...");
  const customers = await Promise.all(
    Array.from({ length: 100 }, () =>
      prisma.customer.create({
        data: {
          name: pick(INDONESIAN_NAMES) + " " + pick(["A", "B", "C", "D", "E"]),
          phone: "08" + int(100000000, 999999999),
          email: null,
          address: `${pick(STREETS)} No. ${int(1, 99)}`,
        },
      })
    )
  );

  console.log("Creating inventory movements (stock-in)...");
  // Initial stock-in for each product + random extra movements
  const movements: { productId: string; type: string; quantity: number; reference: string | null; userId: string }[] = [];
  for (const p of products) {
    movements.push({ productId: p.id, type: "IN", quantity: p.stock, reference: "Initial stock", userId: admin.id });
  }
  while (movements.length < 1000) {
    const p = pick(products);
    const type = pick(["IN", "OUT", "ADJUSTMENT", "RETURN"]);
    const qty = type === "IN" ? int(5, 50) : -int(1, 15);
    movements.push({ productId: p.id, type, quantity: qty, reference: `Auto #${movements.length}`, userId: pick([admin.id, cashier.id]) });
  }
  for (let i = 0; i < movements.length; i += 100) {
    await prisma.inventoryMovement.createMany({ data: movements.slice(i, i + 100) });
  }

  console.log("Creating transactions...");
  const txItems: { transactionId: string; productId: string; name: string; quantity: number; price: number; costPrice: number; total: number }[] = [];
  const txPayments: { transactionId: string; method: string; amount: number }[] = [];
  const stockDeltas = new Map<string, number>();
  const customerStats = new Map<string, { orders: number; spent: number }>();
  const createdTx: { id: string }[] = [];

  for (let trxCount = 0; trxCount < 500; trxCount++) {
    const cashierUser = pick([cashier, admin]);
    const itemsCount = int(1, 5);
    const chosen = Array.from({ length: itemsCount }, () => pick(products));
    const items = chosen.map((p) => {
      const qty = int(1, 4);
      return { p, qty };
    });
    let subtotal = 0;
    for (const { p, qty } of items) subtotal += qty * p.price;
    const discount = subtotal > 50000 && r() > 0.6 ? int(1000, 10000) : 0;
    const total = subtotal - discount;
    const paid = total + int(0, 3) * 1000;
    const change = paid - total;
    const date = new Date(Date.now() - Math.floor(trxCount / 50) * 86400000 - int(0, 86400000));
    const day = date.toISOString().slice(0, 10).replace(/-/g, "");
    const number = `TRX-${day}-${String(trxCount + 1).padStart(3, "0")}`;
    const method = pick(["CASH", "TRANSFER", "QRIS"]);
    const customer = r() > 0.4 ? pick(customers) : null;

    const tx = await prisma.transaction.create({
      data: {
        number, cashierId: cashierUser.id, customerId: customer?.id ?? null,
        subtotal, discount, total, paid, change, paymentMethod: method, createdAt: date,
      },
    });
    createdTx.push({ id: tx.id });
    for (const { p, qty } of items) {
      txItems.push({ transactionId: tx.id, productId: p.id, name: p.name, quantity: qty, price: p.price, costPrice: p.costPrice, total: qty * p.price });
      stockDeltas.set(p.id, (stockDeltas.get(p.id) ?? 0) + qty);
      txPayments.push({ transactionId: tx.id, method, amount: paid });
    }
    if (customer) {
      const s = customerStats.get(customer.id) ?? { orders: 0, spent: 0 };
      s.orders += 1;
      s.spent += total;
      customerStats.set(customer.id, s);
    }
  }

  for (let i = 0; i < txItems.length; i += 200) {
    await prisma.transactionItem.createMany({ data: txItems.slice(i, i + 200) });
  }
  for (let i = 0; i < txPayments.length; i += 200) {
    await prisma.payment.createMany({ data: txPayments.slice(i, i + 200) });
  }

  // Apply stock decrements + OUT movements in bulk.
  const outMovements: { productId: string; type: string; quantity: number; reference: string; userId: string }[] = [];
  for (const [productId, qty] of stockDeltas) {
    await prisma.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } });
    outMovements.push({ productId, type: "OUT", quantity: -qty, reference: "Sales", userId: cashier.id });
  }
  for (let i = 0; i < outMovements.length; i += 100) {
    await prisma.inventoryMovement.createMany({ data: outMovements.slice(i, i + 100) });
  }
  for (const [id, s] of customerStats) {
    await prisma.customer.update({ where: { id }, data: { totalOrders: { increment: s.orders }, totalSpent: { increment: s.spent } } });
  }

  const [u, c, p, t] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.transaction.count(),
  ]);
  console.log(`\nSeed complete: ${u} users, ${c} categories, ${p} products, ${t} transactions.`);
  console.log("Demo login: admin@koperasihub.demo / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
