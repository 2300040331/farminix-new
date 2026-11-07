export function sqlCustomerOrder(row: any) {
  return {
    id: row.id, customerId: row.user_id, date: new Date(row.created_at).toISOString(),
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    totalAmount: Number(row.total_amount), discount: Number(row.discount_amount || 0),
    deliveryFee: Number(row.delivery_fee || 0), handlingFee: Number(row.handling_fee || 0), finalAmount: Number(row.final_amount),
    status: row.status, deliveryAddress: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : row.delivery_address,
    paymentMethod: row.payment_method === 'COD' ? 'Cash on Delivery (COD)' : row.payment_method === 'RAZORPAY' ? 'Razorpay Online' : row.payment_method,
    couponCode: row.coupon_code || undefined, estimatedTime: row.estimated_time || 'Awaiting dispatch',
  };
}
