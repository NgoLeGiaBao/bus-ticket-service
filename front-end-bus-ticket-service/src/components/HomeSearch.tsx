import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import { getAllDestinations, getDestinationsByOrigin} from "../services/apiServices";
import FailureNotification from "./FailureNotification";

const HomeSearch: React.FC = () => {
	const navigate = useNavigate();

	// State for destinations and origins
	const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
	const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);

	// Modal state
	const [failureModalVisible, setFailureModalVisible] = useState<boolean>(false);
	const [startAddressSearchModalVisible, setStartAddressSearchModalVisible] = useState<boolean>(false);
	const [endAddressSearchModalVisible, setEndAddressSearchModalVisible] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");

	// Input fields for search
	const [selectedStartAddress, setSelectedStartAddress] = useState<string>("");
	const [selectedEndAddress, setSelectedEndAddress] = useState<string>("");
	const [startAddressSearchQuery, setStartAddressSearchQuery] = useState<string>("");
	const [endAddressSearchQuery, setEndAddressSearchQuery] = useState<string>("");
	const [tripDate, setTripDate] = useState<string>(new Date().toISOString().split('T')[0]);

	useEffect(() => {
		fetchProvinces();
	}, []);

	// Handle trip search
	const handleTripSearch = () => {
		if (selectedStartAddress && selectedEndAddress && tripDate) {
			navigate(`/search-trip?start_address=${selectedStartAddress}&end_address=${selectedEndAddress}&date=${tripDate}`);
			window.location.reload();
		} else {
			setErrorMessage("Hãy chọn đầy đủ thông tin trước khi tìm kiếm chuyến đi!");
			showFailureModal();
		}
	};

	// Fetch available provinces and destinations based on selected start address
	const fetchProvinces = async () => {
		try {
			const res = await getAllDestinations();
			if (res.success && Array.isArray(res.data)) {
				setAvailableProvinces(res.data);
				setAvailableDestinations(res.data); // Default all destinations are the same as provinces
			}
		} catch (error) {
			console.error("Failed to fetch provinces", error);
		}
	};

	// Fetch destinations by selected start address
	const fetchDestinationsByOrigin = async (origin: string) => {
		try {
			const res = await getDestinationsByOrigin(origin);
			if (res.success && Array.isArray(res.data)) {
				setAvailableDestinations(res.data);
			}
		} catch (error) {
			console.error("Failed to fetch destinations", error);
		}
	};

	// Fetch origins by selected end address
	const fetchOriginsByDestination = async (destination: string) => {
		try {
			const res = await getDestinationsByOrigin(destination);
			if (res.success && Array.isArray(res.data)) {
				setAvailableProvinces(res.data);
			}
		} catch (error) {
			console.error("Failed to fetch origins", error);
		}
	};

	// Modal visibility handlers
	const closeFailureModal = () => setFailureModalVisible(false);
	const showFailureModal = () => setFailureModalVisible(true);

	return (
		<>
			<div className="mt-10 mb-20">
				<h3 className="text-center text-2xl font-bold text-green-700 mb-5">TÌM KIẾM CHUYỂN ĐI</h3>
				<hr className="w-4/5 mx-auto h-0.5 bg-gray-200 md:w-2/5 xl:w-1/5" />
				<div className="max-w-screen-lg bg-white text-black mx-auto mt-10 p-6 border border-orange-400 shadow-xl rounded-xl flex flex-col md:flex-row items-end gap-4">
					{/* Start Address */}
					<div className="input-search flex flex-col w-full md:basis-1/4">
						<label className="mb-2 font-medium text-gray-700">Điểm đi</label>
						<div className="rounded-lg relative">
							<div
								className="w-full h-12 px-4 flex items-center border border-gray-300 rounded-lg hover:border-orange-400 transition-colors cursor-pointer"
								onClick={() => setStartAddressSearchModalVisible(true)}
							>
								<span className={selectedStartAddress ? "" : "text-gray-400"}>
									{selectedStartAddress || "Chọn điểm đi"}
								</span>
							</div>
							{startAddressSearchModalVisible && (
								<div className="absolute z-10 top-14 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
									<div className="p-2 border-b">
										<input
											autoFocus
											value={startAddressSearchQuery}
											className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
											placeholder="Tìm kiếm điểm đi..."
											onChange={(e) => setStartAddressSearchQuery(e.target.value)}
										/>
									</div>
									<ul className="w-full overflow-y-auto max-h-60">
										{(startAddressSearchQuery === "" ? availableProvinces : availableProvinces.filter((item) =>
											item.toLowerCase().includes(startAddressSearchQuery.toLowerCase())
										)).map((item, i) => (
											<li
												key={i}
												className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
												onClick={() => {
													setSelectedStartAddress(item);
													setStartAddressSearchModalVisible(false);
													fetchDestinationsByOrigin(item); 
												}}
											>
												{item}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>

					{/* End Address */}
					<div className="input-search flex flex-col w-full md:basis-1/4">
						<label className="mb-2 font-medium text-gray-700">Điểm đến</label>
						<div className="rounded-lg relative">
							<div
								className="w-full h-12 px-4 flex items-center border border-gray-300 rounded-lg hover:border-orange-400 transition-colors cursor-pointer"
								onClick={() => setEndAddressSearchModalVisible(true)}
							>
								<span className={selectedEndAddress ? "" : "text-gray-400"}>
									{selectedEndAddress || "Chọn điểm đến"}
								</span>
							</div>
							{endAddressSearchModalVisible && (
								<div className="absolute z-10 top-14 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
									<div className="p-2 border-b">
										<input
											autoFocus
											value={endAddressSearchQuery}
											className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
											placeholder="Tìm kiếm điểm đến..."
											onChange={(e) => setEndAddressSearchQuery(e.target.value)}
										/>
									</div>
									<ul className="w-full overflow-y-auto max-h-60">
										{(endAddressSearchQuery === "" ? availableDestinations : availableDestinations.filter((item) =>
											item.toLowerCase().includes(endAddressSearchQuery.toLowerCase())
										)).map((item, i) => (
											<li
												key={i}
												className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
												onClick={() => {
													setSelectedEndAddress(item);
													setEndAddressSearchModalVisible(false);
													fetchOriginsByDestination(item);
												}}
											>
												{item}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>

					{/* Date */}
					<div className="input-search flex flex-col w-full md:basis-1/4">
						<label className="mb-2 font-medium text-gray-700">Thời gian khởi hành</label>
						<input
							value={tripDate || new Date().toISOString().split('T')[0]}  
							min={new Date().toISOString().split('T')[0]}  
							className="w-full h-12 px-4 border border-gray-300 rounded-lg hover:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-colors"
							type="date"
							onChange={(e) => setTripDate(e.target.value)}
						/>
					</div>

					{/* Button */}
					<div className="w-full md:w-auto md:basis-1/4 mt-2 md:mt-0">
						<button
							className="w-full md:w-auto font-semibold text-white hover:bg-red-600 transition-all duration-300 border border-transparent bg-red-500 px-8 py-3 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
							onClick={handleTripSearch}
						>
							Tìm kiếm 
						</button>
					</div>
				</div>
			</div>
			{failureModalVisible && (
				<FailureNotification func={{ closeModal: closeFailureModal }} message={errorMessage} />
			)}
		</>
	);
};

export default HomeSearch;
