/** @format */
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import HomePromotion from './HomePromotion';
import { LoginParams } from '../interfaces/Auth';
import { postLogin } from '../services/apiServices';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/userSlice';

const LoginForm: React.FC = () => {

	const navigate = useNavigate();
	const dispatch = useDispatch();
	const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);

	// Notification
	const [message, setMessage] = useState<string>('');

	// Input
	const [phone_number, setPhoneNumber] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	// Check logged in
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/');
		}
	}, [navigate]);

	// Login
	const submitLogin = async () => {
		const data : LoginParams = {
			phoneNumber: phone_number,
			password,
		};

		try {
			const res = await postLogin(data);
			if (res.success) {
				localStorage.setItem('token', res.data.accessToken);
				dispatch(setUser(res.data));
				navigate('/');
			} else {
				setMessage("Số điện thoại hoặc mật khẩu không chính xác");
			}
		} catch (err: any) {
			setMessage('Mật khẩu hoặc tài khoản không chính xác');
		}
	};

	return (
		<div className="max-w-screen-lg mx-auto mb-20 px-2">
			<div className="mx-auto w-full border-red-200 border-4 rounded-xl p-8 shadow-xl flex flex-col sm:flex-row justify-center items-center">
				<div className="w-full sm:basis-5/12 mx-4">
					<h1 className="text-4xl font-bold text-center mb-10">Đăng nhập</h1>
					<div>
						<div className="relative mb-8">
							<input
								type="text"
								className="block w-full py-2 px-0 text-sm bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0  focus:border-red-600 peer"
								placeholder=""
								autoComplete="off"
								onChange={(e) => {
									setPhoneNumber(e.target.value);
									setMessage('');
								}}
							/>
							<label
								className="absolute text-sm duration-300 transform -translate-y-7 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7"
							>
								Nhập số điện thoại
							</label>
							<span className="absolute top-1 right-1 ">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
									/>
								</svg>
							</span>
						</div>
						<div className="relative mb-4">
							<input
								type="password"
								className="block w-full py-2 px-0 text-sm bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0  focus:border-red-600 peer"
								placeholder=""
								onChange={(e) => {
									setPassword(e.target.value);
									setMessage('');
								}}
								onKeyDown={(event) => {
									if (event.key === 'Enter') {
										event.preventDefault();
										submitLogin();
									}
								}}
							/>
							<label
								className="absolute text-sm duration-300 transform -translate-y-7 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-red-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7"
							>
								Nhập mật khẩu
							</label>
							<span className="absolute top-1 right-1 ">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
									/>
								</svg>
							</span>

							{message && <div className="text-red-600 mt-2 text-sm font-medium">{message}</div>}
						</div>
						<div className="flex justify-between items-center">
							<div className="flex gap-2 items-center">
								<input type="checkbox" />
								<label>Ghi nhớ tài khoản</label>
							</div>
							<span className="text-blue-700">
								<NavLink to="/forgot-password">Quên mật khẩu</NavLink>
							</span>
						</div>
						<button
							type="submit"
							className="transition-colors duration-300 w-full mb-4 text-[18px] mt-6 rounded-full bg-red-500 text-white hover:bg-red-600 py-2"
							onClick={submitLogin}
						>
							Đăng nhập
						</button>
						<div>
							<span className="m-4">
								Chưa có tài khoản?{' '}
								<NavLink to="/signup" className="text-blue-700">
									Đăng ký
								</NavLink>
							</span>
						</div>
					</div>
				</div>
				<div className="hidden sm:block flex-grow mx-4">
					<img
						alt=""
						loading="lazy"
						decoding="async"
						className="transition-all duration-200 relative hidden object-contain sm:block h-full w-full"
						src="https://storage.googleapis.com/futa-busline-cms-dev/image_f922bef1bb/image_f922bef1bb.svg"
					/>
				</div>
			</div>
			<HomePromotion />
		</div>
	);
};

export default LoginForm;
