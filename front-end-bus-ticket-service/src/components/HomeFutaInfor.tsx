/** @format */

import React from 'react';

const HomeFutaInfo: React.FC = () => {
	return (
		<section className="flex flex-col items-center px-4 py-6 text-center sm:p-10 bg-white">
			<span className="home-title text-green-700 w-80 sm:w-full text-2xl font-bold">
				FUTA BUS LINES - CHẤT LƯỢNG LÀ DANH DỰ
			</span>
			<span className="home-title-content text-slate-500 my-3">
				Được khách hàng tin tưởng và lựa chọn
			</span>
			<hr className="w-4/5 mx-auto h-0.5 bg-gray-200 md:w-2/5 xl:w-1/5" />
			<div className="layout mt-8 sm:grid sm:grid-cols-2 sm:gap-16">
				<div>
					{infoItems.map((item, idx) => (
						<div key={idx} className="mb-6 flex items-center">
							<div>
								<img
									alt={item.alt}
									loading="lazy"
									width="96"
									height="96"
									decoding="async"
									className="transition-all duration-200 transparent"
									src={item.image}
								/>
							</div>
							<div className="ml-4 flex flex-col text-left">
								<span className="text-2xl font-semibold text-black lg:text-3xl">
									{item.highlight}
									<span className="ml-3 text-base">{item.label}</span>
								</span>
								<span className="text-gray">{item.description}</span>
							</div>
						</div>
					))}
				</div>
				<div className="relative hidden object-contain sm:block">
					<img
						alt="FUTA Information Graphic"
						loading="lazy"
						decoding="async"
						className="transition-all duration-200 relative hidden object-contain sm:block h-full w-full transparent"
						src="https://storage.googleapis.com/futa-busline-cms-dev/image_f922bef1bb/image_f922bef1bb.svg"
					/>
				</div>
			</div>
		</section>
	);
};

interface InfoItem {
	image: string;
	alt: string;
	highlight: string;
	label: string;
	description: string;
}

const infoItems: InfoItem[] = [
	{
		image:
			'https://storage.googleapis.com/futa-busline-cms-dev/Group_662c4422ba/Group_662c4422ba.svg',
		alt: 'Lượt khách',
		highlight: 'Hơn 20 Triệu',
		label: 'Lượt khách',
		description: 'Phương Trang phục vụ hơn 20 triệu lượt khách bình quân 1 năm trên toàn quốc',
	},
	{
		image:
			'https://storage.googleapis.com/futa-busline-cms-dev/Store_55c0da8bd7/Store_55c0da8bd7.svg',
		alt: 'Phòng vé',
		highlight: 'Hơn 350',
		label: 'Phòng vé - Bưu cục',
		description:
			'Phương Trang có hơn 350 phòng vé, trạm trung chuyển, bến xe,... trên toàn hệ thống',
	},
	{
		image:
			'https://storage.googleapis.com/futa-busline-cms-dev/Group_2_75b5ed1dfd/Group_2_75b5ed1dfd.svg',
		alt: 'Chuyến xe',
		highlight: 'Hơn 1,000',
		label: 'Chuyến xe',
		description:
			'Phương Trang phục vụ hơn 1,000 chuyến xe đường dài và liên tỉnh mỗi ngày',
	},
];

export default HomeFutaInfo;
