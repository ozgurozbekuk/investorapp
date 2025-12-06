import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { getUserByClerkId } from '@/actions/user.action';
import Link from 'next/link';
import { Avatar, AvatarImage } from './ui/avatar';
import SidebarNavLinks from "./SidebarNavLinks";

const Sidebar = async() => {
    const authUser = await currentUser();

    if(!authUser){
        return <UnAuthenticatedSidebar/>
    }

    const user = await getUserByClerkId(authUser.id);
    if(!user) return null
    
  return (
    <div className="sticky top-20 space-y-4">
      <Card>
        <CardContent className="p-4">
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center gap-3"
          >
            <Avatar className="w-12 h-12 border">
              <AvatarImage src={user.image || "/avatar.png"} />
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold leading-tight">{user.name}</span>
              <span className="text-sm text-muted-foreground">{user.username}</span>
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SidebarNavLinks />
        </CardContent>
      </Card>
    </div>
  )
}

export default Sidebar;

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">Welcome Back!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4">
          Login to access your profile and connect with others.
        </p>
        <SignInButton mode="modal">
          <Button className="w-full" variant="outline">
            Login
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full mt-2" variant="default">
            Sign Up
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);
