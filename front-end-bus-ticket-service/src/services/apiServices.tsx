import axios from "../utils/axiosCustomize"

//-- Authentication --//
// Login
export const postLogin = (params: any) => axios.post("/auth/login", params);
// Logout
export const postLogout = () => axios.post("/auth/logout");

// -- Welcome -- //
// Get status table
export const getStatusTable = (tableId: number) => axios.get(`welcome/table-status/${tableId}`);
// Get all tables
export const getAllTables = () => axios.get("/welcome/tables");
// Open table
export const openTable = (tableId: number) => axios.post(`welcome/${tableId}/open`);
// Close table
export const closeTable = (tableId: number) => axios.post(`welcome/${tableId}/close`);

// -- Menu -- //
// Get all categories
export const getAllCategoriesWithItems = () => axios.get("/menu/all-categories-with-items");
// Get categories with count
export const getCategoriesWithCount = () => axios.get("/menu/categories-with-count");
// Get all menus available
export const getAllItemsAvailable = () => axios.get("/menu/all-items-available");
// Get all items 
export const getAllItems = () => axios.get("/menu/all-items");
// Change item status
export const changeItemStatus = (itemId: number) => axios.put(`/menu/change-availability-item/${itemId}`);

// -- Order -- //
// Get order by table ID and Opened status
export const getOrderByTableId = (tableId: number) => axios.get(`ordering/get-order-by-table-id/${tableId}`);
// Add order items
export const addOrderItems = (items: any) => axios.post("/ordering-item/add-order-items", items);
// Get order items by status order
export const getOrderItemsByStatusDish = () => axios.get("ordering-item/get-all-order-items-based-on-status");
// Get order items completed
export const getOrderItemsCompleted = () => axios.get("ordering-item/get-all-order-items-completed");
// Update order status
export const updateOrderStatus = (orderId: number) => {
    return axios.put(`ordering/update-status/${orderId}`);
};
// Update order item status
export const updateOrderItemStatus = (orderItemId: number, status: number) => {
    return axios.put(`ordering-item/update-order-item-status/${orderItemId}`, 
    null,
    { params: { status } }); 
};
// Get all orders' details in a day
export const getAllOrdersDetailsInDay = () => axios.get("ordering/get-order-detail-in-day");
// Get all orders' details
export const getAllOrdersDetails = () => axios.get("ordering/get-all-order-details");

// -- Payment -- //
// Create payment
export const createPayment = (orderId: number) => axios.post(`/payment/create-payment/${orderId}`);
// Update payment 
export const updatePayment = (orderId: string, params: any) => axios.put(`/payment/update-payment/${orderId}`, params);
// Update unpayment
export const updateUnpayment = (orderId: string, params: any) => axios.put(`/payment/update-unpayment/${orderId}`, params);