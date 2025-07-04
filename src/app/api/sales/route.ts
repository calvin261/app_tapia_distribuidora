import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/database";


interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

export async function GET(request: NextRequest) {
  try {
    // Leer parámetros de paginación
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Obtener el total de registros
    const totalResult = await sql`SELECT COUNT(*)::int AS total FROM sales`;
    const total = totalResult[0]?.total || 0;

    // Obtener ventas paginadas y ordenadas
    const sales = await sql`
      SELECT
        s.*,
        c.name as customer_name,
        u.name as user_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Define types for sales
    interface SaleRow {
      id: string;
      customer_id: string | null;
      user_id: string;
      invoice_number: string;
      sale_date: string;
      subtotal: number;
      tax_amount: number;
      discount_amount: number;
      total_amount: number;
      payment_method: string;
      payment_status: string;
      status: string;
      notes: string | null;
      created_at: string;
      updated_at: string;
      customer_name?: string;
      user_name?: string;
    }
    interface SaleItemRow {
      sale_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      discount_amount: number;
      total_amount: number;
    }
    const saleIds = (sales as SaleRow[]).map((s) => s.id);
    let saleItems: SaleItemRow[] = [];
    if (saleIds.length > 0) {
      saleItems = (await sql`
        SELECT si.*, p.name as product_name
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ANY(${[saleIds]})
      `) as SaleItemRow[];
    }
    // Attach items to each sale
    const salesWithItems = (sales as SaleRow[]).map((sale) => ({
      ...sale,
      items: saleItems.filter((item) => item.sale_id === sale.id)
    }));

    // Devolver también el total para la paginación
    return NextResponse.json({ total, sales: salesWithItems });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("xD");

    const data = await request.json();
    const {
      customer_id,
      items,
      payment_method,
      payment_status = "pending",
      status = "draft",
      discount_amount = 0,
      notes,
      user_id
    } = data;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: SaleItem) => sum + item.quantity * item.unit_price,
      0
    );
    const tax_amount = subtotal * 0.16; // 16% tax
    const total_amount = subtotal + tax_amount - discount_amount;

    // Generate invoice number
    const invoice_number = `INV-${Date.now()}`;

    // Convert empty string customer_id to null for DB compatibility
    const safeCustomerId = customer_id === '' ? null : customer_id;

    // Create sale using the authenticated user's ID
    const saleResult = await sql`
      INSERT INTO sales (
        customer_id, user_id, invoice_number, sale_date,
        subtotal, tax_amount, discount_amount, total_amount,
        payment_method, payment_status, status, notes
      )
      VALUES (
        ${safeCustomerId}, ${user_id}, ${invoice_number}, NOW(),
        ${subtotal}, ${tax_amount}, ${discount_amount}, ${total_amount},
        ${payment_method}, ${payment_status}, ${status}, ${notes}
      )
      RETURNING *
    `;
    console.log("Sale created:", saleResult);
    const sale = saleResult[0];

    // Create sale items
    for (const item of items) {
      await sql`
        INSERT INTO sale_items (
          sale_id, product_id, quantity, unit_price,
          discount_amount, total_amount
        )
        VALUES (
          ${sale.id}, ${item.product_id}, ${item.quantity}, ${item.unit_price},
          ${item.discount_amount ?? 0}, ${item.quantity * item.unit_price}
        )
      `;

      // Update product stock
      await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity},
            updated_at = NOW()
        WHERE id = ${item.product_id}
      `;

      // Create stock movement
      await sql`
        INSERT INTO stock_movements (
          product_id, movement_type, quantity, reference_type,
          reference_id, user_id
        )
        VALUES (
          ${item.product_id}, 'out', ${item.quantity}, 'sale',
          ${sale.id}, ${user_id}
        )
      `;
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
