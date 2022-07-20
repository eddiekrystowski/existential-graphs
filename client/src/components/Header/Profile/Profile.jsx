import "../../../main.css"; // Tawilwind stylesheet
import default_profile_picture from "@assets/images/default_profile.jpg"
import { Menu, Transition } from '@headlessui/react'
import { NavLink } from 'react-router-dom'

/**
 * 
 * @param {*} props 
 * @returns 
 */
export default function Profile( props ) {

  //  Fetch user profile image
  let loggedIn = false;

  let profile_image = default_profile_picture;

  if (loggedIn) {
  return (
    <Menu as="div" className="relative inline-block text-left  mr-5 text-black dark:text-black">
      <div>
      <Menu.Button><img src={ profile_image } alt="Profile" className="shadow rounded-full w-10 h-10 align-middle border-none"/></Menu.Button>
      </div>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >

        <Menu.Items className="origin-top-right absolute right-0  w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none p-2">
          <div className="py-1">
            <Menu.Item className>
              <p>Joe</p>
            </Menu.Item>
            <Menu.Item>
              <p>Joe</p>
            </Menu.Item>
          </div>
          <div className="py-1">
          <Menu.Item>
              <p>Joe</p>
            </Menu.Item>
            <Menu.Item>
              <p>Joe</p>
            </Menu.Item>
          </div>
          <div className="py-1">
          <Menu.Item>
              <p>Joe</p>
            </Menu.Item>
            <Menu.Item>
              <p>Joe</p>
            </Menu.Item>
          </div>
          <div className="py-1">
          <Menu.Item>
              <p>Joe</p>
            </Menu.Item>
            <Menu.Item>
              <p>Joe</p>
            </Menu.Item>
          </div>
        </Menu.Items>
        </Transition>
    </Menu>

  );
  }
  else {
    return(
      <div className="flex flex-row gap-4 mr-4 text-white">
        <NavLink to="/login">
          <button className=" w-32 h-10 bg-slate-400 active:bg-slate-500 rounded-md">
            <p>Login</p>
          </button>
        </NavLink>
        <NavLink to="/signup">
          <button className=" w-32 h-10 bg-blue-500 active:bg-blue-600 rounded-md">
            Register
          </button>
        </NavLink>
      </div>

    );
  }
}