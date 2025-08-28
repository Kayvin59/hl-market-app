import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { truncateAddress } from '../utils';

const LoginComponent = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { login, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();
  ;

  // Find the first wallet with 'walletConnect' type or fallback to the first wallet
  const activeWallet = wallets.find(w => w.walletClientType === 'walletConnect') || wallets[0];

  useClickAway(dropdownRef, () => setIsDropdownOpen(false));

  return (
    <div className="flex justify-end items-center space-x-2">
      {!authenticated ? (
        <button
          onClick={login}
          className="text-teal-600 border border-teal-600 px-3 py-1 rounded hover:bg-teal-600 hover:text-white"
        >
          Log In
        </button>
      ) : (
        <>
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative flex items-center w-10 h-10 rounded-full border-2 border-teal-600 bg-teal-600 hover:border-white focus:ring-2 focus:ring-emerald-200"
              type="button"
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="w-full h-full rounded-full object-contain absolute left-0 top-0"
                src="/avatar.svg"
                width="16"
                height="16"
                style={{ minWidth: '16px', minHeight: '16px' }}
                alt="user avatar"
              />
            </button>
            {isDropdownOpen && (
              <ul
                id="dropdownAvatarName"
                className="z-10 bg-white border border-teal-600 divide-y divide-teal-600 rounded-lg shadow w-44 absolute right-0 mt-2"
              >
                {[
                  {
                    key: "address",
                    content: truncateAddress(activeWallet?.address),
                    className: "px-4 py-2 text-sm text-emerald-950",
                  },
                  {
                    key: "dashboard",
                    content: (
                      <a href="#" className="block px-4 py-2 hover:bg-emerald-200">
                        Dashboard
                      </a>
                    ),
                  },
                  {
                    key: "signout",
                    content: (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          logout();
                        }}
                        className="block px-4 py-2 text-sm text-emerald-950 hover:bg-emerald-200"
                      >
                        Sign Out <span className="ml-2">⏻</span>
                      </a>
                    ),
                  },
                ].map(({ key, content, className }) => (
                  <li key={key} className={className}>
                    {content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LoginComponent;