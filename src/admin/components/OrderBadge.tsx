export function OrderBadge({ status }: { status: string }) {
  return <span className={`admin-badge ${status === 'Delivered' ? 'green' : status === 'Order Received' ? 'amber' : 'purple'}`}>{status}</span>;
}
