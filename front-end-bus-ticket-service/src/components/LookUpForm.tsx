/** @format */

import { useState } from 'react';
import LookUpResult from './LookUpResult';
import axios from 'axios';
// import { API_URL } from '../configs/env';
// import FailureNotification from './Noti/FailureNotification';

// Define the ticket type for better type safety
interface Ticket {
  id?: string;
  [key: string]: any; // Add other properties based on your ticket object
}

function LookUpForm() {
  // Data
  const [ticket, setTicket] = useState<Ticket>({});

  // Modal
  const [failureModal, setFailureModal] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Input
  const [phone_number, setPhoneNumber] = useState<string>('');
  const [ticket_id, setTicketId] = useState<string>('');

  // Send GET request to lookup ticket
  const getTicket = async () => {
    let params = {
      phone_number,
      ticket_id,
    };
    await axios
      .get(API_URL + 'customer/lookup-ticket', { params })
      .then((res) => {
        setTicket(res.data);
      })
      .catch((err) => {
        setMessage(err.response.data.message);
        openFailureModal();
      });
  };

  // Close Failure Modal
  const closeFailureModal = () => {
    setFailureModal(false);
  };

  // Open Failure Modal
  const openFailureModal = () => {
    setFailureModal(true);
  };

  return (
    <>
      <div className="lookupform flex flex-col max-w-screen-xl my-10 mx-auto">
        <h1 className="text-green-700 text-2xl text-center font-bold mb-5">
          TRA CỨU THÔNG TIN ĐẶT VÉ
        </h1>
        <hr className="max-w-screen-sm w-full mx-auto h-0.5 bg-gray-200" />
        <div className="max-w-screen-sm w-full flex flex-col gap-y-6 p-6 mx-auto mt-8 bg-white rounded-xl shadow-md overflow-hidden">
  <div className="space-y-1">
    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
    <input
      id="phone"
      onChange={(e) => setPhoneNumber(e.target.value)}
      value={phone_number}
      type="text"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition duration-200"
      placeholder="Nhập số điện thoại của bạn"
    />
  </div>

  <div className="space-y-1">
    <label htmlFor="ticket" className="block text-sm font-medium text-gray-700">Mã vé</label>
    <input
      id="ticket"
      onChange={(e) => setTicketId(e.target.value)}
      value={ticket_id}
      type="text"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition duration-200"
      placeholder="Nhập mã vé của bạn"
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          getTicket();
        }
      }}
    />
  </div>

  <button
    className="font-semibold text-white hover:bg-red-600 transition-all duration-300 ease-in-out transform hover:scale-105 mx-auto border border-transparent bg-red-500 px-12 py-3.5 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    onClick={getTicket}
  >
    Tra cứu vé
  </button>
</div>

      </div>
      {ticket.id ? (
        <div className="flex flex-col max-w-screen-lg my-10 mx-auto">
          <LookUpResult ticket={ticket} />
        </div>
      ) : (
        <div className="h-40"></div>
      )}
      {/* {failureModal && (
        <FailureNotification
          func={{ closeModal: closeFailureModal }}
          message={message}
        />
      )} */}
    </>
  );
}

export default LookUpForm;
