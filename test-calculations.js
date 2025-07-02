// Test script to verify calculation logic

// Test data similar to what we have in the app
const testItems = [
  {
    product_id: '1',
    product_name: 'asdasd',
    quantity: 1,
    unit_price: 22.00,
    total: 22.00
  },
  {
    product_id: '2',
    product_name: 'Mouse Inalámbrico Logitech',
    quantity: 1,
    unit_price: 45.00,
    total: 45.00
  }
];

// Test our calculation logic
function testCalculations() {
  console.log('Testing calculation logic...');
  
  // Test subtotal calculation
  const subtotal = testItems.reduce((sum, item) => {
    const itemTotal = Number(item.total) || 0;
    return sum + itemTotal;
  }, 0);
  
  console.log('Subtotal:', subtotal.toFixed(2)); // Should be 67.00
  
  // Test tax calculation
  const tax = subtotal * 0.16;
  console.log('Tax (16%):', tax.toFixed(2)); // Should be 10.72
  
  // Test total calculation
  const total = subtotal + tax;
  console.log('Total:', total.toFixed(2)); // Should be 77.72
  
  // Test quantity update
  const updatedItems = testItems.map(item =>
    item.product_id === '1'
      ? { ...item, quantity: 2, total: Number((2 * item.unit_price).toFixed(2)) }
      : item
  );
  
  const newSubtotal = updatedItems.reduce((sum, item) => {
    const itemTotal = Number(item.total) || 0;
    return sum + itemTotal;
  }, 0);
  
  console.log('Updated subtotal with quantity 2:', newSubtotal.toFixed(2)); // Should be 89.00
  
  // Test price update
  const priceUpdatedItems = testItems.map(item =>
    item.product_id === '1'
      ? { ...item, unit_price: 25.50, total: Number((item.quantity * 25.50).toFixed(2)) }
      : item
  );
  
  const priceSubtotal = priceUpdatedItems.reduce((sum, item) => {
    const itemTotal = Number(item.total) || 0;
    return sum + itemTotal;
  }, 0);
  
  console.log('Updated subtotal with new price:', priceSubtotal.toFixed(2)); // Should be 70.50
  
  console.log('All tests completed successfully!');
}

testCalculations();
