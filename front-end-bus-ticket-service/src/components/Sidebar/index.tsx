import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
// import Logo from '../../images/logo/logo.svg';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-[#1a3a4f] duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        {/* <NavLink to="/">
          <img src={Logo} alt="Logo" className="h-8" />
        </NavLink> */}

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden text-white"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-[#a8c7d8]">
              MENU
            </h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Dashboard --> */}
              <li>
                <NavLink
                  to="/admin"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('tables') && 'bg-graydark dark:bg-meta-4'
                    }`}
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="19"
                    viewBox="0 0 18 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_130_9756)">
                      <path
                        d="M15.7501 0.55835H2.2501C1.29385 0.55835 0.506348 1.34585 0.506348 2.3021V15.8021C0.506348 16.7584 1.29385 17.574 2.27822 17.574H15.7782C16.7345 17.574 17.5501 16.7865 17.5501 15.8021V2.3021C17.522 1.34585 16.7063 0.55835 15.7501 0.55835ZM6.69385 10.599V6.4646H11.3063V10.5709H6.69385V10.599ZM11.3063 11.8646V16.3083H6.69385V11.8646H11.3063ZM1.77197 6.4646H5.45635V10.5709H1.77197V6.4646ZM12.572 6.4646H16.2563V10.5709H12.572V6.4646ZM2.2501 1.82397H15.7501C16.0313 1.82397 16.2563 2.04897 16.2563 2.33022V5.2271H1.77197V2.3021C1.77197 2.02085 1.96885 1.82397 2.2501 1.82397ZM1.77197 15.8021V11.8646H5.45635V16.3083H2.2501C1.96885 16.3083 1.77197 16.0834 1.77197 15.8021ZM15.7501 16.3083H12.572V11.8646H16.2563V15.8021C16.2563 16.0834 16.0313 16.3083 15.7501 16.3083Z"
                        fill=""
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_130_9756">
                        <rect
                          width="18"
                          height="18"
                          fill="white"
                          transform="translate(0 0.052124)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  Bảng Điều Khiển
                </NavLink>
              </li>
              {/* <!-- Operations Management --> */}
              <SidebarLinkGroup
                activeCondition={pathname.startsWith('/admin/operation')}
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-white duration-300 ease-in-out hover:bg-[#2a4d65] ${
                          pathname.startsWith('/admin/operation') && 'bg-[#2a4d65]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!sidebarExpanded) {
                            setSidebarExpanded(true);
                          }
                          handleClick();
                        }}
                      >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 512"><path fill-rule="nonzero" d="M411.164 74.863l-.117-.117c-3.1-3.046-7.07-4.558-11.004-4.474-4.494.096-7.992 2.416-10.804 5.064l-25.613 25.536c-3.138 3.121-7.988 3.471-11.511 1.057-6.211-4.004-12.878-7.594-19.793-10.803-7.657-3.555-15.65-6.632-23.691-9.287-3.824-1.259-6.248-4.814-6.248-8.633l-.004-39.999c0-8.624-6.4-15.018-15.023-15.018h-50.204c-8.349 0-14.939 6.692-14.939 15.018v36.625c0 4.473-3.232 8.194-7.488 8.953-15.292 3.639-30.301 9.321-44.098 16.863a9.065 9.065 0 01-10.689-1.496c-9.743-9.599-19.858-19.189-29.378-28.965-5.824-5.843-14.576-5.243-20.392.273-11.916 11.065-23.836 23.907-35.43 35.501-5.888 5.998-6.014 15.148-.033 21.13l.459.494 25.707 25.789c3.121 3.138 3.47 7.989 1.057 11.511-4.004 6.21-7.595 12.88-10.806 19.799-3.552 7.655-6.631 15.648-9.283 23.685-1.258 3.824-4.814 6.249-8.633 6.249l-39.996.004c-8.603 0-15.021 6.416-15.021 15.022v50.205c0 8.354 6.693 14.934 15.021 14.934h36.622c4.473 0 8.194 3.233 8.953 7.488 3.705 15.583 9.53 30.55 16.938 44.737 1.881 3.603 1.098 7.895-1.641 10.617-9.621 9.598-19.198 19.291-28.891 28.81-5.851 5.831-5.25 14.581.275 20.405 10.845 11.93 23.758 24.041 35.208 35.623 6.027 5.575 15.688 5.727 21.711.062l25.918-26.325c3.139-3.192 8.063-3.569 11.622-1.102 13.371 8.604 28.387 15.096 43.445 20.061 3.824 1.258 6.248 4.814 6.248 8.632l.004 39.999c0 8.579 6.442 15.021 15.021 15.021h50.204c8.35 0 14.939-6.696 14.939-15.021v-36.624a9.097 9.097 0 017.491-8.953c15.664-3.72 30.469-9.487 44.732-16.935a9.065 9.065 0 0110.617 1.64l28.4 28.473c5.378 5.725 14.516 6.152 20.264.703.433-.415.795-.795 1.209-1.203l34.966-34.563c2.829-3.063 4.26-7.011 4.26-10.964 0-3.898-1.392-7.765-4.197-10.749l-26.33-25.918a9.07 9.07 0 01-1.099-11.623c8.618-13.382 15.084-28.362 20.063-43.446 1.258-3.824 4.814-6.248 8.632-6.248l39.996-.004c8.603 0 15.021-6.412 15.021-15.019v-50.204c0-8.355-6.691-14.939-15.021-14.939h-36.621c-4.531 0-8.29-3.316-8.981-7.653a198.021 198.021 0 00-7.136-22.732c-2.827-7.413-6.064-14.543-9.702-21.205a9.067 9.067 0 011.495-10.689c9.593-9.735 19.193-19.892 28.977-29.386 5.834-5.813 5.231-14.565-.275-20.372-10.882-11.828-23.886-23.843-35.383-35.314zM193.251 356.361c.86 5.43-2.842 10.533-8.273 11.394-5.43.861-10.532-2.842-11.393-8.272l-4.238-26.228c-.828-5.219 2.561-10.135 7.648-11.274l26.518-6.002c5.365-1.206 10.695 2.166 11.901 7.531 1.206 5.365-2.166 10.695-7.532 11.901l-5.134 1.162c23.846 15.009 47.68 19.172 69.094 15.696 17.024-2.765 32.609-10.329 45.505-21.079 12.946-10.792 23.19-24.799 29.478-40.396 9.495-23.55 9.897-50.732-3.152-75.87-2.295-4.454-.546-9.926 3.908-12.221 4.453-2.295 9.926-.546 12.221 3.907 15.674 30.196 15.223 62.766 3.865 90.935-7.398 18.35-19.466 34.844-34.736 47.571-15.32 12.769-33.869 21.762-54.177 25.059-25.751 4.182-54.198-.737-82.281-18.629l.778 4.815zM316.88 152.326a9.076 9.076 0 0118.049-1.919l2.768 25.933a9.077 9.077 0 01-7.32 9.874l-27.126 5.212c-4.925.94-9.682-2.288-10.623-7.212-.941-4.924 2.288-9.682 7.212-10.622l6.834-1.312c-18.543-11.532-39.979-15.411-60.7-12.999-17.217 2.005-33.899 8.321-48.007 18.173-14.038 9.801-25.535 23.086-32.472 39.07-9.607 22.144-10.524 49.708 2.558 80.745 1.942 4.61-.221 9.925-4.832 11.866-4.61 1.942-9.925-.221-11.867-4.831-15.204-36.069-13.944-68.548-2.486-94.957 8.336-19.208 22.042-35.094 38.726-46.744 16.61-11.598 36.179-19.026 56.32-21.371 25.048-2.916 51.059 1.98 73.532 16.4l-.566-5.306zm106.919-90.474c11.961 11.853 24.148 23.776 35.893 35.82 12.266 12.935 12.731 33.001-.085 45.743-8.118 8.118-16.146 16.363-24.207 24.542a192.72 192.72 0 017.634 17.406 212.268 212.268 0 016.123 18.662h29.633c18.279 0 33.21 14.826 33.21 33.128v50.204c0 18.584-14.608 33.208-33.21 33.208h-33.516c-4.366 12.17-9.673 24.1-16.212 35.266l21.572 21.237c6.206 6.55 9.28 14.93 9.28 23.296 0 8.391-3.093 16.81-9.21 23.376l-35.309 34.906c-.555.55-1.082 1.06-1.636 1.628-12.417 11.736-32.017 11.765-44.453.041-8.356-7.572-16.832-16.875-24.89-24.956-11.701 5.716-23.881 10.402-36.441 13.855v29.576c0 18.274-14.83 33.21-33.128 33.21h-50.204c-18.627 0-33.21-14.583-33.21-33.21v-33.529a264.065 264.065 0 01-6.075-2.283c-10.026-3.899-19.9-8.471-29.19-13.915l-21.236 21.568c-13.008 12.332-33.596 12.268-46.672.07-12.048-11.991-24.045-24.209-35.939-36.356-12.282-12.951-12.75-33.022.086-45.776 8.065-8.065 16.161-16.103 24.238-24.157-5.71-11.715-10.406-23.869-13.864-36.44H33.21C14.932 307.972 0 293.151 0 274.849v-50.205c0-18.595 14.606-33.211 33.21-33.211h33.516a232.323 232.323 0 017.912-19.35 188.536 188.536 0 018.335-15.975l-20.627-20.694-.5-.464c-12.922-12.921-12.802-33.723-.037-46.706C73.94 76.579 85.646 64.151 97.663 52.315c12.94-12.279 33.015-12.736 45.763.087 8.077 8.13 16.357 16.139 24.524 24.188 11.554-5.807 23.603-10.402 36.074-13.815V33.207C204.024 14.933 218.856 0 237.152 0h50.204c18.58 0 33.212 14.628 33.212 33.207v33.52c6.486 2.327 12.976 4.954 19.355 7.915a188.668 188.668 0 0115.968 8.332l20.547-20.484c5.622-5.943 13.409-9.633 21.608-10.211 9.192-.648 18.612 2.548 25.719 9.537l.034.036z"/></svg>
                        Quản lý vận hành
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill="currentColor"
                          />
                        </svg>
                      </NavLink>
                      {/* Dropdown Menu */}
                      <div className={`translate transform overflow-hidden ${!open ? 'hidden' : ''}`}>
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/admin/operation/route-management"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Quản lý tuyến đường
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/operation/trip-management"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Quản lý chuyến đi

                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* Reservation Management */}
              <SidebarLinkGroup
                activeCondition={pathname.startsWith('/admin/reservation')}
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-white duration-300 ease-in-out hover:bg-[#2a4d65] ${
                          pathname.startsWith('/admin/reservation')} && 'bg-[#2a4d65]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!sidebarExpanded) {
                            setSidebarExpanded(true);
                          }
                          handleClick();
                        }}
                      >
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none"  xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 492.05"><path d="M48.36 320.24 340.19 28.4l.46-.31c1.91-1.83 4.11-3.24 6.43-4.19 5.1-2.09 10.87-2.08 15.98 0a20.7 20.7 0 0 1 6.74 4.5l38.33 38.33a7.412 7.412 0 0 1 2.13 4.63c.15 1.69-.25 3.48-1.22 4.98-2.24 3.44-3.86 7.2-4.78 11.06-6.25 25.91 17.07 48.94 42.53 42.83 3.78-.9 7.49-2.47 10.86-4.64a7.597 7.597 0 0 1 5.07-1.48c1.78.13 3.53.88 4.87 2.22l38.34 38.34c1.98 1.98 3.49 4.28 4.49 6.73a21.32 21.32 0 0 1 1.58 8 21.32 21.32 0 0 1-1.58 8c-1 2.44-2.51 4.75-4.49 6.73L214.09 485.97a20.685 20.685 0 0 1-6.73 4.49 20.946 20.946 0 0 1-8 1.59c-2.71 0-5.44-.53-8-1.59-2.46-1-4.76-2.52-6.74-4.49l-38.61-38.61c-1.19-1.18-1.92-2.79-2.1-4.45-.18-1.61.14-3.34 1.01-4.82 2.12-3.37 3.59-7.04 4.4-10.81 5.39-24.77-16.55-47.47-41.85-42.2-3.75.79-7.42 2.2-10.81 4.19a8.134 8.134 0 0 1-5.03 1.23 7.505 7.505 0 0 1-4.66-2.18L48.36 349.7a20.493 20.493 0 0 1-4.5-6.74 21.15 21.15 0 0 1-1.58-7.99c0-2.7.53-5.42 1.58-7.99a20.7 20.7 0 0 1 4.5-6.74zM324.92 26.26l-10.27 10.41-20.59-20.58c-1.52-1.52-3.99-1.96-5.96-1.16-.62.26-1.22.66-1.73 1.16l-36.32 36.32c.48.31.96.68 1.43 1.15l10.4 10.4c.28.28.48.52.7.81 5.37 7.51-4.83 15.87-11.1 9.59l-10.42-10.4c-.27-.27-.46-.53-.7-.82l-.42-.63L62.49 239.98c.69.35 1.34.82 1.97 1.45l10.4 10.41c.28.28.49.53.71.81 5.37 7.52-4.83 15.88-11.11 9.6-2.77-2.79-10.22-9.2-11.83-12.42l-36.54 36.55-.58.35c-1.14 1.52-1.44 3.7-.71 5.47.24.63.65 1.22 1.15 1.72l13.46 13.46-3.91 16.65-19.69-19.7a19.47 19.47 0 0 1-4.31-6.46c-2-4.87-1.99-10.43 0-15.3a19.51 19.51 0 0 1 4.31-6.47L276.1 5.82l.44-.3c1.83-1.76 3.93-3.11 6.16-4.02 4.89-2 10.42-2 15.31 0 2.34.96 4.55 2.41 6.45 4.31l20.46 20.45zm119.87 203.97c.61.6 1.24 1.07 1.89 1.42L251.77 426.56l-.32-.49c-.24-.3-.46-.57-.74-.85l-10.85-10.86c-6.56-6.55-17.19 2.18-11.6 10.01.24.3.45.57.73.85l10.87 10.85c.42.43.86.79 1.31 1.09l-37.94 37.94c-.54.53-1.16.95-1.8 1.21-.7.28-1.46.43-2.22.43-.71 0-1.49-.16-2.21-.46-.66-.26-1.3-.66-1.79-1.18l-34.59-34.58a51.6 51.6 0 0 0 3.83-12.69c5.6-33.97-23.73-63.91-58.24-58.22-4.34.7-8.61 2-12.68 3.82l-34.59-34.59c-.53-.54-.95-1.15-1.2-1.81-.28-.66-.42-1.42-.42-2.21 0-1.2.4-2.47 1.17-3.49l.59-.37 38.13-38.13c.21.41.45.83.75 1.24.24.31.45.57.74.85l10.86 10.86c6.55 6.56 17.19-2.17 11.59-10.01-.23-.3-.45-.56-.73-.85l-10.86-10.86a8.604 8.604 0 0 0-2.06-1.52L302.47 87.57l.44.65c.24.3.45.57.73.85l10.86 10.86c6.55 6.55 17.19-2.18 11.59-10.01-.24-.3-.45-.56-.74-.85L314.5 78.22c-.48-.48-.98-.87-1.49-1.19l37.91-37.91c.52-.52 1.15-.94 1.8-1.21 2.06-.84 4.64-.37 6.22 1.21l34.27 34.28a50.213 50.213 0 0 0-4.3 12.79c-6.79 35.35 24.22 65.79 59.1 59.08 4.39-.84 8.71-2.29 12.79-4.3l34.27 34.27a5.3 5.3 0 0 1 1.2 1.81c.27.67.41 1.43.41 2.21 0 1.41-.54 2.94-1.62 4.02l-38.01 38.01c-.19-.36-.41-.71-.66-1.07-.24-.3-.45-.57-.74-.85l-10.86-10.86c-6.55-6.55-17.18 2.17-11.59 10.01.24.3.46.56.74.85l10.85 10.86zm-130.4-83.78 75.13 75.16c4.65 4.9 6.99 11.22 6.99 17.51 0 6.52-2.48 13.05-7.42 17.98L277.13 369.06c-4.93 4.94-11.47 7.42-17.97 7.42-6.52 0-13.05-2.48-17.98-7.42l-74.7-74.7c-4.94-4.93-7.42-11.46-7.42-17.98 0-6.48 2.48-13 7.42-17.95l111.96-111.99c4.95-4.95 11.47-7.42 17.98-7.42 6.51.03 13.05 2.51 17.97 7.43zm64.24 85.16-74.7-74.69a10.624 10.624 0 0 0-7.51-3.13c-2.73.03-5.46 1.06-7.52 3.12L176.94 268.87c-2.05 2.04-3.08 4.77-3.08 7.51 0 2.73 1.03 5.47 3.08 7.52l74.7 74.7c2.05 2.05 4.79 3.08 7.52 3.08 2.73 0 5.46-1.03 7.51-3.08l111.96-111.96c2.05-2.05 3.08-4.79 3.08-7.52 0-2.61-.94-5.23-2.8-7.25l-.28-.26zm-171.35 171.9c6.55 6.55 17.19-2.18 11.6-10.01-.25-.31-.46-.57-.74-.85l-10.86-10.87c-6.55-6.55-17.19 2.18-11.59 10.02.23.3.45.56.73.85l10.86 10.86zm-32.57-32.58c6.55 6.56 17.19-2.17 11.59-10.01-.24-.3-.45-.56-.74-.85l-10.85-10.86c-6.55-6.55-17.19 2.18-11.6 10.01.24.3.45.57.74.85l10.86 10.86zm-32.58-32.57c6.55 6.55 17.19-2.18 11.6-10.01-.24-.31-.45-.57-.73-.85l-10.87-10.87c-6.55-6.55-17.19 2.18-11.59 10.02.24.3.45.56.73.85l10.86 10.86zm270.09-140.71c6.56 6.56 17.19-2.17 11.6-10-.25-.31-.46-.57-.74-.85l-10.86-10.87c-6.56-6.55-17.19 2.18-11.6 10.01.25.3.46.57.75.85l10.85 10.86zm-32.57-32.57c6.55 6.55 17.19-2.18 11.59-10.01-.24-.3-.45-.56-.74-.85l-10.85-10.85c-6.56-6.56-17.19 2.17-11.6 10 .25.3.46.56.74.85l10.86 10.86zm-32.57-32.57c6.55 6.55 17.18-2.18 11.59-10.01-.25-.31-.46-.57-.74-.85l-10.85-10.86c-6.56-6.56-17.19 2.18-11.6 10 .24.31.45.57.74.85l10.86 10.87z"/></svg>
                        Quản lý đặt vé
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill="currentColor"
                          />
                        </svg>
                      </NavLink>
                      {/* Dropdown Menu */}
                      <div className={`translate transform overflow-hidden ${!open ? 'hidden' : ''}`}>
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/admin/reservation/booking-data"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Dữ liệu vé xe
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/reservation/booking-support"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Hỗ trợ đặt vé
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/reservation/change-ticket"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Hỗ trợ đổi vé
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup> 
              {/*Staff dispatch  */}
              <SidebarLinkGroup
                activeCondition={pathname.startsWith('/admin/dispatch')}
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-white duration-300 ease-in-out hover:bg-[#2a4d65] ${
                          pathname.startsWith('/admin/dispatch')} && 'bg-[#2a4d65]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!sidebarExpanded) {
                            setSidebarExpanded(true);
                          }
                          handleClick();
                        }}
                      >
                        <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M6 9C5.59 9 5.25 8.66 5.25 8.25V6.25C5.25 5.84 5.59 5.5 6 5.5C6.41 5.5 6.75 5.84 6.75 6.25V8.25C6.75 8.66 6.41 9 6 9Z" fill="#000000"></path><path d="M12 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V12C22.75 12.41 22.41 12.75 22 12.75C21.59 12.75 21.25 12.41 21.25 12V9C21.25 4.39 19.61 2.75 15 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H12C12.41 21.25 12.75 21.59 12.75 22C12.75 22.41 12.41 22.75 12 22.75Z" fill="#000000"></path><path d="M10 9C9.59 9 9.25 8.66 9.25 8.25V6.25C9.25 5.84 9.59 5.5 10 5.5C10.41 5.5 10.75 5.84 10.75 6.25V8.25C10.75 8.66 10.41 9 10 9Z" fill="#000000"></path><path d="M6 18.75C5.59 18.75 5.25 18.41 5.25 18V16C5.25 15.59 5.59 15.25 6 15.25C6.41 15.25 6.75 15.59 6.75 16V18C6.75 18.41 6.41 18.75 6 18.75Z" fill="#000000"></path><path d="M10 18.75C9.59 18.75 9.25 18.41 9.25 18V16C9.25 15.59 9.59 15.25 10 15.25C10.41 15.25 10.75 15.59 10.75 16V18C10.75 18.41 10.41 18.75 10 18.75Z" fill="#000000"></path><path d="M18 8H14C13.59 8 13.25 7.66 13.25 7.25C13.25 6.84 13.59 6.5 14 6.5H18C18.41 6.5 18.75 6.84 18.75 7.25C18.75 7.66 18.41 8 18 8Z" fill="#000000"></path><path d="M22 12.75H2C1.59 12.75 1.25 12.41 1.25 12C1.25 11.59 1.59 11.25 2 11.25H22C22.41 11.25 22.75 11.59 22.75 12C22.75 12.41 22.41 12.75 22 12.75Z" fill="#000000"></path><path d="M21.5599 20.33C20.9999 21.3 19.9499 21.95 18.7499 21.95C16.9599 21.95 15.8599 20.15 15.8599 20.15M15.9299 17.09C16.4899 16.11 17.5399 15.46 18.7499 15.46C20.9199 15.46 21.9999 17.26 21.9999 17.26M21.9999 15.25V17.25H19.9999M17.8599 20.14H15.8599V22" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></g></svg>
                        Điều phối chuyến xe
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill="currentColor"
                          />
                        </svg>
                      </NavLink>
                      {/* Dropdown Menu */}
                      <div className={`translate transform overflow-hidden ${!open ? 'hidden' : ''}`}>
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/admin/dispatch/staff-routes"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Phân công tuyến
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/dispatch/dispatch-assignment"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Phân công điều phối
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/admin/dispatch/assign-vehicle"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Điều xe cho chuyến đi
                            </NavLink>
                          </li>
                          {/* <li>
                            <NavLink
                              to="/admin/dispatch/staff-schedule"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Lịch Trình Nhân Sự
                            </NavLink>
                          </li> */}
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>  
              {/* User Management */}
              <SidebarLinkGroup
                activeCondition={pathname.startsWith('/admin/user')}
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-white duration-300 ease-in-out hover:bg-[#2a4d65] ${
                          pathname.startsWith('/admin/user') && 'bg-[#2a4d65]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!sidebarExpanded) {
                            setSidebarExpanded(true);
                          }
                          handleClick();
                        }}
                      >
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17.5 18H18.7687C19.2035 18 19.4209 18 19.5817 17.9473C20.1489 17.7612 20.5308 17.1231 20.498 16.4163C20.4887 16.216 20.42 15.9676 20.2825 15.4708C20.168 15.0574 20.1108 14.8507 20.0324 14.6767C19.761 14.0746 19.2766 13.6542 18.7165 13.5346C18.5546 13.5 18.3737 13.5 18.0118 13.5L15.5 13.5346M14.6899 11.6996C15.0858 11.892 15.5303 12 16 12C17.6569 12 19 10.6569 19 9C19 7.34315 17.6569 6 16 6C15.7295 6 15.4674 6.0358 15.2181 6.10291M13.5 8C13.5 10.2091 11.7091 12 9.5 12C7.29086 12 5.5 10.2091 5.5 8C5.5 5.79086 7.29086 4 9.5 4C11.7091 4 13.5 5.79086 13.5 8ZM6.81765 14H12.1824C12.6649 14 12.9061 14 13.1219 14.0461C13.8688 14.2056 14.5147 14.7661 14.8765 15.569C14.9811 15.8009 15.0574 16.0765 15.21 16.6278C15.3933 17.2901 15.485 17.6213 15.4974 17.8884C15.5411 18.8308 15.0318 19.6817 14.2756 19.9297C14.0613 20 13.7714 20 13.1916 20H5.80844C5.22864 20 4.93875 20 4.72441 19.9297C3.96818 19.6817 3.45888 18.8308 3.50261 17.8884C3.51501 17.6213 3.60668 17.2901 3.79003 16.6278C3.94262 16.0765 4.01891 15.8009 4.12346 15.569C4.4853 14.7661 5.13116 14.2056 5.87806 14.0461C6.09387 14 6.33513 14 6.81765 14Z" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        Quản lý người dùng
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill="currentColor"
                          />
                        </svg>
                      </NavLink>
                      {/* Dropdown Menu */}
                      <div className={`translate transform overflow-hidden ${!open ? 'hidden' : ''}`}>
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          {/* <li>
                            <NavLink
                              to="/admin/user/manage-role"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Quản lý vai trò
                            </NavLink>
                          </li> */}
                          <li>
                            <NavLink
                              to="/admin/user/assgin-role"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Phân quyền vai trò
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup> 
              {/* Vehicle Management */}
              <SidebarLinkGroup
                activeCondition={pathname.startsWith('/admin/vehicle')}
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-white duration-300 ease-in-out hover:bg-[#2a4d65] ${
                          pathname.startsWith('/admin/vehicle') && 'bg-[#2a4d65]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!sidebarExpanded) {
                            setSidebarExpanded(true);
                          }
                          handleClick();
                        }}
                      >
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.99993 16C8.55221 16 8.99993 15.5523 8.99993 15C8.99993 14.4477 8.55221 14 7.99993 14C7.44764 14 6.99993 14.4477 6.99993 15C6.99993 15.5523 7.44764 16 7.99993 16Z" fill="#212121"></path> <path d="M16.9997 15C16.9997 15.5523 16.552 16 15.9997 16C15.4474 16 14.9997 15.5523 14.9997 15C14.9997 14.4477 15.4474 14 15.9997 14C16.552 14 16.9997 14.4477 16.9997 15Z" fill="#212121"></path> <path d="M10.7499 5C10.3357 5 9.99993 5.33579 9.99993 5.75C9.99993 6.16421 10.3357 6.5 10.7499 6.5H13.2499C13.6641 6.5 13.9999 6.16421 13.9999 5.75C13.9999 5.33579 13.6641 5 13.2499 5H10.7499Z" fill="#212121"></path> <path d="M7.74993 2C5.67886 2 3.99993 3.67893 3.99993 5.75V9.5H2.74976C2.33554 9.5 1.99976 9.83579 1.99976 10.25C1.99976 10.6642 2.33554 11 2.74976 11H3.99993V19.75C3.99993 20.7165 4.78343 21.5 5.74993 21.5H7.24993C8.21643 21.5 8.99993 20.7165 8.99993 19.75V18.5H14.9999V19.75C14.9999 20.7165 15.7834 21.5 16.7499 21.5H18.2499C19.2164 21.5 19.9999 20.7165 19.9999 19.75V11H21.2272C21.6414 11 21.9772 10.6642 21.9772 10.25C21.9772 9.83579 21.6414 9.5 21.2272 9.5H19.9999V5.75C19.9999 3.67893 18.321 2 16.2499 2H7.74993ZM18.4999 18.5V19.75C18.4999 19.8881 18.388 20 18.2499 20H16.7499C16.6119 20 16.4999 19.8881 16.4999 19.75V18.5H18.4999ZM18.4999 17H5.49993V13H18.4999V17ZM5.49993 19.75V18.5H7.49993V19.75C7.49993 19.8881 7.388 20 7.24993 20H5.74993C5.61186 20 5.49993 19.8881 5.49993 19.75ZM5.49993 5.75C5.49993 4.50736 6.50729 3.5 7.74993 3.5H16.2499C17.4926 3.5 18.4999 4.50736 18.4999 5.75V11.5H5.49993V5.75Z" fill="#ffffff"></path> </g></svg>                        
                        Quản lý phương tiện
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill="currentColor"
                          />
                        </svg>
                      </NavLink>
                      {/* Dropdown Menu */}
                      <div className={`translate transform overflow-hidden ${!open ? 'hidden' : ''}`}>
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          {/* <li>
                            <NavLink
                              to="/admin/user/manage-role"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Quản lý vai trò
                            </NavLink>
                          </li> */}
                          <li>
                            <NavLink
                              to="/admin/vehicle/manage-vehicle"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-[#a8c7d8] duration-300 ease-in-out hover:text-white ${
                                  isActive ? '!text-white font-semibold' : ''
                                }`
                              }
                            >
                              Danh sách xe
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup> 
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;