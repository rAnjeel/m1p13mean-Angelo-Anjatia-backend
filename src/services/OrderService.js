const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Shop = require("../models/Shop");
const User = require("../models/User");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const payOrder = async (orderId, clientId, payload = {}) => {
  const paymentMethodRaw = String(payload?.paymentMethod || "").trim().toLowerCase();
  const cardNumberRaw = String(payload?.cardNumber || "").replace(/\s+/g, "");
  const cardHolderName = String(payload?.cardHolderName || "").trim();
  const pickupDateRaw = payload?.pickupDate;

  if (!["bank_card", "visa"].includes(paymentMethodRaw)) {
    throw createError(400, "Payment method must be 'bank_card' or 'visa'.");
  }

  if (!/^\d{12,19}$/.test(cardNumberRaw)) {
    throw createError(400, "Card number must contain 12 to 19 digits.");
  }

  if (!cardHolderName) {
    throw createError(400, "Card holder name is required.");
  }

  if (!pickupDateRaw) {
    throw createError(400, "Pickup date is required.");
  }

  const pickupDate = new Date(pickupDateRaw);
  if (Number.isNaN(pickupDate.getTime())) {
    throw createError(400, "Pickup date is invalid.");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw createError(404, "Order not found.");
  }

  if (order.clientId.toString() !== clientId) {
    throw createError(403, "Not allowed.");
  }

  if (order.status !== "pending") {
    throw createError(400, "Order already paid or invalid.");
  }

  const orderItems = await OrderItem.find({ orderId });

  // Verify stock before payment.
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw createError(404, "Product not found.");
    }

    if (product.stock < item.quantity) {
      throw createError(
        400,
        `Not enough stock for product ${product.name}`
      );
    }
  }

  // Deduct stock.
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    const stockBefore = Number(product.stock || 0);

    product.stock -= item.quantity;
    await product.save();

    await StockMovement.create({
      productId: item.productId,
      shopId: item.shopId,
      type: "OUT",
      quantity: Number(item.quantity || 0),
      stockBefore,
      stockAfter: Number(product.stock || 0),
      reason: "Order paid",
      reference: `ORDER_PAY:${order._id}`,
    });
  }

  // Mark order as paid and persist payment metadata.
  order.status = "paid";
  order.paymentMethod = paymentMethodRaw;
  order.cardLast4 = cardNumberRaw.slice(-4);
  order.cardHolderName = cardHolderName;
  order.pickupDate = pickupDate;
  order.paidAt = new Date();
  await order.save();

  // Remove paid products from the client's cart after successful payment.
  for (const item of orderItems) {
    const cart = await Cart.findOne({
      clientId,
      shopId: item.shopId,
    });

    if (!cart) {
      continue;
    }

    await CartItem.deleteOne({
      cartId: cart._id,
      productId: item.productId,
    });

    const remaining = await CartItem.countDocuments({ cartId: cart._id });
    if (remaining === 0) {
      await Cart.findByIdAndDelete(cart._id);
    }
  }

  return { order, items: orderItems };
};

const getOrdersByClient = async (clientId) => {
  const orders = await Order.find({ clientId }).sort({ createdAt: -1 }).lean();
  if (!orders.length) {
    return [];
  }

  const orderIds = orders.map((order) => order._id);
  const orderItems = await OrderItem.find({ orderId: { $in: orderIds } })
    .populate("shopId", "name")
    .lean();

  const itemsByOrderId = new Map();
  for (const item of orderItems) {
    const key = String(item.orderId);
    const shopValue = item.shopId;
    const shopName =
      shopValue && typeof shopValue === "object" ? shopValue.name || "" : "";
    const shopId =
      shopValue && typeof shopValue === "object" ? shopValue._id : shopValue;

    const normalizedItem = {
      ...item,
      shopId,
      shopName,
    };

    const current = itemsByOrderId.get(key) || [];
    current.push(normalizedItem);
    itemsByOrderId.set(key, current);
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(String(order._id)) || [],
  }));
};

const getShopkeeperFinancialSummary = async (shopkeeperId) => {
  const shops = await Shop.find({ merchantId: shopkeeperId }).select("_id name").lean();
  if (!shops.length) {
    throw createError(404, "No shop associated with this shopkeeper.");
  }

  const shopIds = shops.map((shop) => shop._id);
  const shopById = new Map(shops.map((shop) => [String(shop._id), shop]));

  const paidRows = await OrderItem.aggregate([
    { $match: { shopId: { $in: shopIds } } },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    { $match: { "order.status": "paid" } },
    {
      $project: {
        orderId: 1,
        productId: 1,
        productName: 1,
        shopId: 1,
        quantity: 1,
        priceAtPurchase: 1,
        lineTotal: { $multiply: ["$quantity", "$priceAtPurchase"] },
        orderCreatedAt: "$order.createdAt",
        clientId: "$order.clientId",
      },
    },
  ]);

  const totalSales = paidRows.reduce((sum, row) => sum + Number(row.lineTotal || 0), 0);

  const orderMap = new Map();
  paidRows.forEach((row) => {
    const key = String(row.orderId);
    const existing = orderMap.get(key) || {
      orderId: key,
      createdAt: row.orderCreatedAt,
      status: "paid",
      totalAmount: 0,
      itemCount: 0,
      clientId: row.clientId,
      clientName: "Unknown client",
      shops: new Set(),
      items: [],
    };

    existing.totalAmount += Number(row.lineTotal || 0);
    existing.itemCount += Number(row.quantity || 0);
    const shopIdStr = String(row.shopId || "");
    const shopName = shopById.get(shopIdStr)?.name || "Boutique";
    existing.shops.add(shopName);
    existing.items.push({
      productId: row.productId,
      productName: row.productName || "Produit",
      quantity: Number(row.quantity || 0),
      priceAtPurchase: Number(row.priceAtPurchase || 0),
      lineTotal: Number(row.lineTotal || 0),
      shopName,
    });
    orderMap.set(key, existing);
  });

  const clientIds = Array.from(
    new Set(
      paidRows
        .map((row) => (row.clientId ? String(row.clientId) : ""))
        .filter(Boolean)
    )
  );

  const clients = await User.find({ _id: { $in: clientIds } })
    .select("_id fullName")
    .lean();
  const clientById = new Map(clients.map((client) => [String(client._id), client]));

  orderMap.forEach((order) => {
    const client = clientById.get(String(order.clientId || ""));
    order.clientName = client?.fullName || "Unknown client";
  });

  const orders = Array.from(orderMap.values())
    .map((order) => ({
      orderId: order.orderId,
      createdAt: order.createdAt,
      status: order.status,
      clientName: order.clientName,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      shops: Array.from(order.shops),
      items: order.items,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const topProductsMap = new Map();
  paidRows.forEach((row) => {
    const key = String(row.productId || row.productName || "");
    const current = topProductsMap.get(key) || {
      productId: row.productId,
      productName: row.productName || "Produit",
      quantitySold: 0,
      revenue: 0,
    };
    current.quantitySold += Number(row.quantity || 0);
    current.revenue += Number(row.lineTotal || 0);
    topProductsMap.set(key, current);
  });

  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => b.quantitySold - a.quantitySold || b.revenue - a.revenue)
    .slice(0, 3);

  return {
    shops,
    totalSales,
    orders,
    topProducts,
  };
};

module.exports = {
  payOrder,
  getOrdersByClient,
  getShopkeeperFinancialSummary,
};
