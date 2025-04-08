import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderByTableId, getStatusTable } from "../../services/apiServices";

const Home: React.FC = () => {
    const [nameRestaurant, setNamRestaurant] = useState<string>("Spicy Pot Delight");
    const [numberOfTables, setNumberOfTables] = useState<number>(2);

    const [isTableActive, setIsTableActive] = useState<boolean>(false); 
    const [isCallStaffModalOpen, setIsCallStaffModalOpen] = useState<boolean>(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
    const [requestText, setRequestText] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>(""); 
    const [isRequestSent, setIsRequestSent] = useState<boolean>(false);
    const [isCallStaffFailed, setIsCallStaffFailed] = useState<boolean>(false);
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState<boolean>(false);
    const [totalAmount, setTotalAmount] = useState<number>(100); 
    const navigate = useNavigate();

    useEffect(() => {
        statusTable(numberOfTables);
    }, []);
    
    const statusTable = async (tableId: number) => {
        const response = await getStatusTable(tableId);
        const isActive = response.success && response.data;
        setIsTableActive(isActive);
        localStorage.setItem("table_status", isActive ? "active" : "inactive");
        
        let orderId = 0;
        if (isActive) {
            const responseOrder = await getOrderByTableId(tableId);
            if (responseOrder.success && responseOrder.data) {
                orderId = responseOrder.data.id;
                // await createPayment(orderId);
            }
        }
        localStorage.setItem("order_id", orderId.toString());
    };

    // Handle open and close modals
    const handleOpenCallStaffModal = () => {
        statusTable(numberOfTables);
        if (isTableActive) {
            setIsCallStaffModalOpen(true);
            setAlertMessage(""); 
            setIsCallStaffFailed(false);
        }
    };
    const handleCloseCallStaffModal = () => {
        setIsCallStaffModalOpen(false);
        setRequestText(""); 
        setAlertMessage(""); 
        setIsCallStaffFailed(false); 
    };

    const handleOpenPaymentModal = () => {
        statusTable(numberOfTables);
        if (isTableActive) {
            setIsPaymentModalOpen(true);
            setAlertMessage("");
        }
    };
    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setPaymentMethod("");
        setAlertMessage(""); 
    };

    // Handle request submission
    const handleSubmitRequest = () => {
        if (requestText.trim() === "") {
            setIsCallStaffFailed(true); 
            setAlertMessage("Please enter a request.");
            return;
        }
        // Send the request logic here
        setIsRequestSent(true);
        setRequestText("");
        setTimeout(() => {
            setIsRequestSent(false); 
            handleCloseCallStaffModal(); 
        }, 2000);
    };

    // Handle payment submission
    const handlePaymentSubmit = () => {
        if (!paymentMethod) {
            setAlertMessage("Please choose a payment method.");
            return;
        }

        // Simulate payment logic here
        setIsPaymentSuccessful(true);
        setAlertMessage(`Payment of $${totalAmount} via ${paymentMethod} was successful!`);
        setTimeout(() => {
            setIsPaymentSuccessful(false); 
            handleClosePaymentModal(); 
        }, 2000); 
    };

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
        setAlertMessage(""); 
    };

    const handleClickMenu = () => {
        statusTable(numberOfTables);
        if (isTableActive) {
            navigate("/order");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header Section */}
            <div className="relative w-full h-48 bg-gray-300">
                <img
                    src="./src/images/bk.jpg"
                    alt="Restaurant"
                    className="absolute w-full h-full object-cover"
                />
            </div>

            {/* Restaurant Info */}
            <div className="relative -mt-20 mx-4">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-2">{nameRestaurant}</h1>
                    <div className="text-gray-500 flex items-center mb-2">
                        <span className="mr-2">🕒</span> Opening hours: 10 AM - 10 PM, Daily 
                    </div>
                    <div className="text-gray-500 flex items-center mb-2">
                        <span className="mr-2">🍽️</span>Number of table: {numberOfTables}
                    </div>
                    <div className="text-gray-500 flex items-center mb-2">
                        <span className="mr-2">🎉 </span> Today’s Special: Spicy Seafood Hotpot
                    </div>
                </div>
            </div>

            {/* Support Buttons */}
            <div className="mt-8 mx-4">
                <h2 className="text-center text-lg font-semibold mb-4">
                    What do you need help with?
                </h2>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        className="flex flex-col items-center justify-center bg-green-100 text-green-600 py-4 rounded-lg shadow"
                        onClick={handleOpenCallStaffModal}
                    >
                        <span className="text-3xl">👨‍💼</span>
                        Call Staff
                    </button>
                    <button
                        className="flex flex-col items-center justify-center bg-yellow-100 text-yellow-600 py-4 rounded-lg shadow"
                        onClick={handleOpenPaymentModal}
                    >
                        <span className="text-3xl">💰</span>
                        Request Payment
                    </button>
                    <button
                        className="flex flex-col items-center justify-center bg-blue-600 text-white py-4 rounded-lg shadow"
                        onClick={() => {
                            handleClickMenu();
                        }} 
                    >
                        <span className="text-3xl">📋</span>
                        Menu & Order
                    </button>
                </div>
            </div>

            {/* Modal for Calling Staff */}
            {isCallStaffModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 md:w-96 shadow-lg relative">
                        <button
                            className="absolute top-4 right-4 text-gray-500"
                            onClick={handleCloseCallStaffModal}
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Call Staff</h2>
                        <p className="text-gray-500 mb-4">Reason for calling staff: (e.g. Request extra bowls, clear the table...)</p>

                        <textarea
                            className="w-full p-2 border rounded-lg mb-4"
                            placeholder="Enter your request"
                            value={requestText}
                            onChange={(e) => setRequestText(e.target.value)}
                        ></textarea>

                        {isRequestSent && (
                            <div className="p-4 rounded-lg mb-4 bg-green-100 text-green-700 shadow">
                                <p>Your request has been sent successfully!</p>
                            </div>
                        )}

                        {isCallStaffFailed && (
                            <div className="p-4 rounded-lg mb-4 bg-red-100 text-red-700 shadow">
                                <p>{alertMessage}</p>
                            </div>
                        )}

                        <button
                            className="w-full bg-blue-500 text-white py-2 rounded-lg"
                            onClick={handleSubmitRequest}
                        >
                            Send Request
                        </button>
                    </div>
                </div>
            )}

            {/* Modal for Payment */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 md:w-96 shadow-lg relative">
                        <button
                            className="absolute top-4 right-4 text-gray-500"
                            onClick={handleClosePaymentModal}
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Payment</h2>
                        <p className="text-gray-500 mb-4">Choose a payment method for your order:</p>

                        <div className="space-y-4 mb-4">
                            <button
                                className={`w-full p-4 border rounded-lg ${paymentMethod === "Cash" ? "bg-blue-100" : ""}`}
                                onClick={() => handlePaymentMethodChange("Cash")}
                            >
                                Cash
                            </button>
                            <button
                                className={`w-full p-4 border rounded-lg ${paymentMethod === "Mono" ? "bg-blue-100" : ""}`}
                                onClick={() => handlePaymentMethodChange("Mono")}
                            >
                                Mono
                            </button>
                            <button
                                className={`w-full p-4 border rounded-lg ${paymentMethod === "Bank" ? "bg-blue-100" : ""}`}
                                onClick={() => handlePaymentMethodChange("Bank")}
                            >
                                Bank Transfer
                            </button>
                        </div>

                        {/* Display alert message */}
                        {alertMessage && (
                            <div
                                className={`p-4 rounded-lg mb-4 ${isPaymentSuccessful ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {alertMessage}
                            </div>
                        )}

                        <button
                            className="w-full bg-blue-500 text-white py-2 rounded-lg"
                            onClick={handlePaymentSubmit}
                        >
                            Confirm Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
