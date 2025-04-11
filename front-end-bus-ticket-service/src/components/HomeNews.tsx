/** @format */

import React from 'react';

const HomeNews: React.FC = () => {
	return (
		<div className="my-10">
			<h3 className="text-center text-2xl font-bold text-green-700 mb-5">TIN TỨC MỚI</h3>
			<hr className="w-4/5 mx-auto h-0.5 bg-gray-200 md:w-2/5 xl:w-1/5" />
			<div className="max-w-screen-lg mx-auto mt-10 flex flex-col md:flex-row justify-center items-start gap-8">
				{newsItems.map((item, idx) => (
					<div key={idx} className="basis-1/3 shadow-2xl">
						<img
							loading="lazy"
							src={item.image}
							alt={item.alt}
							className="rounded-xl shadow-2xl cursor-pointer"
						/>
						<div className="py-3 px-3">
							<p className="font-semibold text-justify">{item.title}</p>
							<div className="flex justify-between items-center py-3">
								<span className="text-sm text-slate-500">{item.date}</span>
								<a
									href={item.link}
									className="text-red-500 cursor-pointer text-sm font-semibold"
								>
									Chi tiết &gt;
								</a>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

interface NewsItem {
	image: string;
	alt: string;
	title: string;
	date: string;
	link: string;
}

const newsItems: NewsItem[] = [
	{
		image: 'https://storage.googleapis.com/futa-busline-web-cms-prod/599_x_337_px_min_f4d6bf9dec/599_x_337_px_min_f4d6bf9dec.png',
		alt: 'news-1',
		title: 'PHƯƠNG TRANG - LIÊN TIẾP ĐẠT TOP 1 CHẤT LƯỢNG ASEAN 2024 KHAI TRƯƠNG',
		date: '8/12/2023',
		link: '#',
	},
	{
		image: 'https://storage.googleapis.com/futa-busline-web-cms-prod/599_x_337_px_0882f6f487/599_x_337_px_0882f6f487.png',
		alt: 'news-2',
		title: 'CÙNG PHƯƠNG TRANG ĐI AN GIANG, NÚI SẬP MẠNG MỊNH MẠNG CHẤT LƯỢNG',
		date: '8/12/2023',
		link: '#',
	},
	{
		image: 'https://storage.googleapis.com/futa-busline-web-cms-prod/599_x_337_px_7aab7fa492/599_x_337_px_7aab7fa492.png',
		alt: 'news-3',
		title: 'CÔNG TY PHƯƠNG TRANG KHAI TRƯƠNG 2 TUYẾN XE BUÝT Ở VĨNH LONG',
		date: '08/04/2025',
		link: '#',
	},
];

export default HomeNews;
