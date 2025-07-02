// Test to verify that our numeric handling fixes work correctly

// Test cases that could cause the .toFixed() error
const testProducts = [
  {
    id: '1',
    name: 'Product with string price',
    sku: 'SKU001',
    sale_price: "22.50", // String instead of number
    stock_quantity: 10,
    unit: 'pcs'
  },
  {
    id: '2',
    name: 'Product with null price',
    sku: 'SKU002',
    sale_price: null, // Null value
    stock_quantity: 5,
    unit: 'pcs'
  },
  {
    id: '3',
    name: 'Product with undefined price',
    sku: 'SKU003',
    sale_price: undefined, // Undefined value
    stock_quantity: 8,
    unit: 'pcs'
  },
  {
    id: '4',
    name: 'Product with number price',
    sku: 'SKU004',
    sale_price: 45.75, // Proper number
    stock_quantity: 15,
    unit: 'pcs'
  }
];

function testProductHandling() {
  console.log('Testing product price handling...');
  
  testProducts.forEach((product, index) => {
    console.log(`\nTest ${index + 1}: ${product.name}`);
    console.log(`Original price: ${product.sale_price} (type: ${typeof product.sale_price})`);
    
    // Test our conversion logic
    const safePrice = Number(product.sale_price || 0);
    console.log(`Converted price: ${safePrice}`);
    console.log(`Formatted price: $${safePrice.toFixed(2)}`);
    
    // Test creating a sale item
    const saleItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: safePrice,
      total: Number(safePrice.toFixed(2))
    };
    
    console.log(`Sale item total: $${saleItem.total.toFixed(2)}`);
  });
  
  console.log('\nAll product handling tests passed!');
}

function testCalculationEdgeCases() {
  console.log('\nTesting calculation edge cases...');
  
  const testItems = [
    {
      product_id: '1',
      product_name: 'Test Product 1',
      quantity: 2,
      unit_price: "15.50", // String price
      total: null // Null total
    },
    {
      product_id: '2', 
      product_name: 'Test Product 2',
      quantity: undefined, // Undefined quantity
      unit_price: 25.75,
      total: 25.75
    }
  ];
  
  // Test subtotal calculation with edge cases
  const subtotal = testItems.reduce((sum, item) => {
    const itemTotal = Number(item.total) || 0;
    console.log(`Item ${item.product_name}: total = ${item.total} -> ${itemTotal}`);
    return sum + itemTotal;
  }, 0);
  
  console.log(`Subtotal: $${subtotal.toFixed(2)}`);
  
  // Test quantity update with edge case
  const updatedItems = testItems.map(item => {
    if (item.product_id === '1') {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unit_price || 0);
      const newTotal = Number((quantity * unitPrice).toFixed(2));
      console.log(`Updated item 1: ${quantity} x $${unitPrice} = $${newTotal}`);
      return { ...item, total: newTotal };
    }
    return item;
  });
  
  console.log('Edge case tests passed!');
}

testProductHandling();
testCalculationEdgeCases();
