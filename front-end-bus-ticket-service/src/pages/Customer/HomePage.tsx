import React from 'react';
import Banner from '../../components/Banner';
import HomeSearch from '../../components/HomeSearch';
import HomePromotion from '../../components/HomePromotion';
import HomeBusLine from '../../components/HomeBusLines';
import HomeFutaInfo from '../../components/HomeFutaInfor';
import HomeNews from '../../components/HomeNews';

const HomePage: React.FC = () => {
	return (
		<div className="App px-2">
			<Banner />
            <HomeSearch />
            <HomePromotion />
            <HomeBusLine />
            <HomeFutaInfo />
            <HomeNews/>
		</div>
	);
};

export default HomePage;
