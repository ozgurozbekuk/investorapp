import React from "react";
import Hero from "@/components/marketing/Hero";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

const page = () => {
  return (
    <div className="m-4">
      <h1>Home page</h1>
    </div>
  );
};

export default page;
