import React from "react";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-slate-200 shadow-md px-2 sm:px-0 ">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link href="/">
          <h1 className="cursor-pointer font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Blog</span>
            <span className="text-slate-700">Site</span>
          </h1>
        </Link>
        <form className="w-40 md:w-64 xl:w-96 bg-slate-100 p-2 rounded-lg flex justify-between items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none"
          />
          <FaSearch className="text-slate-500" />
        </form>
        <ul className="flex gap-4">
          <Link href="/">
            <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
              Home
            </li>
          </Link>
          <Link href="/create-post">
            <li className="hidden sm:inline text-slate-700 hover:underline cursor-pointer">
              Create Post
            </li>
          </Link>
          <Link href="login">
            <li className="inline text-slate-700 hover:underline cursor-pointer">
              Login
            </li>
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Header;
