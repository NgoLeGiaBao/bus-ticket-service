import { useState, useEffect } from "react";
import {FaTimes, FaExclamationCircle, FaCheck, FaPlay } from "react-icons/fa";
import Header from "../../components/Header";
import websocketService from "../../services/websocketService";
import {changeItemStatus, getAllCategoriesWithItems, getOrderItemsByStatusDish, updateOrderItemStatus } from './../../services/apiServices';


const DishManagement = () => {
  useEffect(() => {
    allCategories();
    getOrderByStatus();
    websocketService.connect();

    const handleNotificationNewOrder = (message: any) => {
      const convertMessage = JSON.parse(message);
      if (convertMessage.type === "NEW_DISH") {
          getOrderByStatus();
      }
    };

    websocketService.addListener(handleNotificationNewOrder);

    return () => {
        websocketService.removeListener(handleNotificationNewOrder);
    };
  }, []);



  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState(["All"]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");


  const allCategories = async () => {
    try {
      const response = await getAllCategoriesWithItems();
      if (response.success) {
        const newCategories = new Set(["All"]); 
        const newMenu = [];
  
        response.data.forEach((category) => {
          if (category.menuItems.length){
            newCategories.add(category.name); 
          }
          category.menuItems.forEach((item) => {
            newMenu.push({
              id: item.id,
              name: item.name,
              category: category.name,
              available: item.isAvailable,
              price: item.currentPrice / 100000,
            });
          });
        });
  
        setCategories(Array.from(newCategories)); 
        setMenu(newMenu); 
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getOrderByStatus = async () => {
    try {
      const response = await getOrderItemsByStatusDish();
      if (response.success) {
        const newOrders = response.data.map((order) => ({
          id: order.id,
          table: order.tableId,
          food: order.menuItemName, 
          status: mapStatus(order.status),
          note: order.note,
          quantity: order.quantity,
          time: formatTime(order.createdAt),
        }));
        setOrders(newOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }
  
  // Convert status number to string
  const mapStatus = (status: number) => {
    switch (status) {
        case 0: return "Pending";
        case 1: return "In Progress";
        case 2: return "Completed";
        default: return "Unknown";
    }
  };

  // Format time to 12-hour format
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // const calculateTotalOrdered = (foodName: string) => {
  //   return orders
  //     .filter(order => order.food === foodName && order.status !== "Cancelled")
  //     .reduce((total, order) => total + order.quantity, 0);
  // };

  useEffect(() => {
    const updatedOrders = orders.map(order => {
      const foodItem = menu.find(item => item.name === order.food);
      if (foodItem && !foodItem.available && order.status === "Pending") {
        return { ...order, status: "Out of Stock" };
      }
      return order;
    });
    setOrders(updatedOrders);
  }, [menu]);

  const toggleAvailability = async (foodId: number) => {
    const respose = await changeItemStatus(foodId);
    if (respose.success) {
      setMenu(menu.map(food =>
        food.id === foodId ? { ...food, available: !food.available } : food
      ));
    }
  };

  const updateOrderStatus = async(orderId: number, newStatus: string) => {
    let statusValue: number = 0    
    if (newStatus === "In Progress") {
      statusValue = 1;
    } else if (newStatus === "Completed") {
      statusValue = 2;
    };
    const respose = await updateOrderItemStatus(orderId, statusValue);
    if (statusValue === 2) {
      // WebSocket
      websocketService.sendMessage(JSON.stringify({
          type: "COMPLETED_DISH",
      }));
    }
    if (respose.success) {
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
  };

  const cancelOrder = async (orderId: number) => {
    const response = await updateOrderItemStatus(orderId, 4);
    if (response.success) {
      // WebSocket
       websocketService.sendMessage(JSON.stringify({
           type: "CANCEL_DISH",
       }));

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: "Cancelled" } : order
      ));
    }
  };

  const filteredMenu = selectedCategory === "All"
    ? menu
    : menu.filter(food => food.category === selectedCategory);

 
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-emerald-100 text-emerald-800";
      case "Out of Stock": return "bg-rose-100 text-rose-800";
      case "Cancelled": return "bg-gray-200 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order List */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-3">
                    📋
                  </span>
                  Active Orders
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {orders.filter(o => o.status !== "Completed").map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">Table {order.table}</span>
                          <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">
                          {order.food} × {order.quantity} 
                          <span className="ml-2 text-xs text-gray-500">{order.time}</span>
                        </p>
                        {order.note && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Note:</span> {order.note}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {order.status === "Pending" && (
                          <>
                            <button 
                              onClick={() => updateOrderStatus(order.id, "In Progress")}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              <FaPlay className="mr-1" /> Start
                            </button>
                            <button 
                              onClick={() => cancelOrder(order.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none"
                            >
                              <FaTimes className="mr-1" /> Cancel
                            </button>
                          </>
                        )}
                        {order.status === "In Progress" && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, "Completed")}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
                          >
                            <FaCheck className="mr-1" /> Complete
                          </button>
                        )}
                        {order.status === "Out of Stock" && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-rose-800 bg-rose-100 rounded">
                            <FaExclamationCircle className="mr-1" /> Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Management */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-3">
                    🍽️
                  </span>
                  Menu Management
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors
                        ${selectedCategory === category 
                          ? "bg-indigo-600 text-white" 
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredMenu.map((food) => (
                  <div key={food.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{food.name}</div>
                        <div className="flex items-center mt-1 space-x-4">
                          <span className="text-xs text-gray-500">{food.category}</span>
                          <span className="text-xs font-medium text-gray-900">{formatCurrency(food.price)}</span>
                          <span className="text-xs text-gray-500">
                            {/* Ordered: {calculateTotalOrdered(food.name)} */}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleAvailability(food.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium
                          ${food.available 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"}`}
                      >
                        {food.available ? "Available" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Completed Orders Section */}
          <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-3">
                  ✅
                </span>
                Completed Orders (Today)
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.filter(o => o.status === "Completed").map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">Table {order.table}: {order.food} × {order.quantity}</div>
                      <div className="text-xs text-gray-500 mt-1">{order.time}</div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DishManagement;