import "@root/main.css"; // Tawilwind stylesheet
import React, { useState } from "react";
import { NavLink } from "react-router-dom"


export default function Signup( props ) {

  const [showPassword, setShowPassword] = useState( false );

  return (
    <div className=" w-2/5 self-center mt-10 p-5 rounded-lg text-black font-semibold text-xl font-serif">
    <h1 className="text-5xl font-sans">Sign Up</h1>
    <br />
    <form className="py-4 grid grid-cols-2 gap-4">
        <label for="name" className=" col-span-2">
          Enter your name: <br />
          <input type="text" name="name" id="name" required placeholder="Name" className=" font-light text-slate-500 border-black border-b-2 duration-500 focus:outline-none transition focus:border-blue-600 w-full "/>
        </label>
        <label for="email" className=" col-span-2">
          Enter your email: <br />
          <input type="email" name="email" id="email" required placeholder="Email" className=" font-light text-slate-500 border-black border-b-2 duration-500 focus:outline-none transition focus:border-blue-600 w-full "/>
        </label>
        <div className="col-span">
          <label>Enter a password: <p className=" text-sm underline text-blue-400" onClick={() => setShowPassword( !showPassword )}>{showPassword ? 'Hide Password' : 'Show Password'}</p>
          <input type={showPassword ? "text" : "password"} placeholder="Password" className=" font-light text-slate-500 border-black border-b-2 duration-500 focus:outline-none transition focus:border-blue-600 w-full "/>
          </label>
        </div>
        <div className=" bg-slate-200 row-span-2 self-center justify-self-center text-center justify-center w-11/12 h-5/6 rounded-md flex flex-col text-base p-4">
          Consider using a mix of letters, numbers, and symbols for a stronger password!
        </div>
        <label className="col-span">Reenter password: <br />
          <input type={showPassword ? "text" : "password"} placeholder="Password" className=" font-light text-slate-500 border-black border-b-2 duration-500 focus:outline-none transition focus:border-blue-600 w-full "/>
          </label>
        <button className=" text-white font-sans rounded-md bg-green-600 h-10 self-center active:bg-green-700 col-span-2" type="submit">Sign Up!</button>
    </form>
    <p>
      Already have an account?&nbsp;
      <NavLink to="/login" className="text-blue-500 underline">
        Login!
      </NavLink>
    </p>
  </div>
  );
}