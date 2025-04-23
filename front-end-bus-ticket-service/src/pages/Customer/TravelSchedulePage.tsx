import React from 'react';
import HomeSearch from '../../components/HomeSearch';
import TravelScheduleInfo from '../../components/TravelScheduleInfo';

const TravelSchedulePage: React.FC = () => {
	return (
		<div>
			<HomeSearch />
			<TravelScheduleInfo />
		</div>
	);
};

export default TravelSchedulePage;
