import React from 'react';

const Banner: React.FC = () => {
	return (
		<div>
			<section>
				<div className="bg-[url('https://images.unsplash.com/photo-1505832018823-50331d70d237?q=80&w=2108&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] w-full bg-no-repeat bg-cover relative h-[500px]">
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-white text-center">
						<h1 className="text-4xl mt-5 mb-5 font-bold max-w-2xl md:leading-relaxed">
							Why stay at home when you can travel with BHP Bus Lines
						</h1>

						<p className="text-xl mb-5 font-light">
							Download the BHP travel app from now on
						</p>

						<div className="flex justify-center">
							<button className="hover:bg-transparent hover:border-white transition-all mx-4 border border-transparent bg-red-500 px-10 py-3 rounded-full">
								Playstore
							</button>
							<button className="hover:border-transparent hover:bg-red-500 transition-all mx-4 border border-white bg-transparent px-10 py-3 rounded-full">
								Appstore
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Banner;