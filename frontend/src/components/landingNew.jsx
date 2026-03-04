import React from "react";
import { Link } from "react-router-dom";
import logo from "/assets/logo2.png";
import teaImg from "/assets/hi5.png";

const LandingPage = () => (
  <div className="min-h-screen flex flex-col border border-gray-300 bg-white">
    {/* NavBar */}
    <nav className="w-full flex items-center justify-between px-8 pt-6 pb-2">
      <div className="flex items-end gap-1">
        <img
          src={logo}
          alt="GreenLeaf Logo"
          className="w-12 h-12 margin-0 padding-0"
        />
        <span className="text-xl text-black font-normal ml-1"></span>
      </div>
      <Link
        to="/login"
        className="px-7 py-2 bg-[#25362b] text-white rounded-full font-medium text-md shadow-none hover:bg-[#304e3a] transition"
      >
        Log in
      </Link>
    </nav>
    {/* Hero Section */}
    <main className="flex-1 w-full flex flex-col md:flex-row items-start md:items-center justify-between px-8 pt-8 pb-0 max-w-[1200px] mx-auto">
      <div className="flex flex-col max-w-[460px]">
        <h1
          className="font-extrabold mb-3 leading-snug text-black"
          style={{ fontSize: "4rem", lineHeight: "1.1" }}
        >
          Where Tea <br />
          <span className="text-[#279779]">Meets Efficiency</span>
        </h1>
        <p className="text-[16px] text-[#172b36] font-normal mb-10 mt-3">
          Modernize every step of your tea process—empowering managers and owners—
          with an all-in-one, role-based dashboard. Intake, logistics, payments, and more, all just a click away.
        </p>
        <Link
          to="/login"
          className="self-start bg-[#25362b] text-white text-[18px] py-2.5 px-8 rounded-full font-medium shadow-none hover:bg-[#304e3a] transition"
        >
          Get started
        </Link>
      </div>
      <div className="w-full md:w-1/2 h-[500px] flex items-center justify-end">
        <img
          src={teaImg}
          alt="Tea cup and leaves"
          className="w-full h-full object-cover"
          style={{
            border: "none",
            boxSizing: "border-box"
          }}
        />
      </div>
    </main>
  </div>
);

export default LandingPage;
