import { useEffect, useState } from 'react';
import websocketService from '../../services/websocketService';
import { getAllOrdersDetailsInDay } from '../../services/apiServices';

// Define types for our data
type PaymentMethod = 'cash' | 'card' | 'e-wallet' | string;
type OrderStatus = 'paid' | 'pending' | 'cancelled' | string;

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  // Add more item properties as needed
}

interface Bill {
  id: string;
  tableNumber: string;
  createTime: string;
  totalAmount: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  staff: string;
  items?: OrderItem[];
  // Add more bill properties as needed
}

export const ShiftBillingSummary = () => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getAllBill();
        setupWebSocket();
      } catch (err) {
        setError('Failed to load bills. Please try again.');
        console.error('Error fetching bills:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const setupWebSocket = () => {
    websocketService.connect();
    const handleNotificationOrder = (message: any) => {
      const convertMessage = typeof message === "string" ? JSON.parse(message) : message;
      if (convertMessage.type === "NEW_ORDER" || convertMessage.type === "COMPLETED_ORDER" || convertMessage.type === "READY_ORDER_ITEM") {
        getAllBill();
      }
    };

    websocketService.addListener(handleNotificationOrder);
    return () => websocketService.removeListener(handleNotificationOrder);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };

  const formatDateTime = (dateTimeString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateTimeString).toLocaleDateString('en-US', options);
  };

  const getAllBill = async () => {
    try {
      const response = await getAllOrdersDetailsInDay();
      if (response.success) {
        const dataBills: Bill[] = response.data.map(item => ({
          id: item.id,
          tableNumber: item.tableNumber || 'Takeaway', 
          createTime: item.createTime, 
          totalAmount: item.totalAmount,
          subtotal: item.subtotal || item.totalAmount,
          discount: item.discount || 0,
          tax: item.tax || 0,
          paymentMethod: item.paymentMethod || 'unknown',
          status: item.status || 'pending',
          staff: item.staff || 'Unknown staff',
          items: item.items || []
        }));
        setBills(dataBills);
      } else {
        throw new Error(response.message || 'Failed to fetch bills');
      }
    } catch (error) {
      setError('Failed to load bills. Please try again.');
      console.error('Error fetching bills:', error);
    }
  };

  const getStatusStyle = (status: OrderStatus) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold tracking-wide";
    switch(status) {
      case 'paid': return `${base} bg-emerald-100 text-emerald-800`;
      case 'pending': return `${base} bg-amber-100 text-amber-800`;
      case 'cancelled': return `${base} bg-rose-100 text-rose-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch(method.toLowerCase()) {
      case 'cash': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Cash
          </span>
        );
      case 'card': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
            Card
          </span>
        );
      case 'e-wallet': 
      case 'ewallet': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            E-Wallet
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {method || 'Unknown'}
          </span>
        );
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesFilter = filter === 'all' || bill.status === filter;
    const matchesSearch = 
      bill.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.staff && bill.staff.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = bills
    .filter(bill => bill.status === 'paid')
    .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

  const handleViewDetails = (bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
  };

  const handlePrintReceipt = () => {
    // Implement print functionality
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bills</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={getAllBill}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-display">Current Shift Bills</h1>
              <p className="mt-1 text-sm text-gray-500">Real-time overview of today's transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-lg shadow-xs border border-gray-200">
                <span className="text-sm text-gray-500">Total Revenue:</span>
                <span className="ml-2 text-base font-semibold text-emerald-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  // Implement export functionality
                }}
              >
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search bills by ID, table, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('paid')}
                  className={`px-3 py-1 text-sm rounded-md ${filter === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Paid
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 text-sm rounded-md ${filter === 'pending' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-3 py-1 text-sm rounded-md ${filter === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        #{bill.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.tableNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(bill.createTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(bill.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentIcon(bill.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusStyle(bill.status)}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.staff}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            // Implement print functionality for this bill
                          }}
                        >
                          Print
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleViewDetails(bill)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No bills found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredBills.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBills.length}</span> of{' '}
                    <span className="font-medium">{bills.length}</span> bills
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    disabled={true} // Implement pagination logic
                  >
                    Previous
                  </button>
                  <button 
                    className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    disabled={true} // Implement pagination logic
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Details Modal */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">#{selectedBill.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedBill.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{formatDateTime(selectedBill.createTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Staff</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedBill.staff}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <div className="mt-1">
                    {getPaymentIcon(selectedBill.paymentMethod)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <span className={getStatusStyle(selectedBill.status)}>
                      {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-4">
                  {selectedBill.items?.length > 0 ? (
                    selectedBill.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between">
                        <div className="flex items-start">
                          <span className="text-sm font-medium text-gray-900 mr-2 min-w-[20px]">
                            {item.quantity}x
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            {item.notes && (
                              <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items found for this order</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(selectedBill.subtotal || selectedBill.totalAmount)}
                    </p>
                  </div>
                  
                  {selectedBill.discount && selectedBill.discount > 0 && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">Discount</p>
                      <p className="text-sm font-medium text-rose-600">
                        -{formatCurrency(selectedBill.discount)}
                      </p>
                    </div>
                  )}
                  
                  {selectedBill.tax && selectedBill.tax > 0 && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">Tax</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedBill.tax)}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <p className="text-base font-bold text-gray-900">Total</p>
                    <p className="text-base font-bold text-gray-900">
                      {formatCurrency(selectedBill.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};