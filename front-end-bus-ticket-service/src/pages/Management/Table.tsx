import { useEffect, useState } from "react";
import { FaTable, FaMoneyBillWave, FaTimes, FaBell, FaUtensils } from "react-icons/fa";
import Header from "../../components/Header";
import { closeTable, createPayment, getAllTables, getOrderByTableId, getOrderItemsCompleted, openTable, updateOrderItemStatus, updateOrderStatus, updatePayment, updateUnpayment } from "../../services/apiServices";
import websocketService from "../../services/websocketService";

const TableManagement = ({ shouldShowHeader }: { shouldShowHeader: boolean }) => {
    // Status map
    const statusMap = {
        0: "available",
        1: "occupied",
    };

    const [tables, setTables] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [newOrder, setNewOrder] = useState("");

    useEffect(() => {
        getTable().then((data) => {
            setTables(data);
        });
        websocketService.connect();
        const handleNotificationOrderDisheCompleted = async(message: any) => {
              const convertMessage = typeof message === "string" ? JSON.parse(message) : message;

              if (convertMessage.type === "COMPLETED_DISH") {
                await getTable().then((data) => {
                    setTables(data);
                });
              }
            };

        websocketService.addListener(handleNotificationOrderDisheCompleted);
        
        return () => {
            websocketService.removeListener(handleNotificationOrderDisheCompleted);
        };
    }, []);

    const getServedOrders = (orders) => {
        return orders
            .filter((item) => item.status === "served")
            .reduce((acc, item) => {
                const existingItem = acc.find((i) => i.menuId === item.menuId);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                    existingItem.totalPrice += item.price * item.quantity;
                } else {
                    acc.push({
                        id: item.id,
                        name: item.name,
                        menuId: item.menuId,
                        quantity: item.quantity,
                        price: item.price,
                        totalPrice: item.price * item.quantity,
                    });
                }
                return acc;
            }, []);
    };
    
    const getTable = async () => {
        try {
            const [tablesResponse, ordersResponse] = await Promise.all([
                getAllTables(),
                getOrderItemsCompleted()
            ]);
            if (tablesResponse.success) {
                const tables = tablesResponse.data.map(table => {

                    const orders = ordersResponse.success
                        ? ordersResponse.data
                              .filter(order => order.tableId === table.id)
                              .map(order => ({
                                  id: order.id,
                                  orderId: order.orderId,
                                  menuId: order.menuItemId,
                                  name: order.menuItemName,
                                  price: order.price,
                                  status: order.status === 2 ? "ready" : "served",
                                  quantity: order.quantity
                              }))
                        : [];
        
                    return {
                        id: table.id,
                        name: `Table ${table.tableNumber}`,
                        status: statusMap[table.status as keyof typeof statusMap] || "available",
                        capacity: table.capacity,
                        orders,
                        servedOrders: getServedOrders(orders),
                        notifications: []
                    };
                });
        
                return tables;
            }
        } catch (error) {
            console.error("Error fetching tables: ", error);
        }
    };

    const handleOpenTable = async (tableId: number) => {
        const response = await openTable(tableId);
        if (response.success) {
            setTables(tables.map(table =>
                table.id === tableId ? { 
                    ...table, 
                    status: "occupied",
                    orders: [],
                    notifications: []
                } : table
            ));
        }
        const responseOrder = await getOrderByTableId(tableId);
        if (responseOrder.success) {
            const orderId = responseOrder.data.id;
            await createPayment(orderId);
            websocketService.sendMessage(JSON.stringify({
                type: "NEW_ORDER",
            }));
        }
        
    };

    const handleCloseTable = async (tableId: number) => {
        const response = await closeTable(tableId);
        if (response.success) {
            setTables(tables.map(table =>
                table.id === tableId ? { 
                    ...table, 
                    status: "available",
                    orders: [],
                    notifications: []
                } : table
            ));
        }
    };

    const handleRequestBill = async (tableId: number) => {
        setCurrentTable(tables.find(table => table.id === tableId));
        await getTable().then((data) => {
            setTables(data);
        });
        setShowBillModal(true);
    };

    const handleConfirmPayment = async() => {
        if (!paymentMethod) {
            alert("Please select payment method");
            return;
        }
        const paymentMethodInt = parseInt(paymentMethod, 10);
        const orderId = currentTable?.orders[0]?.orderId;
        const amount = currentTable.servedOrders.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
        
        
        await updatePayment(orderId, { paymentMethod: paymentMethodInt,amount });
        await updateOrderStatus(orderId);
        handleCloseTable(currentTable.id);
        
        websocketService.sendMessage(JSON.stringify({
            type: "COMPLETED_ORDER",
        }))

        setShowBillModal(false);
        setPaymentMethod("");
    };

    const handleAddOrder = (tableId: number) => {
        setCurrentTable(tables.find(table => table.id === tableId));
        setShowOrderModal(true);
    };

    const handleSubmitOrder = () => {
        if (!newOrder.trim()) return;
        
        const newOrderItem = {
            id: Date.now(),
            name: newOrder,
            price: 0, 
            status: "ordered"
        };
        
        setTables(tables.map(table =>
            table.id === currentTable.id ? { 
                ...table, 
                orders: [...table.orders, newOrderItem]
            } : table
        ));
        
        setNewOrder("");
        setShowOrderModal(false);
    };

    const handleMarkReady = async (tableId: number, orderId: number) => {
        const response = await updateOrderItemStatus(orderId, 3);
        if (response.success) {
            // Update tables
            const updatedTables = await getTable();
            setTables(updatedTables);
            
            // Get current table
            const updatedCurrentTable = updatedTables.find(table => table.id === tableId);
            setCurrentTable(updatedCurrentTable);
            
            // Use the updated current table
            const orderIdForPayment = updatedCurrentTable?.orders[0]?.orderId;
            const amount = updatedCurrentTable?.servedOrders?.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            ).toFixed(2);
            
            if (orderIdForPayment && amount) {
                await updateUnpayment(orderIdForPayment, { paymentMethod: 0, amount });
            }
            
            websocketService.sendMessage(JSON.stringify({
                type: "READY_ORDER_ITEM",
            }));
        }
    };

    const handleViewNotifications = (tableId: number) => {
        setCurrentTable(tables.find(table => table.id === tableId));
        setShowNotificationModal(true);
    };

    const handleClearNotifications = (tableId : number ) => {
        setTables(tables.map(table =>
            table.id === tableId ? { ...table, notifications: [] } : table
        ));
        setShowNotificationModal(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available": return "bg-green-100 text-green-800";
            case "occupied": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <>
            {shouldShowHeader && <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header Section */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-3">
                                    <FaTable className="text-xl" />
                                </span>
                                <h2 className="text-lg font-semibold text-gray-900">Table Management</h2>
                            </div>
                            <div className="text-sm text-gray-500">
                                Total Tables: {tables.length} | Occupied: {tables.filter(t => t.status === "occupied").length}
                            </div>
                        </div>
                    </div>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {tables.map((table) => (
                            <div key={table.id} className={`bg-white shadow-sm rounded-lg border ${
                                table.status === "occupied" ? "border-yellow-300" : 
                                table.status === "reserved" ? "border-blue-300" : "border-gray-200"
                            } overflow-hidden transition-transform hover:scale-[1.02]`}>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                                {table.name}
                                                {table.name.includes("VIP") && (
                                                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">VIP</span>
                                                )}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                Capacity: {table.capacity} persons
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(table.status)}`}>
                                            {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                                        </span>
                                    </div>

                                    {table.status === "occupied" && (
                                        <div className="mt-3 space-y-2">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-700 mb-1">Current Orders:</p>
                                                <ul className="space-y-1">
                                                    {table.orders.map((order) => (
                                                        order.status === "ready" && (
                                                            <li key={order.id} className="flex justify-between items-center">
                                                                <span className="text-green-600">
                                                                    {order.name}
                                                                </span>
                                                                <button 
                                                                    onClick={() => handleMarkReady(table.id, order.id)}
                                                                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800"
                                                                >
                                                                    {order.status}
                                                                </button>
                                                            </li>
                                                        )
                                                    ))}
                                                </ul>
                                            </div>
                                            
                                            {table.notifications.length > 0 && (
                                                <button 
                                                    onClick={() => handleViewNotifications(table.id)}
                                                    className="w-full flex items-center justify-between px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium"
                                                >
                                                    <span>New requests ({table.notifications.length})</span>
                                                    <FaBell />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-2">
                                        {table.status === "available" ? (
                                            <button
                                                onClick={() => handleOpenTable(table.id)}
                                                className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Open Table
                                            </button>
                                        ) : table.status === "occupied" ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleAddOrder(table.id)}
                                                    className="inline-flex justify-center items-center px-2 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <FaUtensils className="mr-1" /> Add Order
                                                </button>
                                                <button
                                                    onClick={() => handleRequestBill(table.id)}
                                                    className="inline-flex justify-center items-center px-2 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    <FaMoneyBillWave className="mr-1" /> Bill
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                                            >
                                                Reserved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bill Modal */}
                    {showBillModal && currentTable && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">PAYMENT</h2>
                                        <button
                                            onClick={() => setShowBillModal(false)}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                                            <span>Table:</span>
                                            <span className="font-medium text-gray-900">{currentTable.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Time:</span>
                                            <span className="font-medium text-gray-900">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-b border-gray-200 py-3 my-3 max-h-60 overflow-y-auto">
                                        <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-2">
                                            <span>Item</span>
                                            <span className="text-center">Quantity</span>
                                            <span className="text-center">Price</span>
                                            <span className="text-right">Total</span>
                                        </div>

                                        {currentTable?.servedOrders?.length > 0 && (
                                            currentTable.servedOrders.map((item) => (
                                                <div key={item.id} className="grid grid-cols-4 py-2">
                                                    <span>{item.name}</span>
                                                    <span className="text-center">{item.quantity}</span>
                                                    <span className="text-center text-gray-900">${item.price.toFixed(2)}</span>
                                                    <span className="text-right font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
                                        <span>Total:</span>
                                        <span>
                                            ${currentTable.servedOrders.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                                        </span>                                    
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method:</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">-- Select method --</option>
                                            <option value="1">Cash</option>
                                            <option value="2">Credit Card</option>
                                            <option value="3">E-Wallet</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setShowBillModal(false)}
                                            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmPayment}
                                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                        >
                                            CONFIRM PAYMENT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Modal */}
                    {showOrderModal && currentTable && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">ADD ORDER</h2>
                                        <button
                                            onClick={() => setShowOrderModal(false)}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Order for {currentTable.name}:</label>
                                        <input
                                            type="text"
                                            value={newOrder}
                                            onChange={(e) => setNewOrder(e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Enter item name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setShowOrderModal(false)}
                                            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitOrder}
                                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            ADD ORDER
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Modal */}
                    {showNotificationModal && currentTable && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">CUSTOMER REQUESTS</h2>
                                        <button
                                            onClick={() => setShowNotificationModal(false)}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{currentTable.name}</h3>
                                        <ul className="space-y-2">
                                            {currentTable.notifications.map((note, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="flex-shrink-0 h-5 w-5 text-yellow-500">
                                                        <FaBell />
                                                    </span>
                                                    <span className="ml-2 text-gray-700">{note}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => handleClearNotifications(currentTable.id)}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                    >
                                        MARK AS RESOLVED
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TableManagement;