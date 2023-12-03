import Link from "next/link";
import React from "react";
import { UserAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuth, logOut } = UserAuth();

  return (
    <div>
      <nav className="m-0 w-full h-20 bg-gray-600 flex justify-center items-center text-white">
        <Link className="text-white m-2.5 text-2xl" href="/">
          Home
        </Link>
        <Link className="text-white m-2.5 text-2xl" href="/create-post">
          Create Post
        </Link>

        {!isAuth ? (
          <Link className="text-white m-2.5 text-2xl" href="/login">
            Login
          </Link>
        ) : (
          <>
            <button className="text-white m-2.5 text-2xl" onClick={logOut}>
              {" "}
              Log Out
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
