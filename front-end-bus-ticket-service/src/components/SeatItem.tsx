import React from 'react';

interface SeatItemProps {
  seatCode: string;
  isBooked: boolean;
  isSelected: boolean;
  onClick: (seatCode: string) => void;
}

const SeatItem: React.FC<SeatItemProps> = ({ seatCode, isBooked, isSelected, onClick }) => {
  return (
    <div
      className="text-center relative flex justify-center cursor-pointer"
      onClick={() => onClick(seatCode)}
    >
      <img
        width="40"
        src={
          isBooked
            ? 'https://futabus.vn/images/icons/seat_disabled.svg'
            : isSelected
            ? 'https://futabus.vn/images/icons/seat_selecting.svg'
            : 'https://futabus.vn/images/icons/seat_active.svg'
        }
        alt="seat icon"
      />
      <span
        className={`absolute text-sm font-semibold ${
          isBooked
            ? 'text-gray-400'
            : isSelected
            ? 'text-red-400'
            : 'text-blue-400'
        } top-2`}
      >
        {seatCode}
      </span>
    </div>
  );
};

export default SeatItem;
