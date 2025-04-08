import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addOrderItems, getAllItemsAvailable, getCategoriesWithCount } from "../../services/apiServices";
import websocketService from "../../services/websocketService";

const Order: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [cartItems, setCartItems] = useState<any[]>([]); 
    const [note, setNote] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>(""); 
    const [showCart, setShowCart] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    const navigate = useNavigate();

    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [totalProductsCount, setTotalProductsCount] = useState<number>(0);
    
    useEffect(() => {
        allItems();
        categoryWithCount();
        checkTableStatus();
        websocketService.connect();
    }, []);

    useEffect(() => {
        filterItems();
    }, [selectedCategory, items, searchQuery]);

    const allItems = async () => {
        const response = await getAllItemsAvailable();
        if (response.success){
            const formattedItems = response.data.map(item => ({
                ...item,
                name: item.name,
                price: item.currentPrice / 100000, 
                description: item.description, 
                image: item.url
            }));
            

            setItems(formattedItems);
        }
    };

    const checkTableStatus = () => {
        const tableStatus = localStorage.getItem("table_status");
        if (tableStatus !== "active") {
            navigate("/");
        }
    };

    const categoryWithCount = async () => {
        const response = await getCategoriesWithCount();
        if (response.success){
            const { totalProducts, categories } = response.data;
            setTotalProductsCount(totalProducts);
            const formattedCategories = categories.map((category: any) => ({
                id: category.categoryId,
                name: category.categoryName,
                count: category.count
            }));

            setCategories(formattedCategories);
        }
    };

    const filterItems = () => {
        let filtered = items;

        if (selectedCategory !== "All") {
            filtered = items.filter(item => item.categoryId === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    };

    const handleOpenModal = (item: any) => {
        setSelectedItem(item);
        setQuantity(1); 
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedItem(null);
    };

    const handleQuantityChange = (value: number) => {
        if (quantity + value >= 1) {
            setQuantity(quantity + value);
        }
    };

    const handleAddToCart = () => {
        const existingItem = cartItems.find(i => i.name === selectedItem.name);
        if (existingItem) {
            setCartItems(cartItems.map(i =>
                i.name === selectedItem.name
                    ? { ...i, quantity: i.quantity + quantity, note }
                    : i
            ));
        } else {
            setCartItems([...cartItems, { ...selectedItem, quantity, note }]);
        }
        setModalOpen(false);
        setSelectedItem(null);
        setQuantity(1);
        setNote("");
    };

    const handleRemoveFromCart = (itemName: string) => {
        setCartItems(cartItems.filter(item => item.name !== itemName));
    };

    const handleUpdateQuantity = (itemName: string, newQuantity: number) => {
        if (newQuantity >= 1) {
            setCartItems(cartItems.map(item =>
                item.name === itemName
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const handlePlaceOrder = async () => {
        var orderId = localStorage.getItem("order_id");
        if (orderId !== "0") {
            const orderItems = cartItems.map(item => ({
                OrderId: parseInt(orderId),
                MenuItemId: item.id,
                MenuItemName: item.name,
                Quantity: item.quantity,
                Price: item.price,
                Note: item.note
            }));

            const response = await addOrderItems(orderItems);
            if (response.success) {
                setShowSuccessModal(true);
                setCartItems([]);
                
                // WebSocket
                websocketService.sendMessage(JSON.stringify({
                    type: "NEW_DISH",
                }));

                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate("/");
                }, 3000); 
            }
            
        }
        
    }

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalProducts = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <>
            <div className="flex flex-col md:flex-row h-screen">
            {/* Sidebar */}
            <div className="bg-gray-100 p-4 md:w-64 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Menu</h2>
                <ul>
                    <li
                        className={`p-2 mb-2 rounded-lg cursor-pointer ${selectedCategory === "All"
                            ? "bg-blue-500 text-white"
                            : "hover:bg-gray-200"
                            }`}
                        onClick={() => setSelectedCategory("All")}
                    >
                        All ({totalProductsCount})
                    </li>
                    {categories.map((category) => (
                        <li
                            key={category.id}
                            className={`p-2 mb-2 rounded-lg cursor-pointer ${selectedCategory === category.id
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-200"
                                }`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name} ({category.count})
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white p-6 overflow-y-auto pb-24">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        {selectedCategory === "All" ? "All" : categories.find(cat => cat.id === selectedCategory)?.name}
                    </h1>
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                        onClick={() => navigate('/')}
                    >
                        Go Back
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full p-2 border rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Display "No items found" if no items match the search */}
                {filteredItems.length === 0 ? (
                    <div className="text-center text-gray-500">No items found</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center md:flex-row p-4 border rounded-lg shadow hover:shadow-lg"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 rounded-lg mb-4 md:mb-0 md:mr-4"
                                />
                                <div className="text-center md:text-left">
                                    <h3 className="text-lg font-bold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                    <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                                </div>
                                <button
                                    className="mt-4 md:mt-0 ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    onClick={() => handleOpenModal(item)}
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 md:w-96 shadow-lg relative">
                        <button
                            className="absolute top-4 right-4 text-gray-500"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                        <div className="flex items-center mb-4">
                            <img
                                src={selectedItem.image}
                                alt={selectedItem.name}
                                className="w-20 h-20 rounded-lg mr-4"
                            />
                            <div>
                                <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                                <p className="text-sm text-gray-500">{selectedItem.description}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="mb-2">
                                <strong>Item Type:</strong>
                            </p>
                            <p className="text-blue-600 font-bold">Dine-in (${selectedItem.price.toFixed(2)})</p>
                        </div>
                        <div className="mb-4">
                            <textarea
                                className="w-full p-2 border rounded-lg"
                                placeholder="Enter notes to help the restaurant serve you better"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    className="bg-gray-300 px-2 py-1 rounded-lg"
                                    onClick={() => handleQuantityChange(-1)}
                                >
                                    -
                                </button>
                                <span className="mx-4">{quantity}</span>
                                <button
                                    className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                                    onClick={() => handleQuantityChange(1)}
                                >
                                    +
                                </button>
                            </div>
                            <p className="font-bold text-blue-600">
                                ${(selectedItem.price * quantity).toFixed(2)}
                            </p>
                        </div>
                        <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg" onClick={handleAddToCart}>
                            Place Order
                        </button>
                    </div>
                </div>
            )}

            {/* Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
                    <div className="bg-white p-6 w-96 h-full shadow-lg overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Your Order Summary</h2>
                            <button
                                className="text-gray-500"
                                onClick={() => setShowCart(false)}
                            >
                                ✕
                            </button>
                        </div>
                        {cartItems.map((item, index) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold">{item.name}</h3>
                                        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                    </div>
                                    <button
                                        className="text-red-500"
                                        onClick={() => handleRemoveFromCart(item.name)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="flex items-center mt-2">
                                    <button
                                        className="bg-gray-300 px-2 py-1 rounded-lg"
                                        onClick={() => handleUpdateQuantity(item.name, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <span className="mx-4">{item.quantity}</span>
                                    <button
                                        className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                                        onClick={() => handleUpdateQuantity(item.name, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                {item.note && (
                                    <p className="text-sm text-gray-500 mt-2">Note: {item.note}</p>
                                )}
                            </div>
                        ))}
                        <div className="mt-4">
                            <p className="text-lg font-bold">Total: ${totalPrice.toFixed(2)}</p>
                        </div>
                        <button
                            className={`w-full mt-4 py-2 rounded-lg ${
                                totalPrice === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white'
                            }`}
                            onClick={() => handlePlaceOrder()}
                            disabled={totalPrice === 0}
                        >
                            Order Now
                        </button>
                    </div>
                </div>
            )}

            {/* Cart Footer */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex justify-between items-center border-t">
                    <div className="flex items-center">
                        <span className="text-blue-500 mr-2">
                        🍽️ Total Dish(es): {totalProducts}</span>
                        <span className="font-bold text-red-500 ml-4">Total Price: ${totalPrice.toLocaleString()}</span>
                    </div>
                    <button
                        className="bg-green-500 text-white px-6 py-2 rounded-lg"
                        onClick={() => setShowCart(true)}
                    >
                        View Order
                    </button>
                </div>
            )}
            </div>
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-green-500 text-2xl font-bold mb-2">🎉 Order Placed Successfully!</h2>
                        <p className="text-gray-600">Redirecting to homepage in 3 seconds...</p>
                    </div>
                </div>
            )}
        </> 
    );
};

export default Order;