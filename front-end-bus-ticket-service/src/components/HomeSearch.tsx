/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import FailureNotification from "./Noti/FailureNotification";
import axios from "axios";

const HomeSearch: React.FC = () => {
	const navigate = useNavigate();

	// Data
	const [provinces, setProvinces] = useState<string[]>([]);

	// Modal
	const [failureModal, setFailureModal] = useState<boolean>(false);
	const [startAddressSearchModal, setStartAddressSearchModal] = useState<boolean>(false);
	const [endAddressSearchModal, setEndAddressSearchModal] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");

	// Input
	const [start_address, setStartAddress] = useState<string>("");
	const [end_address, setEndAddress] = useState<string>("");
	const [endAddressSearch, setEndAddressSearch] = useState<string>("");
	const [startAddressSearch, setStartAddressSearch] = useState<string>("");
	const [date, setDate] = useState<string>("");

	useEffect(() => {
		getProvinces();
	}, []);

	// Search Trip
	const handleSearch = () => {
		if (start_address && end_address && date) {
			navigate(
				`/search-trip?start_address=${start_address}&end_address=${end_address}&date=${date}`
			);
			window.location.reload();
		} else {
			setMessage("Vui lòng điền đầy đủ thông tin!");
			openFailureModal();
		}
	};

	// Get Provinces API
	const getProvinces = async () => {
		try {
			const res = await axios.get("https://provinces.open-api.vn/api/");
			const cleaned = res.data.reduce((prev: string[], curr: any) => {
				let name = curr.name.replace("Tỉnh", "").replace("Thành phố", "").trim();
				prev.push(name);
				return prev;
			}, []);
			setProvinces(cleaned);
		} catch (error) {
			console.error("Failed to fetch provinces", error);
		}
	};

	// Close & Open Modal
	const closeFailureModal = () => setFailureModal(false);
	const openFailureModal = () => setFailureModal(true);

	return (
		<>
			<div className="mt-10 mb-20">
				<h3 className="text-center text-2xl font-bold text-green-700 mb-5">LỰA CHỌN CHUYẾN ĐI</h3>
				<hr className="w-4/5 mx-auto h-0.5 bg-gray-200 md:w-2/5 xl:w-1/5" />
				<div className="max-w-screen-lg bg-white text-black mx-auto mt-10 p-6 border border-orange-400 shadow-xl rounded-xl flex flex-col md:flex-row items-end gap-4">
  				{/* Start Address */}
				<div className="input-search flex flex-col w-full md:basis-1/4">
				    <label className="mb-2 font-medium text-gray-700">Điểm đi</label>
				    <div className="rounded-lg relative">
				      <div
				        className="w-full h-12 px-4 flex items-center border border-gray-300 rounded-lg hover:border-orange-400 transition-colors cursor-pointer"
				        onClick={() => setStartAddressSearchModal(true)}
				      >
				        <span className={start_address ? "" : "text-gray-400"}>
				          {start_address || "Chọn điểm đi"}
				        </span>
				      </div>
				      {startAddressSearchModal && (
				        <div className="absolute z-10 top-14 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
				          <div className="p-2 border-b">
				            <input
				              autoFocus
				              value={startAddressSearch}
				              className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
				              placeholder="Tìm điểm đi..."
				              onChange={(e) => setStartAddressSearch(e.target.value)}
				            />
				          </div>
				          <ul className="w-full overflow-y-auto max-h-60">
				            {(startAddressSearch === "" ? provinces : provinces.filter((item) =>
				              item.toLowerCase().includes(startAddressSearch.toLowerCase())
				            )).map((item, i) => (
				              <li
				                key={i}
				                className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
				                onClick={() => {
				                  setStartAddress(item);
				                  setStartAddressSearchModal(false);
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
				        onClick={() => setEndAddressSearchModal(true)}
				      >
				        <span className={end_address ? "" : "text-gray-400"}>
				          {end_address || "Chọn điểm đến"}
				        </span>
				      </div>
				      {endAddressSearchModal && (
				        <div className="absolute z-10 top-14 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
				          <div className="p-2 border-b">
				            <input
				              autoFocus
				              value={endAddressSearch}
				              className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
				              placeholder="Tìm điểm đến..."
				              onChange={(e) => setEndAddressSearch(e.target.value)}
				            />
				          </div>
				          <ul className="w-full overflow-y-auto max-h-60">
				            {(endAddressSearch === "" ? provinces : provinces.filter((item) =>
				              item.toLowerCase().includes(endAddressSearch.toLowerCase())
				            )).map((item, i) => (
				              <li
				                key={i}
				                className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
				                onClick={() => {
				                  setEndAddress(item);
				                  setEndAddressSearchModal(false);
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
				    <label className="mb-2 font-medium text-gray-700">Ngày đi</label>
				    <input
				      value={date}
				      min={new Date().toISOString().split('T')[0]}
				      className="w-full h-12 px-4 border border-gray-300 rounded-lg hover:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-colors"
				      type="date"
				      onChange={(e) => setDate(e.target.value)}
				    />
				  </div>
				  
				  {/* Button */}
				  <div className="w-full md:w-auto md:basis-1/4 mt-2 md:mt-0">
				    <button
				      className="w-full md:w-auto font-semibold text-white hover:bg-red-600 transition-all duration-300 border border-transparent bg-red-500 px-8 py-3 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
				      onClick={handleSearch}
				    >
				      Tìm chuyến xe
				    </button>
				  </div>
				</div>
			</div>

			{/* {failureModal && (
				<FailureNotification func={{ closeModal: closeFailureModal }} message={message} />
			)} */}
		</>
	);
};

export default HomeSearch;
