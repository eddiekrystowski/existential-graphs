import "@root/main.css"; // Tawilwind stylesheet
import React, { useState } from "react";
import { NavLink } from "react-router-dom"



export default function Login( props ) {

  const [showPassword, setShowPassword] = useState( false );

  return (
    <div className=" w-2/5 self-center mt-10 p-5 rounded-lg text-black font-semibold text-xl font-serif">
      <h1 className="text-5xl font-sans">Login</h1>
      <br />
      <form className="py-4 grid grid-cols-2 gap-4">
          <label for="email" className=" col-span-2">
            Enter your email: <br />
            <input type="email" name="email" id="email" required placeholder="Email" className=" font-light text-slate-500 border-black border-b-2 duration-500 focus:outline-none transition focus:border-blue-600 w-full "/>
          </label>
          <div className="col-span-2">
            <label>Enter your password: <p className=" text-sm underline text-blue-400" onClick={() => setShowPassword( !showPassword )}>{showPassword ? 'Hide Password' : 'Show Password'}</p>
            <input type={showPassword ? "text" : "password"} placeholder="Password" className="font-light text-slate-500 border-black border-b-2 duration-500 focus:outline-none transition focus:border-blue-600 w-full"/>
            </label>
          </div>
          
          <button className=" text-white font-sans rounded-md bg-green-600 active:bg-green-700 h-10 self-center col-span-2" type="submit">Login</button>
      </form>
      <p>
        Don't have an account?&nbsp;
        <NavLink to="/signup" className="text-blue-500 underline">
          Sign Up!
        </NavLink>
      </p>
    </div>
  )
}