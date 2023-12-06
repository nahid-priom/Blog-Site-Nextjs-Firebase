'use client'
import Navbar from "@/app/components/Navbar";
import React from "react";
import { auth, provider } from "../firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { UserAuth } from "../context/AuthContext";
import { FaGoogle } from 'react-icons/fa';

const Page = () => {
    const { user, googleSignIn, logOut } = UserAuth();
    const router = useRouter(); 
  
    const handleSignIn = async () => {
      try {
        await googleSignIn();
       
        router.push('/');
      } catch (error) {
        console.log(error);
      }
    };
  
  return (
    <div>
      <div className="w-screen min-h-calc-viewport flex flex-col justify-center items-center">
        <p className="text-3xl">Sign in with Google to continue</p>
        <div>
          
        <button className="flex items-center justify-between border cursor-pointer transition duration-300 ease-in-out px-5 my-4 py-2 rounded-md shadow-box-shadow text-gray-700 text-2xl font-semibold bg-white bg-no-repeat bg-center bg-cover" onClick={handleSignIn}> <FaGoogle className="mr-2"/>Sign in with Google</button>
        </div>
      </div>
    </div>
  );
};

export default Page;
