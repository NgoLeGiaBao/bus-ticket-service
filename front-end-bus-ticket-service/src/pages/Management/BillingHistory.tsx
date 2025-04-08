import { useEffect, useState } from 'react';
import { getAllOrdersDetails } from '../../services/apiServices';
import websocketService from '../../services/websocketService';

export const BillingHistory = () => {
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [bills, setBills] = useState<any[]>([]);


  useEffect(() => {
      getAllBill();
      const handleNotificationOrder = (message: any) => {
            const convertMessage = typeof message === "string" ? JSON.parse(message) : message;
    
            if (convertMessage.type === "COMPLETED_ORDER") {
              getAllBill();
            }
          };
    
      websocketService.addListener(handleNotificationOrder);
      
      return () => {
          websocketService.removeListener(handleNotificationOrder);
      };
      }, []);

    const getAllBill = async () => {
      const response = await getAllOrdersDetails();
      if (response.success) {
        const dataBills = response.data.map(item => ({
          ...item,
          id: item.id,
          date: item.createTime,
          shift: item.shift,
          tableNumber: item.tableNumber,
          totalAmount: item.totalAmount,
          discount: item.discountAmount,
          finalAmount: item.finalAmount,
          paymentMethod: item.paymentMethod,
          staff: item.staff       
      }));
      setBills(dataBills);
      }
    }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getShiftName = (shift: string) => {
    switch(shift) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'evening': return 'Evening';
      default: return shift;
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesShift = shiftFilter === 'all' || bill.shift === shiftFilter;
    const matchesDate = !dateFilter || bill.date.includes(dateFilter);
    return matchesShift && matchesDate;
  });

  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.finalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-display">Billing History</h1>
              <p className="mt-1 text-sm text-gray-500">Complete transaction records by date</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-lg shadow-xs border border-gray-200">
                <span className="text-sm text-gray-500">Total Revenue:</span>
                <span className="ml-2 text-base font-semibold text-emerald-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  className="block w-full sm:w-40 pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <select
                className="block w-full sm:w-40 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
              >
                <option value="all">All Shifts</option>
                <option value="Shift 1">Shift 1	</option>
                <option value="Shift 2">Shift 2</option>
              </select>
            </div>
            <div className="w-full sm:w-72">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search bills..."
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{bill.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getShiftName(bill.shift)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.tableNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(bill.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-500">{formatCurrency(bill.discount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{formatCurrency(bill.finalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.staff}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">Print</button>
                      <button className="text-gray-600 hover:text-gray-900">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBills.length}</span> of{' '}
                  <span className="font-medium">{bills.length}</span> bills
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};